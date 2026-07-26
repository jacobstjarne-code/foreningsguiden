/**
 * verify-generator.ts — Golden set-grinden för bidragsutkastgeneratorn
 * (utkastGenerator.ts). Samma stil som verify-matching.ts:
 * node:assert/strict, ingen testrunner (package.json har inget idag).
 * Kör: node scripts/verify-generator.ts
 *
 * Läser varje golden-set/*.yaml (inklusive .EXEMPEL.yaml-filer — namnet är
 * bara en läsbarhetsmarkör för människor, ingen filtrering här), kör
 * generatorn mot facit-profilen, och testar de fyra spärrarna maskinellt.
 *
 * VIKTIGT — grönt här bevisar att PIPELINEN fungerar. Det bevisar INTE att
 * grinden är godkänd i Jacobs mening: en fil vars kravStatus ingen människa
 * har läst igenom och bekräftat är en demonstration, inte ett facit.
 * "Betalning aktiveras FÖRST när grinden är grön" (Jacob, 2026-07-26)
 * förutsätter riktiga, mänskligt skrivna facit-filer i golden-set/ — se
 * README.md i den mappen.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';
import { genereraUtkast } from '../src/lib/utkastGenerator.ts';
import type { Kommun } from '../src/lib/kommunTyper.ts';
import type { Foreningsprofil } from '../src/lib/foreningsprofil.ts';

// Läser kommun-YAML direkt (js-yaml, samma som kommuner.ts) i stället för
// att importera kommuner.ts self: den filen gör en riktig VALUE-import av
// kommunTyper.ts UTAN .ts-ändelse (rätt för Astro/Vite-bygget, fel för
// Nodes strikta ESM-upplösning vid `node scripts/...ts`). Att lägga till
// en extension där hade rört delad infrastruktur i onödan för ett
// skriptbekvämlighetsproblem — enklare att låta scriptet vara
// självförsörjande, samma princip som verify-matching.ts:s egna
// test-fixtures.
function getKommunBySlug(slug: string): Kommun | undefined {
  const path = `data/kommuner/${slug}.yaml`;
  try {
    return yaml.load(readFileSync(path, 'utf-8')) as Kommun;
  } catch {
    return undefined;
  }
}

interface GoldenSetFacit {
  bidragId: string;
  kommunSlug: string;
  profil: Foreningsprofil;
  forvantadTyp: 'bidragsutkast' | 'registrering_forst';
  kravStatus?: ('ifyllt' | 'lucka')[];
}

// Skannar ENDAST generatorns egna strängar (ansvarsrad, kravRader[].innehall)
// — ALDRIG kravText, eftersom det är kommunens egen text och kan legitimt
// innehålla ord som "beviljas" i sin egen formulering (t.ex. "bidrag
// beviljas inte till interna sammankomster"). Ett scan av kravText hade gett
// falska positiva.
const BANNADE_FRASER = [
  /öka(r)?\s+(er|din|föreningens)?\s*chans/i,
  /garant(i|erar)/i,
  /\bbevilja(s|r)?\b/i,
  /större\s+chans/i,
  /ökar?\s+sannolikheten/i,
];

let antal = 0;
let fel = 0;
function test(namn: string, fn: () => void) {
  try {
    fn();
    antal++;
    console.log(`ok — ${namn}`);
  } catch (e) {
    fel++;
    console.error(`FAIL — ${namn}\n  ${(e as Error).message}`);
  }
}

const filer = readdirSync('golden-set').filter((f) => f.endsWith('.yaml'));

if (filer.length === 0) {
  console.log('Inga golden-set/*.yaml-filer hittades. Grinden har inget att köra mot — se golden-set/README.md.');
  process.exit(0);
}

for (const fil of filer) {
  const facit = yaml.load(readFileSync(`golden-set/${fil}`, 'utf-8')) as GoldenSetFacit;

  const kommun = getKommunBySlug(facit.kommunSlug);
  test(`${fil} — kommunSlug känd`, () => {
    assert.ok(kommun, `okänd kommunSlug "${facit.kommunSlug}"`);
  });
  if (!kommun) continue;

  const bidrag = kommun.bidrag.find((b) => b.id === facit.bidragId);
  test(`${fil} — bidragId känt`, () => {
    assert.ok(bidrag, `okänt bidragId "${facit.bidragId}" i ${facit.kommunSlug}`);
  });
  if (!bidrag) continue;

  const resultat = genereraUtkast(facit.profil, bidrag, kommun);

  test(`${fil} — spärr 4 (registreringsgate rätt typ)`, () => {
    assert.equal(resultat.typ, facit.forvantadTyp);
  });

  if (resultat.typ !== 'bidragsutkast') continue;

  test(`${fil} — spärr 1 (inget påhittat krav, ordagrant citat, rätt antal och ordning)`, () => {
    assert.equal(resultat.kravRader.length, bidrag.krav.length, 'antal kravRader matchar inte bidragets krav[]');
    resultat.kravRader.forEach((r, i) => {
      assert.equal(r.kravText, bidrag.krav[i], `kravRader[${i}] är inte ett ordagrant citat av bidrag.krav[${i}]`);
    });
  });

  test(`${fil} — spärr 2 (lovar aldrig bifall)`, () => {
    const genererat = [resultat.ansvarsrad, ...resultat.kravRader.map((r) => r.innehall)].join(' ');
    for (const monster of BANNADE_FRASER) {
      assert.ok(!monster.test(genererat), `genererad text matchar bannat mönster: ${monster}`);
    }
    assert.ok(resultat.ansvarsrad.length > 0, 'ansvarsrad saknas');
  });

  if (facit.kravStatus) {
    test(`${fil} — spärr 3 (luckor markerade exakt som facit)`, () => {
      assert.equal(
        resultat.kravRader.length,
        facit.kravStatus!.length,
        'drift: bidragets krav[] och facit.kravStatus har olika längd — facit måste uppdateras av en människa'
      );
      resultat.kravRader.forEach((r, i) => {
        assert.equal(r.status, facit.kravStatus![i], `krav[${i}] "${r.kravText}": förväntade ${facit.kravStatus![i]}, fick ${r.status}`);
      });
    });
  }
}

console.log(`\n${antal} tester klara, ${fel} FAIL`);
if (fel > 0) process.exit(1);
