/**
 * kommunKlar.ts — O2/Q1 (Jacob 2026-08-17, incoming/KLAR.md). De NIO
 * datareglerna (KLAR.md §"Data (skript)"), utbrutna till en delad modul
 * så att BÅDE scripts/verify-kommun-klar.ts (CLI/grinden) OCH sajtens
 * egna sidor (kommunsidans "alla {N}"-copy, Q1) läser samma sanning —
 * "Villkoret läses ur samma skript som redan finns, inte ur en lista
 * någon underhåller" (Jacob, Q1).
 *
 * Ren funktion, inget I/O — tar ett redan inläst Kommun-objekt. Säker
 * att importera var som helst (byggtid eller klient), ingen fs-koppling.
 */
import { strippaProcessSprak } from './anteckningFilter.ts';
import type { Kommun, Bidrag } from './kommunTyper.ts';

interface BidragRegel {
  namn: string;
  ok: (b: Bidrag) => boolean;
}

// Rad 1-7, 9 i KLAR.md — per bidrag. Rad 8 (giltighet_regel) är
// kommun-nivå, hanteras separat i granskaKommunKlar().
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

// O3 (Jacob 2026-08-17): samma "kontrollast eller ingen_regel"-mönster
// som rad 4/5 (deadline_status/belopp_status) — en läst källa som
// uttryckligen inte publicerar en giltighetsregel är lika klar som en
// kontrollast regel, inte en lucka.
function giltighetOk(kommun: Kommun): boolean {
  return kommun.giltighet_regel_status === 'kontrollast' || kommun.giltighet_regel_status === 'ingen_regel';
}

export interface RegelUtfall {
  namn: string;
  ok: boolean;
  fattasBidragIds: string[]; // tomt för kommun-nivå-regeln (giltighet)
}

export interface KommunKlarResultat {
  slug: string;
  kommun: string;
  antalAktivaBidrag: number;
  passerade: number; // av 9
  rader: RegelUtfall[]; // 9 rader, KLAR.md-ordning
}

export function granskaKommunKlar(kommun: Kommun): KommunKlarResultat {
  const aktiva = kommun.bidrag.filter((b) => b.status === 'aktiv');
  const rader: RegelUtfall[] = [];

  // Rad 1-7: per-bidrag-reglerna i KLAR.md-ordning, före giltighet (rad 8).
  for (const regel of BIDRAGSREGLER.slice(0, 7)) {
    const fattas = aktiva.filter((b) => !regel.ok(b)).map((b) => b.id);
    rader.push({ namn: regel.namn, ok: fattas.length === 0 && aktiva.length > 0, fattasBidragIds: fattas });
  }

  // Rad 8: giltighet_regel, kommun-nivå.
  const giltighetPass = giltighetOk(kommun);
  rader.push({ namn: 'giltighet_regel_status: kontrollast eller ingen_regel (kommunnivå)', ok: giltighetPass, fattasBidragIds: [] });

  // Rad 9: processspråk (sist i BIDRAGSREGLER).
  const sistaRegel = BIDRAGSREGLER[7];
  const fattasProcessSprak = aktiva.filter((b) => !sistaRegel.ok(b)).map((b) => b.id);
  rader.push({ namn: sistaRegel.namn, ok: fattasProcessSprak.length === 0 && aktiva.length > 0, fattasBidragIds: fattasProcessSprak });

  const passerade = rader.filter((r) => r.ok).length;
  return { slug: kommun.kommun_slug, kommun: kommun.kommun, antalAktivaBidrag: aktiva.length, passerade, rader };
}

/**
 * Q1 (Jacob 2026-08-17): "Ordet alla får bara stå när kommunen klarar
 * 9/9." Bekräftat i produktion — Örebro (18 publicerade stöd, 5 i
 * basen) och Stockholm (36/12) hade "alla {N}"-copy som påstod
 * fullständighet ingen av dem har. Denna funktion är den enda platsen
 * sajten frågar "får vi säga alla?" — samma nio regler som CLI-grinden.
 */
export function arKommunKlar9av9(kommun: Kommun): boolean {
  return granskaKommunKlar(kommun).passerade === 9;
}

/**
 * R2 (Jacob 2026-08-18): blockets villkor bytt — inte längre "råkar en
 * kravrad vara en bar sätesmening" (KommunProgression.astro:s gamla
 * arSaljbar/SALJBARHETSPROFIL-genväg via genereraUtkast, 93 bidrag,
 * 100% via samma sätesregel, okorrelerat med datakvalitet). Samma tre
 * rader som KLAR 1-3 (BIDRAGSREGLER[0..2] ovan) — "har kommunens data
 * för DETTA bidrag räcker till en användbar checklista", oberoende av
 * besökarens profil. Enda källan: köpteasern (KommunProgression.astro),
 * checkout-spärren (api/checkout/bidragsutkast.ts) och utkastsidans
 * kopram/bevaka-val (utkast/[bidragId]/index.astro) läser alla härifrån
 * — samma spärr på tre ställen, aldrig en egen kopia.
 */
export function arBidragSaljbart(bidrag: Bidrag): boolean {
  return BIDRAGSREGLER.slice(0, 3).every((regel) => regel.ok(bidrag));
}
