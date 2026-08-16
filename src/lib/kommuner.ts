/**
 * kommuner.ts — Loads and validates all kommun-YAML från data/kommuner/.
 * Bygget ska faila hårt på trasig eller ofullständig YAML (§4 UPPDRAG_POC.md) —
 * validering körs vid modul-load, alltså vid varje `astro build`/`astro dev`.
 *
 * Typer/konstanter/rena formaterare bor i kommunTyper.ts (inget fs/path-
 * beroende där — se den filens filhuvud för varför). Allt re-exporteras
 * härifrån, så befintliga `import {...} from '../lib/kommuner'` fortsätter
 * fungera oförändrat. Klientkod (t.ex. matchningstrattens <script>) ska
 * importera direkt från kommunTyper.ts i stället för denna fil.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
// .ts-suffix på de riktiga importerna (SPEC: Omverifiering) — se
// omverifiering.ts:s filhuvud för varför: scripts/omverifiering-ko.ts
// kör som ett vanligt node-skript, utanför Vites resolver.
import {
  KATEGORIER, VERKSAMHETER, DEADLINE_TYPER, BIDRAG_STATUSAR, DATATILLSTAND, todayISO, nextOccurrenceISO,
  GILTIGHET_REGEL_TYPER, GILTIGHET_REGEL_STATUSAR, individuelltBelopp,
} from './kommunTyper.ts';
import type { Verksamhet, Bidrag, Forutsattning, Kommun, DeadlineEntry, Datatillstand } from './kommunTyper.ts';
import { GILTIGA_KOMMUNSLUGS, lanForKommunSlug } from './kommunlan.ts';

export * from './kommunTyper.ts';

const DATA_DIR = resolve(process.cwd(), 'data', 'kommuner');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MMDD_RE = /^\d{2}-\d{2}$/;

class SchemaError extends Error {
  constructor(file: string, problems: string[]) {
    super(`Trasig kommun-YAML: ${file}\n  - ${problems.join('\n  - ')}`);
    this.name = 'SchemaError';
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

// Delade hjälpare för matchningsfälten — samma bakåtkompatibla mönster som
// forutsattningar/kommunsiffra: undefined/null → null, inget problems-fel.
function numberOrNull(raw: any, field: string, where: string, problems: string[]): number | null {
  const v = raw[field];
  if (v === null || v === undefined) return null;
  if (typeof v !== 'number' || v < 0) {
    problems.push(`${where}.${field} måste vara ett icke-negativt tal eller null`);
    return null;
  }
  return v;
}

function boolOrNull(raw: any, field: string, where: string, problems: string[]): boolean | null {
  const v = raw[field];
  if (v === null || v === undefined) return null;
  if (typeof v !== 'boolean') {
    problems.push(`${where}.${field} måste vara true/false eller null`);
    return null;
  }
  return v;
}

function verksamhetListOrNull(raw: any, field: string, where: string, problems: string[]): Verksamhet[] | null {
  const v = raw[field];
  if (v === null || v === undefined) return null;
  if (!Array.isArray(v)) {
    problems.push(`${where}.${field} måste vara en lista eller null`);
    return null;
  }
  // Tomhetskontroll (steg 5-sveppet, 2026-07): en tom lista är INTE
  // ekvivalent med null här — matchning.ts:matchBidrag läser
  // `foreningstyp !== null` för att avgöra om kravet ska prövas alls, och
  // `[].some(...)` är alltid false. En tom array skulle alltså tyst
  // exkludera bidraget ur ALLA matchningar (motsatsen till null, som
  // matchar ALLTID) — utan byggfel, utan varning. E1 Nollregeln säger
  // null = "inte undersökt/inte angivet", aldrig en tom lista.
  if (v.length === 0) {
    problems.push(`${where}.${field} är en tom lista — skriv null om fältet inte är känt/angivet i källan (en tom lista matchar ALDRIG i motorn, se matching.ts matchBidrag)`);
    return v;
  }
  for (const item of v) {
    if (!VERKSAMHETER.includes(item)) {
      problems.push(`${where}.${field} innehåller okänt värde "${item}" (tillåtna: ${VERKSAMHETER.join(', ')})`);
    }
  }
  return v;
}

function normalizeDate(v: unknown): unknown {
  // js-yaml parsar YAML-datum (utan citattecken) som JS Date-objekt.
  return v instanceof Date ? v.toISOString().slice(0, 10) : v;
}

/**
 * Arbetsorder 2026-08-03, punkt 3 — samma fyrfältade regel för belopp/
 * deadline/krav (Bidrag) och giltighet (Forutsattning). Uppdaterad
 * ÅTGÄRDSSPEC T1/T6 (samma kväll, fyra-lägesrevisionen): status saknas
 * → fäll; status är olast/kontrollast (HARVARDE_KRAVER_STATUSAR — "vi ska
 * ha ett värde") men fältet tomt → fäll; status är okand/ingen_regel
 * (inget värde förväntat) men fältet HAR ett värde → fäll (samma
 * tomhetskrav för båda — om det redan finns ett svar finns inget kvar
 * att vara okänt om eller sakna en regel för).
 *
 * `symmetrisk=false` (bara belopp): en platshållarfras ("Individuell
 * bedömning" m.fl., se hittaBeloppPlatshallare) är en icke-null STRÄNG
 * men INTE ett riktigt värde — korrigera-belopp-platshallare.ts sätter
 * medvetet belopp_status: okand trots att fältet fortfarande innehåller
 * texten (vi rör aldrig belopp-värdet självt). Den riktningen ("okand
 * men fältet har ett värde") är alltså en LEGITIM kombination för just
 * belopp — bara "olast/kontrollast men tomt" ska fällas här. Den farliga
 * riktningen (olast/kontrollast + platshållare) fångas redan av
 * hittaBeloppPlatshallare, som är corpus-medveten och kan skilja en
 * platshållare från ett äkta runt tal ("5 000 kronor") — något denna
 * enfils-validering inte kan avgöra.
 */
