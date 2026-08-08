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

// A2 (Jacob 2026-08-08), punkt 4 — processpråk i anteckning ska VARNA,
// aldrig fälla bygget. GPT ska se det (och flytta över till
// qa_anteckning vid nästa researchpass i respektive kommun), inte
// blockeras av det. Samma strippaProcessSprak() som A1:s rendering-
// filter — en sanning för vad som räknas som processpråk.
let anteckningMedProcessSprak = 0;
let anteckningMeningarStrukna = 0;
const kommunerMedProcessSprak = new Set<string>();
for (const k of kommuner) {
  for (const b of k.bidrag) {
    const { strukna } = strippaProcessSprak(b.anteckning);
    if (strukna.length > 0) {
      anteckningMedProcessSprak++;
      anteckningMeningarStrukna += strukna.length;
      kommunerMedProcessSprak.add(k.kommun_slug);
    }
  }
}
if (anteckningMedProcessSprak > 0) {
  console.log(
    `\nVARNING (fäller inte): ${anteckningMeningarStrukna} meningar processpråk i anteckning, ` +
      `${anteckningMedProcessSprak} bidrag, ${kommunerMedProcessSprak.size} kommuner. ` +
      `Filtreras bort vid rendering (A1) — flytta till qa_anteckning vid nästa researchpass i respektive kommun.`
  );
}
