/**
 * utkastGenerator.ts — Bidragsutkastgeneratorn (SPEC_GENERATOR steg 3).
 * Deterministisk, rent funktionell — inget I/O, inget LLM-anrop. Ett LLM-
 * steg hade gjort golden set-grinden (scripts/verify-generator.ts)
 * icke-deterministisk; hela poängen med grinden är att samma indata alltid
 * ger samma utdata att jämföra mot facit.
 *
 * Fyra hårda spärrar (Jacob, 2026-07-26), var och en maskinellt testad i
 * scripts/verify-generator.ts:
 *   1. Aldrig ett krav som inte står i Bidrag.krav[] — kravText citeras
 *      alltid ordagrant, i samma ordning.
 *   2. Lovar aldrig bifall — ansvarsraden är en redan Fable-godkänd konstant,
 *      aldrig egenskriven prosa.
 *   3. Ärliga luckor — fyllKrav() gissar aldrig utanför sin snäva vitlista.
 *   4. Oregistrerad förening får registreringsutkastet FÖRST — se
 *      registreringForst(), som återanvänder visaBorjaHar() (matching.ts)
 *      rakt av i stället för att bygga om samma gate.
 *
 * Ingen ny svensk prosa skrivs här. Allt textinnehåll är antingen (a)
 * Bidrag.krav[i] citerat ordagrant, (b) en importerad, redan godkänd
 * copy-konstant, eller (c) en mekanisk platshållare/{{FABLE:}}-slot.
 */

import type { Bidrag, Kommun } from './kommunTyper.ts';
import { earliestDeadlineISO, formatDate, todayISO } from './kommunTyper.ts';
import type { Foreningsprofil } from './foreningsprofil.ts';
import { visaBorjaHar } from './matching.ts';
import { VANTELISTA, VAGLEDNING } from './content.ts';

export interface UtkastKravRad {
  /** Bidrag.krav[i] — ordagrant citat, aldrig omskrivet. */
  kravText: string;
  status: 'ifyllt' | 'lucka';
  /** ifyllt: den ifyllda uppgiften. lucka: en fast platshållartext. */
  innehall: string;
  kalla: 'kommunSlug' | 'verksamhet' | null;
}

export interface UtkastDokument {
  typ: 'bidragsutkast';
  bidragId: string;
  bidragNamn: string;
  kommun: string;
  kommunSlug: string;
  belopp: string | null;
  deadlineText: string;
  kravRader: UtkastKravRad[];
  luckor: number;
  ansvarsrad: string;
  kalla_url: string;
}

export interface RegistreringForstResultat {
  typ: 'registrering_forst';
  kommunSlug: string;
  registreraHref: string;
  skal: 'ej_sokt' | 'kraver_registrering';
}

export type GeneratorResultat = UtkastDokument | RegistreringForstResultat;

/**
 * Ansvarsraden — flagga #1 i planen. VANTELISTA.ansvar (content.ts) valt
 * framför VAGLEDNING.station5.ansvar: den säger uttryckligen "vi lovar
 * inte bifall", vilket matchar spärr 2 ord för ord bättre än station5s
 * neutrala formulering. Öppen för Fable/Jacob att byta — se HANDOVER.
 */
const ANSVARSRAD = VANTELISTA.ansvar;

/** Platshållare för en obemött lucka. Etableras, inte uppfunnen på nytt: samma "[Fyll i: X]"-form Jacob gav i uppdraget. */
function luckaText(): string {
  return '[Fyll i: uppgift som styrker att kravet är uppfyllt]';
}

/**
 * Fält som gör en sträng till en SAMMANSATT mening, ett undantagsfall, eller
 * en omvänd/villkorad formulering — förekommer NÅGOT av dessa i kravtexten
 * spärras ett annars matchande mönster, eftersom resten av meningen då är en
 * lucka (eller rentav motsatt betydelse) som en "ifyllt"-markering skulle
 * dölja (spärr 3).
 *
 * Listan är EMPIRISKT framtagen, inte hypotetisk: sonderad mot 3541 verkliga
 * krav-strängar (2026-07-26, se sondera-fyllkrav.mjs-körningen i samma
 * commit) genom att köra regel A UTAN guard och läsa igenom alla 16 träffar
 * för hand. 8 av 16 var falska positiva och avslöjade fem distinkta
 * felmönster naivt "innehåller ordet säte"-matchning missar:
 *   - AND-sammansatt villkor ("...och huvudsakligen bedriva verksamhet...",
 *     boden/pitea/rattvik) → huvudsak/huvuddel/verksam inom/bedriva...verksamhet
 *   - Undantagsklausul, omvänd betydelse ("Studieförbund UTAN lokalt säte...
 *     kan ansöka efter särskild prövning", norrtälje — ordet "säte" förekommer
 *     i en mening som säger att det INTE krävs) → särskild prövning/undantag/
 *     kan ansöka
 *   - Villkorad/omvänd polaritet ("...OM föreningen har säte UTANFÖR
 *     kommunen", uddevalla-medlem — motsatsen till vad vi vill bekräfta)
 *     → utanför/trots
 *   - Exemplifierande, inte definierande ("t.ex. säte, verksamhet",
 *     sundbyberg — säte är EN av flera möjliga indikatorer, inte kravet
 *     självt) → t.ex./till exempel
 *   - Annan juridisk/geografisk räckvidd än hela kommunen (bidragsberättigad-
 *     status, sub-kommunalt "verksamhetsområde", eller individens
 *     folkbokföring snarare än föreningens säte) → bidragsberättigad/
 *     folkbokförd/verksamhetsområd/området/anknytning
 * Kvar efter den utökade listan: 6 träffar, samtliga lästa för hand och
 * bekräftat rena enkla-villkor (t.ex. "Föreningen ska ha sitt säte i Kalmar
 * kommun"). "eller" guardas brett (hellre en missad säker OR-täckning, t.ex.
 * Vallentunas "säte ELLER huvuddelen av verksamheten", än en gissning i fel
 * riktning — spärr 3:s uttryckliga bias).
 */
