/**
 * kommunTyper.ts — Typer, konstanter och RENA funktioner ur kommuner.ts,
 * utan beroende på `fs`/`path`. Utbrutet (matchningstratten, turn-11) för
 * att src/pages/matcha/index.astro:s klientskript kan importera formaterare
 * (formatDate, earliestDeadlineISO, todayISO, svenskLista) utan att dra in
 * loadKommuner()/DATA_DIR-koden — ett top-level `resolve(process.cwd(), ...)`
 * i kommuner.ts kraschade Vite-bygget för klientbundeln (inte tree-shakebart,
 * körs ovillkorligt vid modul-load, "path" kan inte externaliseras i
 * webbläsaren). kommuner.ts re-exporterar allt härifrån — alla befintliga
 * `import {...} from '../lib/kommuner'` fortsätter fungera oförändrat.
 */

import { strippaProcessSprak } from './anteckningFilter.ts';

export const KATEGORIER = ['idrott', 'kultur', 'social', 'pensionar', 'funktionsratt', 'ovrig'] as const;
export type Kategori = (typeof KATEGORIER)[number];

// Verksamhet — matchningstrattens EGEN taxonomi (GUIDE_TRATT_COPY.ts
// fraga_verksamhet.alternativ), skild från KATEGORIER. KATEGORIER styr
// bidragens navigering (/kommun/[slug]/[kategori]/); Verksamhet är ett
// hårdare behörighetsfilter på Bidrag.foreningstyp, extraherat ur
// malgrupp/krav. Se matching.ts.
export const VERKSAMHETER = ['idrott', 'kultur', 'hembygd', 'friluft', 'social', 'ungdom', 'annat'] as const;
export type Verksamhet = (typeof VERKSAMHETER)[number];

// 'okand' — källan är helt tyst om ansökningsförfarande (varken ett publicerat
// datum eller en uttrycklig löpande-formulering). Skild från 'lopande', som
// betyder att kommunen UTTRYCKLIGEN skriver löpande/rullande ansökan.
// 'lopande' får ALDRIG användas som utfyllnad för tystnad — se Västervik-
// reverten 2026-07 (c995f80 backad) för vad som händer när den regeln bryts.
//
// 'relativ' — tillagd 2026-08-03 (DATATILLSTAND_och_koprutan.md §2c).
// Skild från 'okand': en relativ frist är INTE ett hål i vår kunskap — vi
// har en fullständig, känd formel (t.ex. "60 dagar efter avslutad kurs"),
// bara inget absolut datum förrän besökaren fyller i sin egen
// referenspunkt. 'okand' migrerade tidigare in relativa frister av misstag
// (anteckning-textmönstret "Relativ tidsfrist: X" var det enda strukturella
// spåret) — det gav deadline_status: overifierat åt något vi faktiskt VET.
// Ett eget typ-värde, inte ett fjärde Datatillstand-värde: de tre andra
// fälten (belopp/krav/giltighet) har inget analogt "relativt" tillstånd,
// och Datatillstand ska vara samma skala för alla fyra.
export const DEADLINE_TYPER = ['fasta', 'lopande', 'okand', 'relativ'] as const;
export type DeadlineTyp = (typeof DEADLINE_TYPER)[number];

// Datatillstånd (arbetsorder 2026-08-03, DATATILLSTAND_och_koprutan.md;
// ÅTGÄRDSSPEC T1-T6, 2026-08-03 kväll — fyra-lägesrevisionen) — EN skala
// för fyra olika fält (belopp/deadline/krav på Bidrag, giltighet på
// Forutsattning), alla obligatoriska efter migrationen (kommuner.ts).
//
// Fyra värden, inte tre. 'angivet'/'overifierat' döptes om (ren
// namnbyte, ingen ny bedömning) för att täcka en skillnad de aldrig
// bar: ett värde som kommer från extraktionen är INTE samma sak som ett
// värde någon oberoende kontrollerat mot kommunens LEVANDE sida. Det var
// "Arvika-problemet" — ekern visade ett datum med full säkerhet, kortet
// hedgade samma datum, och båda hade rätt givet den gamla tvåvägs-
// uppdelningen (finns/finns inte), bara olika grad av försiktighet.
//
//   olast       Extraherat, INTE oberoende omkontrollerat. VÄRDET VISAS
//               överallt (D3) med en gemensam reservation: streckad
//               markör + "Inte kontrollerad mot kommunens sida sedan vi
//               hämtade den." + källänk. Detta ÄR dagens 'angivet' —
//               bara ärligare namngivet. Sätts av migrationen/GPT-
//               extraktionen, ALDRIG av ett researchpass som faktiskt
//               kontrollerat källan (det sätter 'kontrollast').
//   kontrollast Extraherat OCH oberoende bekräftat mot kommunens
//               levande sida. Full markering, ingen reservation. Sätts
//               ENDAST av ett researchpass — omrakna-datatillstand.ts
//               får aldrig skriva detta värde (samma skydd som
//               krav_fullstandiga).
//   ingen_regel Bekräftat att INGET värde finns — kommunen har
//               uttryckligen sagt att regeln/beloppet/kravet saknas.
//               Full markering, aktiv formulering ("Gislaved anger
//               ingen tidsgräns"), fylld markör (VoidState). Sätts
//               ENDAST av ett researchpass, ALDRIG av migrationen —
//               att gissa den vore exakt den klass av påhitt allt annat
//               i den här kodbasen vägrar göra. Detta ÄR dagens
//               'ingen_regel', oförändrat i sak — bara skyddat hårdare
//               (se omrakna-datatillstand.ts: rör aldrig ett fält som
//               redan är ingen_regel eller verifierad).
//   okand       Ett äkta hål i vår kunskap — inget värde, ingen
//               bekräftelse av att det saknas heller. Void (streckad
//               ram, dämpad text, källänk ut — VoidMark). Detta ÄR
//               dagens 'overifierat' — bara ärligare namngivet (samma
//               ord ska inte betyda både "vi vet inget alls" OCH "vi
//               har ett värde men har inte dubbelkollat det").
//
// (En parallell Code-session döpte samma skala FALT_STATUSAR/FaltStatus
// och lade giltighet_status direkt på Bidrag, med en duplicerad
// `giltighet: string | null` — löst till förmån för DENNA version vid
// sammanslagningen 2026-08-03: giltighet hör hemma på Forutsattning, där
// fältet redan fanns långt innan datatillstånd-arbetet (C3.1, 2026-08-11:
// fritexten läses idag bara av giltighet_status/VerificationStamp, inte
// längre av GiltighetsKontroll.astro — se giltighet_regel nedan). Två
// källor för samma sak hade brutit "en sanning, ett ställe".)
export const DATATILLSTAND = ['olast', 'okand', 'ingen_regel', 'kontrollast'] as const;
export type Datatillstand = (typeof DATATILLSTAND)[number];

