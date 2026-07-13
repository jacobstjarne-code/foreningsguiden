/**
 * kommuner.ts — Loads and validates all kommun-YAML från data/kommuner/.
 * Bygget ska faila hårt på trasig eller ofullständig YAML (§4 UPPDRAG_POC.md) —
 * validering körs vid modul-load, alltså vid varje `astro build`/`astro dev`.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';

export const KATEGORIER = ['idrott', 'kultur', 'social', 'pensionar', 'funktionsratt', 'ovrig'] as const;
export type Kategori = (typeof KATEGORIER)[number];

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
  system: string;
  ledtid: number | null; // dagar
  ledtid_text: string | null;
  giltighet: string | null;
  ordning: number;
  kalla_url: string;
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
}

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

function normalizeDate(v: unknown): unknown {
  // js-yaml parsar YAML-datum (utan citattecken) som JS Date-objekt.
  return v instanceof Date ? v.toISOString().slice(0, 10) : v;
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
  if (!isNonEmptyString(raw.sen_ansokan)) problems.push(`${where}.sen_ansokan saknas eller är tom`);
  if (!isNonEmptyString(raw.kalla_url)) problems.push(`${where}.kalla_url saknas eller är tom`);
  if (raw.anteckning !== null && raw.anteckning !== undefined && typeof raw.anteckning !== 'string') {
    problems.push(`${where}.anteckning måste vara text eller null`);
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
  if (!isNonEmptyString(raw.system)) problems.push(`${where}.system saknas eller är tom`);

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

  raw.ledtid = raw.ledtid ?? null;
  raw.ledtid_text = raw.ledtid_text ?? null;
  raw.giltighet = raw.giltighet ?? null;

  return raw as Forutsattning;
}

function validateKommun(raw: any, file: string): Kommun {
  const problems: string[] = [];

  if (!isNonEmptyString(raw?.kommun)) problems.push('kommun saknas eller är tom');
  if (!isNonEmptyString(raw?.kommun_slug)) problems.push('kommun_slug saknas eller är tom');
  if (isNonEmptyString(raw?.kommun_slug) && !/^[a-z0-9-]+$/.test(raw.kommun_slug)) {
    problems.push(`kommun_slug "${raw.kommun_slug}" innehåller otillåtna tecken (endast a-z, 0-9, -)`);
  }
  if (!isNonEmptyString(raw?.lan)) problems.push('lan saknas eller är tom');
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

  if (problems.length > 0) {
    throw new SchemaError(file, problems);
  }

  return raw as Kommun;
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
    kommuner.push(validateKommun(raw, file));
  }

  kommuner.sort((a, b) => a.kommun.localeCompare(b.kommun, 'sv'));
  _cache = kommuner;
  return kommuner;
}

export function getKommunBySlug(slug: string): Kommun | undefined {
  return loadKommuner().find((k) => k.kommun_slug === slug);
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

/**
 * Platt, kronologiskt sorterad lista över alla deadlines i alla kommuner —
 * underlag för deadlinekalendern (§5 punkt 4 UPPDRAG_POC.md). Löpande
 * bidrag saknar datum och sorteras sist, som en egen sektion.
 */
export function getDeadlineEntries(today: string = todayISO()): DeadlineEntry[] {
  const entries: DeadlineEntry[] = [];

  for (const kommun of loadKommuner()) {
    for (const bidrag of kommun.bidrag) {
      const base = {
        kommun: kommun.kommun,
        kommunSlug: kommun.kommun_slug,
        bidragId: bidrag.id,
        bidragNamn: bidrag.namn,
        kategori: bidrag.kategori,
      };
      if (bidrag.deadlines.typ === 'lopande') {
        entries.push({ ...base, isLopande: true, dateISO: null });
        continue;
      }
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

export const KATEGORI_LABELS: Record<Kategori, string> = {
  idrott: 'Idrott',
  kultur: 'Kultur',
  social: 'Social',
  pensionar: 'Pensionär',
  funktionsratt: 'Funktionsrätt',
  ovrig: 'Övrigt',
};
