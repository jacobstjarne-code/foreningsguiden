/**
 * verify-generator.ts — Golden set-grinden för bidragsutkastgeneratorn
 * (utkastGenerator.ts), enligt SPEC_GOLDEN_SET.md (Opus/Fable, 2026-07-27).
 * Samma stil som verify-matching.ts: node:assert/strict, ingen testrunner
 * (package.json har inget idag). Kör: node scripts/verify-generator.ts
 *
 * Kör genereraUtkast() mot varje golden-set/*.yaml-facit, för VAR OCH EN
 * av de tre fasta testprofilerna (P1/P2/P3, SPEC_GOLDEN_SET §4), och
 * testar de fyra kriterierna K1–K4 (SPEC_GOLDEN_SET §2) maskinellt.
 *
 * VIKTIGT — grönt här bevisar att PIPELINEN fungerar. Det bevisar INTE att
 * grinden är godkänd i Jacobs mening: en fil vars kravFacit ingen människa
 * har läst igenom och bekräftat är en demonstration, inte ett facit.
 * "Betalning aktiveras FÖRST när grinden är grön" förutsätter riktiga,
 * mänskligt skrivna facit-filer i golden-set/ — se README.md i den mappen.
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

type ProfilNyckel = 'p1' | 'p2' | 'p3';
const PROFIL_NYCKLAR: ProfilNyckel[] = ['p1', 'p2', 'p3'];

/**
 * De tre fasta testprofilerna (SPEC_GOLDEN_SET §4) — IDENTISKA för alla
 * bidrag utom kommunSlug. Facit-skrivaren beskriver bara UTFALLET för
 * sitt bidrag mot dessa redan fastställda profiler, aldrig egna värden
 * — det är vad som gör 15 bidrag × 3 profiler jämförbart som 45
 * körningar i stället för 45 egna testfall.
 */
const TESTPROFILER: Record<ProfilNyckel, (kommunSlug: string) => Foreningsprofil> = {
  // P1 — Komplett: alla trattsvar ifyllda, registrerad förening.
  p1: (kommunSlug) => ({ kommunSlug, verksamhet: ['idrott'], storlek: 'm', alder: 'etablerad', sokt: 'ja', uppdaterad: '' }),
  // P2 — Luckor: verksamhet + kommun ifyllda, storlek och verksamhetstid saknas.
  p2: (kommunSlug) => ({ kommunSlug, verksamhet: ['idrott'], storlek: null, alder: null, sokt: 'ja', uppdaterad: '' }),
  // P3 — Oregistrerad: testar registreringsgrenen (spärr 4).
  p3: (kommunSlug) => ({ kommunSlug, verksamhet: ['idrott'], storlek: 'm', alder: 'etablerad', sokt: 'nej', uppdaterad: '' }),
};

interface KravFacit {
  forvantatStatus: 'ifyllt' | 'lucka';
}

interface ProfilFacit {
  forvantadTyp: 'bidragsutkast' | 'registrering_forst';
  kravFacit?: KravFacit[];
  anteckningar?: string;
}

interface GoldenSetFacit {
  bidragId: string;
  kommunSlug: string;
  kalla_url?: string;
  // Extra kontroll utöver K1-K4 (inte i SPEC_GOLDEN_SET.md, men direkt
  // uttryckt i alla fem facit från Fable: "får ALDRIG hitta på ett
  // datum"/"får ALDRIG bli löpande"). Valfri — utelämnas failar inget.
  forvantadDeadlineTyp?: 'fast' | 'lopande';
  // Extra kontroll (omgång 2, "det farligaste är beloppen" — Fable
  // 2026-07-27): beloppssträngen ska återges ORDAGRANT, differentiering
  // och undantag intakt. genereraUtkast() kopierar bidrag.belopp rakt av
  // (ingen transformation existerar i koden idag), så detta är redan
  // strukturellt garanterat — men explicit test skyddar mot en framtida
  // ändring som börjar formatera/förenkla beloppet.
  forvantadBelopp?: string | null;
  profiler: Partial<Record<ProfilNyckel, ProfilFacit>>;
}

// K2/K3 — genereraUtkast() är deterministisk och rent mallbaserad (se
// utkastGenerator.ts:s filhuvud: "Ingen ny svensk prosa skrivs här").
// "ifyllt"-rader kan därför ALLTID bara vara en av dessa två kända
// mallar; något annat är ett tecken på att fri text smugit sig in.
const KANDA_INNEHALL_MALLAR = [/^Föreningen har sitt säte i .+\.$/, /^Föreningens verksamhet: .+\.$/];
const LUCKA_TEXT = '[Fyll i: uppgift som styrker att kravet är uppfyllt]';
// Samma fasta sträng som deadlineText() (utkastGenerator.ts) returnerar
// för typ 'lopande' — inget annat värde betyder någonsin "löpande".
const LOPANDE_TEXT = 'Söks löpande, inget fast datum.';

