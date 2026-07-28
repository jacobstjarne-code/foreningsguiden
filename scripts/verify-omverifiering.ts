/**
 * verify-omverifiering.ts — Fristående verifiering av
 * src/lib/omverifieringLogik.ts (SPEC: Omverifiering, 2026-07-27). Samma
 * konvention som verify-matching.ts/verify-generator.ts: node:assert/strict,
 * inget nytt testramverk. Kör: node scripts/verify-omverifiering.ts
 */
import assert from 'node:assert/strict';
import {
  berakUtfall, strippaDynamiskInnehall, hashaText, berakPrioritet, sorteraPrioritet,
  type HamtatResultat, type BerakUtfallInput,
} from '../src/lib/omverifieringLogik.ts';

let antal = 0;
function test(namn: string, fn: () => void) {
  fn();
  antal++;
  console.log(`ok — ${namn}`);
}

function resultat(overrides: Partial<HamtatResultat> = {}): HamtatResultat {
  return { ok: true, etag: null, lastModified: null, hash: null, ...overrides };
}

function input(overrides: Partial<BerakUtfallInput> = {}): BerakUtfallInput {
  return {
    baslinjeEtag: null,
    baslinjeLastModified: null,
    baslinjeHash: null,
    flaggadSedan: null,
    konsekutivaFel: 0,
    resultat: resultat(),
    maxSenastVerifieradBlandBidrag: null,
    today: '2026-07-28',
    ...overrides,
  };
}

test('berakUtfall: första kontrollen (ingen baslinje) etablerar baslinjen, aldrig andrad', () => {
  const r = berakUtfall(input({ resultat: resultat({ etag: 'W/"abc"' }) }));
  assert.equal(r.utfall, 'oforandrad');
  assert.equal(r.baslinjeEtag, 'W/"abc"');
  assert.equal(r.flaggadSedan, null);
});

test('berakUtfall: samma ETag → oforandrad, baslinjen orörd', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    resultat: resultat({ etag: 'W/"abc"' }),
  }));
  assert.equal(r.utfall, 'oforandrad');
  assert.equal(r.baslinjeEtag, 'W/"abc"');
});

test('berakUtfall: olika ETag → andrad, baslinjen rullas INTE fram, flaggadSedan sätts till today', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    resultat: resultat({ etag: 'W/"xyz"' }),
  }));
  assert.equal(r.utfall, 'andrad');
  assert.equal(r.baslinjeEtag, 'W/"abc"'); // OFÖRÄNDRAD — det är hela poängen
  assert.equal(r.flaggadSedan, '2026-07-28');
});

test('berakUtfall: redan flaggad, samma ändring igen nästa vecka → flaggadSedan behåller URSPRUNGSDATUMET, inte today', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    flaggadSedan: '2026-07-14',
    resultat: resultat({ etag: 'W/"xyz"' }),
    today: '2026-07-21',
  }));
  assert.equal(r.utfall, 'andrad');
  assert.equal(r.flaggadSedan, '2026-07-14');
});

test('berakUtfall: samma hash (varken etag eller lastModified) → oforandrad', () => {
  const r = berakUtfall(input({
    baslinjeHash: 'aaa111',
    resultat: resultat({ hash: 'aaa111' }),
  }));
  assert.equal(r.utfall, 'oforandrad');
});

test('berakUtfall: mekanismbyte (baslinje hade ETag, nu bara hash) → konservativt andrad även om "värdet" råkar se likadant ut', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'aaa111',
    resultat: resultat({ hash: 'aaa111' }), // samma STRÄNG, annan mekanism
  }));
  assert.equal(r.utfall, 'andrad');
});

test('berakUtfall: hämtning misslyckades → otillganglig, konsekutivaFel ökar, baslinje/flagga orörda', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    konsekutivaFel: 1,
    resultat: resultat({ ok: false }),
  }));
  assert.equal(r.utfall, 'otillganglig');
  assert.equal(r.konsekutivaFel, 2);
  assert.equal(r.baslinjeEtag, 'W/"abc"');
});

test('berakUtfall: tre misslyckanden i rad — räknaren når tröskeln (adminvyns jobb att flagga, inte denna funktionens)', () => {
  let r = berakUtfall(input({ konsekutivaFel: 0, resultat: resultat({ ok: false }) }));
  r = berakUtfall(input({ konsekutivaFel: r.konsekutivaFel, resultat: resultat({ ok: false }) }));
  r = berakUtfall(input({ konsekutivaFel: r.konsekutivaFel, resultat: resultat({ ok: false }) }));
  assert.equal(r.konsekutivaFel, 3);
});

test('berakUtfall AUTO-CLEAR: flaggad ändring, ett bidrag som delar URL:en har senast_verifierad EFTER flaggadSedan → resolve, baslinjen rullar fram, flaggan rensas', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    flaggadSedan: '2026-07-14',
    maxSenastVerifieradBlandBidrag: '2026-07-20', // EFTER flaggadSedan — forskningspasset har redan varit där
    resultat: resultat({ etag: 'W/"xyz"' }),
    today: '2026-07-28',
  }));
  assert.equal(r.utfall, 'oforandrad');
  assert.equal(r.baslinjeEtag, 'W/"xyz"'); // rullad fram till det nya, bekräftade värdet
  assert.equal(r.flaggadSedan, null);
});