const HARVARDE_KRAVER_STATUSAR: readonly Datatillstand[] = ['olast', 'kontrollast'];

function validateDatatillstand(where: string, faltnamn: string, status: unknown, harVarde: boolean, problems: string[], symmetrisk = true): void {
  if (status === null || status === undefined) {
    problems.push(`${where}.${faltnamn}_status saknas`);
    return;
  }
  if (!DATATILLSTAND.includes(status as (typeof DATATILLSTAND)[number])) {
    problems.push(`${where}.${faltnamn}_status är "${status}" (tillåtna: ${DATATILLSTAND.join(', ')})`);
    return;
  }
  const kraverVarde = HARVARDE_KRAVER_STATUSAR.includes(status as Datatillstand);
  if (kraverVarde && !harVarde) {
    problems.push(`${where}.${faltnamn}_status är "${status}" men fältet är tomt`);
  }
  if (!symmetrisk) return;
  if (!kraverVarde && harVarde) {
    problems.push(`${where}.${faltnamn}_status är "${status}" men fältet har ett värde`);
  }
}

function validateBidrag(raw: any, kommunSlug: string, index: number, problems: string[]): Bidrag | null {
  const where = `bidrag[${index}] (${kommunSlug})`;
  if (!raw || typeof raw !== 'object') {
    problems.push(`${where}: saknar innehåll`);
    return null;
  }
  if (!isNonEmptyString(raw.id)) problems.push(`${where}.id saknas eller är tom`);
  if (!isNonEmptyString(raw.namn)) problems.push(`${where}.namn saknas eller är tom`);
  if (!Array.isArray(raw.kategori) || raw.kategori.length === 0) {
    problems.push(`${where}.kategori måste vara en icke-tom lista`);
  } else {
    for (const k of raw.kategori) {
      if (!KATEGORIER.includes(k)) {
        problems.push(`${where}.kategori innehåller okänt värde "${k}" (tillåtna: ${KATEGORIER.join(', ')})`);
      }
    }
  }
  if (!isNonEmptyString(raw.malgrupp)) problems.push(`${where}.malgrupp saknas eller är tom`);

  if (!raw.deadlines || typeof raw.deadlines !== 'object') {
    problems.push(`${where}.deadlines saknas`);
  } else {
    if (!DEADLINE_TYPER.includes(raw.deadlines.typ)) {
      problems.push(`${where}.deadlines.typ är "${raw.deadlines.typ}" (tillåtna: ${DEADLINE_TYPER.join(', ')})`);
    }
    if (!Array.isArray(raw.deadlines.datum)) {
      problems.push(`${where}.deadlines.datum måste vara en lista`);
    } else if (raw.deadlines.typ === 'fasta') {
      if (raw.deadlines.datum.length === 0) {
        problems.push(`${where}.deadlines.datum är tom men deadlines.typ är "fasta" — fasta deadlines måste ha minst ett datum`);
      }
      for (const d of raw.deadlines.datum) {
        if (typeof d !== 'string' || !MMDD_RE.test(d)) {
          problems.push(`${where}.deadlines.datum innehåller "${d}", förväntat format MM-DD`);
        }
      }
    }
  }

  if (!Array.isArray(raw.krav)) problems.push(`${where}.krav måste vara en lista (kan vara tom)`);
  if (raw.belopp !== null && typeof raw.belopp !== 'string') {
    problems.push(`${where}.belopp måste vara text eller null`);
  }
  if (typeof raw.belopp === 'string' && /https?:\/\//i.test(raw.belopp)) {
    problems.push(`${where}.belopp får inte innehålla en URL`);
  }
  if (!isNonEmptyString(raw.sen_ansokan)) problems.push(`${where}.sen_ansokan saknas eller är tom`);
  if (!isNonEmptyString(raw.kalla_url)) {
    problems.push(`${where}.kalla_url saknas eller är tom`);
  } else if (!/^https?:\/\//i.test(raw.kalla_url)) {
    problems.push(`${where}.kalla_url måste börja med http:// eller https://`);
  }
  if (raw.anteckning !== null && raw.anteckning !== undefined && typeof raw.anteckning !== 'string') {
    problems.push(`${where}.anteckning måste vara text eller null`);
  }

  // A2 — valfritt fält, saknas i alla befintliga filer i dag. Samma
  // additiva recept som status/senast_verifierad: validera bara om satt.
  if (raw.qa_anteckning !== null && raw.qa_anteckning !== undefined && typeof raw.qa_anteckning !== 'string') {
    problems.push(`${where}.qa_anteckning måste vara text eller null`);
  }
  raw.qa_anteckning = raw.qa_anteckning ?? null;

  // A (belopp-avser-spårbarhet, 2026-08-12) — kommunens_pott normaliseras
  // FÖRE belopp_status-validering så att harVarde-beräkningen kan läsa den.
  if (raw.kommunens_pott !== null && raw.kommunens_pott !== undefined && typeof raw.kommunens_pott !== 'string') {
    problems.push(`${where}.kommunens_pott måste vara text eller null`);
  }
  raw.kommunens_pott = raw.kommunens_pott ?? null;

  // belopp_avser — BEDÖMNINGSFÄLT. Tillåter bara per_forening|okand.
  // Default är ALLTID 'okand' — skriptet sätter ALDRIG 'per_forening'.
  if (raw.belopp_avser !== null && raw.belopp_avser !== undefined) {
    if (!['per_forening', 'okand'].includes(raw.belopp_avser)) {
      problems.push(`${where}.belopp_avser är "${raw.belopp_avser}" (tillåtna: per_forening, okand)`);
    }
  }
  raw.belopp_avser = raw.belopp_avser ?? 'okand'; // ALDRIG automatiskt 'per_forening'
  if (raw.belopp_avser === 'per_forening' && raw.belopp === null) {
    problems.push(`${where}.belopp_avser är per_forening men belopp är null`);
  }

  // Arbetsorder 2026-08-03, punkt 3 — datatillstånd, obligatoriska efter migrationen.
  // harVarde för belopp: belopp-fältet ELLER kommunens_pott räcker — om bara
  // potten är känd (belopp: null, kommunens_pott: "X kr") är belopp_status:
  // kontrollast en giltig kombination (vi har verifierad pott-info).
  const beloppHarVarde = (raw.belopp !== null && raw.belopp !== undefined) ||
    (raw.kommunens_pott !== null && raw.kommunens_pott !== undefined);
  validateDatatillstand(where, 'belopp', raw.belopp_status, beloppHarVarde, problems, false);
  validateDatatillstand(where, 'deadline', raw.deadline_status, raw.deadlines?.typ !== 'okand', problems);
  validateDatatillstand(where, 'krav', raw.krav_status, Array.isArray(raw.krav) && raw.krav.length > 0, problems);

  if (raw.krav_fullstandiga !== null && raw.krav_fullstandiga !== undefined && typeof raw.krav_fullstandiga !== 'boolean') {
    problems.push(`${where}.krav_fullstandiga måste vara true, false eller null`);
  }
  if (raw.krav_fullstandiga === true && (!Array.isArray(raw.krav) || raw.krav.length === 0)) {
    problems.push(`${where}.krav_fullstandiga är true men krav-listan är tom`);
  }
  raw.krav_fullstandiga = raw.krav_fullstandiga ?? null;

  raw.min_medlemmar = numberOrNull(raw, 'min_medlemmar', where, problems);
  raw.alder_min = numberOrNull(raw, 'alder_min', where, problems);
  raw.alder_max = numberOrNull(raw, 'alder_max', where, problems);
  if (raw.alder_min !== null && raw.alder_max !== null && raw.alder_min > raw.alder_max) {
    problems.push(`${where}.alder_min (${raw.alder_min}) är större än alder_max (${raw.alder_max})`);
  }
  raw.min_verksamhetstid_manader = numberOrNull(raw, 'min_verksamhetstid_manader', where, problems);
  raw.foreningstyp = verksamhetListOrNull(raw, 'foreningstyp', where, problems);
  raw.kraver_registrering = boolOrNull(raw, 'kraver_registrering', where, problems);
  raw.sate_i_kommunen = boolOrNull(raw, 'sate_i_kommunen', where, problems);

  // H26 — valfritt fält, saknas i alla 99 befintliga filer i dag.
  if (raw.status !== null && raw.status !== undefined && !BIDRAG_STATUSAR.includes(raw.status)) {
    problems.push(`${where}.status är "${raw.status}" (tillåtna: ${BIDRAG_STATUSAR.join(', ')})`);
  }
  raw.status = raw.status ?? 'aktiv';

  // SPEC: Omverifiering — valfritt fält, saknas i alla befintliga filer
  // i dag. Samma additiva recept som status ovan: validera bara om satt,
  // default null (INTE dagens datum, INTE kommunens verifierad) annars.
  raw.senast_verifierad = normalizeDate(raw.senast_verifierad ?? null);
  if (
    raw.senast_verifierad !== null &&
    (!isNonEmptyString(raw.senast_verifierad) || !DATE_RE.test(raw.senast_verifierad))
  ) {
    problems.push(`${where}.senast_verifierad måste vara ett datum i formatet YYYY-MM-DD eller null`);
  }

  return raw as Bidrag;
}

