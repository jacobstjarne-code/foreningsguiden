// Engångsskript (Jacobs arbetsorder 3 aug 2026, punkt 1b): för varje kommun,
// lista de kategorier som har en filterknapp på kommunsidan men noll bidrag
// i den kategorin. Producerar bara en lista — fyller INTE i data, det gör GPT.
//
// Källa till "har en filterknapp": KommunProgression.astro (station 1) och
// [slug]/[kategori]/index.astro:s getStaticPaths använder BÅDA exakt samma
// predikat: KATEGORIER.filter(k => kommun.bidrag.some(b => b.kategori.includes(k))).
// En pill/kategorisida kan alltså strukturellt aldrig existera för en kategori
// med noll bidrag — se rapporten till Jacob för vad detta betyder för Gislaved-
// exemplet (det är en feltaggning, inte en tom pill).
import { loadKommuner, KATEGORIER, KATEGORI_LABELS } from '../src/lib/kommuner.ts';

const rader: { kommun: string; kategori: string; antal: number }[] = [];

for (const kommun of loadKommuner()) {
  const kategorierMedBidrag = KATEGORIER.filter((k) => kommun.bidrag.some((b) => b.kategori.includes(k)));
  for (const kategori of kategorierMedBidrag) {
    const antal = kommun.bidrag.filter((b) => b.kategori.includes(kategori)).length;
    if (antal === 0) {
      rader.push({ kommun: kommun.kommun, kategori: KATEGORI_LABELS[kategori], antal });
    }
  }
}

rader.sort((a, b) => a.kommun.localeCompare(b.kommun, 'sv'));

if (rader.length === 0) {
  console.log('0 rader — ingen kommun har en pill/kategorisida med noll bidrag (strukturellt förhindrat av kategorierMedBidrag-predikatet i båda konsumenterna).');
} else {
  console.log('kommun,kategori,antal_bidrag');
  for (const r of rader) console.log(`${r.kommun},${r.kategori},${r.antal}`);
}
