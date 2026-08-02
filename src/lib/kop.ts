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

// `?? process.env` — scripts/omverifiering-ko.ts (SPEC: Omverifiering)
// importerar denna transitivt som ett vanligt node-skript, utanför Vites
// import.meta.env-injektion. I Astro/Vite-kontext är import.meta.env
// alltid satt, ?? triggas aldrig — oförändrat beteende där.
const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;
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
// H18 (SPEC: Det som återstår): egen nyckelrymd av samma skäl som
// utfallsfraganKey ovan — köp-scopad idempotens för cronets utskick,
// skild från utfallsfrågans (frågorna kan i teorin gå till samma
// köp+bidrag utan att krocka).
const inlamningsPaminnelseKey = (stripeSessionId: string, bidragId: string) =>
  `inlamningspaminnelse:${stripeSessionId}:${bidragId}`;

// 'bidragsutkast' (CODE_UPPDRAG_KOMMERSIELL §1.B, 2026-07-30): egen
// produkt, egen constant (PRIS_BIDRAGSUTKAST_ORE, priser.ts) — skild
// från 'registrering' så adminvyn (hamtaAllaKop) kan skilja dem åt.
// hamtaKopAvProdukt('registrering') i cron/utfallsfraga.ts och
// cron/inlamningspaminnelse.ts filtrerar redan explicit på produkten —
// bidragsutkast-köp rör INTE de croneen bara för att typen finns nu.
export type KopProdukt = 'registrering' | 'bidragsutkast';

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

// H18 (SPEC: Det som återstår, 2026-07-28): svaret på inlämnings-
// påminnelsens två länkar (api/inlamnad/[session]/[bidrag]/[svar]) —
// samma mönster som KopUtfallSvar/KopUtfallEntry ovan.
export type KopInlamningSvar = 'ja' | 'nej';

export interface KopInlamningEntry {
  bidragId: string;
  bidragNamn: string;
  svar: KopInlamningSvar;
  svaratDatum: string; // ISO
}

/**
 * §0 (SPEC_HUVUDPROCESSEN, Opus/Fable 2026-08-01): fyra fält en
 * registreringsansökan faktiskt kräver, som tratten aldrig samlar in
 * (org.nr är en annan sorts uppgift än trattens grova intervall).
 * Samlas EFTER betalning, sparas på KÖPET — inte i föreningsprofilen.
 */
export interface Foreningsuppgifter {
  namn: string;
  orgnr: string;
  kontaktperson: string;
  kontaktEpost: string;
  bankgiroPlusgiro: string;
}

export interface KopEntry {
  email: string;
  kommunSlug: string;
  produkt: KopProdukt;
  beloppOre: number;
  stripeSessionId: string;
  betaldDatum: string; // ISO
  foreningsprofil?: Foreningsprofil;
  // §0 — produkt==='registrering' i praktiken (formuläret visas bara
  // där), men fältet är inte typmässigt låst till det.
  foreningsuppgifter?: Foreningsuppgifter;
  // H10+H15: Stripes hostade, varaktiga fakturalänk (invoice_creation
  // på checkout-sessionen, se checkout/registrering.ts) — sätts av
  // stripe-webhook.ts efter att fakturan hunnit skapas.
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  // H22: JSON av RegistreringsUtkastRad[] (utkastGenerator.ts) vid
  // KÖPTILLFÄLLET — låst, ändras aldrig efteråt. Ändringsbevakningens
  // cronjobb jämför kommunens NUVARANDE checklista mot denna.
  // produkt==='registrering' ENDAST.
  forutsattningarSnapshot?: string;
  // produkt==='bidragsutkast' ENDAST — vilket bidrag köpet gäller.
  bidragId?: string;
  // produkt==='bidragsutkast' ENDAST: JSON av UtkastDokument
  // (utkastGenerator.ts, genereraUtkast()-resultatet av typ
  // 'bidragsutkast') vid KÖPTILLFÄLLET — låst, samma "aldrig omgenererat
  // i efterhand"-princip som forutsattningarSnapshot. Föreningsprofilen
  // som avgjorde INNEHÅLLET är densamma som foreningsprofil-fältet ovan.
  bidragsutkastSnapshot?: string;
  // H19: en KopEntry kan matcha FLERA bidrag (kommun-scopad registrering,
  // inte bidrag-scopad) — en post per bidrag som faktiskt svarat, inte
  // ett enda fält. "Senaste svaret vinner" per bidragId, ingen historik.
  utfall?: KopUtfallEntry[];
  // H18: samma "en post per bidrag, senaste svaret vinner"-mönster som utfall ovan.
  inlamning?: KopInlamningEntry[];
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

/**
 * H15/H16/H17 (SPEC: Det som återstår, 2026-07-28): samma uppslag som
 * hamtaKop, men returnerar bara träffen om den TILLHÖR den inloggade
 * e-posten. mina-sidor/kop/[session]/ och dess docx/pdf-endpoints
 * använder ALDRIG hamtaKop direkt — en känd/läckt Stripe-sessions-id ska
 * aldrig räcka för att läsa en annan förenings köpta underlag.
 */
export async function hamtaAgtKop(email: string, stripeSessionId: string): Promise<KopEntry | null> {
  const kop = await hamtaKop(stripeSessionId);
  if (!kop || kop.email.toLowerCase() !== email.toLowerCase()) return null;
  return kop;
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

/**
 * §0 (SPEC_HUVUDPROCESSEN, Opus/Fable 2026-08-01): sparar de fyra
 * föreningsuppgifterna EFTER betalning, en blind overwrite av HELA
 * objektet (inte en fältvis merge) — formuläret skickar alltid alla
 * fyra fält tillsammans, så det finns inget att bevara mellan sparningar.
 * No-op om köpet inte finns.
 */
export async function sparaForeningsuppgifter(stripeSessionId: string, uppgifter: Foreningsuppgifter): Promise<boolean> {
  const kop = await hamtaKop(stripeSessionId);
  if (!kop) return false;

  await redis.set(kopKey(stripeSessionId), { ...kop, foreningsuppgifter: uppgifter });
  return true;
}

/** H18: har inlämningspåminnelsen för detta (köp, bidrag) redan skickats — cronets idempotensspärr. */
export async function harInlamningsPaminnelseSkickats(stripeSessionId: string, bidragId: string): Promise<boolean> {
  return (await redis.get(inlamningsPaminnelseKey(stripeSessionId, bidragId))) !== null;
}

/** H18: markerar att inlämningspåminnelsen för detta (köp, bidrag) nu är skickad. */
export async function markeraInlamningsPaminnelseSkickad(stripeSessionId: string, bidragId: string): Promise<void> {
  await redis.set(inlamningsPaminnelseKey(stripeSessionId, bidragId), true);
}

/**
 * H18: sparar svaret på "har ni lämnat in ansökan?" — samma läs-mergea-
 * skriv-princip som sparaUtfallssvar ovan, egen fält (inlamning) så de
 * två svarsflödena aldrig kan skriva över varandra.
 */
export async function sparaInlamningssvar(
  stripeSessionId: string,
  bidragId: string,
  bidragNamn: string,
  svar: KopInlamningSvar
): Promise<boolean> {
  const kop = await hamtaKop(stripeSessionId);
  if (!kop) return false;

  const inlamning = (kop.inlamning ?? []).filter((u) => u.bidragId !== bidragId);
  inlamning.push({ bidragId, bidragNamn, svar, svaratDatum: new Date().toISOString() });
  await redis.set(kopKey(stripeSessionId), { ...kop, inlamning });
  return true;
}
