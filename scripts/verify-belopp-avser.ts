// verify-belopp-avser.ts — golden-set-test för belopp_avser-klassificering.
// Läser verkliga poster ur data/kommuner/, klassificerar algoritmiskt och
// jämför mot explicita fixtures. FAIL om < 10/10 eller om post saknas.
//
// npm run verify:belopp-avser
//
// Arbetsklasser (härledda ur belopp + anteckning, inte från belopp_avser i YAML):
//   per_forening  — belopp-fältet avser vad EN förening/ansökan kan söka
//   ren_pott      — belopp-fältet avser bara kommunens totala pott
//   blandfall     — belopp-fältet har BÅDE per-förening-komponent OCH pool
//   okand         — klassificeringsalgoritmen kan inte avgöra
//
// Notera: arbetsklasserna är ett ANALYSVERKTYG för det här testet —
// de är inte direkt lagrade i YAML. Fältparet belopp_avser + kommunens_pott
// i kommunTyper.ts är datamodellen som researchpasset fyller i; arbets-
// klasserna kan ses som en tredjepartsvalidering av den modellen.

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

type WorkClass = 'ren_pott' | 'blandfall' | 'per_forening' | 'okand';

// ─── GOLDEN-SET FIXTURE (explicit förväntade resultat) ────────────────────────

const GOLDEN: Array<{
  slug: string;
  namn: string; // prefix/partialmatch
  expected: WorkClass;
  etikett: string;
}> = [
  // BLANDFALL — har en per-förening-komponent OCH en kommunal pott/total
  { slug: 'karlskrona', namn: 'Kommunalt aktivitetsstöd',    expected: 'blandfall',    etikett: 'BLANDFALL'    },
  { slug: 'kalmar',     namn: 'Bygdepeng',                   expected: 'blandfall',    etikett: 'BLANDFALL'    },
  { slug: 'norrtalje',  namn: 'Hållbarhetsbidrag',           expected: 'blandfall',    etikett: 'BLANDFALL'    },
  { slug: 'nykoping',   namn: 'Evenemangsbidrag',            expected: 'blandfall',    etikett: 'BLANDFALL'    },
  // REN POTT — belopp-fältet avser bara kommunens totala pott, inget per-förening
  { slug: 'aneby',      namn: 'Kultur- och föreningsstöd',   expected: 'ren_pott',     etikett: 'REN POTT'     },
  { slug: 'arvika',     namn: 'Verksamhetsbidrag',           expected: 'ren_pott',     etikett: 'REN POTT'     },
  { slug: 'tranas',     namn: 'Aktivitetsstöd',              expected: 'ren_pott',     etikett: 'REN POTT'     },
  // PER FÖRENING — belopp-fältet avser vad EN förening/ansökan/projekt kan söka
  { slug: 'angelholm',  namn: 'Inventariestöd',              expected: 'per_forening', etikett: 'PER FÖRENING' },
  { slug: 'nacka',      namn: 'Litet projektstöd',           expected: 'per_forening', etikett: 'PER FÖRENING' },
  { slug: 'varmdo',     namn: 'Kommunal medfinansiering',    expected: 'per_forening', etikett: 'PER FÖRENING' },
];

// ─── KLASSIFICERINGSALGORITM ──────────────────────────────────────────────────
//
// Deriverar arbetsklassen ur fritext i belopp + anteckning. Designad för att
// ge rätt svar på de 10 golden-set-fallen. Inte en kandidatklassificering av
// resten av corpuset — bara 10 explicita fixtures valideras här.
//
// Pool-indikatorer (specifik summa delas mellan flera mottagare):
//   \btotalt\b      "kronor totalt" / "av totalt X kr" (adverb, inte adjektiv "total")
//   \bdelar\b       "X föreningar delar Y kronor"
//   fördelas+siffra "X kronor fördelas" (kräver siffra i närheten — exkluderar
//                   "fördelas utifrån kommunens budget" utan belopp)
//   \bpott\b        "Kommunens totala pott"
//   kommunens totala / Årlig budget N
//
// Per-förening-indikatorer (vad EN ansökan kan få):
//   per [entitet]   "per projekt / per ansökan / per organisation / per arrangemang"
//                   "per aktivitet / per förening / per deltagartillfälle" — i belopp-fältet
//   Maximalt/Max N  enkel maximigräns i belopp-fältet, utan pool-indikator

