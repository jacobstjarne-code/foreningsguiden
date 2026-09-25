// Arbetsorder 2026-08-03, punkt 4 — schemavalidering, en av valideringsgrindens
// snabba kontroller (körs FÖRE astro build i både pre-commit-hooken och CI,
// se scripts/git-hooks/pre-commit + .github/workflows/validera.yml).
//
// Kör validateAllKommunFiles() (kommuner.ts) — samma regler som redan
// styr loadKommuner() (schema, tillåtna kategorier, giltig deadline-
// struktur, kalla_url måste börja med http(s), belopp får inte innehålla
// en URL, unika bidrag-id per kommun) men samlar ALLA trasiga filer i ett
// svep i stället för att stanna vid den första — bättre för en människa
// som ska rätta flera fel på en gång.
import { validateAllKommunFiles, hittaBeloppPlatshallare, loadKommuner } from '../src/lib/kommuner.ts';
import { loadNationellaStod, validateAllNationellaStodFiles } from '../src/lib/nationellaStod.ts';
import { strippaProcessSprak } from '../src/lib/anteckningFilter.ts';

const problem = validateAllKommunFiles();

if (problem.length > 0) {
  console.error(`Schemavalidering FAIL — ${problem.length} fil(er) med fel:\n`);
  for (const p of problem) {
    console.error(`${p.file}:\n  ${p.error.replace(/\n/g, '\n  ')}\n`);
  }
  process.exit(1);
}

console.log('Schemavalidering: alla kommun-YAML-filer är giltiga.');

const nationellaProblem = validateAllNationellaStodFiles();
if (nationellaProblem.length > 0) {
  console.error(`Nationell schemavalidering FAIL — ${nationellaProblem.length} fil(er) med fel:\n`);
  for (const p of nationellaProblem) console.error(`${p.file}:\n  ${p.error.replace(/\n/g, '\n  ')}\n`);
  process.exit(1);
}
console.log(`Nationell schemavalidering: ${loadNationellaStod().length} stöd är giltiga.`);

// Uppföljning 2026-08-03: belopp_status: olast/verifierad får inte
// kombineras med en platshållarfras (se hittaBeloppPlatshallare i
// kommuner.ts för hur listan byggs ur datan, inte gissas).
const platshallare = hittaBeloppPlatshallare();
if (platshallare.length > 0) {
  console.error(`\nPlatshållar-FAIL — ${platshallare.length} bidrag med belopp_status: olast/verifierad men en platshållarfras:\n`);
  for (const p of platshallare) console.error(`  ${p.kommun} — ${p.bidrag}: "${p.belopp}"`);
  process.exit(1);
}
console.log(`Platshållarkontroll: 0 bidrag med belopp_status: olast/verifierad + platshållarfras.`);

// ÅTGÄRDSSPEC T6, regel 3 (rapportregel, fäller ALDRIG): antal 'olast'
// per fält, nationellt — så takten i verifieringen (olast → verifierad)
// går att följa över tid utan att behöva greppa datat manuellt.
const kommuner = loadKommuner();
let beloppOlast = 0, deadlineOlast = 0, kravOlast = 0, giltighetOlast = 0;
for (const k of kommuner) {
  for (const b of k.bidrag) {
    if (b.belopp_status === 'olast') beloppOlast++;
    if (b.deadline_status === 'olast') deadlineOlast++;
    if (b.krav_status === 'olast') kravOlast++;
  }
  for (const f of k.forutsattningar) {
    if (f.giltighet_status === 'olast') giltighetOlast++;
  }
}
console.log(`\nolast (ej oberoende omkontrollerat): belopp ${beloppOlast}, deadline ${deadlineOlast}, krav ${kravOlast}, giltighet ${giltighetOlast}.`);

// Processpråk i publik text FÄLLER bygget (Opus 2026-09-24/25). A2 lät det
// bara varna, men varningen gick förlorad i bruset och 155 anteckningar
// renderades publikt med revisionslogg. Samma strippaProcessSprak() som
// A1:s renderingsfilter — en sanning för vad som räknas som processpråk.
// FG_PROCESSSPRAK_VARNA=1 återgår till att bara varna.
const GRANSKADE_FALT = ['anteckning', 'ansokningssystem', 'beskrivning'] as const;
type Traff = { kommun: string; id: string; falt: string; text: string; strukna: string[] };
const traffar: Traff[] = [];

/** Plockar ut varje sträng ur ett fältvärde — fältet kan vara sträng, objekt (ansokningssystem) eller lista. */
function strangarUr(varde: unknown): string[] {
  if (typeof varde === 'string') return [varde];
  if (Array.isArray(varde)) return varde.flatMap(strangarUr);
  if (varde && typeof varde === 'object') return Object.values(varde as Record<string, unknown>).flatMap(strangarUr);
  return [];
}

function granska(kalla: Record<string, unknown>, kommun: string, id: string) {
  for (const falt of GRANSKADE_FALT) {
    for (const text of strangarUr(kalla[falt])) {
      const { strukna } = strippaProcessSprak(text);
      if (strukna.length > 0) traffar.push({ kommun, id, falt, text, strukna });
    }
  }
}

for (const k of kommuner) {
  granska(k as unknown as Record<string, unknown>, k.kommun_slug, '(kommunnivå)');
  for (const b of k.bidrag) granska(b as unknown as Record<string, unknown>, k.kommun_slug, b.id);
}

// Opus 2026-09-25: grinden fällde aldrig tidigare — mönstren matchade inte
// formuleringarna i datan och bara b.anteckning granskades. Nu körs varje
// sträng i anteckning, ansokningssystem och beskrivning, på båda nivåerna.
// qa_anteckning är undantaget: dit flyttas revisionsspåret.
if (traffar.length > 0) {
  const varna = process.env.FG_PROCESSSPRAK_VARNA === '1';
  const skriv = varna ? console.log : console.error;
  const kommuner_ = new Set(traffar.map((t) => t.kommun));
  skriv(
    `\nProcesspråk-${varna ? 'VARNING' : 'FAIL'} — ${traffar.length} fält i ${kommuner_.size} kommuner ` +
      `bär revisionslogg i publik text. Flytta den till qa_anteckning.`
  );
  for (const t of traffar) skriv(`  ${t.kommun} — ${t.id} [${t.falt}]: ${t.strukna[0].slice(0, 120)}`);
  if (!varna) process.exit(1);
}
