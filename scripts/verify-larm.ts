/**
 * verify-larm.ts — AB1.3 (Jacobs order): systemlarmets rena
 * beslutslogik (larmLogik.ts), utan Redis. Samma delning som
 * omverifieringLogik.ts/omverifiering.ts — den här filen testar bara
 * VAD som beslutas, inte HUR data hämtas/skrivs (det kräver en riktig
 * Upstash-anslutning och täcks inte här, se cron/systemlarm.ts:s eget
 * filhuvud för varför en kallstart aldrig får larma falskt).
 *
 * Kör: node --experimental-strip-types scripts/verify-larm.ts
 */
import { bedomCron, granskningVaxer, aldstDatum } from '../src/lib/larmLogik.ts';

const fail: string[] = [];
function assertEq(faktisk: unknown, forvantad: unknown, etikett: string): void {
  if (JSON.stringify(faktisk) !== JSON.stringify(forvantad)) {
    fail.push(`${etikett}: fick ${JSON.stringify(faktisk)}, väntade ${JSON.stringify(forvantad)}`);
  }
}

const UTEBLIVEN_TIMMAR = 30;
const NU = Date.parse('2026-08-26T14:00:00.000Z');

// --- bedomCron ---

// Aldrig observerad (nydeployad cron) — ska ALDRIG räknas som uteblivet.
assertEq(bedomCron('paminnelser', null, NU, UTEBLIVEN_TIMMAR).status, 'ej_observerad', 'bedomCron: null-heartbeat');