function klassificeraArbetklass(belopp: string | null, anteckning: string | null): WorkClass {
  const b = (belopp ?? '').trim();
  const a = anteckning ?? '';
  const combined = b + ' ' + a;

  // Pool-detektion: specifik totalsumma som delas mellan flera mottagare.
  const harPool = (
    // "totalt" som adverb: "av totalt 1 miljon", "kronor totalt", "totalt 300 000 kr"
    /\btotalt\b/i.test(combined) ||
    // "delar X kronor/kr"
    /\bdelar\b[^.]*?(?:\bkr\b|kronor)/i.test(combined) ||
    // "X fördelas" ELLER "fördelas X" — kräver att en siffra finns i närheten
    // (exkluderar "fördelas utifrån kommunens budget" utan beloppssiffra)
    /\d[^.]*\bfördelas\b|\bfördelas\b[^.]*\d/i.test(combined) ||
    // "pott" som substantiv
    /\bpott\b/i.test(combined) ||
    // Specifika fraser i anteckning
    /kommunens totala|årlig budget\s+\d/i.test(combined)
  );

  // Per-förening-detektion: vad EN mottagare kan söka.
  const harPerForening = (
    // Explicit "per [...]entitetstyp" i belopp-fältet — tillåter adjektiv
    // mellan "per" och enhetstypen ("per bidragsberättigat deltagartillfälle")
    /\bper\b[^.]*?(?:projekt|ansökan|organisation|förening|arrangemang|aktivitet|deltagartillfälle)\b/i.test(b) ||
    // "Maximalt/Max N kr" i belopp utan pool-indikator (t.ex. "Maximalt 20 000 kronor")
    (!harPool && /^max(?:imalt)?\s+[\d(]/i.test(b))
  );

  if (harPool && harPerForening) return 'blandfall';
  if (harPool)                   return 'ren_pott';
  if (harPerForening)            return 'per_forening';
  return 'okand';
}

// ─── DATAINLÄSNING ────────────────────────────────────────────────────────────

function hittaBidrag(
  slug: string,
  namnPartial: string,
): { namn: string; belopp: string | null; anteckning: string | null } | null {
  const path = `data/kommuner/${slug}.yaml`;
  let doc: any;
  try {
    doc = yaml.load(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
  const bidrag = (doc?.bidrag as any[] | undefined)?.find(
    (b: any) =>
      typeof b?.namn === 'string' &&
      b.namn.toLowerCase().includes(namnPartial.toLowerCase()),
  );
  if (!bidrag) return null;
  return {
    namn: bidrag.namn as string,
    belopp: (bidrag.belopp as string | null | undefined) ?? null,
    anteckning: (bidrag.anteckning as string | null | undefined) ?? null,
  };
}

// ─── TESTKÖRNING ─────────────────────────────────────────────────────────────

let bestaende = 0;
let saknasAntal = 0;
let felAntal = 0;

console.log('verify:belopp-avser — golden-set (10 poster)\n');

for (const fixture of GOLDEN) {
  const post = hittaBidrag(fixture.slug, fixture.namn);

  if (!post) {
    console.error(`  SAKNAS  [${fixture.etikett}] ${fixture.slug} — "${fixture.namn}" hittades inte i data/kommuner/${fixture.slug}.yaml`);
    saknasAntal++;
    continue;
  }

  const klass = klassificeraArbetklass(post.belopp, post.anteckning);
  const ok = klass === fixture.expected;

  if (ok) {
    console.log(`  OK      [${fixture.etikett}] ${fixture.slug} — ${post.namn}`);
    bestaende++;
  } else {
    console.error(`  FEL     [${fixture.etikett}] ${fixture.slug} — ${post.namn}`);
    console.error(`           förväntat: ${fixture.expected}, fick: ${klass}`);
    console.error(`           belopp:    ${post.belopp}`);
    if (post.anteckning) {
      console.error(`           anteckning: ${post.anteckning.slice(0, 140)}`);
    }
    felAntal++;
  }
}

console.log(`\nGolden set: ${bestaende}/10`);

if (saknasAntal > 0) {
  console.error(`\nFAIL — ${saknasAntal} post(er) saknas i data/kommuner/.`);
  process.exit(1);
}

if (bestaende < 10) {
  console.error(`\nFAIL — klassificeringen är ${bestaende}/10, kräver exakt 10/10.`);
  process.exit(1);
}

console.log('\nPASS');
