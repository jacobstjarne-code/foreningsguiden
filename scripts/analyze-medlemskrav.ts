/**
 * analyze-medlemskrav.ts — AG1.1 (Jacobs order): "Markera de 64
 * aktivitetsbidragen som har medlemskrav." Rapporterar bara, fäller
 * aldrig bygget (samma roll som analyze-krav-koppling.ts).
 *
 * TALSKILLNAD MOT JACOBS 64, LÄS INNAN DEN JÄMFÖRS: Jacobs 64 är AE1:s
 * egen mätning mot deras renare scope (314 bidrag, bara de rader GPT
 * klassat A/B/D1). Det här skriptet kör mot 309 namn/id-identifierade
 * aktivitetsbidrag (samma heuristik som analyze-krav-koppling.ts,
 * aktivitetsbidragKorpus.ts) och ALLA kravrader, inte bara A/B/D1 —
 * samma scope-skillnad som redan är dokumenterad där. Talet nedan
 * (69) är därför inte en motsägelse av 64, utan en bredare räkning på
 * en något annorlunda bidragsmängd.
 *
 * Kör: node --experimental-strip-types scripts/analyze-medlemskrav.ts
 */
import { samlaAktivitetsbidrag } from '../src/lib/aktivitetsbidragKorpus.ts';
import { identifieraMedlemskravsBidrag } from '../src/lib/medlemskrav.ts';

const bidrag = samlaAktivitetsbidrag();
const flaggade = identifieraMedlemskravsBidrag(bidrag);

console.log(`analyze:medlemskrav — ${flaggade.length} av ${bidrag.length} identifierade aktivitetsbidrag har ett medlemsantalskrav i sin kravtext`);
console.log('(jämförelsetal, se filhuvud för scope-skillnaden mot AE1:s 64)');
console.log('');
console.log('Bidrags-id:n:');
for (const id of flaggade) console.log(`  - ${id}`);
