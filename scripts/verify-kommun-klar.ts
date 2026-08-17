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
 *
 * Q1 (2026-08-17): kärnlogiken (de nio reglerna) flyttad till
 * src/lib/kommunKlar.ts — sajtens sidor (kommunsidans "alla {N}"-copy)
 * läser samma granskaKommunKlar() härifrån, inte en egen kopia.
 */
import { loadKommuner } from '../src/lib/kommuner.ts';
import { granskaKommunKlar as granska } from '../src/lib/kommunKlar.ts';

// KLAR.md §"Listan, i ordning" — samma tio, samma ordning.
const KLAR_KOMMUNER = [
  'ovanaker', 'tranas', 'ljusdal', 'surahammar', 'nassjo',
  'sandviken', 'katrineholm', 'motala', 'bollnas', 'rattvik',
];

const alla = loadKommuner();
const args = process.argv.slice(2);
const ciLage = args.includes('--ci');
const kommunSlugArg = args.find((a) => !a.startsWith('--'));

if (kommunSlugArg) {
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
