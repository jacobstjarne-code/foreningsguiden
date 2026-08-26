/**
 * Golden-set för den migrerade belopp_avser-modellen.
 *
 * Läser verkliga YAML-filer och kräver exakt slutmodell för tio kända
 * referensfall: ren pott, blandfall och endast belopp per förening.
 * Testet kontrollerar de persistenta fälten — inte den heuristik som en
 * gång användes för att hitta kandidater före review och migrering.
 */

import { readFileSync } from 'node:fs';
import * as yaml from 'js-yaml';

type WorkClass = 'ren_pott' | 'blandfall' | 'per_forening' | 'okand';

const GOLDEN: Array<{ slug: string; namn: string; expected: WorkClass; etikett: string }> = [
  { slug: 'karlskrona', namn: 'Kommunalt aktivitetsstöd', expected: 'blandfall', etikett: 'BLANDFALL' },
  { slug: 'kalmar', namn: 'Bygdepeng', expected: 'blandfall', etikett: 'BLANDFALL' },
  { slug: 'norrtalje', namn: 'Hållbarhetsbidrag', expected: 'blandfall', etikett: 'BLANDFALL' },
  { slug: 'nykoping', namn: 'Evenemangsbidrag', expected: 'blandfall', etikett: 'BLANDFALL' },
  { slug: 'aneby', namn: 'Bidrag till studieförbund', expected: 'ren_pott', etikett: 'REN POTT' },
  { slug: 'arvika', namn: 'Verksamhetsbidrag', expected: 'ren_pott', etikett: 'REN POTT' },
  { slug: 'tranas', namn: 'Aktivitetsstöd', expected: 'ren_pott', etikett: 'REN POTT' },
  { slug: 'angelholm', namn: 'Inventariestöd', expected: 'per_forening', etikett: 'PER FÖRENING' },
  { slug: 'nacka', namn: 'Litet projektstöd', expected: 'per_forening', etikett: 'PER FÖRENING' },
  { slug: 'varmdo', namn: 'Kommunal medfinansiering', expected: 'per_forening', etikett: 'PER FÖRENING' },
];

interface PersistedBidrag {
  namn: string;
  belopp: string | null;
  belopp_avser?: 'per_forening' | 'ren_pott' | 'okand';
  kommunens_pott?: string | null;
}

function persistedClass(bidrag: PersistedBidrag): WorkClass {
  const individuellt = bidrag.belopp_avser === 'per_forening' && typeof bidrag.belopp === 'string';
  const pott = typeof bidrag.kommunens_pott === 'string' && bidrag.kommunens_pott.length > 0;
  if (individuellt && pott) return 'blandfall';
  if (individuellt) return 'per_forening';
  if (bidrag.belopp === null && bidrag.belopp_avser === 'ren_pott' && pott) return 'ren_pott';
  if (bidrag.belopp === null && bidrag.belopp_avser === 'okand' && pott) return 'ren_pott';
  return 'okand';
}

let passed = 0;
let missing = 0;
let failed = 0;
console.log('verify:belopp-avser — migrerat golden-set (10 poster)\n');

for (const fixture of GOLDEN) {
  const doc = yaml.load(readFileSync(`data/kommuner/${fixture.slug}.yaml`, 'utf8')) as { bidrag?: PersistedBidrag[] };
  const bidrag = doc.bidrag?.find((b) => b.namn.toLowerCase().includes(fixture.namn.toLowerCase()));
  if (!bidrag) {
    console.error(`  SAKNAS  [${fixture.etikett}] ${fixture.slug} — ${fixture.namn}`);
    missing++;
    continue;
  }
  const actual = persistedClass(bidrag);
  if (actual === fixture.expected) {
    console.log(`  OK      [${fixture.etikett}] ${fixture.slug} — ${bidrag.namn}`);
    passed++;
  } else {
    console.error(`  FEL     [${fixture.etikett}] ${fixture.slug} — ${bidrag.namn}: förväntat ${fixture.expected}, fick ${actual}`);
    failed++;
  }
}

console.log(`\nGolden set: ${passed}/10`);
if (passed !== 10 || missing > 0 || failed > 0) process.exit(1);
console.log('\nPASS');
