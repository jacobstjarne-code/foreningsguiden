/**
 * omverifiering.ts — SPEC: Omverifiering (2026-07-27). Redis-lagring +
 * HTTP-hämtning, byggd ovanpå den rena logiken i omverifieringLogik.ts.
 * Samma @upstash/redis-klientmönster som kop.ts/abonnemang.ts/
 * kommunefterfragan.ts — egen Redis-instans, ingen delad singleton.
 *
 * Två separata Redis-strukturer:
 * - `omverif:kalla:<encodeURIComponent(url)>` — ett record per unik
 *   kalla_url (kommun ELLER bidrag), rådatan om senaste/baslinje-
 *   signaturer. encodeURIComponent för läsbarhet i Upstash-dashboarden,
 *   samma "råa värden i nyckeln"-konvention som kop.ts:s
 *   `kop:email:${email}`.
 * - `omverif:kalla:ko` — EN sorterad mängd (ZSET), medlem=kodad URL,
 *   score=senasteForsok-tidsstämpel. Ger "de mest eftersläpande N
 *   källorna" via ZRANGE utan att läsa och sortera alla poster i minnet
 *   varje cronkörning — nödvändigt redan vid dagens ~1000 unika URL:er,
 *   och helt nödvändigt vid full täckning (~2500).
 */

import { Redis } from '@upstash/redis';
// .ts-suffix på de riktiga (icke-typ-only) relativa importerna nedan —
// scripts/omverifiering-ko.ts kör som ett vanligt node-skript, utanför
// Vites resolver, och Node kräver en fullständig specifier. Astro/Vite
// (allowImportingTsExtensions i tsconfig) accepterar båda formerna,
// oförändrat beteende där.
import { loadKommuner, todayISO, earliestDeadlineISO, daysUntil } from './kommuner.ts';
import type { Bidrag, Kommun } from './kommuner';
import { hamtaKopAvProdukt } from './kop.ts';
import { getAllConfirmedSubscribers } from './subscribers.ts';
import {
  berakUtfall, hashaText, strippaDynamiskInnehall, sorteraPrioritet, OMVERIFIERING_VARNING_DAGAR,
  type KontrollUtfall, type HamtatResultat,
} from './omverifieringLogik.ts';

// `?? process.env` — scripts/omverifiering-ko.ts kör som ett vanligt
// node-skript (samma "extraktionssessionen har filsystemsåtkomst, inte
// en webbklient"-resonemang som motiverar CLI:t i första hand), utanför
// Vites import.meta.env-injektion. Ren utökning: i Astro/Vite-kontext är
// import.meta.env alltid satt, ?? triggas aldrig, oförändrat beteende.
const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const signaturKey = (url: string) => `omverif:kalla:${encodeURIComponent(url)}`;
const KO_KEY = 'omverif:kalla:ko';

// 5s, inte 8s: hamtaResultat kan göra UPP TILL TVÅ anrop (HEAD, sen GET
// om HEAD inte gav en användbar signatur) — ett livetest mot riktiga
// kommunsidor visade flera långsamma/otillgängliga källor, och 2×8s per
// sådan källa drog upp en 400-källors körning till 151s. 5s håller
// värsta-fallet nere utan att straffa de flesta källorna, som svarar på
// under en sekund.
const HAMTNING_TIMEOUT_MS = 5000;
// Botartighet — identifierar crawlern och en kontaktväg, samma princip
// som varje annat utgående mejl i den här kodbasen har en riktig
// avsändare att svara på.
const USER_AGENT = 'Föreningsguiden-Omverifiering/1.0 (+https://foreningsguiden.se; kontakt: jacob.stjarne@gmail.com)';

export interface KallaSignatur {
  url: string;
  baslinjeEtag: string | null;
  baslinjeLastModified: string | null;
  baslinjeHash: string | null;
  senasteEtag: string | null;
  senasteLastModified: string | null;
  senasteHash: string | null;
  senasteUtfall: KontrollUtfall;
  flaggadSedan: string | null; // ISO-datum
  senasteForsok: string; // ISO-tidsstämpel, varje försök
  senastLyckad: string | null; // ISO-tidsstämpel, bara vid resultat.ok — driver H27
  konsekutivaFel: number;
  senasteFel: string | null;
}

export interface BidragReferens {
  kommunSlug: string;
  kommun: string;
  bidragId: string;
  bidragNamn: string;
  bidrag: Bidrag;
}