// H26 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): kommunen kan pausa eller
// avskaffa ett bidrag utan att ta bort YAML-raden. Valfritt fält —
// saknas det i källan defaultar validateBidrag (kommuner.ts) till
// 'aktiv', additivt mot de 99 befintliga filerna.
export const BIDRAG_STATUSAR = ['aktiv', 'pausad', 'avskaffat'] as const;
export type BidragStatus = (typeof BIDRAG_STATUSAR)[number];

export interface Deadlines {
  typ: DeadlineTyp;
  datum: string[]; // MM-DD, återkommande
}

export interface Bidrag {
  id: string;
  namn: string;
  kategori: Kategori[];
  malgrupp: string;
  deadlines: Deadlines;
  krav: string[];
  belopp: string | null;
  sen_ansokan: string;
  kalla_url: string;
  anteckning: string | null;

  // A2 (Jacob 2026-08-08): processpår ur extraktionspasset — ALDRIG
  // renderat. anteckning är den användarvända motsvarigheten. Ingen
  // backfill av de 366 meningar som redan ligger fel i anteckning
  // (PROCESSSPRAK_STRUKET_2026-08-08.md) — de hanteras av A1:s filter
  // (strippaProcessSprak, anteckningFilter.ts) tills GPT ändå är i
  // respektive kommun. Rör aldrig detta fält från kod — bara research-
  // passet skriver hit.
  qa_anteckning: string | null;

  // Matchningsvillkor (matchningstratten, turn-11) — extraheras ur
  // krav/malgrupp av ett separat researchpass, INTE av Code. null = inget
  // känt krav — matchar ALLTID, filtrerar ALDRIG bort (se matching.ts).
  min_medlemmar: number | null;
  alder_min: number | null; // medlemmarnas ålder (t.ex. 7–25 år) — INTE föreningens egen ålder
  alder_max: number | null;
  min_verksamhetstid_manader: number | null; // föreningens EGEN ålder sedan bildande
  foreningstyp: Verksamhet[] | null; // behörighetsfilter — se Verksamhet ovan, skilt från kategori
  kraver_registrering: boolean | null; // kräver DETTA bidrag kommunens bidragsberättigad-status?
  sate_i_kommunen: boolean | null;

  status: BidragStatus; // H26 — se BIDRAG_STATUSAR ovan. Alltid satt efter validateBidrag, default 'aktiv'.

  // Datatillstånd (se Datatillstand ovan) — obligatoriska efter migrationen.
  belopp_status: Datatillstand;
  deadline_status: Datatillstand;
  krav_status: Datatillstand;
  // null = ej bedömt ännu (renderas som overifierat i UI, samma logik som
  // krav_status men en separat bedömning — krav KAN vara angivna utan att
  // vara KOMPLETTA). Sätts bara av ett researchpass, aldrig av migrationen.
  krav_fullstandiga: boolean | null;

  // SPEC: Omverifiering (2026-07-27). Kommun.verifierad finns bara på
  // KOMMUN-nivå — men kalla_url divergerar per bidrag i större kommuner
  // (Karlstad: ≥10 distinkta URL:er över ~28 bidrag), så ETT bidrag kan
  // ha blivit omkontrollerat/bekräftat vid ett ANNAT tillfälle än resten
  // av kommunens bidrag. null = aldrig satt per bidrag (skiljer sig från
  // "okänt datum" — betyder bara att bara kommun-nivåns verifierad finns
  // för det här bidraget hittills). Sätts ENDAST av en forskningssession
  // (samma "Code hittar inte på fakta"-princip som alla andra fält här)
  // — aldrig av omverifieringLogik.ts, som bara upptäcker ATT en källa
  // ändrats, aldrig VAD.
  senast_verifierad: string | null;

  // A (belopp-avser-spårbarhet, 2026-08-12). `per_forening` är en
  // uttrycklig researchbedömning. `okand` är däremot bara standardvärdet:
  // avsaknad av bedömning får inte i sig dölja ett belopp. Fältet sätts
  // aldrig automatiskt till `per_forening` av migrerings-/omräkningskod.
  //
  // "per_forening": belopp-fältet avser vad EN enskild förening/ansökan/
  //   projekt kan söka eller beräknas ut från. Skild från kommunens_pott.
  // "okand": ingen belopp_avser-bedömning är gjord (default); visningen
  //   följer då det tidigare belopp_status-beteendet.
  //
  // Skilt från belopp_status (verifieringsgrad av info vi HAR) och från
  // kommunens_pott (den totala kommunala budgeten för bidraget).
  belopp_avser: 'per_forening' | 'okand';

  // Kommunens totala budget/pott för detta bidrag, som fritext.
  // null = inte känd/angiven. Skild från belopp (vad EN förening kan söka).
  // Sätts UTESLUTANDE av ett researchpass, aldrig av migrerings-/omräkningskod.
  kommunens_pott: string | null;
}

