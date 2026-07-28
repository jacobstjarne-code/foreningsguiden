/**
 * omverifieringLogik.ts — SPEC: Omverifiering (2026-07-27), ren logik utan
 * I/O-beroenden. Samma utbrytningsskäl som kommunTyper.ts ur kommuner.ts:
 * testbar från scripts/verify-omverifiering.ts utan Redis/nätverk, och
 * ingen risk att en `fs`/`crypto`-import någonsin behöver dras in i en
 * klientbundle (den här filen används bara server-/skriptsidan, men
 * hålls ändå ren av samma disciplin).
 *
 * omverifiering.ts (Redis + fetch) anropar in hit för alla beslut — den
 * här filen fattar dem, den andra utför dem.
 */

import { createHash } from 'node:crypto';

export const OMVERIFIERING_VARNING_DAGAR = 60; // H27 — dagar utan lyckad kontroll innan kommunsidan säger det själv.
export const OMVERIFIERING_MAX_KONSEKUTIVA_FEL = 3; // Tre misslyckade i rad flaggar för manuell översyn.

export type KontrollUtfall = 'oforandrad' | 'andrad' | 'otillganglig';

/** Rått resultat av ETT hämtningsförsök — omverifiering.ts:s jobb att producera, aldrig gissat. */
export interface HamtatResultat {
  ok: boolean; // false = nätverksfel, timeout, eller icke-2xx HTTP-status
  etag: string | null;
  lastModified: string | null;
  // Bara satt när varken etag eller lastModified fanns OCH hämtningen
  // lyckades — hashaText(strippaDynamiskInnehall(html)).
  hash: string | null;
}

export interface BerakUtfallInput {
  baslinjeEtag: string | null;
  baslinjeLastModified: string | null;
  baslinjeHash: string | null;
  flaggadSedan: string | null; // ISO-datum, null om inte flaggad
  konsekutivaFel: number;
  resultat: HamtatResultat;
  // Störst senast_verifierad bland de bidrag som delar denna kalla_url,
  // eller null om inget av dem har ett satt. Auto-clear-underlaget.
  maxSenastVerifieradBlandBidrag: string | null;
  today: string; // YYYY-MM-DD — så flaggadSedan kan sättas utan Date.now() i en ren funktion
}

export interface BerakUtfallOutput {
  utfall: KontrollUtfall;
  baslinjeEtag: string | null;
  baslinjeLastModified: string | null;
  baslinjeHash: string | null;
  flaggadSedan: string | null;
  konsekutivaFel: number;
}

type Mekanism = 'etag' | 'lastmodified' | 'hash';

function harledSignatur(
  etag: string | null,
  lastModified: string | null,
  hash: string | null
): { mekanism: Mekanism; varde: string } | null {
  if (etag !== null) return { mekanism: 'etag', varde: etag };
  if (lastModified !== null) return { mekanism: 'lastmodified', varde: lastModified };
  if (hash !== null) return { mekanism: 'hash', varde: hash };
  return null;
}

/**
 * Jämför senaste hämtningen mot baslinjen och avgör utfallet. Baslinjen
 * rullas ALDRIG fram tyst av en vanlig jämförelse — bara vid resolve
 * (auto-clear nedan, eller ett innehåll som återgått till exakt
 * baslinjevärdet). Annars hade en genuin ändring flaggats en gång och
 * sen tystats redan veckan efter, vilket gör hela mekanismen meningslös.
 *
 * Mekanismbyte (t.ex. källan slutar skicka ETag mellan två körningar)
 * räknas konservativt som 'andrad' — vi litar aldrig blint på att en ny
 * mekanism råkar representera samma innehåll.
 */
export function berakUtfall(input: BerakUtfallInput): BerakUtfallOutput {
  if (!input.resultat.ok) {
    return {
      utfall: 'otillganglig',
      baslinjeEtag: input.baslinjeEtag,
      baslinjeLastModified: input.baslinjeLastModified,
      baslinjeHash: input.baslinjeHash,
      flaggadSedan: input.flaggadSedan,
      konsekutivaFel: input.konsekutivaFel + 1,
    };
  }

  const baslinje = harledSignatur(input.baslinjeEtag, input.baslinjeLastModified, input.baslinjeHash);
  const senaste = harledSignatur(input.resultat.etag, input.resultat.lastModified, input.resultat.hash);

  // Första kontrollen någonsin (ingen baslinje), eller ett ok:true-svar
  // utan någon som helst signatur (borde inte inträffa — hash-fallbacken
  // ska alltid ge ett värde — men om det händer: etablera baslinjen i
  // stället för att flagga en ändring mot "ingenting").
  if (baslinje === null || senaste === null) {
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.resultat.etag,
      baslinjeLastModified: input.resultat.lastModified,
      baslinjeHash: input.resultat.hash,
      flaggadSedan: null,
      konsekutivaFel: 0,
    };
  }

  const harAndrats = baslinje.mekanism !== senaste.mekanism || baslinje.varde !== senaste.varde;

  if (!harAndrats) {
    // Matchar baslinjen — antingen aldrig avvikit, eller (om den var
    // flaggad) återgått till exakt det bekräftade värdet. Rensa flaggan.
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.baslinjeEtag,
      baslinjeLastModified: input.baslinjeLastModified,
      baslinjeHash: input.baslinjeHash,
      flaggadSedan: null,
      konsekutivaFel: 0,
    };
  }

  // Auto-clear: ett forskningspass har redan bekräftat (minst) ett av de
  // bidrag som delar den här URL:en EFTER att ändringen först
  // upptäcktes — rulla baslinjen framåt till det som redan är granskat.
  if (
    input.flaggadSedan !== null &&
    input.maxSenastVerifieradBlandBidrag !== null &&
    input.maxSenastVerifieradBlandBidrag >= input.flaggadSedan
  ) {
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.resultat.etag,
      baslinjeLastModified: input.resultat.lastModified,
      baslinjeHash: input.resultat.hash,
      flaggadSedan: null,
      konsekutivaFel: 0,
    };
  }

  return {
    utfall: 'andrad',
    baslinjeEtag: input.baslinjeEtag,
    baslinjeLastModified: input.baslinjeLastModified,
    baslinjeHash: input.baslinjeHash,
    flaggadSedan: input.flaggadSedan ?? input.today,
    konsekutivaFel: 0,
  };
}

