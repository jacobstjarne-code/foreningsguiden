// ÅTGÄRDSSPEC T6, regel 2 (Jacob, 2026-08-03 kväll): "verifierad eller
// ingen_regel satt i samma commit som en mekanisk omräkning → fäll."
//
// omrakna-datatillstand.ts skriver en markörfil (OMRAKNING_KORD.json)
// med vilka data/kommuner/*.yaml den rörde, senast den kördes. Detta
// skript läser markören och jämför den STAGADE datan i EXAKT de filerna
// mot HEAD: om en ny verifierad/ingen_regel dykt upp i en fil den
// mekaniska omräkningen också rörde, är det ett tecken på att ett
// researchpass och en mekanisk körning blandats i samma commit — precis
// det scenariot som lät gislaved-namndens-forfogandes ingen_regel
// försvinna tyst 2026-08-03 (se omrakna-datatillstand.ts filhuvud).
//
// Markören konsumeras (raderas) efter kontrollen, oavsett utfall — den
// ska aldrig läcka in i en senare, orelaterad commit.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import * as yaml from 'js-yaml';

const GIT_DIR = execSync('git rev-parse --absolute-git-dir', { encoding: 'utf-8' }).trim();
const MARKER_PATH = `${GIT_DIR}/OMRAKNING_KORD.json`;

if (!existsSync(MARKER_PATH)) process.exit(0);

const rortaFiler: string[] = JSON.parse(readFileSync(MARKER_PATH, 'utf-8'));
unlinkSync(MARKER_PATH);

function skyddadeIdn(yamlText: string): Set<string> {
  try {
    const doc = yaml.load(yamlText) as { bidrag?: { id: string; belopp_status?: unknown; deadline_status?: unknown; krav_status?: unknown }[] };
    const ids = new Set<string>();
    for (const b of doc.bidrag ?? []) {
      for (const falt of ['belopp_status', 'deadline_status', 'krav_status'] as const) {
        if (b[falt] === 'kontrollast' || b[falt] === 'ingen_regel') ids.add(`${b.id}.${falt}`);
      }
    }
    return ids;
  } catch {
    return new Set();
  }
}

const problem: string[] = [];
for (const path of rortaFiler) {
  if (!existsSync(path)) continue; // filen borttagen sedan dess, inget att jämföra
  let fore: string;
  try {
    fore = execSync(`git show HEAD:${path}`, { encoding: 'utf-8' });
  } catch {
    continue; // ny fil, inget HEAD-tillstånd att jämföra mot
  }
  const efter = readFileSync(path, 'utf-8');
  const foreIds = skyddadeIdn(fore);
  const efterIds = skyddadeIdn(efter);
  for (const id of efterIds) {
    if (!foreIds.has(id)) problem.push(`${path}: ${id} är nu verifierad/ingen_regel — fanns inte i HEAD`);
  }
}

if (problem.length === 0) process.exit(0);

console.error('BLOCKERAD — en mekanisk omräkning (omrakna-datatillstand.ts) och ett researchpass har blandats i samma commit:');
for (const p of problem) console.error(`  ${p}`);
console.error('Committa forskningspasset (verifierad/ingen_regel) separat, INNAN eller EFTER den mekaniska omräkningen — aldrig i samma commit som rör samma filer.');
process.exit(1);