async function fetchMedTimeout(url: string, method: 'HEAD' | 'GET'): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HAMTNING_TIMEOUT_MS);
  try {
    return await fetch(url, { method, redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': USER_AGENT } });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * HEAD först (billigare — ingen body att hämta om headers räcker); GET
 * bara om HEAD inte gav ett användbart svar ELLER varken ETag eller
 * Last-Modified fanns (då krävs bodyn för hash-fallbacken).
 */
async function hamtaResultat(url: string): Promise<HamtatResultat> {
  const headRes = await fetchMedTimeout(url, 'HEAD');
  if (headRes && headRes.ok) {
    const etag = headRes.headers.get('etag');
    const lastModified = headRes.headers.get('last-modified');
    if (etag || lastModified) {
      return { ok: true, etag, lastModified, hash: null };
    }
  }

  const getRes = await fetchMedTimeout(url, 'GET');
  if (!getRes || !getRes.ok) {
    return { ok: false, etag: null, lastModified: null, hash: null };
  }

  const etag = getRes.headers.get('etag');
  const lastModified = getRes.headers.get('last-modified');
  if (etag || lastModified) {
    return { ok: true, etag, lastModified, hash: null };
  }

  const html = await getRes.text();
  return { ok: true, etag: null, lastModified: null, hash: hashaText(strippaDynamiskInnehall(html)) };
}

export async function hamtaSignatur(url: string): Promise<KallaSignatur | null> {
  return (await redis.get<KallaSignatur>(signaturKey(url))) ?? null;
}

async function sparaSignatur(record: KallaSignatur): Promise<void> {
  await redis.set(signaturKey(record.url), record);
}

/**
 * Bygger URL→bidrag-uppslagningen RENT ur nuvarande YAML, ALDRIG
 * denormaliserad till Redis — kan alltså aldrig bli inkonsekvent mot
 * deployad data. 'avskaffat' uteslutet (ingen anledning att fortsätta
 * övervaka ett bidrag som är borta för gott — men delar en annan,
 * fortfarande aktiv/pausad post samma URL dyker den ändå upp via den).
 */
export function byggBidragIndex(kommuner: Kommun[]): Map<string, BidragReferens[]> {
  const index = new Map<string, BidragReferens[]>();
  for (const kommun of kommuner) {
    for (const bidrag of kommun.bidrag) {
      if (bidrag.status === 'avskaffat') continue;
      const lista = index.get(bidrag.kalla_url) ?? [];
      lista.push({ kommunSlug: kommun.kommun_slug, kommun: kommun.kommun, bidragId: bidrag.id, bidragNamn: bidrag.namn, bidrag });
      index.set(bidrag.kalla_url, lista);
    }
  }
  return index;
}

/** Störst senast_verifierad bland en lista bidrag, eller null om inget är satt — auto-clear-underlaget i berakUtfall. */
export function maxSenastVerifierad(bidragLista: BidragReferens[]): string | null {
  const datum = bidragLista.map((b) => b.bidrag.senast_verifierad).filter((d): d is string => d !== null);
  if (datum.length === 0) return null;
  return datum.reduce((max, d) => (d > max ? d : max));
}

/**
 * Diffar kön mot nuvarande YAML: lägger till nya käll-URL:er (kommun-
 * ELLER bidragsnivå) vid score 0 (aldrig kontrollerad → sorteras först),
 * rensar bort URL:er som inte längre förekommer (kommunen borttagen ur
 * datasetet, alla bidrag som delade den avskaffade, etc.) — signaturen
 * tas bort samtidigt, den är meningslös utan en levande koppling.
 */
export async function synkaKoMedYaml(): Promise<{ tillagda: number; borttagna: number }> {
  const kommuner = loadKommuner();
  const index = byggBidragIndex(kommuner);
  const alla = new Set<string>([...index.keys(), ...kommuner.map((k) => k.kalla_url)]);

  const befintliga = new Set<string>(await redis.zrange<string[]>(KO_KEY, 0, -1));

  let tillagda = 0;
  let borttagna = 0;

  for (const url of alla) {
    if (!befintliga.has(url)) {
      await redis.zadd(KO_KEY, { score: 0, member: url });
      tillagda++;
    }
  }
  for (const url of befintliga) {
    if (!alla.has(url)) {
      await redis.zrem(KO_KEY, url);
      await redis.del(signaturKey(url));
      borttagna++;
    }
  }

  return { tillagda, borttagna };
}

/** De `limit` mest eftersläpande källorna (äldst `senasteForsok`, aldrig kontrollerade allra först). */
export async function nastaSkift(limit: number): Promise<string[]> {
  return redis.zrange<string[]>(KO_KEY, 0, limit - 1);
}

/**
 * Kontrollerar EN källa: hämtar, jämför via berakUtfall (ren logik),
 * sparar det uppdaterade recordet, och bumpar kö-scoren till nu —
 * oavsett utfall, så en källa som just kontrollerats inte kontrolleras
 * igen förrän den åter är äldst i kön.
 */
export async function kontrolleraKalla(url: string, maxSenastVerifieradBlandBidrag: string | null): Promise<KallaSignatur> {
  const befintlig = await hamtaSignatur(url);
  const resultat = await hamtaResultat(url);
  const nu = new Date().toISOString();

  const utfall = berakUtfall({
    baslinjeEtag: befintlig?.baslinjeEtag ?? null,
    baslinjeLastModified: befintlig?.baslinjeLastModified ?? null,
    baslinjeHash: befintlig?.baslinjeHash ?? null,
    flaggadSedan: befintlig?.flaggadSedan ?? null,
    konsekutivaFel: befintlig?.konsekutivaFel ?? 0,
    resultat,
    maxSenastVerifieradBlandBidrag,
    today: todayISO(),
  });

  const record: KallaSignatur = {
    url,
    baslinjeEtag: utfall.baslinjeEtag,
    baslinjeLastModified: utfall.baslinjeLastModified,
    baslinjeHash: utfall.baslinjeHash,
    senasteEtag: resultat.etag,
    senasteLastModified: resultat.lastModified,
    senasteHash: resultat.hash,
    senasteUtfall: utfall.utfall,
    flaggadSedan: utfall.flaggadSedan,
    senasteForsok: nu,
    senastLyckad: resultat.ok ? nu : (befintlig?.senastLyckad ?? null),
    konsekutivaFel: utfall.konsekutivaFel,
    senasteFel: resultat.ok ? null : 'hämtning misslyckades (timeout, nätverksfel, eller icke-2xx-status)',
  };

  await sparaSignatur(record);
  await redis.zadd(KO_KEY, { score: Date.parse(nu), member: url });

  return record;
}

/** Adminvyn/CLI: alla kända signaturer. */
export async function hamtaAllaSignaturer(): Promise<KallaSignatur[]> {
  const urls = await redis.zrange<string[]>(KO_KEY, 0, -1);
  const poster = await Promise.all(urls.map((url) => hamtaSignatur(url)));
  return poster.filter((p): p is KallaSignatur => p !== null);
}

/** Källor som INTE är 'oforandrad' — det som faktiskt behöver ett forskningspass eller manuell översyn. */
export async function hamtaFlaggade(): Promise<KallaSignatur[]> {
  return (await hamtaAllaSignaturer()).filter((s) => s.senasteUtfall !== 'oforandrad');
}

/**
 * Manuell escape-hatch (adminknappen): forskningspasset avgjorde att
 * ändringen inte var verklig (hash-falsklarm) — ingen `senast_verifierad`
 * att auto-clear:a mot i det fallet, så en människa måste rensa flaggan.
 */
export async function avfardaFlagga(url: string): Promise<boolean> {
  const befintlig = await hamtaSignatur(url);
  if (!befintlig) return false;
  await sparaSignatur({
    ...befintlig,
    baslinjeEtag: befintlig.senasteEtag,
    baslinjeLastModified: befintlig.senasteLastModified,
    baslinjeHash: befintlig.senasteHash,
    senasteUtfall: 'oforandrad',
    flaggadSedan: null,
    konsekutivaFel: 0,
  });
  return true;
}

export interface FlaggadKallaMedKontext extends KallaSignatur {
  bidrag: BidragReferens[];
  minDagarTillDeadline: number | null;
  arKoptEllerBevakad: boolean;
}

/**
 * Kopplar varje flaggad källa mot dess bidrag/kommun-kontext — namn för
 * adminvyn, plus underlaget för prioritering (närmaste deadline bland
 * AKTIVA bidrag med fast datum; om något bidrags kommun är köpt
 * (kop.ts) eller bevakad (subscribers.ts, kommun-granulärt)).
 */
export async function hamtaFlaggadeMedKontext(): Promise<FlaggadKallaMedKontext[]> {
  const kommuner = loadKommuner();
  const index = byggBidragIndex(kommuner);
  const flaggade = await hamtaFlaggade();

  const [kopLista, subscribers] = await Promise.all([hamtaKopAvProdukt('registrering'), getAllConfirmedSubscribers()]);
  const koptaKommuner = new Set(kopLista.map((k) => k.kommunSlug));
  const bevakadeKommuner = new Set(subscribers.flatMap((s) => s.kommuner));

  const today = todayISO();

  return flaggade.map((signatur) => {
    const bidragLista = index.get(signatur.url) ?? [];
    const dagarTillAktivaDeadlines = bidragLista
      .filter((b) => b.bidrag.status === 'aktiv' && b.bidrag.deadlines.typ === 'fasta')
      .map((b) => earliestDeadlineISO(b.bidrag, today))
      .filter((d): d is string => d !== null)
      .map((d) => daysUntil(d, today));
    const minDagarTillDeadline = dagarTillAktivaDeadlines.length > 0 ? Math.min(...dagarTillAktivaDeadlines) : null;
    const arKoptEllerBevakad = bidragLista.some((b) => koptaKommuner.has(b.kommunSlug) || bevakadeKommuner.has(b.kommunSlug));

    return { ...signatur, bidrag: bidragLista, minDagarTillDeadline, arKoptEllerBevakad };
  });
}

/**
 * DEN prioriterade kön — en sanning, två läsytor (adminvyn och
 * scripts/omverifiering-ko.ts läser båda bara denna funktionen).
 * flaggadSedan kan vara null (en källa som ALDRIG setts ändrad, bara
 * varit otillgänglig sedan sin allra första kontroll) — sorteringen
 * behöver ett stabilt datum ändå, så senasteForsok används som proxy
 * BARA för sorteringsnyckeln, det riktiga (ev. null) värdet i svaret är
 * orört för visning.
 */
export async function hamtaPrioriteradKo(): Promise<FlaggadKallaMedKontext[]> {
  const kontext = await hamtaFlaggadeMedKontext();
  const sorteringsunderlag = kontext.map((k) => ({
    url: k.url,
    minDagarTillDeadline: k.minDagarTillDeadline,
    arKoptEllerBevakad: k.arKoptEllerBevakad,
    flaggadSedan: k.flaggadSedan ?? k.senasteForsok.slice(0, 10),
    original: k,
  }));
  return sorteraPrioritet(sorteringsunderlag).map((s) => s.original);
}

export interface OmverifieringStatus {
  status: 'unknown' | 'ok' | 'stale';
  dagarSedanLyckad: number | null;
  aldstaUrl: string | null;
}

/**
 * H27:s kommun-nivå-aggregat. Konservativt: den ÄLDSTA lyckade
 * kontrollen bland kommunens samtliga kalla_url:er (kommun- och
 * bidragsnivå, 'avskaffat' uteslutet) avgör — en enda underövervakad
 * källa räcker för att trippa varningen. 'unknown' (inte 'stale') om
 * INGEN av URL:erna har någon lyckad kontroll än (cold-start eller helt
 * nya bidrag som ännu inte hunnits synkas in i kön) — annars hade varje
 * ny bidragsrad genererat ett falskt "inte kontrollerad på 9999 dagar".
 */
export async function omverifieringStatusForKommun(kommun: Kommun): Promise<OmverifieringStatus> {
  const urls = new Set<string>([kommun.kalla_url]);
  for (const bidrag of kommun.bidrag) {
    if (bidrag.status === 'avskaffat') continue;
    urls.add(bidrag.kalla_url);
  }

  const poster = await Promise.all([...urls].map((url) => hamtaSignatur(url)));
  const kanda = poster.filter((p): p is KallaSignatur => p !== null && p.senastLyckad !== null);

  if (kanda.length === 0) {
    return { status: 'unknown', dagarSedanLyckad: null, aldstaUrl: null };
  }

  let aldst = kanda[0];
  for (const p of kanda) {
    if (p.senastLyckad! < aldst.senastLyckad!) aldst = p;
  }

  const dagar = Math.floor((Date.now() - new Date(aldst.senastLyckad!).getTime()) / (1000 * 60 * 60 * 24));
  return {
    status: dagar > OMVERIFIERING_VARNING_DAGAR ? 'stale' : 'ok',
    dagarSedanLyckad: dagar,
    aldstaUrl: aldst.url,
  };
}
