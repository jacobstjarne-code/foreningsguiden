/**
 * analyze-krav-koppling.ts — AF1.3 (Jacobs order): "Rapportera hur många
 * rader som INTE går att koppla." Rapporterar bara, fäller aldrig bygget
 * (till skillnad från verify-krav-koppling.ts).
 *
 * SCOPE-SKILLNAD MOT GPT:S 238, LÄS INNAN TALEN JÄMFÖRS:
 * AE1 (incoming/AE1_FALTLISTA_AKTIVITETSBIDRAG.md) byggde sitt 238-tal
 * på de 1393 rader GPT SJÄLV klassificerat som A/B/D1 av 1726 totala
 * kravrader i de 314 aktivitetsbidragen — en rad-nivå-klassificering
 * (A/B/C/D) som INTE finns i den här kodbasens datamodell (kommunTyper.ts:s
 * Bidrag.krav är string[], ingen struktur per rad — se AD1_KRAVENS_
 * KARAKTAR.md §"Bidragsarten är identifierad från namn och id, eftersom
 * datan saknar ett separat fält för bidragsart"). Att reproducera GPT:s
 * rad-klassificering är ett eget researchpass, inte AF1:s.
 *
 * Det här skriptet kör därför mönstermatchningen mot ALLA kravrader i de
 * bidrag som identifieras som aktivitetsbidrag (namn/id-heuristik, samma
 * teknik som verify-lok-ansokningsvag.ts redan använder för LOK) — INTE
 * bara de rader GPT klassade A/B/D1. Det betyder att C/D2-rader (fritext-
 * skäl, processregler som "beslut kan överklagas") också räknas här och
 * ALDRIG kommer matcha ett av de 68 fälten, vilket sänker täckningen
 * jämfört med GPT:s renare 1393-radsscope. Talen nedan är därför INTE
 * direkt jämförbara med 238 — de svarar på en bredare fråga ("hur många
 * av ALLA kravrader i aktivitetsbidrag går att koppla") än AE1:s smalare
 * ("hur många av A/B/D1-raderna").
 *
 * Kör: node --experimental-strip-types scripts/analyze-krav-koppling.ts
 */
import { kopplaKravtext } from '../src/lib/kravKoppling.ts';
import { samlaAktivitetsbidrag } from '../src/lib/aktivitetsbidragKorpus.ts';
import { FALT_KATALOG } from '../src/lib/profilFalt.ts';

const bidrag = samlaAktivitetsbidrag();
const kravrader = bidrag.flatMap((b) => b.krav);

let reusable = 0;
const perFalt = new Map<string, number>();
const customExempel: string[] = [];

for (const rad of kravrader) {
  // klass är kosmetisk för custom-ID:t när ingen rad-klassificering finns
  // (se filhuvud) — påverkar INTE om mönstret träffar eller ej.
  const r = kopplaKravtext(rad, 'D1');
  if (r.reusable) {
    reusable++;
    perFalt.set(r.faltId, (perFalt.get(r.faltId) ?? 0) + 1);
  } else if (customExempel.length < 10) {
    customExempel.push(rad);
  }
}

const custom = kravrader.length - reusable;

console.log(`analyze:krav-koppling — ${bidrag.length} bidrag identifierade som aktivitetsbidrag (namn/id-heuristik)`);
console.log(`${kravrader.length} kravrader totalt (ALLA klasser A/B/C/D — se filhuvud för scope-skillnad mot GPT:s 238)`);
console.log(`  kopplade till ett av de ${FALT_KATALOG.length} återanvändbara fälten: ${reusable} (${((reusable / kravrader.length) * 100).toFixed(1)}%)`);
console.log(`  föll till custom-fallback (ingen mönsterträff): ${custom} (${((custom / kravrader.length) * 100).toFixed(1)}%)`);
console.log('');
console.log('Topp 15 mest träffade fält:');
[...perFalt.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([falt, antal]) => console.log(`  ${falt}: ${antal}`));
console.log('');
console.log('10 exempel på rader som INTE kopplades (custom-fallback):');
customExempel.forEach((r) => console.log(`  - "${r}"`));
