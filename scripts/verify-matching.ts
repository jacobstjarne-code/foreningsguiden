/**
 * verify-matching.ts — Fristående verifiering av matchningsmotorn
 * (src/lib/matching.ts). Inget nytt testramverk (package.json har inget
 * idag) — node:assert/strict räcker. Kör: node scripts/verify-matching.ts
 * (eller `node --experimental-strip-types scripts/verify-matching.ts` om
 * Node-versionen kräver flaggan för native TS-körning).
 */
import assert from 'node:assert/strict';
import { matchBidrag, matchKommun, visaBorjaHar, harMatchningsdata } from '../src/lib/matching.ts';
import { sumBeloppTak, formatDate, parseBeloppTak, manadNyckel, nastaManadNyckel, formatManadRubrik } from '../src/lib/kommunTyper.ts';
import { arOverGolv, formateraBevakarText } from '../src/lib/bevakningKlient.ts';
import type { Bidrag, Kommun } from '../src/lib/kommuner.ts';
import type { Foreningsprofil } from '../src/lib/foreningsprofil.ts';

let antal = 0;
function test(namn: string, fn: () => void) {
  fn();
  antal++;
  console.log(`ok — ${namn}`);
}

function bidrag(overrides: Partial<Bidrag> = {}): Bidrag {
  return {
    id: 'test-bidrag',
    namn: 'Testbidrag',
    kategori: ['idrott'],
    malgrupp: 'Test',
    deadlines: { typ: 'lopande', datum: [] },
    krav: [],
    belopp: null,
    sen_ansokan: 'Ej angivet',
    kalla_url: 'https://example.se',
    anteckning: null,
    min_medlemmar: null,
    alder_min: null,
    alder_max: null,
    min_verksamhetstid_manader: null,
    foreningstyp: null,
    kraver_registrering: null,
    sate_i_kommunen: null,
    status: 'aktiv',
    ...overrides,
  };
}

function profil(overrides: Partial<Foreningsprofil> = {}): Foreningsprofil {
  return {
    kommunSlug: 'test',
    verksamhet: [],
    storlek: null,
    alder: null,
    sokt: null,
    uppdaterad: '',
    ...overrides,
  };
}

function kommun(bidragLista: Bidrag[]): Kommun {
  return {
    kommun: 'Testkommun',
    kommun_slug: 'test',
    lan: 'Testlän',
    befolkning: 1000,
    forvaltning: 'Test',
    ansokningssystem: { namn: 'Test', url: 'https://example.se' },
    kalla_url: 'https://example.se',
    verifierad: '2026-01-01',
    bidrag: bidragLista,
    forutsattningar: [],
    kommunsiffra: null,
  };
}

test('alla sju fält null → alltid MATCHAR, oavsett profil (grov matchning som designegenskap)', () => {
  const b = bidrag();
  const p = profil({ verksamhet: ['kultur'], storlek: 'xs', alder: 'ny', sokt: 'nej' });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'MATCHAR');
  assert.equal(r.skal.length, 0);
});

test('foreningstyp satt, ingen gemensam verksamhet → SAKNAR (mjukt, inte EJ_BEHORIG)', () => {
  const b = bidrag({ foreningstyp: ['idrott'] });
  const p = profil({ verksamhet: ['kultur'] });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'SAKNAR');
  assert.equal(r.skal[0].falt, 'foreningstyp');
});

test('foreningstyp null → matchar oavsett profil.verksamhet, även tom', () => {
  const b = bidrag({ foreningstyp: null });
  const p = profil({ verksamhet: [] });
  assert.equal(matchBidrag(p, b).state, 'MATCHAR');
});

test('min_medlemmar: bucket xs (övre gräns 24) mot krav 500 → SAKNAR', () => {
  const b = bidrag({ min_medlemmar: 500 });
  const p = profil({ storlek: 'xs' });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'SAKNAR');
  assert.equal(r.skal[0].falt, 'min_medlemmar');
});

test('min_medlemmar: bucket m (övre gräns 500) mot krav 100 → optimistisk MATCHAR', () => {
  const b = bidrag({ min_medlemmar: 100 });
  const p = profil({ storlek: 'm' });
  assert.equal(matchBidrag(p, b).state, 'MATCHAR');
});

test('min_verksamhetstid_manader: bucket ny (övre gräns 11) mot krav 36 → SAKNAR', () => {
  const b = bidrag({ min_verksamhetstid_manader: 36 });
  const p = profil({ alder: 'ny' });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'SAKNAR');
  assert.equal(r.skal[0].falt, 'min_verksamhetstid_manader');
});

test('min_verksamhetstid_manader: bucket etablerad (Infinity) mot krav 36 → MATCHAR', () => {
  const b = bidrag({ min_verksamhetstid_manader: 36 });
  const p = profil({ alder: 'etablerad' });
  assert.equal(matchBidrag(p, b).state, 'MATCHAR');
});