export interface Ansokningssystem {
  namn: string;
  url: string;
}

/**
 * Förutsättning — steg som krävs innan något bidrag i kommunen kan sökas
 * (FORUTSATTNINGAR.md §2). `ledtid` är null om kommunen inte publicerar en
 * faktisk siffra — gissa aldrig en handläggningstid.
 */
export interface Forutsattning {
  id: string;
  vad: string;
  beskrivning: string;
  system: string | null; // null när steget inte sker i ett digitalt system (t.ex. beslut på årsmötet)
  ledtid: number | null; // dagar
  ledtid_text: string | null;
  giltighet: string | null;
  giltighet_status: Datatillstand; // se Datatillstand ovan, obligatorisk efter migrationen
  ordning: number;
  kalla_url: string;
}

/**
 * Kommunsiffran — aha-rad på kommunsidan (KOMMUNSIFFRA, content.ts). Bara
 * kommuner som lämnat ut en egen sammanställning har den; null annars.
 * Gissa aldrig fram värden — bara det kommunen faktiskt publicerat.
 */
export interface Kommunsiffra {
  antal_foreningar: number;
  summa_kr: string; // förformaterat, t.ex. "781 117" — se KOMMUNSIFFRA.template
  bidragstyp: string;
  utlamnad_datum: string;
}

// G1/C3 (ARBETSORDER 2026-08-11) — kommunens STRUKTURERADE regel för hur
// länge ett godkännande som bidragsberättigad förening gäller. Skild från
// Forutsattning.giltighet (fritext) — men C3.1 (Jacob 2026-08-11,
// Helsingborg-fyndet) rev EN skillnad som fanns här tidigare:
// GiltighetsKontroll.astro trodde en gång att fritexten kunde driva en
// EGEN, oberoende beräkning (RISK_TROSKEL_DAGAR/GRANS_DAGAR ≈ 365 dagar,
// gissat). Det gav fel svar (Helsingborg: "ett år från beslutsdagen" i
// källan blev "om 7 månader, mars 2027" i widgeten — fel bas, fel matte).
// Fritexten driver inte längre någon beräkning alls (den gamla
// hittaGiltighetsregel()-lookupen är raderad, se kommentaren ovanför
// hittaGiltighetsstatus()) — bara giltighet_status/VerificationStamp
// läser den nu. Widgeten och cronet räknar UTESLUTANDE mot giltighet_regel
// + berakForfallodatum().
// fast_datum tillagd J3 (2026-08-16, Jacob): "lägg in i GILTIGHET_REGEL_
// TYPER. Frasen finns redan [MEJLTEXTER.md:s regeltext-tabell]. Datan
// kommer från GPT" — G1-researchpasset extraherar värdena, den här
// commiten gör bara typen och beräkningen redo att ta emot dem.
export const GILTIGHET_REGEL_TYPER = [
  'manader_efter_arsmote', 'manader_efter_beslut', 'kalenderar', 'fast_datum', 'ingen_regel', 'okand',
] as const;
export type GiltighetRegelTyp = (typeof GILTIGHET_REGEL_TYPER)[number];

export interface GiltighetRegel {
  typ: GiltighetRegelTyp;
  antal: number | null;
  // J3 (2026-08-16) — MM-DD, samma format och validering som deadlines.
  // datum (MMDD_RE, kommuner.ts), för fast_datum ("31 mars varje år").
  // null för alla andra typer — antal och datum är ömsesidigt
  // uteslutande beroende på typ, aldrig båda satta på riktigt.
  datum: string | null;
  kalla_url: string;
}

// G1 ger MEDVETET bara tre värden här, inte hela Datatillstand-skalan —
// 'olast' (extraherat, inte oberoende bekräftat) gäller inte en regel som
// bara ett researchpass sätter. Egen, snävare typ i stället för att
// återanvända Datatillstand och tillåta ett fjärde värde G1 inte bad om.
export const GILTIGHET_REGEL_STATUSAR = ['kontrollast', 'ingen_regel', 'okand'] as const;
export type GiltighetRegelStatus = (typeof GILTIGHET_REGEL_STATUSAR)[number];

/**
 * Sant bara när giltighet_regel faktiskt kan ge ett beräknat förfallodatum
 * — falskt för null, för ingen_regel/okand, och när det fält typen kräver
 * (antal för manader_efter_*, datum för fast_datum) saknas. J3
 * (2026-08-16): kalenderar och fast_datum ger nu BÅDA ett förfallodatum
 * (berakForfallodatum nedan) och räknas därför hit — NIVÅ 1, inte längre
 * NIVÅ 2. GiltighetsKontroll.astro använder funktionen både server- och
 * klientsidan så de aldrig kan divergera om vilken gren som visas.
 */
export function giltighetRegelGerDatum(regel: GiltighetRegel | null): boolean {
  if (regel === null) return false;
  switch (regel.typ) {
    case 'manader_efter_arsmote':
    case 'manader_efter_beslut':
      return regel.antal !== null;
    case 'kalenderar':
      return true;
    case 'fast_datum':
      return regel.datum !== null;
    case 'ingen_regel':
    case 'okand':
      return false;
  }
}

export interface Kommun {
  kommun: string;
  kommun_slug: string;
  lan: string;
  befolkning: number;
  forvaltning: string;
  ansokningssystem: Ansokningssystem;
  kalla_url: string;
  verifierad: string; // YYYY-MM-DD
  bidrag: Bidrag[];
  forutsattningar: Forutsattning[];
  kommunsiffra: Kommunsiffra | null;
  // G1 — additivt, saknas i alla 290 filer i dag (0 kommuner har regeln
  // extraherad, mätt 2026-08-11). null = inget researchpass har satt den
  // än, skilt från giltighet_regel_status: 'okand' (ett bekräftat "vi
  // hittade ingen regel", se giltighet_regel_status).
  giltighet_regel: GiltighetRegel | null;
  giltighet_regel_status: GiltighetRegelStatus | null;
}

