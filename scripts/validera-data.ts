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
import { validateAllKommunFiles, hittaBeloppPlatshallare } from '../src/lib/kommuner.ts';

const problem = validateAllKommunFiles();

if (problem.length > 0) {
  console.error(`Schemavalidering FAIL — ${problem.length} fil(er) med fel:\n`);
  for (const p of problem) {
    console.error(`${p.file}:\n  ${p.error.replace(/\n/g, '\n  ')}\n`);
  }
  process.exit(1);
}

console.log('Schemavalidering: alla kommun-YAML-filer är giltiga.');

// Uppföljning 2026-08-03: belopp_status: angivet får inte kombineras med
// en platshållarfras (se hittaBeloppPlatshallare i kommuner.ts för hur
// listan byggs ur datan, inte gissas).
const platshallare = hittaBeloppPlatshallare();
if (platshallare.length > 0) {
  console.error(`\nPlatshållar-FAIL — ${platshallare.length} bidrag med belopp_status: angivet men en platshållarfras:\n`);
  for (const p of platshallare) console.error(`  ${p.kommun} — ${p.bidrag}: "${p.belopp}"`);
  process.exit(1);
}
console.log(`Platshållarkontroll: 0 bidrag med belopp_status: angivet + platshållarfras.`);
