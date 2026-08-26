/**
 * larm.ts — AB1.3 (Jacobs order): registreringssidan av systemlarmet.
 * Skriver de räknare/heartbeats som cron/systemlarm.ts sedan läser och
 * mejlar om. Samma @upstash/redis-klientmönster som omverifiering.ts/
 * kop.ts — egen instans, ingen delad singleton (etablerad konvention i
 * den här kodbasen, se omverifiering.ts:s filhuvud).
 *
 * Fem villkor, fem registreringspunkter, en läsare:
 * 1. Webhook 5xx/fastnat i retry  → registreraWebhookFel() (stripe-webhook.ts)
 * 2. Cron ej körd/fel             → registreraCronKorning() (varje cron/*.ts)
 * 3. Mejlfel över tröskel         → registreraMejlFel() (mejl.ts, kastMejlFel)
 * 4. Källa olästbar efter försök  → redan täckt, läses direkt ur
 *    omverifiering.ts:s KallaSignatur.konsekutivaFel — ingen egen skrivpunkt
 *    behövs (se cron/systemlarm.ts).
 * 5. Växande granskningskö        → samma sak, läses ur omverifiering.ts:s
 *    hamtaFlaggade() + en sparad föregående-storlek här.
 *
 * Räknarna (1 och 3) är "sedan senaste kollen", inte "totalt någonsin" —
 * cron/systemlarm.ts nollställer dem varje körning (hamtaOchNollstall).
 * En förlorad räkning i racet mellan läsning och nollställning är en
 * ofarlig brist i ett övervakningsverktyg, inte i en betalning — samma
 * avvägning som resten av filen: best effort, kraschar aldrig den
 * anropande koden.
 */
import { Redis } from '@upstash/redis';

const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const WEBHOOK_FEL_KEY = 'larm:webhook:fel';
const WEBHOOK_EXEMPEL_KEY = 'larm:webhook:exempel';
const MEJL_FEL_KEY = 'larm:mejl:fel';
const MEJL_EXEMPEL_KEY = 'larm:mejl:exempel';
const cronKey = (namn: string) => `larm:cron:${namn}`;
export const GRANSKNING_FOREGAENDE_KEY = 'larm:granskning:foregaende';

const EXEMPEL_TAK = 5; // hur många exempelmeddelanden som sparas per kategori — mejlet ska vara läsbart, inte en dump

/** Best effort — ett larmregister som självt kastar ett fel får aldrig krascha anropskoden det instrumenterar. */
async function tyst(p: Promise<unknown>): Promise<void> {
  try {
    await p;
  } catch (e) {
    console.error('larm.ts: kunde inte skriva larmregister', (e as Error).message);
  }
}

export async function registreraWebhookFel(kontext: string): Promise<void> {
  await tyst(redis.incr(WEBHOOK_FEL_KEY));
  await tyst(Promise.all([redis.lpush(WEBHOOK_EXEMPEL_KEY, kontext), redis.ltrim(WEBHOOK_EXEMPEL_KEY, 0, EXEMPEL_TAK - 1)]));
}

export async function registreraMejlFel(kontext: string): Promise<void> {
  await tyst(redis.incr(MEJL_FEL_KEY));
  await tyst(Promise.all([redis.lpush(MEJL_EXEMPEL_KEY, kontext), redis.ltrim(MEJL_EXEMPEL_KEY, 0, EXEMPEL_TAK - 1)]));
}

export interface CronHeartbeat {
  senasteKorning: string; // ISO-tidsstämpel
  fel: string[]; // samma errors-array cronet redan byggde för sitt eget JSON-svar
}

/** Kallas sist i varje cron/*.ts, precis före dess egen `return new Response(...)`. */
export async function registreraCronKorning(namn: string, fel: string[]): Promise<void> {
  const post: CronHeartbeat = { senasteKorning: new Date().toISOString(), fel };
  await tyst(redis.set(cronKey(namn), post));
}

export async function hamtaCronHeartbeat(namn: string): Promise<CronHeartbeat | null> {
  return (await redis.get<CronHeartbeat>(cronKey(namn))) ?? null;
}

/** Läser räknaren och nollställer den i samma anrop — "sedan senaste kollen"-semantik. Inte atomiskt (se filhuvudet), godtagbart för ett övervakningsräkneverk. */
async function hamtaOchNollstall(raknarKey: string, exempelKey: string): Promise<{ antal: number; exempel: string[] }> {
  const [antal, exempel] = await Promise.all([redis.get<number>(raknarKey), redis.lrange<string>(exempelKey, 0, -1)]);
  await tyst(Promise.all([redis.del(raknarKey), redis.del(exempelKey)]));
  return { antal: antal ?? 0, exempel };
}

export function hamtaOchNollstallWebhookFel(): Promise<{ antal: number; exempel: string[] }> {
  return hamtaOchNollstall(WEBHOOK_FEL_KEY, WEBHOOK_EXEMPEL_KEY);
}

export function hamtaOchNollstallMejlFel(): Promise<{ antal: number; exempel: string[] }> {
  return hamtaOchNollstall(MEJL_FEL_KEY, MEJL_EXEMPEL_KEY);
}

/** null = aldrig sparad tidigare (kallstart) — skiljs från 0 (en verkligt tom kö förra körningen) så det första larm/systemlarm-passet inte tolkar "0 → N" som tillväxt. */
export async function hamtaGranskningForegaende(): Promise<number | null> {
  return (await redis.get<number>(GRANSKNING_FOREGAENDE_KEY)) ?? null;
}

export async function sparaGranskningStorlek(storlek: number): Promise<void> {
  await tyst(redis.set(GRANSKNING_FOREGAENDE_KEY, storlek));
}

/**
 * De sju kända dagliga cronen (vercel.json) — en sanning, läst av
 * cron/systemlarm.ts för att veta vilka heartbeats som ska kontrolleras.
 * systemlarm själv listas INTE här (den kontrollerar inte sig själv).
 */
export const KANDA_CRON_NAMN = [
  'paminnelser',
  'andringsbevakning',
  'abonnemangsbevakning',
  'utfallsfraga',
  'omverifiering',
  'inlamningspaminnelse',
  'giltighetsvarning',
] as const;

// 30h, inte 24h: crons kör en gång/dygn på en fast UTC-timme (07-13) —
// 24h skulle larma på minsta schemaglapp (Vercels egen exekvering kan dra
// någon minut), 30h ger en dryg dags marginal utan att missa ett genuint
// uteblivet dygn.
export const CRON_UTEBLIVEN_TIMMAR = 30;

// AB1.8 (Jacobs order): systemlarmet larmar om de sju ANDRA cronen är
// tysta — men ett larm som själv slutar köra ser likadant ut som ett
// utan fel att rapportera, ingen skulle märka det. Tightare marginal
// (26h, inte CRON_UTEBLIVEN_TIMMAR=30h) eftersom det HÄR är sista
// försvarslinjen — ingenting annat bevakar systemlarmet.
export const SYSTEMLARM_UTEBLIVET_TIMMAR = 26;

// Fler än så här mejlfel "sedan senaste kollen" (en gång/dygn, se
// vercel.json) pekar på ett systemproblem (Resend nere, felkonfigurerad
// nyckel) snarare än enstaka studsar mot en enskild mottagares inkorg.
export const MEJL_FEL_TROSKEL = 3;
