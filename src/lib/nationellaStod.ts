import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import { BIDRAG_STATUSAR, DATATILLSTAND, KATEGORIER, VERKSAMHETER, nextOccurrenceISO, todayISO, formatRecurringDate, svenskLista } from './kommunTyper.ts';
import type { Datatillstand } from './kommunTyper.ts';
import type {
  NationellDataflagga,
  NationellDeadlineEntry,
  NationellKalla,
  NationelltStod,
  Sanktionsteg,
} from './nationellaTyper.ts';

export * from './nationellaTyper.ts';

const DATA_DIR = resolve(process.cwd(), 'data', 'nationella-stod');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_OR_DATE_RE = /^\d{4}-\d{2}(?:-\d{2})?$/;
const MMDD_RE = /^\d{2}-\d{2}$/;

class NationelltSchemaError extends Error {
  constructor(file: string, problems: string[]) {
    super(`Trasig nationell stöd-YAML: ${file}\n  - ${problems.join('\n  - ')}`);
    this.name = 'NationelltSchemaError';
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function normalizeDate(v: unknown): unknown {
  return v instanceof Date ? v.toISOString().slice(0, 10) : v;
}

function validateStatus(value: unknown, where: string, problems: string[]): value is Datatillstand {
  if (!DATATILLSTAND.includes(value as Datatillstand)) {
    problems.push(`${where} är "${value}" (tillåtna: ${DATATILLSTAND.join(', ')})`);
    return false;
  }
  return true;
}

function validateKallor(raw: any, problems: string[]): Set<string> {
  if (!Array.isArray(raw.kallor) || raw.kallor.length === 0) {
    problems.push('kallor måste vara en icke-tom lista');
    return new Set();
  }
  const ids = new Set<string>();
  raw.kallor.forEach((k: NationellKalla, i: number) => {
    const where = `kallor[${i}]`;
    if (!isNonEmptyString(k?.id)) problems.push(`${where}.id saknas`);
    else if (ids.has(k.id)) problems.push(`${where}.id "${k.id}" är duplicerat`);
    else ids.add(k.id);
    if (!isNonEmptyString(k?.titel)) problems.push(`${where}.titel saknas`);
    if (!isNonEmptyString(k?.url) || !/^https?:\/\//.test(k.url)) problems.push(`${where}.url måste vara en http(s)-URL`);
    k.last_datum = normalizeDate(k?.last_datum) as string;
    if (!isNonEmptyString(k?.last_datum) || !DATE_RE.test(k.last_datum)) problems.push(`${where}.last_datum måste vara YYYY-MM-DD`);
    k.giltig_fran = normalizeDate(k?.giltig_fran ?? null) as string | null;
    if (k.giltig_fran !== null && (!isNonEmptyString(k.giltig_fran) || !DATE_RE.test(k.giltig_fran))) problems.push(`${where}.giltig_fran måste vara YYYY-MM-DD eller null`);
    if (!['foreskrift', 'informationssida', 'faq'].includes(k?.kalltyp)) problems.push(`${where}.kalltyp är ogiltig`);
  });
  return ids;
}

function sourceExists(id: unknown, where: string, sourceIds: Set<string>, problems: string[]): void {
  if (!isNonEmptyString(id) || !sourceIds.has(id)) problems.push(`${where} refererar en okänd kalla_id "${id}"`);
}

function validateSanctions(raw: any, sourceIds: Set<string>, problems: string[]): void {
  const s = raw.sanktionstrappa;
  if (!s || typeof s !== 'object') {
    problems.push('sanktionstrappa saknas');
    return;
  }
  validateStatus(s.status, 'sanktionstrappa.status', problems);
  if (!Array.isArray(s.steg) || s.steg.length !== 4) problems.push('sanktionstrappa.steg måste innehålla exakt fyra steg');
  (s.steg ?? []).forEach((steg: Sanktionsteg, i: number) => {
    const where = `sanktionstrappa.steg[${i}]`;
    if (!Array.isArray(steg.perioder) || steg.perioder.length !== 2) problems.push(`${where}.perioder måste innehålla februari/mars- och augusti/septemberperiod`);
    for (const [j, period] of (steg.perioder ?? []).entries()) {
      if (!MMDD_RE.test(period?.fran ?? '')) problems.push(`${where}.perioder[${j}].fran måste vara MM-DD`);
      if (period?.till !== null && !MMDD_RE.test(period?.till ?? '')) problems.push(`${where}.perioder[${j}].till måste vara MM-DD eller null`);
    }
    if (!['reducering', 'avslag'].includes(steg.pafoljd)) problems.push(`${where}.pafoljd är ogiltig`);
    if (steg.pafoljd === 'reducering' && ![25, 50, 75].includes(steg.reducering_procent ?? -1)) problems.push(`${where}.reducering_procent måste vara 25, 50 eller 75`);
    if (steg.pafoljd === 'avslag' && steg.reducering_procent !== null) problems.push(`${where}.reducering_procent måste vara null vid avslag`);
  });
  if (!isNonEmptyString(s.undantag)) problems.push('sanktionstrappa.undantag saknas');
  sourceExists(s.kalla_id, 'sanktionstrappa.kalla_id', sourceIds, problems);
}

function validateFlags(raw: any, sourceIds: Set<string>, problems: string[]): void {
  if (!Array.isArray(raw.dataflaggor)) {
    problems.push('dataflaggor måste vara en lista');
    return;
  }
  const flags = raw.dataflaggor as NationellDataflagga[];
  if (flags.filter((f) => f.typ === 'systembyte').length !== 1) problems.push('dataflaggor måste innehålla exakt en systembyte-flagga');
  if (flags.filter((f) => f.typ === 'behorighet').length !== 1) problems.push('dataflaggor måste innehålla exakt en behörighetsflagga');
  flags.forEach((flag, i) => {
    const where = `dataflaggor[${i}]`;
    flag.galler_fran = normalizeDate(flag.galler_fran) as string;
    validateStatus(flag.status, `${where}.status`, problems);
    if (!MONTH_OR_DATE_RE.test(flag.galler_fran ?? '')) problems.push(`${where}.galler_fran måste vara YYYY-MM eller YYYY-MM-DD`);
    if (!isNonEmptyString(flag.beskrivning)) problems.push(`${where}.beskrivning saknas`);
    sourceExists(flag.kalla_id, `${where}.kalla_id`, sourceIds, problems);
    if (flag.typ === 'systembyte') {
      if (!isNonEmptyString(flag.system_fore) || !isNonEmptyString(flag.system_efter)) problems.push(`${where} måste ange system_fore och system_efter`);
    } else if (flag.typ === 'behorighet') {
      if (flag.omfattning !== 'idrottsarenan_ekonomiska_stod') problems.push(`${where}.omfattning måste vara idrottsarenan_ekonomiska_stod`);
      if (flag.e_legitimation !== 'Freja+') problems.push(`${where}.e_legitimation måste vara Freja+`);
      if (flag.aktiveras_for_stodet_vid_flagga !== 'systembyte') problems.push(`${where}.aktiveras_for_stodet_vid_flagga måste vara systembyte`);
    } else {
      problems.push(`${where}.typ är ogiltig`);
    }
  });
}

function validateNationelltStod(raw: any, file: string, stem: string): NationelltStod {
  const problems: string[] = [];
  if (!raw || typeof raw !== 'object') throw new NationelltSchemaError(file, ['saknar innehåll']);
  if (!isNonEmptyString(raw.id)) problems.push('id saknas');
  if (raw.id !== stem) problems.push(`filnamnets stam "${stem}" matchar inte id "${raw.id}"`);
  if (!isNonEmptyString(raw.namn)) problems.push('namn saknas');
  if (raw.niva !== 'nationell') problems.push('niva måste vara nationell');
  if (raw.kommun_slug !== undefined) problems.push('kommun_slug får inte finnas på ett nationellt stöd');
  if (raw.omfattning?.kommuner !== 'alla' || raw.omfattning?.antal_kommuner !== 290) problems.push('omfattning måste vara alla 290 kommuner');
  if (!BIDRAG_STATUSAR.includes(raw.status)) problems.push(`status är ogiltig`);
  if (!Array.isArray(raw.kategori) || raw.kategori.length === 0 || raw.kategori.some((k: string) => !KATEGORIER.includes(k as any))) problems.push('kategori måste vara en icke-tom lista med kända kategorier');
  if (raw.foreningstyp !== null && (!Array.isArray(raw.foreningstyp) || raw.foreningstyp.length === 0 || raw.foreningstyp.some((v: string) => !VERKSAMHETER.includes(v as any)))) problems.push('foreningstyp måste vara null eller en icke-tom lista med kända verksamheter');
  if (!isNonEmptyString(raw.malgrupp)) problems.push('malgrupp saknas');
  if (!isNonEmptyString(raw.ansokningssystem?.namn) || !isNonEmptyString(raw.ansokningssystem?.url)) problems.push('ansokningssystem måste ha namn och url');

  const sourceIds = validateKallor(raw, problems);
  const huvudkalla = raw.kallor?.find((k: NationellKalla) => k.url === raw.kalla_url);
  if (!huvudkalla) problems.push('kalla_url måste motsvara URL:en för en post i kallor');

  if (!Array.isArray(raw.krav) || raw.krav.length === 0) problems.push('krav måste vara en icke-tom lista');
  const requirementIds = new Set<string>();
  (raw.krav ?? []).forEach((krav: any, i: number) => {
    const where = `krav[${i}]`;
    if (!isNonEmptyString(krav?.id) || requirementIds.has(krav.id)) problems.push(`${where}.id saknas eller är duplicerat`);
    else requirementIds.add(krav.id);
    if (!isNonEmptyString(krav?.text)) problems.push(`${where}.text saknas`);
    sourceExists(krav?.kalla_id, `${where}.kalla_id`, sourceIds, problems);
  });
  validateStatus(raw.krav_status, 'krav_status', problems);
  if (raw.krav_fullstandiga !== true) problems.push('krav_fullstandiga måste vara true för LOK-stödets kontrollästa fullständiga krav');

  if (raw.deadlines?.typ !== 'fasta') problems.push('deadlines.typ måste vara fasta');
  if (!Array.isArray(raw.deadlines?.datum) || raw.deadlines.datum.length !== 2 || raw.deadlines.datum.some((d: string) => !MMDD_RE.test(d))) problems.push('deadlines.datum måste innehålla exakt två MM-DD-datum');
  if (!Array.isArray(raw.deadlines?.perioder) || raw.deadlines.perioder.length !== 2) problems.push('deadlines.perioder måste innehålla exakt två perioder');
  (raw.deadlines?.perioder ?? []).forEach((period: any, i: number) => {
    const where = `deadlines.perioder[${i}]`;
    if (!raw.deadlines.datum.includes(period?.datum)) problems.push(`${where}.datum måste finnas i deadlines.datum`);
    if (!MMDD_RE.test(period?.avser?.fran ?? '') || !MMDD_RE.test(period?.avser?.till ?? '')) problems.push(`${where}.avser måste ha MM-DD från/till`);
    if (!['samma_ar', 'foregaende_ar'].includes(period?.avser?.ar_relation)) problems.push(`${where}.avser.ar_relation är ogiltig`);
    sourceExists(period?.kalla_id, `${where}.kalla_id`, sourceIds, problems);
  });
  validateStatus(raw.deadline_status, 'deadline_status', problems);

  if (raw.belopp?.typ !== 'trappa' || raw.belopp?.valuta !== 'SEK') problems.push('belopp måste vara en SEK-trappa');
  if (raw.belopp?.ledarstod?.en_ledare_ore !== 2000 || raw.belopp?.ledarstod?.tva_eller_fler_ledare_ore !== 2500) problems.push('ledarstödet måste vara 2000/2500 öre');
  if (!Array.isArray(raw.belopp?.deltagarstod) || raw.belopp.deltagarstod.length < 2) problems.push('belopp.deltagarstod måste innehålla ålderstrapporna');
  (raw.belopp?.deltagarstod ?? []).forEach((trappa: any, i: number) => {
    if (!Array.isArray(trappa.tillfallen) || trappa.tillfallen.length === 0) problems.push(`belopp.deltagarstod[${i}].tillfallen saknas`);
    for (const tillfalle of trappa.tillfallen ?? []) {
      if (!Number.isInteger(tillfalle.tillfalle) || !Number.isInteger(tillfalle.belopp_ore) || tillfalle.belopp_ore <= 0) problems.push(`belopp.deltagarstod[${i}] innehåller ogiltigt tillfälle/belopp_ore`);
    }
  });
  sourceExists(raw.belopp?.kalla_id, 'belopp.kalla_id', sourceIds, problems);
  validateStatus(raw.belopp_status, 'belopp_status', problems);
  if (raw.belopp_avser !== 'per_forening') problems.push('belopp_avser måste vara per_forening');

  validateSanctions(raw, sourceIds, problems);
  validateFlags(raw, sourceIds, problems);
  if (!isNonEmptyString(raw.qa_anteckning)) problems.push('qa_anteckning måste bära källkonflikten');
  raw.senast_verifierad = normalizeDate(raw.senast_verifierad);
  if (!isNonEmptyString(raw.senast_verifierad) || !DATE_RE.test(raw.senast_verifierad)) problems.push('senast_verifierad måste vara YYYY-MM-DD');
  if (raw.kopbar !== false) problems.push('kopbar måste vara false för nationella stöd');

  if (problems.length > 0) throw new NationelltSchemaError(file, problems);
  return raw as NationelltStod;
}

export function validateAllNationellaStodFiles(): { file: string; error: string }[] {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  const problems: { file: string; error: string }[] = [];
  for (const file of files) {
    try {
      const raw = yaml.load(readFileSync(join(DATA_DIR, file), 'utf-8'));
      validateNationelltStod(raw, file, file.replace(/\.ya?ml$/, ''));
    } catch (e) {
      problems.push({ file, error: (e as Error).message });
    }
  }
  return problems;
}

let cache: NationelltStod[] | null = null;

export function loadNationellaStod(): NationelltStod[] {
  if (cache) return cache;
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  cache = files.map((file) => {
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(join(DATA_DIR, file), 'utf-8'));
    } catch (e) {
      throw new NationelltSchemaError(file, [`ogiltig YAML-syntax: ${(e as Error).message}`]);
    }
    return validateNationelltStod(raw, file, file.replace(/\.ya?ml$/, ''));
  }).sort((a, b) => a.namn.localeCompare(b.namn, 'sv'));
  return cache;
}

export function getNationelltStodById(id: string): NationelltStod | undefined {
  return loadNationellaStod().find((stod) => stod.id === id);
}

// Z2.1 (incoming/OPPNA_PUNKTER_Z1.md): "raden om två datum renderas ur
// stod.datum[], inte som fast text — ett framtida nationellt stöd kan
// ha ett annat antal." Räknat, inte gissat — bara ett/två har ett
// hårdkodat ord (matchar svenskan i resten av sajten, t.ex. TRATT.
// raknare.mallEtt), tre eller fler faller tillbaka på siffran.
const RAKNEORD: Record<number, string> = { 1: 'ett', 2: 'två', 3: 'tre', 4: 'fyra', 5: 'fem' };
export function formatDatumradForStod(stod: NationelltStod): string {
  const datum = stod.deadlines.datum.map(formatRecurringDate);
  const antalOrd = RAKNEORD[datum.length] ?? String(datum.length);
  return `${stod.namn} har ${antalOrd} sista datum om året: ${svenskLista(datum)}.`;
}

export function getNationellaDeadlineEntries(today: string = todayISO()): NationellDeadlineEntry[] {
  return loadNationellaStod().flatMap((stod) =>
    stod.status !== 'aktiv' ? [] : stod.deadlines.datum.map((mmdd) => ({
      ref: { niva: 'nationell' as const, stodId: stod.id },
      niva: 'nationell' as const,
      stodId: stod.id,
      stodNamn: stod.namn,
      kategori: stod.kategori,
      isLopande: false as const,
      dateISO: nextOccurrenceISO(mmdd, today),
      deadlineStatus: stod.deadline_status,
    }))
  ).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}
