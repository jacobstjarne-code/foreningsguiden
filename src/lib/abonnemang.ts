/**
 * abonnemang.ts — Lagring för Abonnemanget (SPEC_ABONNEMANG.md,
 * 2026-07-27), det återkommande 495 kr/år-abonnemanget. Samma
 * @upstash/redis-klientmönster som kop.ts, men EGEN, parallell
 * datamodell — inte en utökning av KopEntry (kop.ts):
 *
 * - KopEntry nycklas på ett engångs stripeSessionId, saknar statusfält,
 *   och rörs medvetet ALDRIG efter skrivning (GDPR-resonemanget i
 *   kop.ts filhuvud — ett kvitto ska visa vad som var sant vid
 *   köptillfället). Ett abonnemang är motsatsen: det lever längre än
 *   sin ursprungssession, identifieras av ett stripeSubscriptionId, och
 *   MUTERAS löpande (status, giltigTill) när Stripe skickar
 *   customer.subscription.updated/deleted.
 * - Namnkrock undviks medvetet: `prenumerant:`/`prenumeranter:index`
 *   (subscribers.ts) är redan upptaget av den GRATIS deadline-
 *   bevakningen. Den här modulen använder ordet "abonnemang" rakt
 *   igenom — `abonnemang:<subscriptionId>`, inte `prenumeration:*`.
 *
 * Föreningsprofilen som cronet matchar mot bor INTE här — den ligger
 * redan på Subscriber.foreningsprofil (subscribers.ts) och mergas in
 * av samma addForeningsprofil()-anrop som registreringsflödet redan
 * använder (se stripe-webhook.ts). Ingen duplicerad datakälla.
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const abonnemangKey = (stripeSubscriptionId: string) => `abonnemang:${stripeSubscriptionId}`;
const ABONNEMANG_INDEX_KEY = 'abonnemang:index';
const abonnemangPerEmailKey = (email: string) => `abonnemang:email:${email.toLowerCase()}`;

export type AbonnemangStatus = 'active' | 'past_due' | 'canceled' | 'incomplete';

export interface AbonnemangEntry {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: AbonnemangStatus;
  giltigTill: string; // ISO-datum (YYYY-MM-DD), Stripes current_period_end
  skapad: string; // ISO
}

/** Sparar/uppdaterar en abonnemangspost. Idempotent per stripeSubscriptionId — samma prenumeration skriver aldrig två indexposter. */
export async function sparaAbonnemang(entry: AbonnemangEntry): Promise<void> {
  await redis.set(abonnemangKey(entry.stripeSubscriptionId), entry);
  await redis.sadd(ABONNEMANG_INDEX_KEY, entry.stripeSubscriptionId);
  await redis.sadd(abonnemangPerEmailKey(entry.email), entry.stripeSubscriptionId);
}

/** Läser tillbaka en abonnemangspost — används för att göra webhooken idempotent. */
export async function hamtaAbonnemang(stripeSubscriptionId: string): Promise<AbonnemangEntry | null> {
  return (await redis.get<AbonnemangEntry>(abonnemangKey(stripeSubscriptionId))) ?? null;
}

/**
 * Uppdaterar status/giltigTill på en BEFINTLIG post (customer.subscription.
 * updated/deleted). Läser-mergar-skriver — samma "läs befintlig FÖRST"-
 * princip som subscribers.ts, så vi aldrig skriver över email/
 * stripeCustomerId/skapad med tomma fält. No-op (utan fel) om posten
 * inte finns — kan hända om Stripe skickar ett updated-event före
 * webhooken hunnit skapa posten via checkout.session.completed, ett
 * ordningsläge som inte ska krascha webhooken.
 */
export async function uppdateraAbonnemangStatus(
  stripeSubscriptionId: string,
  status: AbonnemangStatus,
  giltigTill: string
): Promise<void> {
  const existing = await hamtaAbonnemang(stripeSubscriptionId);
  if (!existing) return;
  await redis.set(abonnemangKey(stripeSubscriptionId), { ...existing, status, giltigTill });
}

/** Mina sidor (H29-mönster): alla abonnemang för en e-post, senaste först. En förening förväntas ha högst ett, men modellen tillåter fler (historik vid uppsägning+nytt köp). */
export async function hamtaAbonnemangForEmail(email: string): Promise<AbonnemangEntry[]> {
  const subscriptionIds = await redis.smembers(abonnemangPerEmailKey(email));
  const entries = await Promise.all(subscriptionIds.map((id) => hamtaAbonnemang(id)));
  return entries
    .filter((e): e is AbonnemangEntry => e !== null)
    .sort((a, b) => b.skapad.localeCompare(a.skapad));
}

/** Adminvyn: ALLA abonnemang, senaste först. */
export async function hamtaAllaAbonnemang(): Promise<AbonnemangEntry[]> {
  const subscriptionIds = await redis.smembers(ABONNEMANG_INDEX_KEY);
  const entries = await Promise.all(subscriptionIds.map((id) => hamtaAbonnemang(id)));
  return entries
    .filter((e): e is AbonnemangEntry => e !== null)
    .sort((a, b) => b.skapad.localeCompare(a.skapad));
}