/**
 * C3 REVIDERAD (Jacob 2026-08-11): förfallodatum för en kommuns
 * bidragsberättigad-status, räknat ur giltighet_regel + föreningens eget
 * årsmötesdatum. Ren funktion, inga sidoeffekter — samma logik ska driva
 * både "raden på sidan" (NIVÅ 1) och cronets 2-månader-innan-utskick.
 * `today` (J3, 2026-08-16) — bara kalenderar/fast_datum använder den,
 * de två manader_efter_*-grenarna räknar oförändrat ur arsmotesdatum.
 *
 * manader_efter_beslut räknas identiskt med manader_efter_arsmote —
 * datamodellen har inget separat beslutsdatum (bara årsmötesdatum lagras,
 * se Subscriber.giltighetArsmoten), så "beslutet" i praktiken ÄR
 * årsmötesdatumet tills ett eget beslutsdatum-fält finns. Flaggat till
 * Jacob, inte en tyst gissning.
 *
 * kalenderar (J3): förfallodatum = 31 december INNEVARANDE år, räknat ur
 * `today` — Jacobs egen instruktion, inklusive "mejl 5 går inte ut om
 * datumet redan passerat". Det villkoret kan i praktiken aldrig slå till
 * (31 december av today:s EGET år är alltid >= today) — kvar som samma
 * "kan inte hända men gissar aldrig"-försvar som redan finns i
 * GiltighetsKontroll.astro, inte borttaget för att det ser onödigt ut.
 *
 * fast_datum (J3): Code-beslut, ingen uttrycklig instruktion för den här
 * grenen — samma "nästa förekomst, rulla framåt om passerad"-princip som
 * riktiga ansökningsdeadlines (nextOccurrenceISO nedan), eftersom en
 * fast_datum-regel återkommer varje år (till skillnad från kalenderar,
 * där Jacob uttryckligen ville ha null i stället för att rulla framåt).
 *
 * ingen_regel (inget förfaller) och okand (vet inte) har inget datum att
 * räkna ur. Ger null — aldrig ett gissat datum.
 */
export function berakForfallodatum(regel: GiltighetRegel, arsmotesdatum: string, today: string): string | null {
  switch (regel.typ) {
    case 'manader_efter_arsmote':
    case 'manader_efter_beslut':
      return regel.antal === null ? null : addMonths(arsmotesdatum, regel.antal);
    case 'kalenderar': {
      const forfallodatum = `${today.slice(0, 4)}-12-31`;
      return forfallodatum < today ? null : forfallodatum;
    }
    case 'fast_datum':
      return regel.datum === null ? null : nextOccurrenceISO(regel.datum, today);
    case 'ingen_regel':
    case 'okand':
      return null;
  }
}

/**
 * J2 (2026-08-16, MEJLTEXTER.md "Regeltext — fraser till mejl 5"): fras
 * för {regeltext} i MEJL.giltighetsvarningNiva1 (content.ts), en rad per
 * typ+antal, verbatim ur källfilens tabell — ingen egen svensk text.
 * "Saknas typen, eller är den okand: mejl 5 går inte ut... Ingen fras
 * uppfinns" — null täcker ingen_regel/okand (ingen rad i tabellen ger
 * dem en fras) och antal: null.
 *
 * kalenderar ("kalenderåret ut") och fast_datum ("till och med {datum}
 * varje år", J3 2026-08-16 — datum formaterat via formatRecurringDate,
 * samma svenska klartext som deadlines redan använder) ger båda en fras
 * OCH ett beräkningsbart förfallodatum (berakForfallodatum ovan) sedan
 * J3 — når mejl 5 på riktigt, inte bara i tabellen.
 */
export function regeltext(regel: GiltighetRegel): string | null {
  switch (regel.typ) {
    case 'manader_efter_arsmote': {
      if (regel.antal === null) return null;
      const n = regel.antal;
      return n === 1 ? 'i en månad efter årsmötet' : `i ${n} månader efter årsmötet`;
    }
    case 'manader_efter_beslut': {
      if (regel.antal === null) return null;
      const n = regel.antal;
      if (n === 12) return 'i ett år från beslutsdagen';
      if (n === 13) return 'i tretton månader från beslutsdagen';
      return `i ${n} månader från beslutsdagen`;
    }
    case 'kalenderar':
      return 'kalenderåret ut';
    case 'fast_datum':
      return regel.datum === null ? null : `till och med ${formatRecurringDate(regel.datum)} varje år`;
    case 'ingen_regel':
    case 'okand':
      return null;
  }
}

/**
 * ISO-datum plus N månader, UTC (negativt N går bakåt — GiltighetsKontroll.
 * astro använder addMonths(forfallodatum, -2) för påminnelsemånaden).
 * Dagen klampas till sista dagen i målmånaden om ursprungsdagen inte
 * finns där (31 jan + 1 månad → 28/29 feb, inte JS-Date:s default-
 * beteende att rulla över till 3 mars).
 */
export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const totalMonths = m - 1 + months;
  const targetYear = y + Math.floor(totalMonths / 12);
  const targetMonthIndex = ((totalMonths % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonthIndex + 1, 0)).getUTCDate();
  const clampedDay = Math.min(d, lastDayOfTargetMonth);
  const date = new Date(Date.UTC(targetYear, targetMonthIndex, clampedDay));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// hittaGiltighetsregel() (fritext-lookup, gav strängen bakom Forutsattning.
