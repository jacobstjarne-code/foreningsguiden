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
// H29/Mina sidor: sekundärindex så köphistorik går att slå upp per e-post
// utan att scanna hela kop:index (som bara innehåller sessions-id:n).
const kopPerEmailKey = (email: string) => `kop:email:${email.toLowerCase()}`;

export type KopProdukt = 'registrering';

export interface KopEntry {
  email: string;
  kommunSlug: string;
  produkt: KopProdukt;
  beloppOre: number;
  stripeSessionId: string;
  betaldDatum: string; // ISO
  foreningsprofil?: Foreningsprofil;
  // H10+H15: Stripes hostade, varaktiga fakturalänk (invoice_creation
  // på checkout-sessionen, se checkout/registrering.ts) — sätts av
  // stripe-webhook.ts efter att fakturan hunnit skapas.
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
}

/** Sparar ett bekräftat köp. Idempotent per stripeSessionId — samma session skriver aldrig två index-poster. */
export async function sparaKop(entry: KopEntry): Promise<void> {
  await redis.set(kopKey(entry.stripeSessionId), entry);
  await redis.sadd(KOP_INDEX_KEY, entry.stripeSessionId);
  await redis.sadd(kopPerEmailKey(entry.email), entry.stripeSessionId);
}

/** Läser tillbaka ett köp — används för att göra webhooken idempotent (Stripe kan skicka samma event flera gånger). */
export async function hamtaKop(stripeSessionId: string): Promise<KopEntry | null> {
  return (await redis.get<KopEntry>(kopKey(stripeSessionId))) ?? null;
}

/** Mina sidor (H29): alla köp för en e-post, senaste först. */
export async function hamtaKopForEmail(email: string): Promise<KopEntry[]> {
  const sessionIds = await redis.smembers(kopPerEmailKey(email));
  const entries = await Promise.all(sessionIds.map((id) => hamtaKop(id)));
  return entries
    .filter((e): e is KopEntry => e !== null)
    .sort((a, b) => b.betaldDatum.localeCompare(a.betaldDatum));
}
