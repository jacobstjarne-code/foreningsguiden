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

export const DEADLINE_TYPER = ['fasta', 'lopande'] as const;
export type DeadlineTyp = (typeof DEADLINE_TYPER)[number];

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
}

export const KATEGORI_LABELS: Record<Kategori, string> = {
  idrott: 'Idrott',
  kultur: 'Kultur',
  social: 'Social',
  pensionar: 'Pensionär',
  funktionsratt: 'Funktionsrätt',
  ovrig: 'Övrigt',
};