function validateForutsattning(raw: any, kommunSlug: string, index: number, problems: string[]): Forutsattning | null {
  const where = `forutsattningar[${index}] (${kommunSlug})`;
  if (!raw || typeof raw !== 'object') {
    problems.push(`${where}: saknar innehåll`);
    return null;
  }
  if (!isNonEmptyString(raw.id)) problems.push(`${where}.id saknas eller är tom`);
  if (!isNonEmptyString(raw.vad)) problems.push(`${where}.vad saknas eller är tom`);
  if (!isNonEmptyString(raw.beskrivning)) problems.push(`${where}.beskrivning saknas eller är tom`);
  if (raw.system !== null && raw.system !== undefined && !isNonEmptyString(raw.system)) {
    problems.push(`${where}.system måste vara text eller null (null om steget inte sker i ett digitalt system)`);
  }

  if (raw.ledtid !== null && raw.ledtid !== undefined && typeof raw.ledtid !== 'number') {
    problems.push(`${where}.ledtid måste vara ett heltal (dagar) eller null`);
  }
  if (raw.ledtid_text !== null && raw.ledtid_text !== undefined && typeof raw.ledtid_text !== 'string') {
    problems.push(`${where}.ledtid_text måste vara text eller null`);
  }
  if (raw.giltighet !== null && raw.giltighet !== undefined && typeof raw.giltighet !== 'string') {
    problems.push(`${where}.giltighet måste vara text eller null`);
  }
  if (typeof raw.ordning !== 'number') problems.push(`${where}.ordning måste vara ett heltal`);
  if (!isNonEmptyString(raw.kalla_url)) problems.push(`${where}.kalla_url saknas eller är tom`);

  // Arbetsorder 2026-08-03, punkt 3 — datatillstånd, obligatoriskt efter migrationen.
  validateDatatillstand(where, 'giltighet', raw.giltighet_status, raw.giltighet !== null && raw.giltighet !== undefined, problems);

  raw.system = raw.system ?? null;
  raw.ledtid = raw.ledtid ?? null;
  raw.ledtid_text = raw.ledtid_text ?? null;
  raw.giltighet = raw.giltighet ?? null;

  return raw as Forutsattning;
}

