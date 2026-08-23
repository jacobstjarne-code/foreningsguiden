import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadKommuner } from '../src/lib/kommuner.ts';
import { getNationellaDeadlineEntries, loadNationellaStod } from '../src/lib/nationellaStod.ts';

const stod = loadNationellaStod();
assert.equal(stod.length, 1, 'T1 ska innehålla exakt ett nationellt stöd');
const lok = stod[0];
assert.equal(lok.id, 'lok-stod');
assert.equal(lok.niva, 'nationell');
assert.equal('kommun_slug' in lok, false, 'nationella stöd får aldrig kommun_slug');
assert.deepEqual(lok.omfattning, { kommuner: 'alla', antal_kommuner: 290 });
assert.deepEqual(lok.deadlines.datum, ['02-25', '08-25']);
assert.deepEqual(lok.deadlines.perioder.map((p) => p.avser.ar_relation), ['foregaende_ar', 'samma_ar']);
assert.deepEqual(lok.belopp.deltagarstod.map((t) => t.tillfallen.map((x) => x.belopp_ore)), [
  [630, 630, 420],
  [630, 630, 420, 210, 210],
]);
assert.deepEqual(lok.sanktionstrappa.steg.map((s) => s.reducering_procent), [25, 50, 75, null]);
assert.equal(lok.dataflaggor.find((f) => f.typ === 'behorighet')?.aktiveras_for_stodet_vid_flagga, 'systembyte');
assert.equal(lok.kopbar, false, 'nationella stöd ska permanent vara exkluderade från köp');
assert.ok(lok.kallor.every((k) => k.last_datum === '2026-08-18'));
assert.equal(getNationellaDeadlineEntries('2026-08-18').length, 2);

const kommunalaIds = loadKommuner().flatMap((k) => k.bidrag.map((b) => `${k.kommun_slug}:${b.id}`));
assert.ok(!kommunalaIds.some((id) => id.startsWith('nationell:') || id.endsWith(':lok-stod')), 'LOK-stöd får inte läcka in i kommunala köpobjekt');

const subscribers = readFileSync(new URL('../src/lib/subscribers.ts', import.meta.url), 'utf8');
assert.match(subscribers, /nationellaStod\?: string\[\]/, 'Subscriber måste ha ett additivt nationellt bevakningsfält');

console.log('Nationella stöd: identitet, LOK-data, köpundantag och additiv bevakningsmodell verifierade.');
