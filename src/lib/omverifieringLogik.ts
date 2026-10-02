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

  // 3B (Jacobs beslut 2026-10-02). ETag och Last-Modified får BARA användas
  // som genväg till "oförändrad", aldrig som ändringssignal. Matchar en av
  // dem baslinjen är innehållet med säkerhet orört, och vi slipper jämföra
  // hashen. Matchar de inte säger det ingenting — mätpasset visade ETag:ar
  // som ändras utan att innehållet gör det.
  const genvagOforandrad =
    (input.baslinjeEtag !== null && input.resultat.etag === input.baslinjeEtag) ||
    (input.baslinjeLastModified !== null && input.resultat.lastModified === input.baslinjeLastModified);

  if (genvagOforandrad) {
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.baslinjeEtag,
      baslinjeLastModified: input.baslinjeLastModified,
      baslinjeHash: input.baslinjeHash,
      flaggadSedan: null,
      konsekutivaFel: 0,
    };
  }

  // Första kontrollen någonsin, eller ett ok:true-svar utan hash (borde
  // inte inträffa — hamtaResultat ger alltid en regionhash på 2xx).
  // Etablera baslinjen i stället för att flagga mot "ingenting".
  if (input.baslinjeHash === null || input.resultat.hash === null) {
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.resultat.etag,
      baslinjeLastModified: input.resultat.lastModified,
      baslinjeHash: input.resultat.hash,
      flaggadSedan: null,
      konsekutivaFel: 0,
    };
  }

  if (input.resultat.hash === input.baslinjeHash) {
    // Innehållsregionen är oförändrad. ETag/Last-Modified rullas fram så
    // att genvägen ovan kan användas nästa gång — det är säkert, eftersom
    // innehållet bevisligen inte rört sig.
    return {
      utfall: 'oforandrad',
      baslinjeEtag: input.resultat.etag,
      baslinjeLastModified: input.resultat.lastModified,
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

/**
 * INNEHÅLLSREGIONEN (3B, Jacobs beslut 2026-10-02). Ändringssignalen är
 * hashen på sidans innehållsregion, inte på hela sidan. Mätpasset
 * 2026-10-02 visade varför: 235 av 531 flaggor (44,3 %) hade en
 * helsidehash som skilde sig från BÅDE baslinjen och flaggningsögonblicket,
 * alltså en sida som ändras vid varje hämtning, medan innehållsregionen var
 * identisk mellan två hämtningar i 554 av 556 fall (99,6 %).
 *
 * Ordningen är main, article, SiteVisions innehållsregion. Hittas ingen
 * region faller vi tillbaka på hela sidan — en sämre signal är bättre än
 * ingen, och fallbacken syns i mätningen.
 */
function elementInnehall(html: string, tagg: string, franIndex = 0): string | null {
  const oppna = new RegExp(`<${tagg}\\b[^>]*>`, 'gi');
  oppna.lastIndex = franIndex;
  const forsta = oppna.exec(html);
  if (!forsta) return null;
  if (/\/>$/.test(forsta[0])) return '';
  const taggar = new RegExp(`<${tagg}\\b[^>]*>|</${tagg}\\s*>`, 'gi');
  taggar.lastIndex = forsta.index + forsta[0].length;
  let djup = 1;
  for (let m = taggar.exec(html); m; m = taggar.exec(html)) {
    djup += m[0].startsWith('</') ? -1 : 1;
    if (djup === 0) return html.slice(forsta.index + forsta[0].length, m.index);
  }
  return null;
}

export type Regionkalla = 'main' | 'article' | 'sitevision' | 'helsida' | 'kromskalad';

export function plockaInnehallsregion(html: string): { region: string; kalla: Regionkalla } {
  const main = elementInnehall(html, 'main');
  if (main && main.trim()) return { region: main, kalla: 'main' };
  const article = elementInnehall(html, 'article');
  if (article && article.trim()) return { region: article, kalla: 'article' };
  let bast: string | null = null;
  const oppna = /<div\b[^>]*(?:id="svid\d+_[^"]*"|class="[^"]*sv-layout[^"]*")[^>]*>/gi;
  for (let m = oppna.exec(html); m; m = oppna.exec(html)) {
    const block = elementInnehall(html, 'div', m.index);
    if (block && (bast === null || block.length > bast.length)) bast = block;
  }
  if (bast && bast.trim()) return { region: bast, kalla: 'sitevision' };
  return { region: html, kalla: 'helsida' };
}

/**
 * RESERVLÖSNINGEN (Jacob 2026-10-02). 717 av 1674 källor saknar main,
 * article och SiteVision-region, och föll då tillbaka på hela sidan — alltså
 * kvar i samma brus som 3B skulle bli kvitt. I stället skalas kromet bort:
 * sidhuvud, navigation, sidfot, aside, landmärkesroller, brödsmulor och
 * cookie-/samtyckesrutor. Det som blir kvar är inte en avgränsad
 * innehållsregion, men betydligt närmare en än hela dokumentet.
 *
 * Kakrutor och brödsmulor träffas på klass- eller id-namn. Listan är
 * medvetet bred — ett falskt borttaget element gör signalen trubbigare, ett
 * kvarlämnat gör den brusigare, och brus är det fel vi faktiskt har.
 */
const KROM_TAGGAR = ['header', 'nav', 'footer', 'aside'];
const KROM_ROLLER = ['navigation', 'banner', 'contentinfo'];
const KROM_NAMN = /(brodsmul|breadcrumb|cookie|consent|samtycke|kakor|gdpr)/i;

function taBortElement(html: string, tagg: string, villkor?: (oppningstagg: string) => boolean): string {
  let ut = '';
  let rest = html;
  for (;;) {
    const oppna = new RegExp(`<${tagg}\\b[^>]*>`, 'i').exec(rest);
    if (!oppna) return ut + rest;
    const fore = rest.slice(0, oppna.index);
    const efter = rest.slice(oppna.index + oppna[0].length);
    if (villkor && !villkor(oppna[0])) {
      // Behåll just det här elementets öppningstagg och fortsätt leta.
      ut += fore + oppna[0];
      rest = efter;
      continue;
    }
    // Hitta den balanserade stängtaggen och kasta hela blocket.
    const taggar = new RegExp(`<${tagg}\\b[^>]*>|</${tagg}\\s*>`, 'gi');
    let djup = 1;
    let slutIndex = efter.length;
    for (let m = taggar.exec(efter); m; m = taggar.exec(efter)) {
      djup += m[0].startsWith('</') ? -1 : 1;
      if (djup === 0) { slutIndex = taggar.lastIndex; break; }
    }
    ut += fore;
    rest = efter.slice(slutIndex);
  }
}

export function strippaKrom(html: string): string {
  let ut = html
    .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  for (const tagg of KROM_TAGGAR) ut = taBortElement(ut, tagg);
  for (const tagg of ['div', 'section', 'ol', 'ul']) {
    ut = taBortElement(ut, tagg, (oppning) =>
      KROM_ROLLER.some((r) => new RegExp(`role=["']${r}["']`, 'i').test(oppning)) || KROM_NAMN.test(oppning)
    );
  }
  return ut;
}

/**
 * Ändringssignalen: hash på innehållsregionen efter samma strippning som
 * förut. Saknas en region hashas kromskalad body i stället för hela sidan —
 * kalla blir 'kromskalad' så fördelningen syns i mätningen.
 */
export function hashaInnehallsregion(html: string): { hash: string; kalla: Regionkalla } {
  const { region, kalla } = plockaInnehallsregion(html);
  if (kalla !== 'helsida') return { hash: hashaText(strippaDynamiskInnehall(region)), kalla };
  return { hash: hashaText(strippaDynamiskInnehall(strippaKrom(html))), kalla: 'kromskalad' };
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
