/**
 * verify-anteckning-filter.ts — Fristående verifiering av
 * src/lib/anteckningFilter.ts (A1, Jacob 2026-08-08). Samma konvention
 * som verify-matching.ts/verify-omverifiering.ts: node:assert/strict,
 * inget nytt testramverk. Kör: node scripts/verify-anteckning-filter.ts
 */
import assert from 'node:assert/strict';
import { delaIMeningar, strippaProcessSprak } from '../src/lib/anteckningFilter.ts';

let antal = 0;
function test(namn: string, fn: () => void) {
  fn();
  antal++;
  console.log(`ok — ${namn}`);
}

test('delaIMeningar: grundfall, två meningar', () => {
  const meningar = delaIMeningar('Första meningen. Andra meningen.');
  assert.deepEqual(meningar, ['Första meningen.', 'Andra meningen.']);
});

test('delaIMeningar: "bl.a. Ansjö" splittras INTE — förkortning följd av egennamn', () => {
  const meningar = delaIMeningar('Föreningar kan söka bidraget (bl.a. Ansjö Bygdegård, Flen). Ansökan görs löpande.');
  assert.equal(meningar.length, 2);
  assert.ok(meningar[0].includes('bl.a. Ansjö Bygdegård'), 'förkortningen och egennamnet ska ligga i samma mening');
});

test('delaIMeningar: "t.ex. Boverket" splittras INTE', () => {
  const meningar = delaIMeningar('Bidrag från andra aktörer (t.ex. Boverket) prioriteras inte. Nästa mening.');
  assert.equal(meningar.length, 2);
  assert.ok(meningar[0].includes('t.ex. Boverket'));
});

test('delaIMeningar: vanlig "t.ex." följt av gemen splittras aldrig (redan skyddat av versal-kravet)', () => {
  const meningar = delaIMeningar('Konstnärligt område, t.ex. musik eller teater. Nästa mening.');
  assert.equal(meningar.length, 2);
});

test('strippaProcessSprak: RESEARCH_SPEC-referens stryks, resten behålls', () => {
  const { kvar, strukna } = strippaProcessSprak(
    "Ansökningsperiod 15 augusti–15 september. SAKNADES I FÖREGÅENDE VERSION, uttryckligen exkluderad — inte ett godkänt uteslutningsskäl enligt RESEARCH_SPEC_v2.md §2.4. Driftbidrag täcker löpande kostnader."
  );
  assert.equal(kvar, 'Ansökningsperiod 15 augusti–15 september. Driftbidrag täcker löpande kostnader.');
  assert.equal(strukna.length, 1);
  assert.ok(strukna[0].includes('RESEARCH_SPEC_v2.md'));
});

test('strippaProcessSprak: KÄLLKONFLIKT-mening stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Höstfönstret var samstämmigt i båda källorna. KÄLLKONFLIKT (§2.5): vårfönstrets öppningsdatum skiljer sig mellan källorna.'
  );
  assert.equal(kvar, 'Höstfönstret var samstämmigt i båda källorna.');
});

test('strippaProcessSprak: diarienummer-mönster ([A-ZÅÄÖ]{2,4} åååå/nr) stryks', () => {
  const { kvar, strukna } = strippaProcessSprak('Se KFN 2025/84-50 för fullständiga regler. Bidraget söks löpande.');
  assert.equal(kvar, 'Bidraget söks löpande.');
  assert.equal(strukna.length, 1);
});

test('strippaProcessSprak: hela fältet är processspråk → null, ingen tom sträng', () => {
  const { kvar } = strippaProcessSprak('SAKNADES I FÖREGÅENDE VERSION enligt RESEARCH_SPEC_v2.md §2.4.');
  assert.equal(kvar, null);
});

test('strippaProcessSprak: null-input → null, tom strukna-lista', () => {
  const { kvar, strukna } = strippaProcessSprak(null);
  assert.equal(kvar, null);
  assert.deepEqual(strukna, []);
});

test('strippaProcessSprak: ren användarkontext utan träffar lämnas helt orörd', () => {
  const text = 'Ansökningsperiod 1 februari–1 april. Ersättning utgår procentuellt per aktivitet.';
  const { kvar, strukna } = strippaProcessSprak(text);
  assert.equal(kvar, text);
  assert.deepEqual(strukna, []);
});

console.log(`\n${antal} tester klara`);