test('kraver_registrering=true + sokt≠ja → SAKNAR på bidraget', () => {
  const b = bidrag({ kraver_registrering: true });
  const p = profil({ sokt: 'nej' });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'SAKNAR');
  assert.equal(r.skal[0].falt, 'kraver_registrering');
});

test('kraver_registrering=true + sokt=ja → inget skäl, MATCHAR', () => {
  const b = bidrag({ kraver_registrering: true });
  const p = profil({ sokt: 'ja' });
  assert.equal(matchBidrag(p, b).state, 'MATCHAR');
});

test('kraver_registrering=null → aldrig ett skäl, oavsett sokt', () => {
  const b = bidrag({ kraver_registrering: null });
  assert.equal(matchBidrag(profil({ sokt: 'nej' }), b).state, 'MATCHAR');
  assert.equal(matchBidrag(profil({ sokt: 'ja' }), b).state, 'MATCHAR');
});

test('visaBorjaHar: sokt=null/osaker/nej → true oavsett matchande bidrag', () => {
  assert.equal(visaBorjaHar(profil({ sokt: null }), []), true);
  assert.equal(visaBorjaHar(profil({ sokt: 'osaker' }), []), true);
  assert.equal(visaBorjaHar(profil({ sokt: 'nej' }), []), true);
});

test('visaBorjaHar: sokt=ja + inget kraver_registrering-bidrag i matchar → false', () => {
  const b = bidrag({ kraver_registrering: null });
  assert.equal(visaBorjaHar(profil({ sokt: 'ja' }), [b]), false);
});

test('visaBorjaHar: sokt=ja MEN ett matchat bidrag har kraver_registrering=true → true (edge-caset)', () => {
  const b = bidrag({ kraver_registrering: true });
  assert.equal(visaBorjaHar(profil({ sokt: 'ja' }), [b]), true);
});

test('alder_min/alder_max satt men profilen samlar inte in medlemsålder → hoppas alltid över, EJ_BEHORIG oåtkomligt via denna UI', () => {
  const b = bidrag({ alder_min: 7, alder_max: 25 });
  const p = profil({ verksamhet: ['ungdom'] });
  const r = matchBidrag(p, b);
  assert.equal(r.state, 'MATCHAR');
  assert.equal(r.skal.length, 0);
});

test('matchKommun grupperar korrekt: MATCHAR/SAKNAR i rätt hinkar, EJ_BEHORIG oåtkomlig via denna UI, + borjaHar', () => {
  const matchande = bidrag({ id: 'a' });
  const saknar = bidrag({ id: 'b', min_medlemmar: 500 });
  // sate_i_kommunen: profilen samlar inte in ett motsvarande svar (alltid
  // null/obesvarat i denna UI, se foreningsprofil.ts) → ingen skal
  // produceras → detta bidraget hoppar in i MATCHAR, inte EJ_BEHORIG.
  const utanProfilsignal = bidrag({ id: 'c', sate_i_kommunen: true });
  const k = kommun([matchande, saknar, utanProfilsignal]);
  const p = profil({ storlek: 'xs', sokt: 'nej' });
  const r = matchKommun(p, k);

  assert.equal(r.matchar.length, 2);
  assert.deepEqual(r.matchar.map((b) => b.id).sort(), ['a', 'c']);
  assert.equal(r.saknar.length, 1);
  assert.equal(r.saknar[0].bidrag.id, 'b');
  assert.equal(r.ejBehorig.length, 0);
  assert.equal(r.matchar.length + r.saknar.length + r.ejBehorig.length, 3);
  assert.equal(r.borjaHar, true); // sokt='nej'
});

test('H26: pausat/avskaffat bidrag hoppas över helt i matchKommun — hamnar varken i matchar, saknar eller ejBehorig', () => {
  const aktivt = bidrag({ id: 'a' });
  const pausat = bidrag({ id: 'b', status: 'pausad' });
  const avskaffat = bidrag({ id: 'c', status: 'avskaffat', min_medlemmar: 500 }); // skulle annars gett SAKNAR
  const k = kommun([aktivt, pausat, avskaffat]);
  const r = matchKommun(profil({ storlek: 'xs' }), k);

  assert.deepEqual(r.matchar.map((b) => b.id), ['a']);
  assert.equal(r.saknar.length, 0);
  assert.equal(r.ejBehorig.length, 0);
});

test('harMatchningsdata: alla bidrag helt null → false (dagens läge i alla 80 kommuner)', () => {
  const k = kommun([bidrag({ id: 'a' }), bidrag({ id: 'b' })]);
  assert.equal(harMatchningsdata(k), false);
});

test('harMatchningsdata: ett enda ifyllt fält på ETT bidrag → true för hela kommunen', () => {
  const k = kommun([bidrag({ id: 'a' }), bidrag({ id: 'b', min_medlemmar: 10 })]);
  assert.equal(harMatchningsdata(k), true);
});