// Körde nyss, inga fel — ok, inget meddelande.
assertEq(
  bedomCron('paminnelser', { senasteKorning: new Date(NU - 2 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, UTEBLIVEN_TIMMAR),
  { namn: 'paminnelser', status: 'ok', meddelande: null },
  'bedomCron: frisk körning'
);

// Körde för 31h sedan (över tröskeln 30h) — uteblivet, trumfar även om fel skulle råka vara tom.
{
  const b = bedomCron('giltighetsvarning', { senasteKorning: new Date(NU - 31 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, UTEBLIVEN_TIMMAR);
  assertEq(b.status, 'uteblivet', 'bedomCron: 31h sedan → uteblivet');
  if (!b.meddelande?.includes('31.0 timmar')) fail.push(`bedomCron: uteblivet-meddelandet saknar timantalet: ${b.meddelande}`);
}

// Precis under tröskeln (29h) — fortfarande ok, inte uteblivet (gränsfall).
assertEq(
  bedomCron('utfallsfraga', { senasteKorning: new Date(NU - 29 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, UTEBLIVEN_TIMMAR).status,
  'ok',
  'bedomCron: 29h sedan → fortfarande ok (under tröskeln)'
);

// Körde nyss men hade fel — 'fel', inte 'uteblivet'.
{
  const b = bedomCron(
    'omverifiering',
    { senasteKorning: new Date(NU - 1 * 60 * 60 * 1000).toISOString(), fel: ['url1: timeout', 'url2: 500'] },
    NU,
    UTEBLIVEN_TIMMAR
  );
  assertEq(b.status, 'fel', 'bedomCron: färska fel → status fel');
  if (!b.meddelande?.includes('2 fel')) fail.push(`bedomCron: fel-meddelandet saknar felantalet: ${b.meddelande}`);
}

// --- AB1.8: systemlarmets egen självkontroll, samma bedomCron men med
// SYSTEMLARM_UTEBLIVET_TIMMAR (26h) i stället för CRON_UTEBLIVEN_TIMMAR
// (30h) — de två tröskelvärdena får inte råka blandas ihop. ---

const SYSTEMLARM_UTEBLIVET_TIMMAR = 26;

// Nydeployad (aldrig kört sig själv förut) — ska INTE larma första gången.
assertEq(bedomCron('systemlarm', null, NU, SYSTEMLARM_UTEBLIVET_TIMMAR).status, 'ej_observerad', 'bedomCron (självkontroll): aldrig kört');

// Normalt dygnsschema: föregående körning ~24h sedan — ok, under 26h-tröskeln.
assertEq(
  bedomCron('systemlarm', { senasteKorning: new Date(NU - 24 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, SYSTEMLARM_UTEBLIVET_TIMMAR).status,
  'ok',
  'bedomCron (självkontroll): 24h sedan (normalt dygnsschema) → ok'
);

// En körning missades helt — föregående lyckade var ~48h sedan (ett helt hoppat dygn) → uteblivet.
{
  const b = bedomCron('systemlarm', { senasteKorning: new Date(NU - 48 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, SYSTEMLARM_UTEBLIVET_TIMMAR);
  assertEq(b.status, 'uteblivet', 'bedomCron (självkontroll): 48h sedan (ett hoppat dygn) → uteblivet');
}

// Skarp gräns: exakt på tröskeln (26h) är INTE över den (> jämförs, inte >=) — fortfarande ok.
assertEq(
  bedomCron('systemlarm', { senasteKorning: new Date(NU - 26 * 60 * 60 * 1000).toISOString(), fel: [] }, NU, SYSTEMLARM_UTEBLIVET_TIMMAR).status,
  'ok',
  'bedomCron (självkontroll): exakt 26h → fortfarande ok (strikt över-jämförelse)'
);

// Marginalen är TIGHTARE än de andra sju cronens 30h — samma 27h-gap
// (mellan 26 och 30) ska ge olika utfall beroende på vilken tröskel som
// används, annars har de två konstanterna av misstag blivit samma tal.
{
  const heartbeat = { senasteKorning: new Date(NU - 27 * 60 * 60 * 1000).toISOString(), fel: [] };
  assertEq(bedomCron('systemlarm', heartbeat, NU, SYSTEMLARM_UTEBLIVET_TIMMAR).status, 'uteblivet', 'bedomCron (självkontroll): 27h → uteblivet vid 26h-tröskeln');
  assertEq(bedomCron('paminnelser', heartbeat, NU, UTEBLIVEN_TIMMAR).status, 'ok', 'bedomCron (övriga crons): samma 27h → fortfarande ok vid 30h-tröskeln');
}

// --- granskningVaxer ---

assertEq(granskningVaxer(5, 3), true, 'granskningVaxer: 3→5 är tillväxt');
assertEq(granskningVaxer(3, 5), false, 'granskningVaxer: 5→3 är INTE tillväxt');
assertEq(granskningVaxer(3, 3), false, 'granskningVaxer: oförändrat är INTE tillväxt');
// Kallstart-fallet — hela poängen med AB1.3-fixen: null (aldrig sparad
// baslinje) får ALDRIG tolkas som "0 → N är tillväxt".
assertEq(granskningVaxer(50, null), false, 'granskningVaxer: kallstart (null-baslinje) larmar inte, oavsett storlek');
assertEq(granskningVaxer(0, null), false, 'granskningVaxer: kallstart med 0 poster larmar inte');

// --- aldstDatum ---

assertEq(aldstDatum([]), null, 'aldstDatum: tom lista → null');
assertEq(aldstDatum(['2026-08-01']), '2026-08-01', 'aldstDatum: en post');
assertEq(aldstDatum(['2026-08-10', '2026-07-15', '2026-08-01']), '2026-07-15', 'aldstDatum: väljer tidigast, oavsett ordning');
assertEq(aldstDatum(['2026-08-01', '2026-08-01']), '2026-08-01', 'aldstDatum: dubbletter påverkar inte resultatet');

if (fail.length > 0) {
  console.error(`verify:larm FAIL — ${fail.length} fel`);
  for (const problem of fail) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log('verify:larm — bedomCron (5 fall) + AB1.8-självkontroll (5 fall), granskningVaxer (5 fall, inkl. kallstart), aldstDatum (4 fall). PASS');