// giltighet) RADERAD C3.1 (Jacob 2026-08-11) — superseterad, inte
// text-utan-yta: dess enda yta var GiltighetsKontroll.astro:s realtids-
// besked + den gamla 275-dagarscronen, och båda pekar nu uteslutande på
// giltighet_regel + berakForfallodatum() (se GiltighetsKontroll.astro och
// cron/giltighetsvarning.ts filhuvuden). 0 kvarvarande anropsställen vid
// borttagningen (grep -rn "hittaGiltighetsregel" src/ gav bara denna fils
// egen definition). hittaGiltighetsstatus() nedan är INTE samma sak —
// den läser giltighet_status (granskningsläget på fritexten, till
// VerificationStamp-badgen), en helt annan fråga, och rörs inte av detta.

/**
 * T4 (ÅTGÄRDSSPEC 2026-08-03 kväll): stämpeln räknas nu över FYRA fält,
 * inte tre — giltighet är kommun-nivå (Forutsattning), inte per-bidrag,
 * men en besökare som ansöker bryr sig om hur länge beslutet gäller lika
 * mycket som om belopp/deadline/krav. Samma sök-mönster som Helsingborg
 * ursprungligen avslöjade (giltighet sitter inte alltid på
 * forutsattningar[0] — Helsingborg har den på [1]): hittar den
 * förutsättning som faktiskt BÄR ett giltighet-värde, oavsett index.
 * Faller tillbaka på forutsattningar[0] om ingen bär ett värde (samma
 * "vi gissar inte"-princip: fallbacken pekar aldrig ut fel post, den
 * pekar bara på den enda rimliga kandidaten när ingen är bättre).
 */
export function hittaGiltighetsstatus(forutsattningar: Forutsattning[]): Datatillstand {
  const relevant = forutsattningar.find((f) => f.giltighet) ?? forutsattningar[0];
  return relevant?.giltighet_status ?? 'okand';
}

/**
 * 2b (arbetsorder 2026-08-03): "Till ansökan"-knappen använde kommunens
 * generiska ansokningssystem.url för ALLA bidrag — fel så fort ett bidrag
 * har en egen, mer specifik källa (Gislaveds Föreningsbidrag social
 * verksamhet ligger under omsorg-och-stod/, inte fritid-och-kultursidan
 * knappen pekade på). kalla_url är ett obligatoriskt fält på Bidrag — ska
 * alltid finnas — men fallbacken finns kvar defensivt, aldrig en tom href.
 * En sanning: samma funktion som knappen OCH källfotnoten ska derivera ur,
 * så de aldrig kan divergera igen (se testet i verify-matching.ts).
 */
export function bidragAnsokningsUrl(bidrag: Bidrag, kommun: Kommun): string {
  return bidrag.kalla_url || kommun.ansokningssystem.url;
}

/**
 * C5 (ÅTGÄRDSSPEC, 2026-08-03 kväll): köprutans beskrivning ska sälja mot
 * det system besökaren faktiskt öppnar — men bara om ett riktigt
 * e-tjänstsystem finns. Två namn i corpuset betyder uttryckligen att
 * ansökan går utanför ett system: "E-post" (arboga, arjeplog m.fl.) och
 * "Blankett" (pappersblankett). Verifierat mot hela corpuset 2026-08-03
 * — de enda två värdena av 161 unika ansokningssystem.namn som inte
 * beskriver ett faktiskt system att öppna.
 */
const INGET_ETJANSTSYSTEM = new Set(['e-post', 'blankett']);

export function harEtjanstsystem(kommun: Kommun): boolean {
  return !INGET_ETJANSTSYSTEM.has(kommun.ansokningssystem.namn.trim().toLowerCase());
}

/**
 * 2c (arbetsorder 2026-08-03) + uppföljning 2026-08-03: ursprungligen
 * detekterad enbart via anteckning-mönstret "Relativ tidsfrist: {frist}"
 * (kolon = ett värde att visa, skiljer från t.ex. Åstorps datamodells-
 * kommentar "Relativ tidsfrist kan inte uttryckas..." utan kolon). Nu
 * strukturellt riktigt: deadlines.typ === 'relativ' är den EGENTLIGA
 * grinden (se DEADLINE_TYPER ovan) — anteckning-texten är bara källan
 * till formelns beskrivning, inte längre detektionsmekanismen. En bidrag
 * med typ 'relativ' men en anteckning som inte matchar kolon-mönstret
 * visar ändå hela anteckningen hellre än inget alls.
 */
/**
 * Uppföljning 2026-08-03 (punkt 3): "GRANSKAD"-stämpeln påstod full
 * granskning oavsett hur många av bidragets fält som faktiskt var
 * verifierade — noll av tre räknades som samma sak som tre av tre.
 *
 * T4 (ÅTGÄRDSSPEC, samma kväll, fyra-lägesrevisionen): utökad från tre
 * till fyra fält (+ giltighet, se hittaGiltighetsstatus ovan), och
 * granskat-kriteriet skärpt. 'olast' (extraherat, INTE oberoende
 * omkontrollerat) räknas INTE längre som granskat — bara 'kontrollast'
 * (oberoende bekräftat mot källan) och 'ingen_regel' (bekräftad
 * frånvaro) gör. Det är själva poängen med fyra-lägesrevisionen: ett
 * fält som bara är extraherat har inte granskats i den mening stämpeln
 * påstår, oavsett om vi råkar ha ett värde för det.
 * Noll granskade fält döljer stämpeln helt (VerificationStamp.astro) —
 * en "OGRANSKAT"-etikett hade bara varit ännu ett påstående om ett
 * tomrum, samma fälla som VoidMark redan finns för att undvika.
 */
export type Granskningsniva = 'fullt' | 'delvis' | 'ogranskat';

const GRANSKAT_STATUSAR: readonly Datatillstand[] = ['kontrollast', 'ingen_regel'];

