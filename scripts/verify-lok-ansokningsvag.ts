import assert from 'node:assert/strict';
import { loadKommuner } from '../src/lib/kommuner.ts';

// Samma dynamiska definition som NationellaStodSektion använder för att
// upptäcka kollisionen mellan kommunens stöd och RF:s statliga LOK-stöd.
// En nytillkommen kommunpost får därför inte passera CI utan ett faktiskt
// svar på om RF-redovisningen räcker eller om kommunen kräver ett extra steg.
const kommuner = loadKommuner();
const lokPoster = kommuner.flatMap((kommun) =>
  kommun.bidrag
    .filter((bidrag) => bidrag.namn.includes('LOK') || /lokalt aktivitetsstöd/i.test(bidrag.namn))
    .map((bidrag) => ({ kommun, bidrag })),
);

const saknarSvar = lokPoster.filter(({ bidrag }) => !bidrag.ansokningsvag?.trim());
assert.deepEqual(
  saknarSvar.map(({ kommun, bidrag }) => `${kommun.kommun_slug}/${bidrag.id}`),
  [],
  'LOK-liknande kommunbidrag saknar ansokningsvag',
);

const svarUtanRf = lokPoster.filter(({ bidrag }) =>
  !/\bRF\b|Riksidrottsförbundet|IdrottOnline/i.test(bidrag.ansokningsvag ?? ''),
);
assert.deepEqual(
  svarUtanRf.map(({ kommun, bidrag }) => `${kommun.kommun_slug}/${bidrag.id}`),
  [],
  'ansokningsvag måste uttryckligen besvara hur RF-rapporteringen förhåller sig till kommunstödet',
);

const falun = lokPoster.find(({ bidrag }) => bidrag.id === 'falun-lok-stod');
assert.equal(
  falun?.bidrag.ansokningsvag,
  'RF-anslutna föreningar redovisar via Riksidrottsförbundet; övriga föreningar ansöker via ActorSmartbook.',
  'Faluns belagda ansökningsväg får inte regressera',
);

console.log(
  `LOK-ansökningsväg: ${lokPoster.length} bidragsposter i ${new Set(lokPoster.map(({ kommun }) => kommun.kommun_slug)).size} kommuner har ett uttryckligt RF/kommun-svar.`,
);
