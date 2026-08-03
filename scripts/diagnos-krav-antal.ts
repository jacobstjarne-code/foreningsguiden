// Engångsskript (arbetsorder 2026-08-03, uppföljningspunkt 4): räknar krav
// per bidrag nationellt. Utdata: kommun, bidrag, antal krav — sorterat
// stigande, så listan visar var kraven är kollapsade till en rad. Går
// vidare till GPT som arbetsorder — fyller INTE i data, bara producerar
// listan. krav är inte ett av de tre fält v1.0 garanterar (belopp,
// deadline, giltighet) — den här listan är underlaget för att bedöma hur
// illa täckningen faktiskt är.
import { loadKommuner } from '../src/lib/kommuner.ts';

const rader: { kommun: string; bidrag: string; antal: number }[] = [];

for (const kommun of loadKommuner()) {
  for (const bidrag of kommun.bidrag) {
    rader.push({ kommun: kommun.kommun, bidrag: bidrag.namn, antal: bidrag.krav.length });
  }
}

rader.sort((a, b) => a.antal - b.antal || a.kommun.localeCompare(b.kommun, 'sv'));

console.log('kommun,bidrag,antal_krav');
for (const r of rader) console.log(`${r.kommun},${r.bidrag},${r.antal}`);

const noll = rader.filter((r) => r.antal === 0).length;
const en = rader.filter((r) => r.antal === 1).length;
console.error(`\n${rader.length} bidrag totalt. ${noll} med 0 krav, ${en} med exakt 1 krav (${noll + en} av ${rader.length} — ${Math.round((100 * (noll + en)) / rader.length)}% har högst ett krav listat).`);
