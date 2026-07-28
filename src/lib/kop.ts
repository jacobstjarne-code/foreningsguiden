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
// H22 (ändringsbevakning): senaste snapshotten vi FAKTISKT mejlat om per
// köp — skild från KopEntry.forutsattningarSnapshot (som är låst till
// köptillfället och aldrig ändras). Gör cronjobbet idempotent utan att
// behöva hasha: samma nya tillstånd mejlas aldrig två gånger, men en
// FÖRNYAD ändring efter det mejlas igen.
const andringsnotisKey = (stripeSessionId: string) => `andringsnotis:${stripeSessionId}`;
// H19: har utfallsfrågan för DETTA köp+bidrag redan skickats? Egen
// nyckelrymd, inte subscribers.ts:s paminnelseskickad:*-mönster — den är
// e-postscopad (en bevakare), den här är köp-scopad (samma person kan i
// teorin köpa flera gånger, varje köp får sin egen utfallsfråga).
const utfallsfraganKey = (stripeSessionId: string, bidragId: string) => `utfallsfraga:${stripeSessionId}:${bidragId}`;

export type KopProdukt = 'registrering';

// H19 (SPEC: Kluster 1 — efter-köp-ytan, utfallsslingan): tre
// svarsalternativ, klartext-literaler rakt av som URL-path-segment
// (api/utfall/[session]/[bidrag]/[svar].ts) — inga koder att slå upp.
export type KopUtfallSvar = 'beviljat' | 'avslag' | 'vet_inte';

export interface KopUtfallEntry {
  bidragId: string;
  bidragNamn: string;
  svar: KopUtfallSvar;
  svaratDatum: string; // ISO
}

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
  // H22: JSON av RegistreringsUtkastRad[] (utkastGenerator.ts) vid
  // KÖPTILLFÄLLET — låst, ändras aldrig efteråt. Ändringsbevakningens
  // cronjobb jämför kommunens NUVARANDE checklista mot denna.
  forutsattningarSnapshot?: string;
  // H19: en KopEntry kan matcha FLERA bidrag (kommun-scopad registrering,
  // inte bidrag-scopad) — en post per bidrag som faktiskt svarat, inte
  // ett enda fält. "Senaste svaret vinner" per bidragId, ingen historik.
  utfall?: KopUtfallEntry[];
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

/** Adminvyn: ALLA köp, senaste först. */
export async function hamtaAllaKop(): Promise<KopEntry[]> {
  const sessionIds = await redis.smembers(KOP_INDEX_KEY);
  const entries = await Promise.all(sessionIds.map((id) => hamtaKop(id)));
  return entries
    .filter((e): e is KopEntry => e !== null)
    .sort((a, b) => b.betaldDatum.localeCompare(a.betaldDatum));
}

/**
 * H29-tillägg (Mina sidor: byt e-post) — flyttar INDEXET (vilka
 * sessions-id:n som hör till adressen) till den nya e-posten. Rör
 * ALDRIG de historiska KopEntry.email-fälten — ett kvitto/en faktura
 * ska visa vad som var sant vid köptillfället, samma resonemang som att
 * kop:-poster inte rörs av GDPR-raderingen (DATAINVENTERING_GDPR.md).
 */
export async function flyttaKopIndex(oldEmail: string, newEmail: string): Promise<void> {
  const sessionIds = await redis.smembers(kopPerEmailKey(oldEmail));
  if (sessionIds.length === 0) return;
  await redis.sadd(kopPerEmailKey(newEmail), ...sessionIds);
  await redis.del(kopPerEmailKey(oldEmail));
}

/** H22: alla köp av en given produkt (t.ex. bara 'registrering' — det enda säljbara idag). */
export async function hamtaKopAvProdukt(produkt: KopProdukt): Promise<KopEntry[]> {
  const alla = await hamtaAllaKop();
  return alla.filter((k) => k.produkt === produkt);
}

/**
 * H22: vilken snapshot vi senast FAKTISKT mejlade köparen om, eller null
 * om aldrig. Sparas inlindad i ett objekt ({ snapshot }), inte som en
 * bar sträng — @upstash/redis auto-parsar ett JSON-likt TOPPNIVÅVÄRDE
 * transparent vid läsning (skillnad mot ett fält NÅGONSTANS INNE i ett
 * objekt, som förblir en sträng). En bar sträng hade tystat gjort denna
 * funktion om till att returnera ett OBJEKT i stället för en sträng,
 * vilket bröt strängjämförelsen i cron/andringsbevakning.ts och gjorde
 * "idempotensen" verkningslös — fångat i ett verkligt end-to-end-test
 * (muterad snapshot → mejl → kört cronen igen → mejlade EN GÅNG TILL).
 */
export async function hamtaSenastNotifieradSnapshot(stripeSessionId: string): Promise<string | null> {
  const data = await redis.get<{ snapshot: string }>(andringsnotisKey(stripeSessionId));
  return data?.snapshot ?? null;
}

/** H22: markerar att köparen nu är mejlad om denna specifika (nya) snapshot. */
export async function markeraSnapshotNotifierad(stripeSessionId: string, snapshot: string): Promise<void> {
  await redis.set(andringsnotisKey(stripeSessionId), { snapshot });
}

/** H19: har utfallsfrågan för detta (köp, bidrag) redan skickats — cronets idempotensspärr. */
export async function harUtfallsfraganSkickats(stripeSessionId: string, bidragId: string): Promise<boolean> {
  return (await redis.get(utfallsfraganKey(stripeSessionId, bidragId))) !== null;
}

/** H19: markerar att utfallsfrågan för detta (köp, bidrag) nu är skickad. */
export async function markeraUtfallsfraganSkickad(stripeSessionId: string, bidragId: string): Promise<void> {
  await redis.set(utfallsfraganKey(stripeSessionId, bidragId), true);
}

/**
 * H19: sparar svaret från en av de tre mejllänkarna. Läs-mergea-skriv,
 * samma "läs befintlig FÖRST"-princip som subscribers.ts — en blind
 * overwrite hade tappat andra bidrags redan sparade svar på samma köp.
 * Senaste svaret för ETT bidragId vinner (klickar man en annan länk i
 * efterhand ändras svaret, ingen historik). No-op om köpet inte finns —
 * kan hända om länken är gammal/manipulerad, kraschar aldrig routen.
 */
export async function sparaUtfallssvar(
  stripeSessionId: string,
  bidragId: string,
  bidragNamn: string,
  svar: KopUtfallSvar
): Promise<boolean> {
  const kop = await hamtaKop(stripeSessionId);
  if (!kop) return false;

  const utfall = (kop.utfall ?? []).filter((u) => u.bidragId !== bidragId);
  utfall.push({ bidragId, bidragNamn, svar, svaratDatum: new Date().toISOString() });
  await redis.set(kopKey(stripeSessionId), { ...kop, utfall });
  return true;
}