export function bidragGranskningsniva(bidrag: Bidrag, giltighetStatus: Datatillstand): Granskningsniva {
  const statusar = [bidrag.belopp_status, bidrag.deadline_status, bidrag.krav_status, giltighetStatus];
  const antalGranskade = statusar.filter((s) => GRANSKAT_STATUSAR.includes(s)).length;
  if (antalGranskade === 0) return 'ogranskat';
  if (antalGranskade === statusar.length) return 'fullt';
  return 'delvis';
}

const RELATIV_FRIST_RE = /^Relativ tidsfrist:\s*(.+)$/;

export function relativFrist(bidrag: Bidrag): string | null {
  if (bidrag.deadlines.typ !== 'relativ') return null;
  const match = bidrag.anteckning?.match(RELATIV_FRIST_RE);
  if (match) return match[1];
  // A1 (Jacob 2026-08-08): fallbacken visar hela anteckningen när kolon-
  // mönstret inte matchar — men får aldrig visa RÅ text, samma
  // processspråksrisk som BidragCard.astro:s källrad.
  return strippaProcessSprak(bidrag.anteckning).kvar;
}

/**
 * Uppföljning 2026-08-03 (arbetsorder, punkt 2): sen_ansokan ska bara
 * visas när fältet faktiskt bär vad som händer vid en för sen ansökan —
 * inte "Ej angivet i källan" (sentinelvärdet, 2e) och inte en feltaggning
 * där fältet bara restaterar deadline-cykeln ("15 mars varje år" — ett
 * datum, ingen konsekvens). "varje år" verifierat (grep över hela datat,
 * 2026-08-03) att ALDRIG förekomma i en genuin konsekvens-text — bara i
 * den här feltaggningsklassen (12 träffar, se rapporten till Jacob för
 * vilka kommuner).
 *
 * Ärver deadline_status (uppföljning, punkt 2 i den andra arbetsordern):
 * sen_ansokan saknar ett eget statusfält, men "vad händer om man söker
 * sent" är meningslöst utan en känd deadline att vara sen MOT — en
 * kvarglömd sen_ansokan-text på ett bidrag vi inte ens vet deadlinen för
 * (deadline_status: 'okand', ett äkta hål) skulle annars påstå en
 * konsekvens av något odefinierat. 'olast' spärrar INTE (fyra-
 * lägesrevisionen, T3): vi HAR en deadline, bara inte oberoende
 * omkontrollerad — samma reservation gäller överallt (D3), inte en
 * anledning att dölja fältet helt.
 */
export function harRiktigSenAnsokanText(bidrag: Bidrag): boolean {
  if (bidrag.deadline_status === 'okand') return false;
  if (bidrag.sen_ansokan === 'Ej angivet i källan') return false;
  if (/varje år/i.test(bidrag.sen_ansokan)) return false;
  return true;
}

/**
 * 1d (SPEC_HUVUDPROCESSEN §1d, Jacob 2026-08-02): en förutsättnings
 * beskrivning som bockningsbara punkter i stället för ett textblock.
 * Delar ENDAST på meningsgräns (.!?) — ALDRIG på kommatecken. Ett
 * tidigare test (förra sprinten) visade att kommatecken-splittring
 * garblar texten för många kommuner, eftersom kommatecken i svensk
 * löptext inte bara skiljer listelement (uppräkningar, bisatser,
 * "X, Y och Z" blandat med annat). Meningsgränsen är den enda gränsen
 * vi litar på utan att gissa struktur som inte står där.
 *
 * Ger EN punkt (hela texten oförändrad) när beskrivningen bara är en
 * mening — det ÄR flaggan: anroparen ska då rendera prosa som i dag
 * (samma utseende som innan denna funktion fanns), inte tvinga fram en
 * checklista med ett enda kryss. Ingen separat "kuraterings"-lista
 * behövs — fallback-läget är självsynligt (prosa i stället för
 * kryssrutor) för den som tittar på sidan.
 */
