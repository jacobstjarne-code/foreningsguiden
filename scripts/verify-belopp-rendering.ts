/**
 * Verifierar att byggda ytor aldrig publicerar kommunens pott som ett
 * individuellt belopp. Kör efter `npm run build`.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const dist = resolve(root, 'dist', 'client');

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function requireText(source: string, expected: string, context: string): void {
  if (!source.includes(expected)) fail(`${context} saknar ${JSON.stringify(expected)}`);
}

const kommunDataDir = resolve(dist, 'kommun-data');
const files = readdirSync(kommunDataDir).filter((name) => name.endsWith('.json')).sort();
if (files.length !== 290) fail(`förväntade 290 kommun-JSON, hittade ${files.length}`);

let bidragCount = 0;
let hiddenUnsafeAmounts = 0;
let publishedIndividualAmounts = 0;
let publishedPools = 0;

for (const file of files) {
  const kommun = JSON.parse(readFileSync(resolve(kommunDataDir, file), 'utf8')) as {
    kommun_slug: string;
    bidrag: Array<{
      id: string;
      belopp: string | null;
      belopp_avser: 'per_forening' | 'okand';
      kommunens_pott: string | null;
    }>;
  };

  for (const bidrag of kommun.bidrag) {
    bidragCount += 1;
    if (bidrag.belopp_avser !== 'per_forening' && bidrag.belopp !== null) {
      fail(`${kommun.kommun_slug}/${bidrag.id} publicerar belopp trots belopp_avser=${bidrag.belopp_avser}`);
    }
    if (bidrag.belopp_avser === 'per_forening' && bidrag.belopp !== null) publishedIndividualAmounts += 1;
    else hiddenUnsafeAmounts += 1;
    if (bidrag.kommunens_pott !== null) publishedPools += 1;
  }
}

const purePoolHtml = readFileSync(
  resolve(dist, 'kommun', 'tranas', 'bidrag', 'tranas-aktivitetsstod', 'index.html'),
  'utf8',
);
requireText(purePoolHtml, 'individuellt belopp inte fastställt', 'rent pottfall');
requireText(purePoolHtml, 'Kommunens pott', 'rent pottfall');
requireText(purePoolHtml, '680 000 kr', 'rent pottfall');

const mixedHtml = readFileSync(
  resolve(dist, 'kommun', 'norrtalje', 'bidrag', 'norrtalje-hallbarhetsbidrag', 'index.html'),
  'utf8',
);
requireText(mixedHtml, 'Belopp för föreningen', 'blandfall');
requireText(mixedHtml, 'Max 60 000 kronor per projekt', 'blandfall');
requireText(mixedHtml, 'Kommunens pott', 'blandfall');
requireText(mixedHtml, 'Kommunens totala pott är 250 000 kronor per år', 'blandfall');

console.log('verify-belopp-rendering: PASS');
console.log(`  kommuner: ${files.length}`);
console.log(`  bidrag: ${bidragCount}`);
console.log(`  publicerade individuella belopp: ${publishedIndividualAmounts}`);
console.log(`  dolda osäkra/icke-individuella belopp: ${hiddenUnsafeAmounts}`);
console.log(`  publicerade separata kommunpotter: ${publishedPools}`);