function validateKommun(raw: any, file: string, stem: string): Kommun {
  const problems: string[] = [];

  if (!isNonEmptyString(raw?.kommun)) problems.push('kommun saknas eller är tom');
  if (!isNonEmptyString(raw?.kommun_slug)) problems.push('kommun_slug saknas eller är tom');
  if (isNonEmptyString(raw?.kommun_slug) && !/^[a-z0-9-]+$/.test(raw.kommun_slug)) {
    problems.push(`kommun_slug "${raw.kommun_slug}" innehåller otillåtna tecken (endast a-z, 0-9, -)`);
  }
  // Valideringsspärr mot slugfel (Jacob, 2026-07-27): filnamnets stam MÅSTE
  // vara identisk med kommun_slug — annars fel, inte varning. Fångar
  // t.ex. en fil döpt "norrkoeping.yaml" med kommun_slug: "norrkoeping"
  // (internt konsekvent, men fel — se GILTIGA_KOMMUNSLUGS-kollen nedan).
  if (isNonEmptyString(raw?.kommun_slug) && raw.kommun_slug !== stem) {
    problems.push(`filnamnets stam "${stem}" matchar inte kommun_slug "${raw.kommun_slug}"`);
  }
  // kommun_slug måste finnas i facit över Sveriges 290 kommuner
  // (kommunlan.ts, genererat en gång från SCB) — en okänd slug är ett fel
  // per definition, det finns inga andra kommuner. Fångar norrkoeping/
  // vestervik/harryrda/falkopping-klassen av fel automatiskt i stället för
  // att de upptäcks när något bryter (se HANDOVER 2026-07-27).
  if (isNonEmptyString(raw?.kommun_slug) && !GILTIGA_KOMMUNSLUGS.has(raw.kommun_slug)) {
    problems.push(`kommun_slug "${raw.kommun_slug}" finns inte bland Sveriges 290 kommuner (kommunlan.ts)`);
  }
  if (!isNonEmptyString(raw?.lan)) problems.push('lan saknas eller är tom');
  if (isNonEmptyString(raw?.kommun_slug) && isNonEmptyString(raw?.lan) && GILTIGA_KOMMUNSLUGS.has(raw.kommun_slug)) {
    const rattLan = lanForKommunSlug(raw.kommun_slug);
    if (rattLan !== undefined && raw.lan !== rattLan) {
      problems.push(`lan "${raw.lan}" stämmer inte — ${raw.kommun_slug} ligger i "${rattLan}" (kommunlan.ts)`);
    }
  }
  if (typeof raw?.befolkning !== 'number' || raw.befolkning <= 0) {
    problems.push('befolkning måste vara ett positivt tal');
  }
  if (!isNonEmptyString(raw?.forvaltning)) problems.push('forvaltning saknas eller är tom');

  if (!raw?.ansokningssystem || typeof raw.ansokningssystem !== 'object') {
    problems.push('ansokningssystem saknas');
  } else {
    if (!isNonEmptyString(raw.ansokningssystem.namn)) problems.push('ansokningssystem.namn saknas eller är tom');
    if (!isNonEmptyString(raw.ansokningssystem.url)) problems.push('ansokningssystem.url saknas eller är tom');
  }

  if (!isNonEmptyString(raw?.kalla_url)) problems.push('kalla_url saknas eller är tom');

  raw.verifierad = normalizeDate(raw?.verifierad);
  if (!isNonEmptyString(raw?.verifierad) || !DATE_RE.test(raw.verifierad)) {
    problems.push(`verifierad måste vara ett datum i formatet YYYY-MM-DD, fick "${raw?.verifierad}"`);
  }

  if (!Array.isArray(raw?.bidrag)) {
    problems.push('bidrag måste vara en lista (kan vara tom om inga bidrag hittats än)');
  } else {
    raw.bidrag = raw.bidrag.map((b: any, i: number) => validateBidrag(b, raw.kommun_slug ?? file, i, problems));
    // Arbetsorder 2026-08-03, punkt 4: unika id per kommun. bidrag[].id
    // används som HTML-ankare (#bidrag-{id}) och som matchningsnyckel —
    // en dubblett ger ett odefinierat ankarmål och kan dölja ett bidrag
    // bakom ett annat i länkar/matchning.
    const iddSedda = new Map<string, number>();
    for (const b of raw.bidrag as { id?: string }[]) {
      if (!isNonEmptyString(b?.id)) continue; // redan flaggat av validateBidrag ovan
      iddSedda.set(b.id, (iddSedda.get(b.id) ?? 0) + 1);
    }
    for (const [id, antal] of iddSedda) {
      if (antal > 1) problems.push(`bidrag-id "${id}" (${raw.kommun_slug ?? file}) förekommer ${antal} gånger — id måste vara unikt inom kommunen`);
    }
  }

  // forutsattningar är nytt (FORUTSATTNINGAR.md §2) — saknas i äldre YAML,
  // default till tom lista snarare än att faila befintliga filer.
  if (raw.forutsattningar === undefined) {
    raw.forutsattningar = [];
  } else if (!Array.isArray(raw.forutsattningar)) {
    problems.push('forutsattningar måste vara en lista (kan vara tom om inget verifierat än)');
  } else {
    raw.forutsattningar = raw.forutsattningar
      .map((f: any, i: number) => validateForutsattning(f, raw.kommun_slug ?? file, i, problems))
      .sort((a: Forutsattning, b: Forutsattning) => a.ordning - b.ordning);
  }

  if (raw.kommunsiffra === undefined || raw.kommunsiffra === null) {
    raw.kommunsiffra = null;
  } else {
    const ks = raw.kommunsiffra;
    const where = `kommunsiffra (${raw.kommun_slug ?? file})`;
    if (typeof ks !== 'object') {
      problems.push(`${where} måste vara ett objekt eller null`);
    } else {
      if (typeof ks.antal_foreningar !== 'number' || ks.antal_foreningar <= 0) {
        problems.push(`${where}.antal_foreningar måste vara ett positivt tal`);
      }
      if (!isNonEmptyString(ks.summa_kr)) problems.push(`${where}.summa_kr saknas eller är tom`);
      if (!isNonEmptyString(ks.bidragstyp)) problems.push(`${where}.bidragstyp saknas eller är tom`);
      if (!isNonEmptyString(ks.utlamnad_datum)) problems.push(`${where}.utlamnad_datum saknas eller är tom`);
    }
  }

  // G1/C3 (ARBETSORDER 2026-08-11) — additivt precis som kommunsiffra
  // ovan: saknas i alla 290 filer i dag (0 kommuner extraherade), null
  // tills ett researchpass sätter den. giltighet_regel_status validerar
  // MOT GILTIGHET_REGEL_STATUSAR (kontrollast/ingen_regel/okand) — inte
  // DATATILLSTAND, se kommunTyper.ts:s kommentar om varför de är skilda.
  if (raw.giltighet_regel === undefined || raw.giltighet_regel === null) {
    raw.giltighet_regel = null;
  } else {
    const gr = raw.giltighet_regel;
    const where = `giltighet_regel (${raw.kommun_slug ?? file})`;
    if (typeof gr !== 'object') {
      problems.push(`${where} måste vara ett objekt eller null`);
    } else {
      if (!GILTIGHET_REGEL_TYPER.includes(gr.typ)) {
        problems.push(`${where}.typ är "${gr.typ}" (tillåtna: ${GILTIGHET_REGEL_TYPER.join(', ')})`);
      }
      if (gr.antal !== null && typeof gr.antal !== 'number') {
        problems.push(`${where}.antal måste vara ett tal eller null`);
      }
      // J3 (2026-08-16): datum — MM-DD för fast_datum, samma format/
      // regex som deadlines.datum. Additivt precis som resten av fältet:
      // saknas i alla filer i dag, normaliseras till null tills G1/GPT
      // sätter den.
      if (gr.datum === undefined) {
        gr.datum = null;
      } else if (gr.datum !== null && (typeof gr.datum !== 'string' || !MMDD_RE.test(gr.datum))) {
        problems.push(`${where}.datum är "${gr.datum}", förväntat format MM-DD eller null`);
      }
      if (!isNonEmptyString(gr.kalla_url)) problems.push(`${where}.kalla_url saknas eller är tom`);
    }
  }

  if (raw.giltighet_regel_status === undefined) {
    raw.giltighet_regel_status = null;
  } else if (raw.giltighet_regel_status !== null && !GILTIGHET_REGEL_STATUSAR.includes(raw.giltighet_regel_status)) {
    problems.push(`giltighet_regel_status är "${raw.giltighet_regel_status}" (tillåtna: ${GILTIGHET_REGEL_STATUSAR.join(', ')}, eller null)`);
  }

  if (problems.length > 0) {
    throw new SchemaError(file, problems);
  }

  return raw as Kommun;
}