export function delaUppKravPunkter(beskrivning: string): string[] {
  return beskrivning
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Antal dagar sedan `verifierad`-datumet. */
export function daysSinceVerified(verifierad: string): number {
  const ms = Date.now() - new Date(verifierad).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export const STALE_THRESHOLD_DAYS = 180;

export function isStale(verifierad: string): boolean {
  return daysSinceVerified(verifierad) > STALE_THRESHOLD_DAYS;
}

const MANADSNAMN = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

/** Formaterar ett ISO-datum (YYYY-MM-DD) som svensk klartext: "10 juli 2026". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MANADSNAMN[m - 1]} ${y}`;
}

/** Formaterar ett återkommande MM-DD-datum (deadlines.datum) som svensk klartext utan år: "31 januari". */
export function formatRecurringDate(mmdd: string): string {
  const [m, d] = mmdd.split('-').map(Number);
  return `${d} ${MANADSNAMN[m - 1]}`;
}

// Kalenderns månadsgruppering (SPEC_DEADLINEKALENDER.md, 2026-07-27) —
// "YYYY-MM" som gruppnyckel, ren sträng/heltalsaritmetik precis som
// nextOccurrenceISO ovan, inga Date-objekt.

/** "YYYY-MM" ur ett ISO-datum (YYYY-MM-DD) — kalenderns gruppnyckel. */
export function manadNyckel(iso: string): string {
  return iso.slice(0, 7);
}

/** Nästa månads "YYYY-MM"-nyckel, med årsrullning vid december. */
export function nastaManadNyckel(manad: string): string {
  const [y, m] = manad.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

/** Svensk rubrikklartext för en "YYYY-MM"-nyckel, versal månad: "September 2026". */
export function formatManadRubrik(manad: string): string {
  const [y, m] = manad.split('-').map(Number);
  const namn = MANADSNAMN[m - 1];
  return `${namn.charAt(0).toUpperCase()}${namn.slice(1)} ${y}`;
}

const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

/** Veckodag för ett ISO-datum, gemener: "onsdag". UTC — samma dygnsgräns som daysUntil. */
export function formatWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return VECKODAGAR[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

const MANADSFORKORTNING = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];

/** Formaterar ett ISO-datum som VerificationStamp-format: "03 JUL". */
export function formatStampDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MANADSFORKORTNING[m - 1]}`;
}

/** "a" / "a och b" / "a, b och c" — svensk uppräkning för mall-variabler. */
export function svenskLista(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} och ${items[items.length - 1]}`;
}

/** Svensk genitivform: "Gislaved" → "Gislaveds", men "Borås" → "Borås'" (namn på -s tar bara apostrof). */
export function possessiv(kommun: string): string {
  return /s$/i.test(kommun) ? `${kommun}'` : `${kommun}s`;
}

const KR_TAL = '(\\d[\\d\\s]*\\d|\\d)\\s*kr(?:onor)?';
// Fall 1: HELA strängen är bara "N kr" — ingen konkurrerande formel/sats
// att missförstå. Fall 2: talet är EXPLICIT inramat som ett tak ("max",
// "högst", "upp till", "dock högst") — utan den inramningen kan en
// kr-siffra lika gärna vara en per-timme-taxa ("1 000 kr/aktivitetstimme")
// eller en fast delsumma i en flerledad formel, inte en gräns. Kräver
// inramningen — annars summerar vi taxor som om de vore tak.
const BELOPP_ENDA_TAL_RE = new RegExp(`^\\s*${KR_TAL}\\s*$`, 'i');
const BELOPP_TAK_RE = new RegExp(`(?:max|högst|upp till|dock högst)\\s+${KR_TAL}`, 'i');

/**
 * Parsar ETT absolut krontak ur Bidrag.belopp fri text, eller null om
 * ingen otvetydig sådan siffra finns (procentbaserade belopp, per-enhet-
 * taxor utan uttalat tak, flerledade formler). Grund för matchningstrattens
 * kostnadsram — summera ALDRIG in ett null-resultat som noll; hoppa över
 * det bidraget helt i summeringen.
 */
export function parseBeloppTak(belopp: string | null): number | null {
  if (!belopp) return null;
  const match = belopp.match(BELOPP_ENDA_TAL_RE) ?? belopp.match(BELOPP_TAK_RE);
  if (!match) return null;
  const siffra = Number(match[1].replace(/\s/g, ''));
  return Number.isFinite(siffra) && siffra > 0 ? siffra : null;
}

// H1.2/F② (2026-08-12) — bredare än parseBeloppTak ovan: den kräver att
// HELA strängen är bara talet, ingen "/år"/"per medlem"-svans ("3 000
// kronor per år" missar annars, trots att det är lika entydigt som "3 000
// kronor"). Skild funktion, inte en utökning av parseBeloppTak — den
// funktionens snäva kontrakt (matchningstrattens kostnadssummering) ska
// inte bli lösare bara för att förstasidan/köprutan har andra behov.
const KR_TAL_LOS = '([0-9][0-9\\s.]*[0-9]|[0-9])\\s*(?:kr|kronor)';
const BELOPP_ENKELT_RE = new RegExp(`^\\s*${KR_TAL_LOS}(?:\\s*/\\s*\\S+|\\s+per\\s+\\S+(?:\\s+\\S+)?)?\\s*$`, 'i');
const BELOPP_TAK_LOS_RE = new RegExp(`^\\s*(?:max|högst|upp till|dock högst)\\s+${KR_TAL_LOS}\\s*$`, 'i');
// Ett rent skrivet belopp kan ändå vara en KOMMUNPOOL, inte ett per-
// förening-tak (Tranås Aktivitetsstöd, H1.7-fyndet: "680 000 kr" i
// belopp-fältet, "Årlig budget 680 000 kr för 2026" i anteckningen).
// belopp-fältet ensamt skiljer inte de två — anteckningen måste kollas med.
const BELOPP_POOL_RE = /totalt|total budget|årlig budget|fördelas (mellan|på)|delas (mellan|på)/i;

/**
 * Det belopp som ska visas för en enskild förening/ansökan.
 *
 * `okand` är modellens standardvärde, inte en ren-pott-klassificering,
 * och ska därför behålla det tidigare belopp_status-styrda beteendet.
 * En migrerad ren kommunpott har i stället `belopp: null` och sitt värde
 * i `kommunens_pott`, så den kan aldrig läcka ut som individuellt belopp.
 * Blandfall har `per_forening` + `kommunens_pott` och visar båda separat.
 */
export function individuelltBelopp(bidrag: Bidrag): string | null {
  return bidrag.belopp;
}

/**
 * Ett bidrags belopp, om och bara om det är EN sak (bara talet, ev. med
 * "/år"/"per medlem", eller ett explicit uttryckt tak) OCH inte är en
 * kommunpool enligt anteckningen. Grund för F②:s ankringsrad (kommunsidans
 * köpruta OCH utkastvyn) och förstasidans svarsyta (H1.2/H1.7) — samma
 * regel på alla tre ställena, inte tre separata gissningar.
 */
export function beloppArEttEnkeltTal(bidrag: Bidrag): number | null {
  const belopp = individuelltBelopp(bidrag);
  if (!belopp) return null;
  if (bidrag.anteckning && BELOPP_POOL_RE.test(bidrag.anteckning)) return null;
  const match = belopp.match(BELOPP_ENKELT_RE) ?? belopp.match(BELOPP_TAK_LOS_RE);
  if (!match) return null;
  const tal = Number(match[1].replace(/[\s.]/g, ''));
  return Number.isFinite(tal) && tal > 0 ? tal : null;
}

export interface BeloppSumma {
  total: number;
  capped: number; // antal bidrag med ett parseat tak — bidrar till total
  uncapped: number; // antal bidrag UTAN parseat tak — exkluderade, kan höja den sanna summan
}

export interface BeloppTackning {
  medBelopp: number; // säkert individuellt belopp finns
  utanBelopp: number; // individuellt belopp saknas eller är ännu oklassificerat
}

/**
 * Räknar hur många av kommunens bidrag som har ett publicerat belopp
 * (`belopp !== null`) kontra inte — grövre än parseBeloppTak/sumBeloppTak
 * (som mäter om ett publicerat belopp gick att tolka som ett krontak).
 * H24 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): grund för täckningsbadgen —
 * medBelopp === 0 && utanBelopp > 0 betyder att INGET av kommunens bidrag
 * har ett publicerat belopp, en kommunegenskap, inte ett dataglapp hos oss.
 */
export function beloppTackning(kommun: Kommun): BeloppTackning {
  let medBelopp = 0;
  let utanBelopp = 0;
  for (const bidrag of kommun.bidrag) {
    if (individuelltBelopp(bidrag) !== null) medBelopp++;
    else utanBelopp++;
  }
  return { medBelopp, utanBelopp };
}

/**
 * Summerar parseBeloppTak() över en lista bidrag. Ett bidrag utan parseat
 * tak bidrar varken till total eller capped — bara till uncapped, så
 * anroparen kan visa en fotnot om vad som utelämnats (Design turn-14).
 */
export function sumBeloppTak(bidragLista: Bidrag[]): BeloppSumma {
  let total = 0;
  let capped = 0;
  for (const bidrag of bidragLista) {
    const tak = parseBeloppTak(individuelltBelopp(bidrag));
    if (tak !== null) {
      total += tak;
      capped++;
    }
  }
  return { total, capped, uncapped: bidragLista.length - capped };
}

/**
 * Tidigaste kommande deadline för ett bidrag, som ISO-datum — null om bidraget
 * söks löpande (inget datum att jämföra mot). Underlag för progressionens
 * station 2/4-sortering (FORUTSATTNINGAR.md §4).
 */
export function earliestDeadlineISO(bidrag: Bidrag, today: string): string | null {
  if (bidrag.deadlines.typ === 'lopande') return null;
  const occurrences = bidrag.deadlines.datum.map((mmdd) => nextOccurrenceISO(mmdd, today));
  return occurrences.sort()[0] ?? null;
}

/** Dagens datum som YYYY-MM-DD (lokal tid). */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Räknar ut nästa förekomst av ett återkommande MM-DD-datum relativt `todayISO`,
 * som ett fullt ISO-datum (YYYY-MM-DD). Ren sträng/heltalsjämförelse — inga
 * Date-objekt inblandade, så tidszon kan aldrig ge en off-by-one.
 */
export function nextOccurrenceISO(mmdd: string, today: string): string {
  const [ty] = today.split('-').map(Number);
  const todayKey = today.slice(5); // "MM-DD"
  const year = mmdd >= todayKey ? ty : ty + 1;
  return `${year}-${mmdd}`;
}

/** Antal dagar från `today` till `dateISO` (kan bli 0 om det är idag). */
export function daysUntil(dateISO: string, today: string): number {
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(dateISO) - toUTC(today)) / (1000 * 60 * 60 * 24));
}

