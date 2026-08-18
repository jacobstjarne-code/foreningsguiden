/**
 * verify-kommun-klar.ts — O2 (Jacob 2026-08-17, incoming/KLAR.md). Mäter
 * de NIO datareglerna (KLAR.md §"Data (skript)") mekaniskt, per kommun.
 * De tre webbläsarraderna (KLAR.md rad 10-12 — köpblock öppet, ingen
 * overflow/för små träffytor, hela vägen gången med ett riktigt
 * bekräftelsemejl) mäts INTE här, per KLAR.md:s egen uppdelning
 * ("Nio kan mätas med ett skript, tre kräver en webbläsare").
 *
 * "Varje bidrag har X" (KLAR.md) — en regel räknas som klar för HELA
 * kommunen bara om ALLA dess aktiva bidrag (status: 'aktiv', samma H26-
 * filter som resten av kodbasen) klarar den. Ett enda bidrag som fattas
 * fäller regeln för hela kommunen.
 *
 * Körsätt:
 *   node --experimental-strip-types scripts/verify-kommun-klar.ts
 *     → alla tio kommunerna i KLAR.md "Listan", en rad var: "ovanaker 2/9"
 *   node --experimental-strip-types scripts/verify-kommun-klar.ts ovanaker
 *     → rad för rad för just den kommunen, vilka bidrag som fattas per regel
 *   node --experimental-strip-types scripts/verify-kommun-klar.ts --ci
 *     → samma utskrift som utan argument, avsedd att köras i grinden
 *       (pre-commit/CI) — rapporterar, men process.exit(0) alltid.
 *       Detta är ett mätinstrument, inte en spärr; KLAR.md §"Vad som
 *       inte får hända" säger att framsteg mäts mot talet, inte att
 *       bygget ska fällas på det innan en kommun är klar.
 *   node --experimental-strip-types scripts/verify-kommun-klar.ts --alla
 *     → hela korpusen (alla kommuner i data/kommuner, inte bara
 *       Listan): antal 9/9, antal som klarar KLAR 1-3, antal bidrag
 *       som passerar arBidragSaljbart. Ingen handhållen lista — S2
 *       (Jacob 2026-08-18).
 *
 * Q1 (2026-08-17): kärnlogiken (de nio reglerna) flyttad till
 * src/lib/kommunKlar.ts — sajtens sidor (kommunsidans "alla {N}"-copy)
 * läser samma granskaKommunKlar() härifrån, inte en egen kopia.
 *
 * S2 (Jacob 2026-08-18): --alla — hela korpusen (290 kommuner), tre
 * aggregerade tal, ingen handhållen lista. "Guldkommun" (R2:s rapport)
 * hade ingen kodkälla — chattens egen bokföring, inte kodens. Detta
 * läge ÄR den koden: klarar 9/9 (samma granska()-resultat som ovan),
 * klarar KLAR 1-3 (rader[0..2] — samma tre rader som arBidragSaljbart
 * mäter per bidrag, läst här på kommun-nivå av samma granska()-anrop,
 * ingen dubblerad logik), och antal bidrag som passerar
 * arBidragSaljbart över hela basen (samma spärr som R2 kopplade in på
 * köpblocket).
 */
import { loadKommuner } from '../src/lib/kommuner.ts';
import { granskaKommunKlar as granska, arBidragSaljbart } from '../src/lib/kommunKlar.ts';

// KLAR.md §"Listan, i ordning" — samma tio, samma ordning.
const KLAR_KOMMUNER = [
  'ovanaker', 'tranas', 'ljusdal', 'surahammar', 'nassjo',
  'sandviken', 'katrineholm', 'motala', 'bollnas', 'rattvik',
];

const alla = loadKommuner();
const args = process.argv.slice(2);
const ciLage = args.includes('--ci');
const allaLage = args.includes('--alla');
const kommunSlugArg = args.find((a) => !a.startsWith('--'));

if (allaLage) {
  let klar9av9 = 0;
  let klarKlar1till3 = 0;
  let saljbaraBidrag = 0;

  for (const kommun of alla) {
    const r = granska(kommun);
    if (r.passerade === 9) klar9av9++;
    if (r.rader[0]?.ok && r.rader[1]?.ok && r.rader[2]?.ok) klarKlar1till3++;
    for (const bidrag of kommun.bidrag) {
      if (bidrag.status === 'aktiv' && arBidragSaljbart(bidrag)) saljbaraBidrag++;
    }
  }

  console.log(`Kommuner totalt: ${alla.length}`);
  console.log(`Klarar 9/9: ${klar9av9}`);
  console.log(`Klarar KLAR 1-3 (alla aktiva bidrag): ${klarKlar1till3}`);
  console.log(`Bidrag som passerar arBidragSaljbart (hela basen): ${saljbaraBidrag}`);
} else if (kommunSlugArg) {
  const kommun = alla.find((k) => k.kommun_slug === kommunSlugArg);
  if (!kommun) {
    console.error(`Okänd kommun: ${kommunSlugArg}`);
    process.exit(1);
  }
  const r = granska(kommun);
  console.log(`${r.kommun} (${r.slug}) — ${r.passerade}/9 — ${r.antalAktivaBidrag} aktiva bidrag`);
  console.log('');
  r.rader.forEach((rad, i) => {
    if (rad.ok) {
      console.log(`${i + 1}. ✓ ${rad.namn}`);
    } else {
      const forsta = rad.fattasBidragIds.slice(0, 6).join(', ');
      const rest = rad.fattasBidragIds.length > 6 ? ` … (+${rad.fattasBidragIds.length - 6} till)` : '';
      const fattasText = rad.fattasBidragIds.length > 0 ? ` — fattas: ${forsta}${rest}` : '';
      console.log(`${i + 1}. ✗ ${rad.namn}${fattasText}`);
    }
  });
} else {
  for (const slug of KLAR_KOMMUNER) {
    const kommun = alla.find((k) => k.kommun_slug === slug);
    if (!kommun) {
      console.log(`${slug} — SAKNAS I DATAKÄLLAN`);
      continue;
    }
    const r = granska(kommun);
    console.log(`${r.slug} ${r.passerade}/9`);
  }
  if (ciLage) {
    console.log('(--ci: rapport, fäller aldrig grinden)');
  }
}

// Mätinstrument, inte en spärr — fäller aldrig, se filhuvudet.
process.exit(0);
