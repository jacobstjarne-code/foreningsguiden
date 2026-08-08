/**
 * rapportera-processsprak.ts — A1 punkt 2 (Jacob 2026-08-08). Kör samma
 * strippaProcessSprak() som BidragCard.astro/relativFrist() mot ALLA
 * kommuners bidrag, och listar exakt vilka meningar som stryks —
 * kommun, bidrags-id, den strukna meningen. Rör aldrig YAML-filerna.
 * Den här listan är underlaget för textrundan som städar datan på
 * riktigt (A1 punkt 2/3) — filtret i BidragCard.astro är en spärr,
 * inte den slutgiltiga lösningen.
 *
 * Kör: node scripts/rapportera-processsprak.ts
 */
import { writeFileSync } from 'node:fs';
import { loadKommuner } from '../src/lib/kommuner.ts';
import { strippaProcessSprak } from '../src/lib/anteckningFilter.ts';

interface Rad {
  kommun: string;
  kommunSlug: string;
  bidragId: string;
  bidragNamn: string;
  strukenMening: string;
}

const kommuner = loadKommuner();
const rader: Rad[] = [];

for (const kommun of kommuner) {
  for (const bidrag of kommun.bidrag) {
    const { strukna } = strippaProcessSprak(bidrag.anteckning);
    for (const mening of strukna) {
      rader.push({
        kommun: kommun.kommun,
        kommunSlug: kommun.kommun_slug,
        bidragId: bidrag.id,
        bidragNamn: bidrag.namn,
        strukenMening: mening,
      });
    }
  }
}

const kommunerMedTraff = new Set(rader.map((r) => r.kommunSlug)).size;
const bidragMedTraff = new Set(rader.map((r) => r.bidragId)).size;

const rubrik = `# Processspråk strukna ur anteckning-fältet — ${new Date().toISOString().slice(0, 10)}

*A1 (Jacob 2026-08-08). Genererad av \`scripts/rapportera-processsprak.ts\`.
${rader.length} meningar strukna, ${bidragMedTraff} bidrag, ${kommunerMedTraff} kommuner.
Detta är underlaget för textrundan som städar \`anteckning\`-fälten i
YAML-källan på riktigt — filtret i BidragCard.astro/relativFrist() är
bara en spärr som stoppar läckaget vid rendering tills dess.*

| Kommun | Bidrag | Struken mening |
|---|---|---|
`;

const tabell = rader
  .map((r) => `| ${r.kommun} | ${r.bidragId} (${r.bidragNamn}) | ${r.strukenMening.replace(/\|/g, '\\|')} |`)
  .join('\n');

writeFileSync('PROCESSSPRAK_STRUKET_2026-08-08.md', rubrik + tabell + '\n');

console.log(`${rader.length} meningar strukna ur ${bidragMedTraff} bidrag i ${kommunerMedTraff} kommuner.`);
console.log('Skrivet till PROCESSSPRAK_STRUKET_2026-08-08.md');