// --- Innehållshashning (steg 1:s fallback när varken ETag eller Last-Modified finns) ---

const SCRIPT_STYLE_RE = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi;
const KOMMENTAR_RE = /<!--[\s\S]*?-->/g;
const TAGG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/g;

const MANADSNAMN_ALT = 'januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december';
const ISO_DATUM_RE = /\b\d{4}-\d{2}-\d{2}\b/g;
const SVENSKT_DATUM_RE = new RegExp(`\\b\\d{1,2}\\s(?:${MANADSNAMN_ALT})\\s\\d{4}\\b`, 'gi');
const SLASHDATUM_RE = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
// "Besökt 1 234 gånger", "N besök", "visningar: N" — kommunsidors vanliga besöksräknare.
const BESOKSRAKNARE_RE = /(besökt|besök(?:are)?|visningar)\s*:?\s*[\d\s]{1,10}(\sg[aå]nger)?/gi;
const COPYRIGHT_RE = /©\s*\d{4}|\d{4}\s*©/g;
const UPPDATERAD_RE = /senast\s+(uppdaterad|publicerad|granskad|ändrad)[^.\n]{0,40}/gi;

/**
 * Strippar skript/stilar/kommentarer/HTML-taggar och sedan "uppenbart
 * dynamiska" mönster (datumstämplar, besöksräknare, copyright-årtal) ur
 * en sidas rå HTML, INNAN hashning. Kommunsidor har ofta besöksräknare
 * och datumstämplar som ändras dagligen utan att bidragen gör det — en
 * naiv hash av hela sidan ger falsklarm varje vecka.
 *
 * Uttryckligen heuristisk: falska positiva (missad dynamisk komponent)
 * kostar bara en billig steg 2-läsning, inte ett datafel. Klientsidans
 * JS-renderade innehåll är ett känt, olöst blindpunkt (fetch() kör
 * aldrig JS) — se live-testet i verifieringsplanen, inte löst här.
 */
export function strippaDynamiskInnehall(html: string): string {
  const text = html
    .replace(SCRIPT_STYLE_RE, ' ')
    .replace(KOMMENTAR_RE, ' ')
    .replace(TAGG_RE, ' ')
    .replace(UPPDATERAD_RE, ' ')
    .replace(ISO_DATUM_RE, ' ')
    .replace(SVENSKT_DATUM_RE, ' ')
    .replace(SLASHDATUM_RE, ' ')
    .replace(BESOKSRAKNARE_RE, ' ')
    .replace(COPYRIGHT_RE, ' ');
  return text.replace(WHITESPACE_RE, ' ').trim();
}

/** SHA-256 hexdigest — inga nya beroenden, node:crypto är inbyggt. */
export function hashaText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// --- Prioritetskön (fyra tiers, se SPEC: Omverifiering §Prioritering av kön) ---

export interface FlaggadKallaPrioritetsInput {
  url: string;
  // Minsta earliestDeadlineISO-avstånd (dagar) bland AKTIVA bidrag som
  // delar denna URL — null om inget har en fast deadline att räkna på.
  minDagarTillDeadline: number | null;
  // Sant om något bidrag som delar URL:en hör till en kommun någon köpt
  // (kop.ts) eller bevakar (subscribers.ts, kommun-granulärt).
  arKoptEllerBevakad: boolean;
  flaggadSedan: string; // ISO-datum — alltid satt för en flaggad post
}

const DEADLINE_TIER_TROSKEL_DAGAR = 60;

/**
 * Tier 3 (Umami — flest besök) byggs INTE: ingen server-integration mot
 * Umami finns i kodbasen (bara en klient-spårningstagg, ingen API-nyckel).
 * Att hitta på autentisering eller fabricera besöksdata hade varit precis
 * den sortens gissning specen själv förbjuder för stegen 1-hashningen.
 * Allt som skulle landat i tier 3 faller rakt in i tier 4 i stället —
 * "roterande" täcker det ärligare än en påhittad prioritering.
 */
export function berakPrioritet(input: FlaggadKallaPrioritetsInput): [number, string] {
  if (input.minDagarTillDeadline !== null && input.minDagarTillDeadline <= DEADLINE_TIER_TROSKEL_DAGAR) {
    return [1, String(Math.max(0, input.minDagarTillDeadline)).padStart(4, '0')];
  }
  if (input.arKoptEllerBevakad) {
    return [2, input.flaggadSedan];
  }
  return [4, input.flaggadSedan];
}

/** Sorterar flaggade källor i prioritetsordning — samma funktion adminvyn och CLI-verktyget läser ur. */
export function sorteraPrioritet<T extends FlaggadKallaPrioritetsInput>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const [tierA, sekA] = berakPrioritet(a);
    const [tierB, sekB] = berakPrioritet(b);
    if (tierA !== tierB) return tierA - tierB;
    return sekA.localeCompare(sekB);
  });
}