/**
 * ISO-datum minus N dagar, UTC — samma dygnsgräns som daysUntil. H19
 * (SPEC: Kluster 1, utfallsslingan): nextOccurrenceISO rullar bara
 * FRAMÅT och kan alltså aldrig hitta "deadlinen som var 14 dagar sedan"
 * — den frågan går åt andra hållet, därav en egen funktion i stället för
 * att försöka vända nextOccurrenceISO baklänges.
 */
export function subtractDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export type Urgency = 'urgent' | 'attention' | 'positive';

/** Urgens-modellen (tokens.css §04): ≤3 dagar bråttom, 4–14 snart, annars god tid. */
export function getUrgency(days: number): Urgency {
  if (days <= 3) return 'urgent';
  if (days <= 14) return 'attention';
  return 'positive';
}

export interface DeadlineEntry {
  kommun: string;
  kommunSlug: string;
  bidragId: string;
  bidragNamn: string;
  kategori: Kategori[];
  isLopande: boolean;
  dateISO: string | null; // null för löpande — kan inte placeras kronologiskt
  belopp: string | null; // endast bekräftat individuellt belopp — kalendern kör det genom parseBeloppTak()
  deadlineStatus: Datatillstand; // TILLSTANDET_OLAST.md 4c yta 3/4 — markören i kalender- och förstasidesraden
}

export const KATEGORI_LABELS: Record<Kategori, string> = {
  idrott: 'Idrott',
  kultur: 'Kultur',
  social: 'Social',
  pensionar: 'Pensionär',
  funktionsratt: 'Funktionsrätt',
  ovrig: 'Övrigt',
};

// R7.2 (Jacob 2026-08-08), igenkänningsraden: "Ordnat för en
// idrottsförening." — bara Verksamhet-värden som bildar ett riktigt,
// etablerat svenskt sammansatt ord tas med. 'social' och 'annat' ger
// inget naturligt sammansatt ord ("socialförening" är inte svenska) —
// konsumenten faller tillbaka på en generisk formulering utan
// substantiv-sammansättning när uppslaget saknas, eller när profilen
// har fler än ett verksamhet-värde (ingen given regel för hur flera
// värden ska sammanfogas till ett sammansatt ord).
export const VERKSAMHET_FORENING_LABELS: Partial<Record<Verksamhet, string>> = {
  idrott: 'idrottsförening',
  kultur: 'kulturförening',
  hembygd: 'hembygdsförening',
  friluft: 'friluftsförening',
  ungdom: 'ungdomsförening',
};