// K4 — skannar ENDAST generatorns egna strängar (ansvarsrad,
// kravRader[].innehall) — ALDRIG kravText, eftersom det är kommunens
// egen text och kan legitimt innehålla ord som "beviljas" i sin egen
// formulering (t.ex. "bidrag beviljas inte till interna sammankomster").
// Ett scan av kravText hade gett falska positiva.
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

let korda = 0;
let mojliga = 0;

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

  for (const nyckel of PROFIL_NYCKLAR) {
    mojliga++;
    const profilFacit = facit.profiler[nyckel];
    if (!profilFacit) continue; // facit under uppbyggnad — se täckningsraden nedan, inte ett FAIL.
    korda++;

    const profil = TESTPROFILER[nyckel](facit.kommunSlug);
    const resultat = genereraUtkast(profil, bidrag, kommun);
    const label = `${fil} [${nyckel}]`;

    test(`${label} — gren (bidragsutkast/registrering_forst)`, () => {
      assert.equal(resultat.typ, profilFacit.forvantadTyp);
    });

    if (resultat.typ !== 'bidragsutkast') continue;

    if (facit.forvantadDeadlineTyp) {
      test(`${label} — deadline (extra, ej K1-K4: ${facit.forvantadDeadlineTyp} förväntad)`, () => {
        if (facit.forvantadDeadlineTyp === 'lopande') {
          assert.equal(resultat.deadlineText, LOPANDE_TEXT, 'facit förväntar löpande men generatorn angav ett datum');
        } else {
          assert.notEqual(resultat.deadlineText, LOPANDE_TEXT, 'facit förväntar ett fast datum men generatorn sa "löpande"');
        }
      });
    }

    if (facit.forvantadBelopp !== undefined) {
      test(`${label} — belopp (extra, ej K1-K4: ordagrant, ingen förenkling)`, () => {
        assert.equal(resultat.belopp, facit.forvantadBelopp, 'beloppssträngen skiljer sig från facit — differentiering/undantag kan ha tappats');
      });
    }

    test(`${label} — K1 (täckning: varje krav bemött, ordagrant, rätt ordning)`, () => {
      assert.equal(resultat.kravRader.length, bidrag.krav.length, 'antal kravRader matchar inte bidragets krav[]');
      resultat.kravRader.forEach((r, i) => {
        assert.equal(r.kravText, bidrag.krav[i], `kravRader[${i}] är inte ett ordagrant citat av bidrag.krav[${i}]`);
      });
    });

    test(`${label} — K2 (ingen uppfinning: innehall är endera känd mall eller luckplatshållaren)`, () => {
      resultat.kravRader.forEach((r, i) => {
        if (r.status === 'lucka') {
          assert.equal(r.innehall, LUCKA_TEXT, `krav[${i}] är "lucka" men innehall är inte standardplatshållaren — misstänkt påhittad text`);
        } else {
          const matchar = KANDA_INNEHALL_MALLAR.some((m) => m.test(r.innehall));
          assert.ok(matchar, `krav[${i}] är "ifyllt" men innehall matchar ingen känd mall: "${r.innehall}"`);
        }
      });
    });

    if (profilFacit.kravFacit) {
      test(`${label} — K3 (ärliga luckor: status matchar facit exakt)`, () => {
        assert.equal(
          resultat.kravRader.length,
          profilFacit.kravFacit!.length,
          'drift: bidragets krav[] och facit.kravFacit har olika längd — facit måste uppdateras av en människa'
        );
        resultat.kravRader.forEach((r, i) => {
          assert.equal(
            r.status,
            profilFacit.kravFacit![i].forvantatStatus,
            `krav[${i}] "${r.kravText}": förväntade ${profilFacit.kravFacit![i].forvantatStatus}, fick ${r.status}`
          );
        });
      });
    }

    test(`${label} — K4 (inget bifallslöfte)`, () => {
      const genererat = [resultat.ansvarsrad, ...resultat.kravRader.map((r) => r.innehall)].join(' ');
      for (const monster of BANNADE_FRASER) {
        assert.ok(!monster.test(genererat), `genererad text matchar bannat mönster: ${monster}`);
      }
      assert.ok(resultat.ansvarsrad.length > 0, 'ansvarsrad saknas');
    });
  }
}

console.log(`\n${antal} tester klara, ${fel} FAIL`);
console.log(`Täckning: ${korda}/${mojliga} (bidrag × profil)-kombinationer testade (SPEC_GOLDEN_SET §4/§6 kräver 45/45 för en godkänd grind).`);
if (fel > 0) process.exit(1);
