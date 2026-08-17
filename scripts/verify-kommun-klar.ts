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
 */
import { loadKommuner } from '../src/lib/kommuner.ts';
import { strippaProcessSprak } from '../src/lib/anteckningFilter.ts';
import type { Kommun, Bidrag } from '../src/lib/kommunTyper.ts';

// KLAR.md §"Listan, i ordning" — samma tio, samma ordning.
const KLAR_KOMMUNER = [
  'ovanaker', 'tranas', 'ljusdal', 'surahammar', 'nassjo',
  'sandviken', 'katrineholm', 'motala', 'bollnas', 'rattvik',
];

interface BidragRegel {
  namn: string;
  ok: (b: Bidrag) => boolean;
}

// Rad 1-7, 9 i KLAR.md — per bidrag. Rad 8 (giltighet_regel) är
// kommun-nivå, hanteras separat i granska().
const BIDRAGSREGLER: BidragRegel[] = [
  { namn: 'krav_status: kontrollast', ok: (b) => b.krav_status === 'kontrollast' },
  { namn: 'minst tre krav', ok: (b) => b.krav.length >= 3 },
  { namn: 'krav_fullstandiga: true', ok: (b) => b.krav_fullstandiga === true },
  { namn: 'deadline_status: kontrollast eller ingen_regel', ok: (b) => b.deadline_status === 'kontrollast' || b.deadline_status === 'ingen_regel' },
  { namn: 'belopp_status: kontrollast eller ingen_regel', ok: (b) => b.belopp_status === 'kontrollast' || b.belopp_status === 'ingen_regel' },
  { namn: 'belopp_avser satt (≠ okand)', ok: (b) => b.belopp_avser !== 'okand' },
  { namn: 'foreningstyp ifylld', ok: (b) => b.foreningstyp !== null && b.foreningstyp.length > 0 },
  { namn: 'noll processpråk i anteckning', ok: (b) => strippaProcessSprak(b.anteckning).strukna.length === 0 },
];

function giltighetOk(kommun: Kommun): boolean {
  return kommun.giltighet_regel !== null && kommun.giltighet_regel_status === 'kontrollast';
}

interface RegelUtfall {
  namn: string;
  ok: boolean;
  fattasBidragIds: string[]; // tomt för kommun-nivå-regeln (giltighet)
}

interface KommunResultat {
  slug: string;
  kommun: string;
  antalAktivaBidrag: number;
  passerade: number; // av 9
  rader: RegelUtfall[]; // 9 rader, KLAR.md-ordning
}

function granska(kommun: Kommun): KommunResultat {
  const aktiva = kommun.bidrag.filter((b) => b.status === 'aktiv');
  const rader: RegelUtfall[] = [];

  // Rad 1-7: per-bidrag-reglerna i KLAR.md-ordning, före giltighet (rad 8).
  for (const regel of BIDRAGSREGLER.slice(0, 7)) {
    const fattas = aktiva.filter((b) => !regel.ok(b)).map((b) => b.id);
    rader.push({ namn: regel.namn, ok: fattas.length === 0 && aktiva.length > 0, fattasBidragIds: fattas });
  }

  // Rad 8: giltighet_regel, kommun-nivå.
  const giltighetPass = giltighetOk(kommun);
  rader.push({ namn: 'giltighet_regel med giltighet_regel_status kontrollast (kommunnivå)', ok: giltighetPass, fattasBidragIds: [] });

  // Rad 9: processspråk (sist i BIDRAGSREGLER).
  const sistaRegel = BIDRAGSREGLER[7];
  const fattasProcessSprak = aktiva.filter((b) => !sistaRegel.ok(b)).map((b) => b.id);
  rader.push({ namn: sistaRegel.namn, ok: fattasProcessSprak.length === 0 && aktiva.length > 0, fattasBidragIds: fattasProcessSprak });

  const passerade = rader.filter((r) => r.ok).length;
  return { slug: kommun.kommun_slug, kommun: kommun.kommun, antalAktivaBidrag: aktiva.length, passerade, rader };
}

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