/**
 * Arbetsorder 2026-08-03, punkt 4: valideringsgrinden (scripts/validera-
 * data.ts) vill se ALLA trasiga filer i ett svep, inte bara den första
 * (loadKommuner() nedan är medvetet fail-fast — en trasig fil ska aldrig
 * tyst släppas igenom till en byggd sida). Samma parse+validera-logik,
 * bara med varje fils fel samlat i stället för kastat vid första träff.
 */
export function validateAllKommunFiles(): { file: string; error: string }[] {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const problem: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      const content = readFileSync(join(DATA_DIR, file), 'utf-8');
      const raw = yaml.load(content);
      const stem = file.replace(/\.ya?ml$/, '');
      validateKommun(raw, file, stem);
    } catch (e) {
      problem.push({ file, error: (e as Error).message });
    }
  }
  return problem;
}

/**
 * Uppföljning 2026-08-03 (arbetsorder 2, uppdaterad T1-namnbytet): ett
 * belopp_status som kräver ett värde (olast eller kontrollast) får inte
 * kombineras med ett belopp som är en platshållarfras, inte kommunens
 * egna ord. Listan byggs UR DATAN, inte gissad: en fras som återkommer
 * ORDAGRANT i flera OLIKA kommuner och inte innehåller en siffra kan per
 * definition inte vara en specifik uppgift ur just den kommunens källa —
 * riktiga belopp (även runda tal som "5 000 kronor", som råkar delas av
 * flera kommuner) innehåller alltid en siffra. Verifierat 2026-08-03:
 * "Individuell bedömning" (34 kommuner) och dess "per {sak}"-varianter
 * (7/2/2 kommuner) är de enda icke-numeriska fraserna som återkommer
 * >=3 gånger i corpuset — reglen är alltså inte bara teoretisk, den
 * fångar ett verkligt, redan existerande mönster.
 */
