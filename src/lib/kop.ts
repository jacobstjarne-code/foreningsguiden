/**
 * kop.ts — Lagring för betalda köp (SPEC: Betalintegration, 2026-07-26).
 * Samma @upstash/redis-klientmönster som vantelista.ts/subscribers.ts —
 * egen, enklare struktur eftersom ett köp har andra fält (belopp,
 * Stripe-sessionsid) än en väntelista-anmälan eller ett bevaknings-abonnemang.
 *
 * Testläge bygger denna precis som skarpt läge kommer fungera — Stripe
 * testläge beter sig identiskt, bara med fejkade kort. Ingen del av denna
 * fil vet om den körs mot test- eller skarpt Stripe-konto.
 */

import { Redis } from '@upstash/redis';
import type { Foreningsprofil } from './foreningsprofil';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const kopKey = (stripeSessionId: string) => `kop:${stripeSessionId}`;
const KOP_INDEX_KEY = 'kop:index';

export type KopProdukt = 'registrering';

export interface KopEntry {
  email: string;
  kommunSlug: string;
  produkt: KopProdukt;
  beloppOre: number;
  stripeSessionId: string;
  betaldDatum: string; // ISO
  foreningsprofil?: Foreningsprofil;
}

/** Sparar ett bekräftat köp. Idempotent per stripeSessionId — samma session skriver aldrig två index-poster. */
export async function sparaKop(entry: KopEntry): Promise<void> {
  await redis.set(kopKey(entry.stripeSessionId), entry);
  await redis.sadd(KOP_INDEX_KEY, entry.stripeSessionId);
}

/** Läser tillbaka ett köp — används för att göra webhooken idempotent (Stripe kan skicka samma event flera gånger). */
export async function hamtaKop(stripeSessionId: string): Promise<KopEntry | null> {
  return (await redis.get<KopEntry>(kopKey(stripeSessionId))) ?? null;
}
