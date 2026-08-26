import { loadKommuner } from '../src/lib/kommuner.ts';

// Samma dynamiska definition som NationellaStodSektion använder för att
// upptäcka kollisionen mellan kommunens stöd och RF:s statliga LOK-stöd.
// AC2: detta är avsiktligt en RAPPORT, inte en grind. Ett tomt fält är
// sannare än en härledning när den bidragsspecifika källan inte uttryckligen
// svarar på om RF-redovisningen räcker eller om kommunen kräver ett extra steg.
const kommuner = loadKommuner();
const lokPoster = kommuner.flatMap((kommun) =>
  kommun.bidrag
    .filter((bidrag) => bidrag.namn.includes('LOK') || /lokalt aktivitetsstöd/i.test(bidrag.namn))
    .map((bidrag) => ({ kommun, bidrag })),
);

const saknarSvar = lokPoster.filter(({ bidrag }) => !bidrag.ansokningsvag?.trim());
const belagda = lokPoster.filter(({ bidrag }) => bidrag.ansokningsvag?.trim());

console.log(
  `LOK-ansökningsväg (rapport, fäller aldrig): ${belagda.length} belagda, ${saknarSvar.length} saknar svar, ${lokPoster.length} poster totalt i ${new Set(lokPoster.map(({ kommun }) => kommun.kommun_slug)).size} kommuner.`,
);

if (saknarSvar.length > 0) {
  console.log('Saknar ansokningsvag:');
  for (const { kommun, bidrag } of saknarSvar.sort((a, b) =>
    `${a.kommun.kommun_slug}/${a.bidrag.id}`.localeCompare(`${b.kommun.kommun_slug}/${b.bidrag.id}`, 'sv')
  )) {
    console.log(`- ${kommun.kommun_slug}/${bidrag.id}`);
  }
}
