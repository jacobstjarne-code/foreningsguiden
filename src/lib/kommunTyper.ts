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
export const DEADLINE_TYPER = ['fasta', 'lopande', 'okand'] as const;
export type DeadlineTyp = (typeof DEADLINE_TYPER)[number];

// Extraktionsstatus för kritiska fält. `overifierat` är standard och betyder
// att källan inte har kunnat avgöras. `ingen_regel` får bara användas när
// kommunen uttryckligen anger att ingen gräns, frist eller regel finns.
export const FALT_STATUSAR = ['angivet', 'ingen_regel', 'overifierat'] as const;
export type FaltStatus = (typeof FALT_STATUSAR)[number];

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


  // Källsäkerhet per kritiskt fält. Alla fält defaultar till `overifierat`
  // för äldre data och måste aktivt sättas av den som läst källan.
  belopp_status: FaltStatus;
  deadline_status: FaltStatus;
  krav_status: FaltStatus;
  giltighet_status: FaltStatus;
  krav_fullstandiga: boolean;
  giltighet: string | null;

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
}

/**
 * Den giltighetsregel som faktiskt ska räknas mot (GiltighetsKontroll.astro,
 * KommunProgression.astro station 3, cron/giltighetsvarning.ts). En kommun
 * kan ha flera förutsättningar och `giltighet` sitter inte alltid på den
 * första — Helsingborg har den på forutsattningar[1] (forutsattningar[0]
 * är "registrera dig", giltighet: null; forutsattningar[1] är "förbli
 * bidragsberättigad", giltighet satt). Ett rakt `forutsattningar[0]?.giltighet`
 * missar den regeln helt och tystnar tyst till "vi gissar inte" — bugg
 * hittad 2026-08-02 vid Playwright-verifiering av 1f Yta 2, ingen tidigare
 * kommun i datat hade en andra förutsättning med giltighet satt.
 */
export function hittaGiltighetsregel(forutsattningar: Forutsattning[]): string | null {
  return forutsattningar.find((f) => f.giltighet)?.giltighet ?? null;
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

export interface BeloppSumma {
  total: number;
  capped: number; // antal bidrag med ett parseat tak — bidrar till total
  uncapped: number; // antal bidrag UTAN parseat tak — exkluderade, kan höja den sanna summan
}

export interface BeloppTackning {
  medBelopp: number; // bidrag.belopp !== null — kommunen har publicerat NÅGOT beloppsvärde
  utanBelopp: number; // bidrag.belopp === null
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
    if (bidrag.belopp !== null) medBelopp++;
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
    const tak = parseBeloppTak(bidrag.belopp);
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
  belopp: string | null; // rå fritext ur Bidrag.belopp — kalendern kör den genom parseBeloppTak() själv
}

export const KATEGORI_LABELS: Record<Kategori, string> = {
  idrott: 'Idrott',
  kultur: 'Kultur',
  social: 'Social',
  pensionar: 'Pensionär',
  funktionsratt: 'Funktionsrätt',
  ovrig: 'Övrigt',
};