const GUARD_TERMER = /\d|medlem|\bår\b|\bårs\b|månad|styrelse|stadga|organisationsnummer|\borg\.?\s*nr\b|bank|riksorganisation|budget|revisor|årsmöte|verksamhetsberättelse|\bantal\b|\bminst\b|\bhögst\b|\bmax\b|huvudsak|huvuddel|verksam\s+inom|bedriva.*verksamhet|\beller\b|särskild\s+pr[öo]vning|undantag|kan\s+ansöka|utanför|\btrots\b|t\.ex\.|till\s+exempel|bidragsberättigad|folkbokförd|verksamhetsområd|\bområdet\b|anknytning/i;

const SATE_MONSTER = /\bsäte\b|hemmahörande|hemmahör/i;

/**
 * FIX 2026-07-30 (Jacob, golden set-facit 11/12 arvika-verksamhetsbidrag-
 * idrott/arvika-ungdom-kultur): "Verksamheten ska bedrivas i/inom X
 * kommun" är sakligt samma säteskrav som SATE_MONSTER redan fångar, bara
 * i annan ordform — men bara när X faktiskt ÄR den kommun bidraget
 * tillhör. Dynamiskt byggd regex, inte statisk, av precis den anledningen:
 * en generisk "bedrivs i [vilken kommun som helst] kommun" hade träffat
 * fel. Stickprov mot hela korpusen (2026-07-30, grep över data/kommuner/
 * *.yaml) hittade 24 träffar på mönstret — bland dem två som INTE är
 * kommunnamn ("bedrivas i subventionerade kommun", "bedrivas i av
 * kommun", sannolikt andra syftningar/extraktionsartefakter). Att kräva
 * exakt kommun.kommun (med valfri genitiv-s: "Karlstad" → "Karlstads
 * kommun") utesluter båda utan en egen undantagslista — ingen riktig
 * kommun heter "subventionerade" eller "av".
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function bedrivsIKommunMonster(kommunNamn: string): RegExp {
  return new RegExp(`bedriv\\w*\\s+(?:i|inom)\\s+\\b${escapeRegExp(kommunNamn)}s?\\s+kommun`, 'i');
}

const VERKSAMHET_ORD: Record<string, RegExp> = {
  idrott: /\bidrott(?:s|en)?\b/i,
  kultur: /\bkultur(?:en)?\b/i,
  hembygd: /\bhembygd/i,
  friluft: /\bfriluft/i,
  social: /\bsocial[at]?\b/i,
  ungdom: /\bungdom/i,
  annat: /(?!)/, // "annat" är för generiskt för ett textmönster — matchar aldrig
};

interface FyllResultat {
  status: 'ifyllt' | 'lucka';
  innehall: string;
  kalla: 'kommunSlug' | 'verksamhet' | null;
}

/**
 * Den snäva vitlistan. Två regler, båda med en egen guard som blockerar
 * träffen så fort kravtexten innehåller något ANNAT testbart villkor.
 * Allt som inte otvetydigt matchar en regel blir en lucka — default är
 * alltid "vet inte", aldrig en gissning.
 */