test('berakUtfall AUTO-CLEAR: senast_verifierad FÖRE flaggadSedan (gammal verifiering, inte en reaktion på flaggan) → INGEN auto-clear, förblir andrad', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    flaggadSedan: '2026-07-14',
    maxSenastVerifieradBlandBidrag: '2026-06-01', // FÖRE flaggan — irrelevant, gammal verifiering
    resultat: resultat({ etag: 'W/"xyz"' }),
  }));
  assert.equal(r.utfall, 'andrad');
  assert.equal(r.baslinjeEtag, 'W/"abc"');
  assert.equal(r.flaggadSedan, '2026-07-14');
});

test('berakUtfall: innehåll återgår till exakt baslinjevärdet efter att ha varit flaggat → oforandrad, flaggan rensas utan auto-clear-villkoret', () => {
  const r = berakUtfall(input({
    baslinjeEtag: 'W/"abc"',
    flaggadSedan: '2026-07-14',
    resultat: resultat({ etag: 'W/"abc"' }), // tillbaka till baslinjen
  }));
  assert.equal(r.utfall, 'oforandrad');
  assert.equal(r.flaggadSedan, null);
});

test('strippaDynamiskInnehall: script/style/kommentarer + datumstämpel/besöksräknare/copyright ger IDENTISKT resultat mellan två annars lika sidor', () => {
  const bas = (extra: string) => `
    <html><head><script>var x = ${Math.random()};</script><style>.a{color:red}</style></head>
    <body>
      <!-- byggd ${extra} -->
      <p>Föreningsbidrag: max 20 000 kr, sök innan sista datum.</p>
      <p>Senast uppdaterad 2026-07-${extra}</p>
      <p>Besökt 1 234 gånger</p>
      <footer>© 2026 Testkommun</footer>
    </body></html>`;
  const a = strippaDynamiskInnehall(bas('01'));
  const b = strippaDynamiskInnehall(bas('27'));
  assert.equal(a, b);
});

test('strippaDynamiskInnehall: en RIKTIG textändring i brödtexten ger olika resultat', () => {
  const a = strippaDynamiskInnehall('<p>Max 20 000 kr i bidrag.</p>');
  const b = strippaDynamiskInnehall('<p>Max 25 000 kr i bidrag.</p>');
  assert.notEqual(a, b);
});

test('hashaText: samma text → samma hash, olika text → olika hash', () => {
  assert.equal(hashaText('samma'), hashaText('samma'));
  assert.notEqual(hashaText('a'), hashaText('b'));
});

test('berakPrioritet: deadline inom 60 dagar hamnar i tier 1 oavsett köpt/bevakad-status', () => {
  const [tier] = berakPrioritet({ url: 'a', minDagarTillDeadline: 10, arKoptEllerBevakad: true, flaggadSedan: '2026-07-01' });
  assert.equal(tier, 1);
});

test('berakPrioritet: köpt/bevakad utan nära deadline hamnar i tier 2', () => {
  const [tier] = berakPrioritet({ url: 'a', minDagarTillDeadline: null, arKoptEllerBevakad: true, flaggadSedan: '2026-07-01' });
  assert.equal(tier, 2);
});

test('berakPrioritet: varken deadline eller köpt/bevakad hamnar i tier 4 (tier 3/Umami byggs inte)', () => {
  const [tier] = berakPrioritet({ url: 'a', minDagarTillDeadline: null, arKoptEllerBevakad: false, flaggadSedan: '2026-07-01' });
  assert.equal(tier, 4);
});

test('sorteraPrioritet: deadline-tier vinner över köpt/bevakad-tier vinner över övrigt', () => {
  const items = [
    { url: 'ovrig', minDagarTillDeadline: null, arKoptEllerBevakad: false, flaggadSedan: '2026-01-01' },
    { url: 'deadline', minDagarTillDeadline: 5, arKoptEllerBevakad: false, flaggadSedan: '2026-07-01' },
    { url: 'kopt', minDagarTillDeadline: null, arKoptEllerBevakad: true, flaggadSedan: '2026-06-01' },
  ];
  const sorterad = sorteraPrioritet(items).map((i) => i.url);
  assert.deepEqual(sorterad, ['deadline', 'kopt', 'ovrig']);
});

test('sorteraPrioritet: inom tier 1, snarast deadline vinner', () => {
  const items = [
    { url: 'sen', minDagarTillDeadline: 45, arKoptEllerBevakad: false, flaggadSedan: '2026-07-01' },
    { url: 'snar', minDagarTillDeadline: 3, arKoptEllerBevakad: false, flaggadSedan: '2026-07-01' },
  ];
  assert.deepEqual(sorteraPrioritet(items).map((i) => i.url), ['snar', 'sen']);
});

test('sorteraPrioritet: inom tier 4, äldst flaggad sorteras FÖRST — det ÄR "roterande" (anti-starvation)', () => {
  const items = [
    { url: 'nyast', minDagarTillDeadline: null, arKoptEllerBevakad: false, flaggadSedan: '2026-07-20' },
    { url: 'aldst', minDagarTillDeadline: null, arKoptEllerBevakad: false, flaggadSedan: '2026-05-01' },
    { url: 'mellan', minDagarTillDeadline: null, arKoptEllerBevakad: false, flaggadSedan: '2026-06-15' },
  ];
  assert.deepEqual(sorteraPrioritet(items).map((i) => i.url), ['aldst', 'mellan', 'nyast']);
});

console.log(`\n${antal} tester klara`);
