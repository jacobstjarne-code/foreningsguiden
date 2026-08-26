/**
 * verify-troskeljamforelse.ts — AF1.4: fäller bygget om tredje-utfallet
 * (gar_inte_att_avgora) någonsin kringgås av ett tomt värde. Se
 * troskeljamforelse.ts:s filhuvud för varför det testet är obligatoriskt,
 * inte valfritt.
 *
 * Kör: node --experimental-strip-types scripts/verify-troskeljamforelse.ts
 */
import { jamforNumeriskTroskel, jamforIntygandeTroskel } from '../src/lib/troskeljamforelse.ts';

const fail: string[] = [];
function forvanta(namn: string, faktiskt: unknown, forvantat: unknown) {
  if (faktiskt !== forvantat) fail.push(`${namn}: förväntade ${JSON.stringify(forvantat)}, fick ${JSON.stringify(faktiskt)}`);
}

// Grundfall — riktning "minst"
forvanta('minst, uppfyllt (60 >= 45)', jamforNumeriskTroskel(60, 45, 'minst'), 'uppfyllt');
forvanta('minst, exakt gräns (45 >= 45)', jamforNumeriskTroskel(45, 45, 'minst'), 'uppfyllt');
forvanta('minst, ej uppfyllt (30 >= 45)', jamforNumeriskTroskel(30, 45, 'minst'), 'ej_uppfyllt');

// Grundfall — riktning "hogst"
forvanta('hogst, uppfyllt (20 <= 30)', jamforNumeriskTroskel(20, 30, 'hogst'), 'uppfyllt');
forvanta('hogst, exakt gräns (30 <= 30)', jamforNumeriskTroskel(30, 30, 'hogst'), 'uppfyllt');
forvanta('hogst, ej uppfyllt (40 <= 30)', jamforNumeriskTroskel(40, 30, 'hogst'), 'ej_uppfyllt');

// KRITISKT — Jacobs uttryckliga krav: aldrig ett resultat på ett tomt värde.
forvanta('numerisk, profilvärde saknas → gar_inte_att_avgora', jamforNumeriskTroskel(null, 45, 'minst'), 'gar_inte_att_avgora');
forvanta('numerisk, profilvärde undefined → gar_inte_att_avgora', jamforNumeriskTroskel(undefined, 45, 'minst'), 'gar_inte_att_avgora');
forvanta('numerisk, tröskelvärde saknas → gar_inte_att_avgora', jamforNumeriskTroskel(60, null, 'minst'), 'gar_inte_att_avgora');
forvanta('numerisk, båda saknas → gar_inte_att_avgora', jamforNumeriskTroskel(null, null, 'minst'), 'gar_inte_att_avgora');
forvanta('numerisk, NaN profilvärde → gar_inte_att_avgora', jamforNumeriskTroskel(NaN, 45, 'minst'), 'gar_inte_att_avgora');
forvanta('numerisk, noll är INTE samma som tomt (0 >= 45)', jamforNumeriskTroskel(0, 45, 'minst'), 'ej_uppfyllt');
forvanta('numerisk, noll som tröskel (5 >= 0)', jamforNumeriskTroskel(5, 0, 'minst'), 'uppfyllt');

// Intygande (ja/nej)
forvanta('intygande, uppfyllt (true === true)', jamforIntygandeTroskel(true, true), 'uppfyllt');
forvanta('intygande, ej uppfyllt (false !== true)', jamforIntygandeTroskel(false, true), 'ej_uppfyllt');
forvanta('intygande, profilsvar saknas → gar_inte_att_avgora', jamforIntygandeTroskel(null, true), 'gar_inte_att_avgora');
forvanta('intygande, profilsvar undefined → gar_inte_att_avgora', jamforIntygandeTroskel(undefined, true), 'gar_inte_att_avgora');
forvanta('intygande, kravvärde saknas → gar_inte_att_avgora', jamforIntygandeTroskel(true, null), 'gar_inte_att_avgora');
forvanta('intygande, false är INTE samma som tomt', jamforIntygandeTroskel(false, false), 'uppfyllt');

if (fail.length > 0) {
  console.error(`verify:troskeljamforelse FAIL — ${fail.length} fel`);
  for (const f of fail) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('verify:troskeljamforelse — alla testfall gröna, inklusive tomt-värde-grinden. PASS');
