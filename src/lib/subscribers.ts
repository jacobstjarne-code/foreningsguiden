/**
 * subscribers.ts — Lagring för deadlinebevakning (§6 UPPDRAG_POC.md).
 * Upstash Redis (Vercel Marketplace, samma env-konvention som gamla Vercel KV:
 * KV_REST_API_URL/KV_REST_API_TOKEN). En hash per e-post + ett set som index
 * för listning/export och GDPR-avregistrering.
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

export interface Subscriber {
  email: string;
  kommuner: string[];
  registrerad: string; // ISO-datum
}

export async function addSubscriber(email: string, kommuner: string[]): Promise<void> {
  const record: Subscriber = { email: email.toLowerCase(), kommuner, registrerad: new Date().toISOString() };
  await redis.set(recordKey(record.email), record);
  await redis.sadd(INDEX_KEY, record.email);
}

export async function removeSubscriber(email: string): Promise<void> {
  await redis.del(recordKey(email));
  await redis.srem(INDEX_KEY, email.toLowerCase());
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  return redis.get<Subscriber>(recordKey(email));
}
