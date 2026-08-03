// ÅTGÄRDSSPEC C7 (Jacob, 2026-08-03) — engångsmigration, körs en gång,
// committas. krav_fullstandiga får tre värden:
//   true  = normdokumentet läst, samtliga villkor fångade
//   false = normdokumentet läst, kraven är ofullständiga
//   null  = ingen har bedömt ännu
//
// Innan denna migration var false det tysta default-värdet för ALLA
// bidrag utom de 17 (Gislaved + Örnsköldsvik) som faktiskt fått ett
// researchpass — false betydde alltså "ofullständig" för 2791 bidrag,
// men bara 35 (5 false + 9 true Gislaved, 30 false + 8 true Örnsköldsvik)
// av dem har verkligen bedömts. Resten är en obekräftad blankett-claim.
//
// Regel: false → null för allt UTOM data/kommuner/gislaved.yaml och
// data/kommuner/ornskoldsvik.yaml (de två kommuner där en genomgång
// faktiskt gjorts — alla bidrag där har antingen true eller false,
// aldrig null, och rörs INTE av detta skript).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const DIR = 'data/kommuner';
const BEDOMDA_FILER = new Set(['gislaved.yaml', 'ornskoldsvik.yaml']);
const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));

let totalt = 0;
let filerAndrade = 0;

for (const file of files) {
  if (BEDOMDA_FILER.has(file)) continue;

  const path = `${DIR}/${file}`;
  const originalText = readFileSync(path, 'utf-8');
  const originalDoc = yaml.load(originalText) as { bidrag?: any[] };
  if (!originalDoc.bidrag?.some((b) => b.krav_fullstandiga === false)) continue;

  const lines = originalText.split('\n');
  const output: string[] = [];
  let section: 'none' | 'bidrag' = 'none';
  let bidragIdx = -1;
  let andradeIFil = 0;

  for (const line of lines) {
    if (/^bidrag:\s*$/.test(line)) { section = 'bidrag'; bidragIdx = -1; output.push(line); continue; }
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:/.test(line)) section = 'none';
    const nyttListobjekt = /^(\s*)- \w+:/.test(line);
    if (nyttListobjekt && section === 'bidrag') bidragIdx++;

    if (section === 'bidrag' && bidragIdx >= 0 && originalDoc.bidrag?.[bidragIdx]?.krav_fullstandiga === false &&
        /^\s*krav_fullstandiga:\s*false\s*$/.test(line)) {
      const indent = line.match(/^(\s*)/)![1];
      output.push(`${indent}krav_fullstandiga: null`);
      totalt++;
      andradeIFil++;
      continue;
    }
    output.push(line);
  }

  if (andradeIFil === 0) continue;

  const finalText = output.join('\n');
  const finalDoc = yaml.load(finalText) as { bidrag?: any[] };
  if (finalDoc.bidrag?.length !== originalDoc.bidrag?.length) {
    console.error(`AVBRYTER — ${file}: bidragsantal ändrades.`);
    process.exit(1);
  }
  if (finalDoc.bidrag?.some((b) => b.krav_fullstandiga === false)) {
    console.error(`AVBRYTER — ${file}: minst ett krav_fullstandiga är fortfarande false.`);
    process.exit(1);
  }
  writeFileSync(path, finalText);
  filerAndrade++;
}

console.log(`${totalt} krav_fullstandiga: false → null, ${filerAndrade} filer (gislaved.yaml + ornskoldsvik.yaml orörda).`);