export function hittaBeloppPlatshallare(minimumKommuner = 3): { kommun: string; kommunSlug: string; bidrag: string; bidragId: string; belopp: string }[] {
  const kommuner = loadKommuner();
  const kommunerPerFras = new Map<string, Set<string>>();
  for (const kommun of kommuner) {
    for (const bidrag of kommun.bidrag) {
      if (bidrag.belopp === null) continue;
      const set = kommunerPerFras.get(bidrag.belopp) ?? new Set<string>();
      set.add(kommun.kommun_slug);
      kommunerPerFras.set(bidrag.belopp, set);
    }
  }

  const platshallarfraser = new Set(
    [...kommunerPerFras.entries()]
      .filter(([fras, kommunSet]) => kommunSet.size >= minimumKommuner && !/\d/.test(fras))
      .map(([fras]) => fras)
  );

  const traffar: { kommun: string; kommunSlug: string; bidrag: string; bidragId: string; belopp: string }[] = [];
  for (const kommun of kommuner) {
    for (const bidrag of kommun.bidrag) {
      if ((bidrag.belopp_status === 'olast' || bidrag.belopp_status === 'kontrollast') && bidrag.belopp !== null && platshallarfraser.has(bidrag.belopp)) {
        traffar.push({ kommun: kommun.kommun, kommunSlug: kommun.kommun_slug, bidrag: bidrag.namn, bidragId: bidrag.id, belopp: bidrag.belopp });
      }
    }
  }
  return traffar;
}