export function fyllKrav(kravText: string, profil: Foreningsprofil, bidrag: Bidrag, kommun: Kommun): FyllResultat {
  const harGuardTerm = GUARD_TERMER.test(kravText);

  // Regel A — säte. Profilens kommunval ÄR sätesfrågan (GUIDE_TRATT_COPY.ts
  // fraga_kommun.hjalp: "Kommunen där föreningen har sitt säte."), så en ren
  // säte-mening kan fyllas i säkert utan gissning. "Bedrivs i/inom X
  // kommun" räknas som samma sakuppgift (se bedrivsIKommunMonster ovan) —
  // men bara när X är DENNA kommun, inte en generisk kommun-nämning.
  const sateTraff = SATE_MONSTER.test(kravText) || bedrivsIKommunMonster(kommun.kommun).test(kravText);
  if (!harGuardTerm && sateTraff && profil.kommunSlug === kommun.kommun_slug) {
    return { status: 'ifyllt', innehall: `Föreningen har sitt säte i ${kommun.kommun}.`, kalla: 'kommunSlug' };
  }

  // Regel B — verksamhet. Träffar bara om kravtexten explicit nämner en
  // Verksamhet-etikett som redan finns i bidragets foreningstyp OCH
  // profilen har den. Förväntad nästan-0-träff i produktionsdata (kategori
  // filtreras redan bort uppströms via malgrupp) — det är korrekt, inte
  // trasigt, om denna regel aldrig slår till.
  if (!harGuardTerm && bidrag.foreningstyp) {
    const traff = bidrag.foreningstyp.find(
      (v) => profil.verksamhet.includes(v) && VERKSAMHET_ORD[v]?.test(kravText)
    );
    if (traff) {
      return { status: 'ifyllt', innehall: `Föreningens verksamhet: ${traff}.`, kalla: 'verksamhet' };
    }
  }

  return { status: 'lucka', innehall: luckaText(), kalla: null };
}

/**
 * Registreringsgaten — spärr 4. Återanvänder visaBorjaHar() (matching.ts)
 * rakt av i stället för att bygga om samma logik: profil.sokt !== 'ja'
 * betyder där redan "inte känd som registrerad/bidragsberättigad".
 */
function registreringForst(profil: Foreningsprofil, bidrag: Bidrag): RegistreringForstResultat | null {
  if (!visaBorjaHar(profil, [bidrag])) return null;
  return {
    typ: 'registrering_forst',
    kommunSlug: profil.kommunSlug as string,
    registreraHref: `/kommun/${profil.kommunSlug}/registrera/`,
    skal: profil.sokt !== 'ja' ? 'ej_sokt' : 'kraver_registrering',
  };
}

function deadlineText(bidrag: Bidrag): string {
  if (bidrag.deadlines.typ === 'lopande') return 'Söks löpande, inget fast datum.';
  if (bidrag.deadlines.typ === 'okand') return 'Kommunen publicerar inget ansökningsdatum — kontrollera direkt hos kommunen.';
  const iso = earliestDeadlineISO(bidrag, todayISO());
  return iso ? formatDate(iso) : 'Söks löpande, inget fast datum.';
}

/**
 * Renderar ett strukturerat bidragsutkast — ett stycke per Bidrag.krav[i],
 * eller registreringsutkastet FÖRST om föreningen inte är känd som
 * registrerad (spärr 4). Ingen fri prosa: se filhuvudet.
 */
export function genereraUtkast(profil: Foreningsprofil, bidrag: Bidrag, kommun: Kommun): GeneratorResultat {
  const gate = registreringForst(profil, bidrag);
  if (gate) return gate;

  const kravRader: UtkastKravRad[] = bidrag.krav.map((kravText) => {
    const r = fyllKrav(kravText, profil, bidrag, kommun);
    return { kravText, status: r.status, innehall: r.innehall, kalla: r.kalla };
  });

  return {
    typ: 'bidragsutkast',
    bidragId: bidrag.id,
    bidragNamn: bidrag.namn,
    kommun: kommun.kommun,
    kommunSlug: kommun.kommun_slug,
    belopp: bidrag.belopp,
    deadlineText: deadlineText(bidrag),
    kravRader,
    luckor: kravRader.filter((r) => r.status === 'lucka').length,
    ansvarsrad: ANSVARSRAD,
    kalla_url: bidrag.kalla_url,
  };
}

export interface RegistreringsUtkastRad {
  vad: string;
  beskrivning: string;
  ledtidText: string;
  giltighetText: string | null;
  kallaUrl: string;
}

/**
 * H8 (GRANSKNING_foreningsguiden.md): "samma motor" som bidragsutkastet
 * — den registreringsutkast-produkten kräver ("249 kr, automatiserat").
 * Ren, deterministisk rendering av Kommun.forutsattningar[], samma
 * VAGLEDNING.station3-mallar som registrera/index.astro:s fria vy redan
 * använder (ingen ny svensk text). Två konsumenter: den fria sidan
 * (oförändrad, egen rendering) och stripe-webhook.ts (mejlar detta som
 * det köpta utkastet).
 */
export function genereraRegistreringsUtkast(kommun: Kommun): RegistreringsUtkastRad[] {
  const forutsattningar = [...kommun.forutsattningar].sort((a, b) => a.ordning - b.ordning);
  return forutsattningar.map((f) => ({
    vad: f.vad,
    beskrivning: f.beskrivning,
    ledtidText:
      f.ledtid !== null
        ? VAGLEDNING.station3.ledtidKand.replace('{ledtid}', String(f.ledtid))
        : (f.ledtid_text ?? VAGLEDNING.station3.ledtidOkand.replace(/{kommun}/g, kommun.kommun)),
    giltighetText: f.giltighet ? VAGLEDNING.station3.giltighetVarning.replace('{giltighet}', f.giltighet) : null,
    kallaUrl: f.kalla_url,
  }));
}
