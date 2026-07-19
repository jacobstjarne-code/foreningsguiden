/**
 * subscribers.ts — Lagring för deadlinebevakning (§6 UPPDRAG_POC.md).
 * Upstash Redis (Vercel Marketplace, samma env-konvention som gamla Vercel KV:
 * KV_REST_API_URL/KV_REST_API_TOKEN). En hash per e-post + ett set som index
 * för listning/export och GDPR-avregistrering.
 *
 * Dubbel opt-in (SPRINT §Spår A, 2026-07-18): subscriber skapas som
 * confirmed:false + ett tidsbegränsat bekräftelsetoken. Bara confirmed:true
 * får påminnelser (getAllConfirmedSubscribers). Skickade påminnelser
 * spåras separat per (typ, bidrag, datum) — inte på subscriber-posten —
 * så att cronjobbet är idempotent utan read-modify-write-race.
 */

import { Redis } from '@upstash/redis';

// Redis.fromEnv() letar efter UPSTASH_REDIS_REST_URL/_TOKEN — Vercels
// Marketplace-integration (vercel install upstash/upstash-kv) provisionerar
// istället de gamla Vercel KV-namnen KV_REST_API_URL/KV_REST_API_TOKEN.
// import.meta.env (inte process.env) — Astro fyller bara den förra i dev-
// serverns Vite-kontext, se debug-env-verifieringen i statusrapporten.
const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const INDEX_KEY = 'prenumeranter:index';
const recordKey = (email: string) => `prenumerant:${email.toLowerCase()}`;
const tokenKey = (token: string) => `bekraftelsetoken:${token}`;
const sentKey = (typ: '14' | '3', bidragId: string, dateISO: string) => `paminnelseskickad:${typ}:${bidragId}:${dateISO}`;

const TOKEN_TTL_SEKUNDER = 60 * 60 * 24 * 7; // 7 dagar

export interface Subscriber {
  email: string;
  kommuner: string[];
  registrerad: string; // ISO-datum
  confirmed: boolean;
  // Giltighetskollen (SPRINT_COPY.ts §GILTIGHETSKOLL) — kommunSlug → senaste
  // årsmötesdatum, sparat när prenumeranten ber om en giltighetspåminnelse.
  // Bara de kommuner som faktiskt frågats om finns med som nycklar.
  giltighetArsmoten?: Record<string, string>;
}

/** Skapar en obekräftad prenumerant + ett bekräftelsetoken (giltigt 7 dagar). */
export async function addPendingSubscriber(email: string, kommuner: string[]): Promise<string> {
  const record: Subscriber = {
    email: email.toLowerCase(),
    kommuner,
    registrerad: new Date().toISOString(),
    confirmed: false,
  };
  await redis.set(recordKey(record.email), record);
  await redis.sadd(INDEX_KEY, record.email);

  const token = crypto.randomUUID();
  await redis.set(tokenKey(token), record.email, { ex: TOKEN_TTL_SEKUNDER });
  return token;
}

/** Bekräftar via token. Returnerar subscriber-posten, eller null om token är ogiltigt/utgånget. */
export async function confirmSubscriberByToken(token: string): Promise<Subscriber | null> {
  const email = await redis.get<string>(tokenKey(token));
  if (!email) return null;

  const record = await getSubscriber(email);
  if (!record) return null;

  record.confirmed = true;
  await redis.set(recordKey(email), record);
  await redis.del(tokenKey(token));
  return record;
}

/**
 * Giltighetsbevakning (SPRINT_COPY.ts §GILTIGHETSKOLL, "erbjudandet" efter
 * beskedet) — sparar årsmötesdatum för kommunen mot adressen. Om adressen
 * redan är en BEKRÄFTAD prenumerant läggs kommunen/datumet till direkt (ingen
 * ny bekräftelse behövs — adressen är redan betrodd); annars går den genom
 * samma dubbla opt-in som vanlig deadlinebevakning. Returnerar null som token
 * när ingen bekräftelse krävs, så anroparen vet om ett bekräftelsemejl ska
 * skickas eller inte.
 */
export async function addGiltighetBevakning(
  email: string,
  kommunSlug: string,
  arsmotesdatum: string
): Promise<{ token: string | null; alreadyConfirmed: boolean }> {
  const normalized = email.toLowerCase();
  const existing = await getSubscriber(normalized);

  const record: Subscriber = {
    email: normalized,
    kommuner: existing ? Array.from(new Set([...existing.kommuner, kommunSlug])) : [kommunSlug],
    registrerad: existing?.registrerad ?? new Date().toISOString(),
    confirmed: existing?.confirmed ?? false,
    giltighetArsmoten: { ...(existing?.giltighetArsmoten ?? {}), [kommunSlug]: arsmotesdatum },
  };
  await redis.set(recordKey(normalized), record);
  await redis.sadd(INDEX_KEY, normalized);

  if (record.confirmed) {
    return { token: null, alreadyConfirmed: true };
  }

  const token = crypto.randomUUID();
  await redis.set(tokenKey(token), normalized, { ex: TOKEN_TTL_SEKUNDER });
  return { token, alreadyConfirmed: false };
}

export async function removeSubscriber(email: string): Promise<void> {
  await redis.del(recordKey(email));
  await redis.srem(INDEX_KEY, email.toLowerCase());
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  return redis.get<Subscriber>(recordKey(email));
}

/** Alla BEKRÄFTADE prenumeranter — underlag för cronjobbets utskick. */
export async function getAllConfirmedSubscribers(): Promise<Subscriber[]> {
  const emails = await redis.smembers(INDEX_KEY);
  const records = await Promise.all(emails.map((e) => getSubscriber(e)));
  return records.filter((r): r is Subscriber => r !== null && r.confirmed);
}

/** Har den här (typ, bidrag, datum)-påminnelsen redan gått till adressen? */
export async function wasReminderSent(typ: '14' | '3', bidragId: string, dateISO: string, email: string): Promise<boolean> {
  return (await redis.sismember(sentKey(typ, bidragId, dateISO), email.toLowerCase())) === 1;
}

export async function markReminderSent(typ: '14' | '3', bidragId: string, dateISO: string, email: string): Promise<void> {
  await redis.sadd(sentKey(typ, bidragId, dateISO), email.toLowerCase());
}