let _cache: Kommun[] | null = null;

export function loadKommuner(): Kommun[] {
  if (_cache) return _cache;

  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const kommuner: Kommun[] = [];

  for (const file of files) {
    const content = readFileSync(join(DATA_DIR, file), 'utf-8');
    let raw: unknown;
    try {
      raw = yaml.load(content);
    } catch (e) {
      throw new SchemaError(file, [`ogiltig YAML-syntax: ${(e as Error).message}`]);
    }
    const stem = file.replace(/\.ya?ml$/, '');
    kommuner.push(validateKommun(raw, file, stem));
  }

  kommuner.sort((a, b) => a.kommun.localeCompare(b.kommun, 'sv'));
  _cache = kommuner;
  return kommuner;
}

export function getKommunBySlug(slug: string): Kommun | undefined {
  return loadKommuner().find((k) => k.kommun_slug === slug);
}

export interface Arbetsbevis {
  totalBidrag: number;
  kontrollastAntal: number;
}

let _arbetsbevisCache: Arbetsbevis | null = null;

/**
 * "Arbetsbeviset" — de två talen som bär förstasidans bevisrad (H1.5),
 * F①:s fallback på utkastvyn OCH F①:s fallback i kommunsidans egen
 * köpruta (station 5, KommunProgression.astro — F8, 2026-08-12).
 * EN räkning, tre anropsställen — annars driver de isär första gången
 * någon räknar om på bara ETT av dem. Memoiserad (samma mönster som
 * loadKommuner()s _cache): kommunsidan anropar detta en gång PER
 * kommun (290 statiska sidor), utan cache 290 × 2808 varv i onödan.
 */
