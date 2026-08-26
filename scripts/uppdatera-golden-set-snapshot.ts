// Arbetsorder 2026-08-03, punkt 6 — skriver om golden-set/snapshot.yaml
// från LIVE data/kommuner/*.yaml, för de kommuner golden-set-facit
// (golden-set/*.yaml) faktiskt refererar. Körs INTE automatiskt av något —
// bara när en facit-fil MEDVETET skrivs om mot ny kommundata. Kör sedan
// `node scripts/verify-generator.ts` igen och bekräfta 42/42 grönt innan
// commit. Se snapshot-filens eget filhuvud för hela resonemanget.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import * as yaml from 'js-yaml';

const SNAPSHOT_PATH = 'golden-set/snapshot.yaml';

function kommunSlugarIGoldenSet(): string[] {
  const filer = readdirSync('golden-set').filter((f) => f.endsWith('.yaml') && !f.startsWith('snapshot'));
  const funna = new Set<string>();
  for (const fil of filer) {
    const facit = yaml.load(readFileSync(`golden-set/${fil}`, 'utf-8')) as { kommunSlug: string };
    funna.add(facit.kommunSlug);
  }
  return [...funna].sort();
}

const slugs = kommunSlugarIGoldenSet();

const snapshot: Record<string, unknown> = {};
for (const slug of slugs) {
  snapshot[slug] = yaml.load(readFileSync(`data/kommuner/${slug}.yaml`, 'utf-8'));
}

const idag = new Date().toISOString().slice(0, 10);
const header = `# golden-set/snapshot.yaml — FRUSEN kopia av de kommuner golden-set-facit
# (golden-set/*.yaml) testar mot (arbetsorder 2026-08-03, punkt 6).
#
# scripts/verify-generator.ts läser HÄRIFRÅN, inte live ur data/kommuner/.
# GPT:s parallella datarättningar ändrar kommun-YAML löpande — en korrekt
# datarättning ska aldrig ensam få golden set-grinden att bli röd (facit
# testar generator-LOGIKEN, inte "råkar dagens YAML matcha en gissning
# skriven för veckor sedan"). Röd grind av det skälet lär folk ignorera
# grinden — exakt det SPEC_GOLDEN_SET.md ska förhindra.
#
# NÄR EN FACIT-FIL MEDVETET SKRIVS OM mot ny data: kör
# \`node --experimental-strip-types scripts/uppdatera-golden-set-snapshot.ts\`
# (regenererar denna fil från live data/kommuner/) i SAMMA commit som
# facit-ändringen, verifiera 42/42 grönt, committa båda tillsammans.
# Snapshotten ska aldrig glida ur synk med facit-filerna i tysthet.
#
# Senast regenererad: ${idag}, kommuner: ${slugs.join(', ')}.

`;

writeFileSync(SNAPSHOT_PATH, header + yaml.dump(snapshot, { lineWidth: 100, noRefs: true }));
console.log(`Snapshot skriven till ${SNAPSHOT_PATH} — kommuner: ${slugs.join(', ')}`);
