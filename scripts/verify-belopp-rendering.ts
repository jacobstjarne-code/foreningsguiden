/**
 * Regressionstest för beloppsrenderingen efter belopp_avser-migreringen.
 * Kör efter `npm run build`.
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

function forbidText(source: string, forbidden: string, context: string): void {
  if (source.includes(forbidden)) fail(`${context} innehåller förbjudna ${JSON.stringify(forbidden)}`);
}

const kommunDataDir = resolve(dist, 'kommun-data');
const files = readdirSync(kommunDataDir).filter((name) => name.endsWith('.json')).sort();
if (files.length !== 290) fail(`förväntade 290 kommun-JSON, hittade ${files.length}`);

let bidragCount = 0;
let missingIndividualAmounts = 0;
let publishedIndividualAmounts = 0;
let publishedPools = 0;
type PublicKommun = {
  kommun_slug: string;
  bidrag: Array<{
    id: string;
    belopp: string | null;
    belopp_avser: 'per_forening' | 'okand';
    kommunens_pott: string | null;
  }>;
};
const publicKommuner = new Map<string, PublicKommun>();

for (const file of files) {
  const kommun = JSON.parse(readFileSync(resolve(kommunDataDir, file), 'utf8')) as PublicKommun;
  publicKommuner.set(kommun.kommun_slug, kommun);

  for (const bidrag of kommun.bidrag) {
    bidragCount += 1;
    if (bidrag.belopp !== null) publishedIndividualAmounts += 1;
    else missingIndividualAmounts += 1;
    if (bidrag.kommunens_pott !== null) publishedPools += 1;
  }
}

function requireBidrag(kommunSlug: string, bidragId: string) {
  const bidrag = publicKommuner.get(kommunSlug)?.bidrag.find((post) => post.id === bidragId);
  if (!bidrag) fail(`${kommunSlug}/${bidragId} saknas i byggd kommun-JSON`);
  return bidrag;
}

// Gislaved: omigrerade standardvärden (`okand`) ska åter visas precis som
// före migrationen. JSON-filen är matchningens faktiska klientunderlag.
const gislavedStart = requireBidrag('gislaved', 'gislaved-startbidrag');
const gislavedGrund = requireBidrag('gislaved', 'gislaved-grundbidrag');
const gislavedAnlaggning = requireBidrag('gislaved', 'gislaved-anlaggningsbidrag');
if (gislavedStart.belopp !== '5 000 kronor') fail('Gislaved startbidrag saknar 5 000 kronor i matchningsdata');
if (gislavedGrund.belopp !== '3 000 kronor per år') fail('Gislaved grundbidrag saknar 3 000 kronor per år i matchningsdata');
requireText(gislavedAnlaggning.belopp ?? '', '210 kronor per bidragsberättigad medlem', 'Gislaved anläggningsbidrag i matchningsdata');

const gislavedHtml = readFileSync(resolve(dist, 'kommun', 'gislaved', 'index.html'), 'utf8');
requireText(gislavedHtml, '5 000 kronor', 'Gislaveds kommunsida');
requireText(gislavedHtml, '3 000 kronor per år', 'Gislaveds kommunsida');
requireText(gislavedHtml, '210 kronor per bidragsberättigad medlem', 'Gislaveds kommunsida');
const gislavedStartHtml = readFileSync(resolve(dist, 'kommun', 'gislaved', 'bidrag', 'gislaved-startbidrag', 'index.html'), 'utf8');
requireText(gislavedStartHtml, '<dt>Belopp</dt>', 'Gislaveds detaljsida med okand-standardvärde');
forbidText(gislavedStartHtml, 'Inte fastställt om uppgiften gäller', 'Gislaveds detaljsida med okand-standardvärde');

const purePoolHtml = readFileSync(
  resolve(dist, 'kommun', 'tranas', 'bidrag', 'tranas-aktivitetsstod', 'index.html'),
  'utf8',
);
requireText(purePoolHtml, 'individuellt belopp inte fastställt', 'rent pottfall');
requireText(purePoolHtml, 'Kommunens pott', 'rent pottfall');
requireText(purePoolHtml, '680 000 kr', 'rent pottfall');

// Tranås: kortet, matchnings-JSON:en och köpytan får aldrig behandla potten
// som ett belopp för föreningen.
const tranas = requireBidrag('tranas', 'tranas-aktivitetsstod');
if (tranas.belopp !== null) fail('Tranås aktivitetsstöd publiceras som individuellt belopp i matchningsdata');
if (tranas.kommunens_pott !== '680 000 kr') fail('Tranås aktivitetsstöd saknar separat kommunpott');
const tranasKommunHtml = readFileSync(resolve(dist, 'kommun', 'tranas', 'index.html'), 'utf8');
const tranasKort = tranasKommunHtml.match(/<li[^>]*data-bidrag-id="tranas-aktivitetsstod"[\s\S]*?<\/li>/)?.[0];
if (!tranasKort) fail('Tranås aktivitetsstöd saknas på kommunsidan');
requireText(tranasKort, 'individuellt belopp inte fastställt', 'Tranås-kortet');
forbidText(tranasKort, '680 000 kr', 'Tranås-kortet');
const tranasKopytaHtml = readFileSync(resolve(dist, 'kommun', 'tranas', 'utkast', 'tranas-aktivitetsstod', 'index.html'), 'utf8');
requireText(tranasKopytaHtml, 'Individuellt belopp inte fastställt', 'Tranås köp-/utkastyta');
forbidText(tranasKopytaHtml, '680 000 kr', 'Tranås köp-/utkastyta');

const mixedHtml = readFileSync(
  resolve(dist, 'kommun', 'norrtalje', 'bidrag', 'norrtalje-hallbarhetsbidrag', 'index.html'),
  'utf8',
);
requireText(mixedHtml, 'Belopp för föreningen', 'blandfall');
requireText(mixedHtml, 'Max 60 000 kronor per projekt', 'blandfall');
requireText(mixedHtml, 'Kommunens pott', 'blandfall');
requireText(mixedHtml, 'Kommunens totala pott är 250 000 kronor per år', 'blandfall');

const norrtalje = requireBidrag('norrtalje', 'norrtalje-hallbarhetsbidrag');
if (norrtalje.belopp !== 'Max 60 000 kronor per projekt') fail('Norrtälje saknar individuellt max i matchningsdata');
if (norrtalje.kommunens_pott !== 'Kommunens totala pott är 250 000 kronor per år') fail('Norrtälje saknar separat kommunpott');

const indexHtml = readFileSync(resolve(dist, 'index.html'), 'utf8');
const beloppKort = [...indexHtml.matchAll(/<li class="belopp-kort(?: belopp-kort--olast)?"[^>]*>[\s\S]*?<\/li>/g)];
if (beloppKort.length !== 4) fail(`förstasidan ska ha fyra beloppskort, hittade ${beloppKort.length}`);
for (const [index, match] of beloppKort.entries()) {
  if (!/belopp-kort__belopp"[^>]*>[^<]*\d[^<]*(?:kr|kronor)/i.test(match[0])) {
    fail(`förstasidans beloppskort ${index + 1} saknar belopp`);
  }
}

console.log('verify-belopp-rendering: PASS');
console.log(`  kommuner: ${files.length}`);
console.log(`  bidrag: ${bidragCount}`);
console.log(`  publicerade individuella belopp: ${publishedIndividualAmounts}`);
console.log(`  poster utan individuellt belopp: ${missingIndividualAmounts}`);
console.log(`  publicerade separata kommunpotter: ${publishedPools}`);
console.log(`  förstasidans beloppskort: ${beloppKort.length}`);