test('harMatchningsdata: sate_i_kommunen ensamt ifylld räknas INTE — tratten samlar inte in ett motsvarande svar', () => {
  const k = kommun([bidrag({ id: 'a', sate_i_kommunen: true })]);
  assert.equal(harMatchningsdata(k), false);
});

test('arOverGolv: gränsen 49→false, 50→true — den exakta övergången ordern bad om att verifiera', () => {
  assert.equal(arOverGolv(49, 50), false);
  assert.equal(arOverGolv(50, 50), true);
  assert.equal(arOverGolv(3, 50), false);
  assert.equal(arOverGolv(0, 3), false);
  assert.equal(arOverGolv(3, 3), true);
});

test('sumBeloppTak: null-belopp exkluderas ur summan men räknas i uncapped (Design turn-14-fotnoten)', () => {
  const lista = [
    bidrag({ id: 'a', belopp: '20 000 kr' }),
    bidrag({ id: 'b', belopp: '75 000 kr' }),
    bidrag({ id: 'c', belopp: 'Upp till 30 % av redovisad kostnad' }), // ej parsebart → uncapped
    bidrag({ id: 'd', belopp: null }),
  ];
  const sum = sumBeloppTak(lista);
  assert.equal(sum.total, 95000);
  assert.equal(sum.capped, 2);
  assert.equal(sum.uncapped, 2);
});

test('sumBeloppTak: alla bidrag cappade → uncapped=0 (sumFotnotCappat-grenen, inte sumFotnotOkant)', () => {
  const lista = [bidrag({ id: 'a', belopp: '10 000 kr' }), bidrag({ id: 'b', belopp: '5 000 kr' })];
  const sum = sumBeloppTak(lista);
  assert.equal(sum.uncapped, 0);
  assert.equal(sum.total, 15000);
});

test('REGRESSION (produktion 2026-07-26): getEarliestConfirmedRegistrationDate måste slice:a full ISO-tidsstämpel till YYYY-MM-DD — annars ger formatDate() "NaN" i "sedan {datum}" (Subscriber.registrerad sparas som new Date().toISOString(), inte ett rent datum)', () => {
  const fullTidsstampel = '2026-07-18T21:59:57.034Z';
  const felaktigtDatum = formatDate(fullTidsstampel); // simulerar buggen direkt
  assert.ok(felaktigtDatum.includes('NaN'), 'test-antagandet stämmer: full tidsstämpel ger NaN i formatDate — det är precis det .slice(0,10) i subscribers.ts förhindrar');
  const korrektDatum = formatDate(fullTidsstampel.slice(0, 10));
  assert.equal(korrektDatum, '18 juli 2026');
});

test('formateraBevakarText: antal===1 väljer singular-mallen (rättar "1 föreningar")', () => {
  const text = formateraBevakarText(1, '18 juli 2026', '{antal} föreningar bevakar sina deadlines · sedan {datum}', '1 förening bevakar sina deadlines · sedan {datum}');
  assert.equal(text, '1 förening bevakar sina deadlines · sedan 18 juli 2026');
});

test('formateraBevakarText: antal>1 väljer plural-mallen', () => {
  const text = formateraBevakarText(3, '18 juli 2026', '{antal} föreningar bevakar sina deadlines · sedan {datum}', '1 förening bevakar sina deadlines · sedan {datum}');
  assert.equal(text, '3 föreningar bevakar sina deadlines · sedan 18 juli 2026');
});

test('SPEC_DEADLINEKALENDER: manadNyckel/nastaManadNyckel/formatManadRubrik — grundfall', () => {
  assert.equal(manadNyckel('2026-09-15'), '2026-09');
  assert.equal(nastaManadNyckel('2026-09'), '2026-10');
  assert.equal(formatManadRubrik('2026-09'), 'September 2026');
});

test('SPEC_DEADLINEKALENDER: nastaManadNyckel rullar över årsskiftet (december → januari nästa år)', () => {
  assert.equal(nastaManadNyckel('2026-12'), '2027-01');
  assert.equal(formatManadRubrik('2027-01'), 'Januari 2027');
});

test('SPEC_DEADLINEKALENDER: parseBeloppTak — kalenderraden visar bara otvetydiga tak, aldrig en taxa (Sundbyberg-klassen)', () => {
  assert.equal(parseBeloppTak('40 000 kr'), 40000);
  assert.equal(parseBeloppTak('Max 40 000 kr'), 40000);
  assert.equal(parseBeloppTak('1 000 kr/aktivitetstimme'), null);
  assert.equal(parseBeloppTak('Upp till 30 % av redovisad kostnad'), null);
  assert.equal(parseBeloppTak(null), null);
});

console.log(`\n${antal} tester klara`);
