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

// Opus 2026-09-25: ett fall per mönster som lades till när grinden gjordes
// fällande. Formuleringarna är hämtade ordagrant ur de 42 anteckningar som
// rensningen flyttade till qa_anteckning — inte påhittade exempel.
test('strippaProcessSprak: "omkörning" stryks', () => {
  const { kvar, strukna } = strippaProcessSprak(
    'Ansökan avser lokalkostnader under föreningens senast avslutade verksamhetsår. Kontrollerad på nytt vid omkörning 2026-07-20, ingen ny avvikelse hittad.'
  );
  assert.equal(kvar, 'Ansökan avser lokalkostnader under föreningens senast avslutade verksamhetsår.');
  assert.equal(strukna.length, 1);
});

test('strippaProcessSprak: "verifierat oförändrat" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Medel beviljas i mån av kvarvarande årsbudget. Verifierat oförändrat vid omkörning 2026-07-21.'
  );
  assert.equal(kvar, 'Medel beviljas i mån av kvarvarande årsbudget.');
});

test('strippaProcessSprak: "Lagrad källa pekade tidigare" stryks', () => {
  const { kvar, strukna } = strippaProcessSprak(
    'Lagrad källa pekade tidigare på sidan Projektstöd inom kultur, som inte beskriver stödet. Beslut går ut i november.'
  );
  assert.equal(kvar, 'Beslut går ut i november.');
  assert.ok(strukna[0].startsWith('Lagrad källa'));
});

test('strippaProcessSprak: "bekräftat i <källa>" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Utbetalning i maj och oktober. Medlemstalet 25 bekräftat i kommunens regelverk — ingen konflikt för detta bidrag.'
  );
  assert.equal(kvar, 'Utbetalning i maj och oktober.');
});

test('strippaProcessSprak: "angav tidigare" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Sen_ansokan angav tidigare 1 mars för höstterminen, vilket motsade postens eget datumfält. Kommunens sida anger 25 februari.'
  );
  assert.equal(kvar, 'Kommunens sida anger 25 februari.');
});

test('strippaProcessSprak: "rättat" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Handläggs av Kulturkontoret. Åldersspannet rättat från 7–25 till 6–25 år enligt bidragsbestämmelserna.'
  );
  assert.equal(kvar, 'Handläggs av Kulturkontoret.');
});

// Negativa fall: de nya mönstren får inte svälja vanlig kassörstext. Båda
// meningarna handlar om kommunens egen handläggning, inte om vår verifiering.
test('strippaProcessSprak: "Beloppet beslutas av nämnden" är INTE processspråk', () => {
  const text = 'Beloppet beslutas av nämnden.';
  const { kvar, strukna } = strippaProcessSprak(text);
  assert.equal(kvar, text);
  assert.deepEqual(strukna, []);
});

test('strippaProcessSprak: "Kommunen bekräftar ansökan via e-post" är INTE processspråk', () => {
  const text = 'Kommunen bekräftar ansökan via e-post.';
  const { kvar, strukna } = strippaProcessSprak(text);
  assert.equal(kvar, text);
  assert.deepEqual(strukna, []);
});

// Jacob 2026-09-25, andra vändan mönster. Samma princip: formuleringarna är
// hämtade ur de anteckningar mönstren faktiskt fällde, inte påhittade.
test('strippaProcessSprak: "förra körningen" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Detta var ett av de bidrag som uteslöts i förra körningen — verifierat här som faktiskt sökbart. Beslutas av omsorgsnämnden.'
  );
  assert.equal(kvar, 'Beslutas av omsorgsnämnden.');
});

test('strippaProcessSprak: "oberoende hämtningar" stryks', () => {
  const { kvar, strukna } = strippaProcessSprak(
    'Handläggning sker löpande. Deadline satt till sista dag i respektive period, dubbelhämtat och bekräftat identiskt i två oberoende hämtningar 2026-07-20.'
  );
  assert.equal(kvar, 'Handläggning sker löpande.');
  assert.equal(strukna.length, 1);
});

test('strippaProcessSprak: "kontrollerat <dag månad år>" stryks mitt i en mening', () => {
  const { kvar } = strippaProcessSprak(
    'Ansökan avser föregående år. Driftbidraget ska sökas senast den 30 april (kontrollerat 18 september 2026).'
  );
  assert.equal(kvar, 'Ansökan avser föregående år.');
});

test('strippaProcessSprak: "bekräftat som" stryks', () => {
  const { kvar } = strippaProcessSprak(
    "Samma ansökningsperioder som aktivitetsstöd 7–25 år. Bekräftat som eget bidrag i kommunens e-tjänstkatalog."
  );
  assert.equal(kvar, 'Samma ansökningsperioder som aktivitetsstöd 7–25 år.');
});

test('strippaProcessSprak: "tidigare angavs" stryks', () => {
  const { kvar } = strippaProcessSprak(
    'Bidraget gäller ett år i taget. Socialnämnden fattar beslut i oktober (tidigare angavs september).'
  );
  assert.equal(kvar, 'Bidraget gäller ett år i taget.');
});

test('strippaProcessSprak: "upprättat avtal" är INTE processspråk — ordgränsen i /\\brättat\\b/ håller', () => {
  const text = 'Ersättning enligt upprättat avtal.';
  const { kvar, strukna } = strippaProcessSprak(text);
  assert.equal(kvar, text);
  assert.deepEqual(strukna, []);
});

console.log(`\n${antal} tester klara`);
