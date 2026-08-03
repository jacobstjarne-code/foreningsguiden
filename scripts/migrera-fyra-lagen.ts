// ÅTGÄRDSSPEC T1 (Jacob, 2026-08-03 kväll) — engångsmigration, körs en
// gång, committas. Ren omdöpning, INGEN ny bedömning:
//   angivet     → olast
//   overifierat → okand
//   ingen_regel → oförändrat
//
// Ingen post blir 'verifierad' i migreringen — det värdet kräver ett
// researchpass som oberoende kontrollerat mot kommunens LEVANDE sida,
// och ett skript får aldrig påstå att någon läst. Samma sak gäller
// 'ingen_regel': redan satta poster behålls exakt, men skriptet SÄTTER
// aldrig ingen_regel på egen hand.
//
// Kör mot data/kommuner/*.yaml:s fyra statusfält (belopp_status/
// deadline_status/krav_status på Bidrag, giltighet_status på
// Forutsattning). Textbaserad radersättning (inte yaml.load+dump) —
// samma motivering som övriga migrationsskript i den här katalogen:
// bevarar formatering/citattecken/radbrytningar, ingen omskrivning av
// hela filen.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const DIR = 'data/kommuner';
const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));

const FALT = ['belopp_status', 'deadline_status', 'krav_status', 'giltighet_status'];
const NAMNBYTE: Record<string, string> = { angivet: 'olast', overifierat: 'okand' };

let totalt = 0;
let filerAndrade = 0;

for (const file of files) {
  const path = `${DIR}/${file}`;
  const originalText = readFileSync(path, 'utf-8');
  const lines = originalText.split('\n');
  const output: string[] = [];
  let andradeIFil = 0;

  for (const line of lines) {
    const match = line.match(new RegExp(`^(\\s*)(${FALT.join('|')}):\\s*(angivet|overifierat)\\s*$`));
    if (match) {
      const [, indent, falt, gammalt] = match;
      output.push(`${indent}${falt}: ${NAMNBYTE[gammalt]}`);
      totalt++;
      andradeIFil++;
      continue;
    }
    output.push(line);
  }

  if (andradeIFil === 0) continue;
  writeFileSync(path, output.join('\n'));
  filerAndrade++;
}

console.log(`${totalt} statusfält omdöpta (angivet→olast, overifierat→okand), ${filerAndrade} filer.`);