export function beraknaArbetsbevis(kommuner: Kommun[]): Arbetsbevis {
  if (_arbetsbevisCache) return _arbetsbevisCache;
  let totalBidrag = 0;
  let kontrollastAntal = 0;
  for (const k of kommuner) {
    for (const b of k.bidrag) {
      totalBidrag++;
      if (b.belopp_status === 'kontrollast') kontrollastAntal++;
    }
  }
  _arbetsbevisCache = { totalBidrag, kontrollastAntal };
  return _arbetsbevisCache;
}

/**
 * Platt, kronologiskt sorterad lista över alla deadlines i alla kommuner —
 * underlag för deadlinekalendern (§5 punkt 4 UPPDRAG_POC.md). Löpande
 * bidrag saknar datum och sorteras sist, som en egen sektion.
 */
export function getDeadlineEntries(today: string = todayISO()): DeadlineEntry[] {
  const entries: DeadlineEntry[] = [];

  for (const kommun of loadKommuner()) {
    for (const bidrag of kommun.bidrag) {
      if (bidrag.status !== 'aktiv') continue; // H26 — pausat/avskaffat bidrag hör inte hemma i kalendern
      const base = {
        kommun: kommun.kommun,
        kommunSlug: kommun.kommun_slug,
        bidragId: bidrag.id,
        bidragNamn: bidrag.namn,
        kategori: bidrag.kategori,
        belopp: individuelltBelopp(bidrag),
        deadlineStatus: bidrag.deadline_status,
      };
      if (bidrag.deadlines.typ === 'lopande') {
        entries.push({ ...base, isLopande: true, dateISO: null });
        continue;
      }
      // 'okand' är en egen, explicit gren — inte ett fall-through via tomt
      // deadlines.datum. Ett okänt ansökningsdatum är ingen deadline att
      // bevaka, så bidraget utelämnas helt ur kalendern (varken kommande-
      // eller löpande-sektionen). Skriv INTE om detta till en implicit
      // tom-array-check under fasta-grenen — se ordern som infört 'okand'.
      if (bidrag.deadlines.typ === 'okand') continue;
      for (const mmdd of bidrag.deadlines.datum) {
        entries.push({ ...base, isLopande: false, dateISO: nextOccurrenceISO(mmdd, today) });
      }
    }
  }

  entries.sort((a, b) => {
    if (a.isLopande !== b.isLopande) return a.isLopande ? 1 : -1;
    if (a.dateISO && b.dateISO) return a.dateISO.localeCompare(b.dateISO);
    return 0;
  });

  return entries;
}
