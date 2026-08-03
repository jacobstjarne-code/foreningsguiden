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
import { validateAllKommunFiles } from '../src/lib/kommuner.ts';

const problem = validateAllKommunFiles();

if (problem.length === 0) {
  console.log('Schemavalidering: alla kommun-YAML-filer är giltiga.');
  process.exit(0);
}

console.error(`Schemavalidering FAIL — ${problem.length} fil(er) med fel:\n`);
for (const p of problem) {
  console.error(`${p.file}:\n  ${p.error.replace(/\n/g, '\n  ')}\n`);
}
process.exit(1);
