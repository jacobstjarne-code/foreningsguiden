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
import type { Foreningsprofil } from './foreningsprofil';
import { removeVantelista } from './vantelista';

// Redis.fromEnv() letar efter UPSTASH_REDIS_REST_URL/_TOKEN — Vercels
// Marketplace-integration (vercel install upstash/upstash-kv) provisionerar
// istället de gamla Vercel KV-namnen KV_REST_API_URL/KV_REST_API_TOKEN.
// import.meta.env FÖRST (inte bara process.env) — Astro fyller bara den
// förra i dev-serverns Vite-kontext, se debug-env-verifieringen i
// statusrapporten. `?? process.env`-fallbacken (SPEC: Omverifiering)
// gäller bara scripts/omverifiering-ko.ts:s plain node-körning, som
// transitivt importerar denna fil — i Astro/Vite-kontext triggas den
// aldrig.
const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;
const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const INDEX_KEY = 'prenumeranter:index';
const recordKey = (email: string) => `prenumerant:${email.toLowerCase()}`;
const tokenKey = (token: string) => `bekraftelsetoken:${token}`;
// '28' — abonnemangsbevakningens fyraveckorspåminnelse (SPEC_ABONNEMANG.md
// §4), samma nyckelmönster som den gratis 14/3-bevakningen men en egen
// typ-literal så de två aldrig kan krocka på samma (bidragId, datum).
const sentKey = (typ: '28' | '14' | '4' | '3', bidragId: string, dateISO: string) => `paminnelseskickad:${typ}:${bidragId}:${dateISO}`;

const TOKEN_TTL_SEKUNDER = 60 * 60 * 24 * 7; // 7 dagar

export interface Subscriber {
  email: string;
  kommuner: string[];
  registrerad: string; // ISO-datum
  confirmed: boolean;
  // P3.1b (Jacob 2026-08-05): bevakning på ENSKILT bidrag, inte hela
  // kommunen — additivt vid sidan av kommuner (aldrig en ersättning).
  // bidragId är bara unikt INOM en kommun (kommuner.ts validateAllKommunFiles
  // kontrollerar det, inget globalt kontrakt) — varje post måste därför
  // bära sin kommunSlug, annars går den inte att slå upp entydigt i
  // paminnelser.ts. Skapas av addBidragBevakning, LÄGGER ALDRIG till i
  // kommuner — en radbevakning ska bara ge påminnelser för DET bidraget,
  // inte tyst utökas till kommunens hela lista.
  bidrag?: { kommunSlug: string; bidragId: string }[];
  // Giltighetskollen (SPRINT_COPY.ts §GILTIGHETSKOLL) — kommunSlug → senaste
  // årsmötesdatum, sparat när prenumeranten ber om en giltighetspåminnelse.
  // Bara de kommuner som faktiskt frågats om finns med som nycklar.
  giltighetArsmoten?: Record<string, string>;
  // Matchningstrattens bestående profil (turn-11) — mergas in FÖRST när en
  // e-post fångas (RegistreringsHjalp.astro/framtida utkastflöde). Fram
  // tills dess lever profilen bara i localStorage (foreningsprofil.ts).
  // Samma "läs-och-mergea, aldrig blind overwrite"-skydd som ovan.
  foreningsprofil?: Foreningsprofil;
}

/**
 * Skapar/utökar en prenumerant. Läser alltid befintlig post FÖRST och
 * mergar — en blind overwrite här regressar en redan BEKRÄFTAD adress
 * till confirmed:false (stänger av pågående påminnelser tills ett nytt
 * klick) och tappar giltighetArsmoten, upptäckt vid egen verifiering
 * 2026-07-19 (samma klass av bugg som addGiltighetBevakning redan
 * skyddar mot). Redan bekräftade adresser läggs till direkt, utan nytt
 * token — se addGiltighetBevakning för samma mönster.
 */
export async function addPendingSubscriber(
  email: string,
  kommuner: string[]
): Promise<{ token: string | null; alreadyConfirmed: boolean }> {
  const normalized = email.toLowerCase();
  const existing = await getSubscriber(normalized);

  const record: Subscriber = {
    email: normalized,
    kommuner: existing ? Array.from(new Set([...existing.kommuner, ...kommuner])) : kommuner,
    registrerad: existing?.registrerad ?? new Date().toISOString(),
    confirmed: existing?.confirmed ?? false,
    bidrag: existing?.bidrag,
    giltighetArsmoten: existing?.giltighetArsmoten,
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

/**
 * P3.1b (Jacob 2026-08-05): bevakning på ENSKILT bidrag — radens "Börja
 * bevaka" i deadlinekalendern (bevakaKlient.ts). Lägger ALDRIG till i
 * kommuner — se Subscriber.bidrag-kommentaren för varför. Dedupar på
 * (kommunSlug, bidragId), samma "läs-och-mergea"-mönster som övriga
 * writers i den här filen.
 */
export async function addBidragBevakning(
  email: string,
  kommunSlug: string,
  bidragId: string
): Promise<{ token: string | null; alreadyConfirmed: boolean }> {
  const normalized = email.toLowerCase();
  const existing = await getSubscriber(normalized);

  const befintligaBidrag = existing?.bidrag ?? [];
  const redanBevakat = befintligaBidrag.some((b) => b.kommunSlug === kommunSlug && b.bidragId === bidragId);

  const record: Subscriber = {
    email: normalized,
    kommuner: existing?.kommuner ?? [],
    registrerad: existing?.registrerad ?? new Date().toISOString(),
    confirmed: existing?.confirmed ?? false,
    bidrag: redanBevakat ? befintligaBidrag : [...befintligaBidrag, { kommunSlug, bidragId }],
    giltighetArsmoten: existing?.giltighetArsmoten,
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
    bidrag: existing?.bidrag,
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

/**
 * Mergar in matchningstrattens föreningsprofil på en subscriber-post (skapas
 * om den inte finns). Samma "läs befintlig FÖRST"-mönster som
 * addGiltighetBevakning — en blind overwrite här skulle regressa en redan
 * BEKRÄFTAD adress till confirmed:false, se filhuvudets varning.
 */
export async function addForeningsprofil(
  email: string,
  profil: Foreningsprofil
): Promise<{ token: string | null; alreadyConfirmed: boolean }> {
  const normalized = email.toLowerCase();
  const existing = await getSubscriber(normalized);

  const record: Subscriber = {
    email: normalized,
    kommuner: existing?.kommuner ?? [],
    registrerad: existing?.registrerad ?? new Date().toISOString(),
    confirmed: existing?.confirmed ?? false,
    bidrag: existing?.bidrag,
    giltighetArsmoten: existing?.giltighetArsmoten,
    foreningsprofil: profil,
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

/**
 * SPEC: Det som återstår, A (2026-07-28): integritetspolicyn lovar att
 * avregistrering raderar bevakningsuppgifterna helt — "ingen kopia,
 * ingen papperskorg". Rensar därför ÄVEN väntelistposten (vantelista.ts)
 * för samma adress, inte bara prenumerant-posten. Utan detta kunde
 * samma adress ligga kvar i väntelistan efter en "klar" avregistrering
 * — texten hade lovat mer än koden gjorde.
 */
export async function removeSubscriber(email: string): Promise<void> {
  await redis.del(recordKey(email));
  await redis.srem(INDEX_KEY, email.toLowerCase());
  await removeVantelista(email);
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  return redis.get<Subscriber>(recordKey(email));
}

/**
 * H29-tillägg (Mina sidor: byt e-post) — flyttar kontot till en ny adress.
 * Läser gammal post FÖRST och MERGAR in i en ev. redan befintlig post på
 * newEmail (samma "läs-och-mergea"-princip som addForeningsprofil m.fl.
 * ovan — en blind overwrite hade kunnat tappa newEmail:s egen bevakning
 * om den adressen redan var i bruk av någon annan). Detta ÄR ett
 * namnbyte, inte en kopia — den gamla postens indexpost tas bort helt.
 * Null om oldEmail inte har någon post att flytta.
 */
export async function flyttaSubscriber(oldEmail: string, newEmail: string): Promise<Subscriber | null> {
  const gammal = await getSubscriber(oldEmail);
  if (!gammal) return null;

  const normalizedNew = newEmail.toLowerCase();
  const befintligNy = await getSubscriber(normalizedNew);

  const ihopslagnaBidrag = [...(gammal.bidrag ?? []), ...(befintligNy?.bidrag ?? [])];
  const unikaBidrag = ihopslagnaBidrag.filter(
    (b, i) => ihopslagnaBidrag.findIndex((b2) => b2.kommunSlug === b.kommunSlug && b2.bidragId === b.bidragId) === i
  );

  const record: Subscriber = {
    email: normalizedNew,
    kommuner: Array.from(new Set([...gammal.kommuner, ...(befintligNy?.kommuner ?? [])])),
    registrerad: befintligNy?.registrerad ?? gammal.registrerad,
    confirmed: befintligNy?.confirmed ?? gammal.confirmed,
    bidrag: unikaBidrag.length > 0 ? unikaBidrag : undefined,
    giltighetArsmoten: { ...(gammal.giltighetArsmoten ?? {}), ...(befintligNy?.giltighetArsmoten ?? {}) },
    foreningsprofil: befintligNy?.foreningsprofil ?? gammal.foreningsprofil,
  };

  await redis.set(recordKey(normalizedNew), record);
  await redis.sadd(INDEX_KEY, normalizedNew);
  await removeSubscriber(oldEmail);

  return record;
}

/** Alla BEKRÄFTADE prenumeranter — underlag för cronjobbets utskick. */
export async function getAllConfirmedSubscribers(): Promise<Subscriber[]> {
  const emails = await redis.smembers(INDEX_KEY);
  const records = await Promise.all(emails.map((e) => getSubscriber(e)));
  return records.filter((r): r is Subscriber => r !== null && r.confirmed);
}

/** Adminvyn: ALLA prenumeranter, även obekräftade (till skillnad från getAllConfirmedSubscribers ovan). */
export async function getAllSubscribers(): Promise<Subscriber[]> {
  const emails = await redis.smembers(INDEX_KEY);
  const records = await Promise.all(emails.map((e) => getSubscriber(e)));
  return records.filter((r): r is Subscriber => r !== null);
}

/**
 * Antal BEKRÄFTADE prenumeranter som bevakar en given kommun — social proof
 * (VANTELISTA.socialProof, GUIDE_TRATT_COPY.ts). Live ur Redis varje anrop,
 * ingen cache — visas bara vid ett golv (se anroparna), så exakthet väger
 * tyngre än hastighet på det här antalet.
 */
export async function countSubscribersByKommun(slug: string): Promise<number> {
  const subs = await getAllConfirmedSubscribers();
  return subs.filter((s) => s.kommuner.includes(slug)).length;
}

/**
 * Datumet för den FÖRSTA bekräftade prenumerationen — "sedan {datum}" på
 * förstasidans live-datakort (turn-14, incoming/foreningsguiden-tratt-
 * tryck-v3-livedata.html). Ett riktigt datum, aldrig ett lanseringsdatum
 * hårdkodat i koden — null om ingen bekräftad prenumerant finns än.
 *
 * `registrerad` sparas som en full ISO-tidsstämpel (new Date().toISOString(),
 * addPendingSubscriber m.fl.) — .slice(0, 10) till ren YYYY-MM-DD HÄR, en
 * gång, så att kommunTyper.ts formatDate() (som bara förstår YYYY-MM-DD)
 * aldrig får en tidsstämpel att splitta på "-" och råka Number()a en
 * "18T21:59:57.034Z"-sträng till NaN (fångat i produktion 2026-07-26).
 */
export async function getEarliestConfirmedRegistrationDate(): Promise<string | null> {
  const subs = await getAllConfirmedSubscribers();
  if (subs.length === 0) return null;
  const earliest = subs.reduce((earliest, s) => (s.registrerad < earliest ? s.registrerad : earliest), subs[0].registrerad);
  return earliest.slice(0, 10);
}

/**
 * Summan av (prenumerant × bevakad kommun × dess kommande fasta deadlines)
 * — "N deadlines bevakas åt föreningar" i live-datakortets över-golv-läge.
 * Räknas live vid varje anrop (samma "ingen cache"-princip som övriga
 * bevakningstal) — datamängden (få hundra deadlines × få prenumeranter)
 * är för liten för att cache ska behövas.
 */
export async function countTrackedDeadlines(deadlineEntries: { kommunSlug: string; isLopande: boolean }[]): Promise<number> {
  const subs = await getAllConfirmedSubscribers();
  const antalPerKommun = new Map<string, number>();
  for (const e of deadlineEntries) {
    if (e.isLopande) continue;
    antalPerKommun.set(e.kommunSlug, (antalPerKommun.get(e.kommunSlug) ?? 0) + 1);
  }

  let total = 0;
  for (const sub of subs) {
    for (const kommunSlug of sub.kommuner) {
      total += antalPerKommun.get(kommunSlug) ?? 0;
    }
  }
  return total;
}

/** Har den här (typ, bidrag, datum)-påminnelsen redan gått till adressen? */
export async function wasReminderSent(typ: '28' | '14' | '4' | '3', bidragId: string, dateISO: string, email: string): Promise<boolean> {
  return (await redis.sismember(sentKey(typ, bidragId, dateISO), email.toLowerCase())) === 1;
}

export async function markReminderSent(typ: '28' | '14' | '4' | '3', bidragId: string, dateISO: string, email: string): Promise<void> {
  await redis.sadd(sentKey(typ, bidragId, dateISO), email.toLowerCase());
}

// B4 (SPRINT: Produkten) — giltighetsvarningens idempotens-nyckel skiljer
// sig i FORM från sentKey ovan (kommun+årsmötesdatum, inte bidrag+datum) —
// EGEN nyckelrymd, samma princip som utfallsfraga.ts:s köp-scopade
// nycklar (kan aldrig krocka med paminnelseskickad:*).
const giltighetsvarningKey = (kommunSlug: string, arsmotesdatum: string) =>
  `giltighetsvarningskickad:${kommunSlug}:${arsmotesdatum}`;

/** Har giltighetsvarningen redan gått till adressen för DETTA kommun+årsmötesdatum? */
export async function wasGiltighetsvarningSent(kommunSlug: string, arsmotesdatum: string, email: string): Promise<boolean> {
  return (await redis.sismember(giltighetsvarningKey(kommunSlug, arsmotesdatum), email.toLowerCase())) === 1;
}

export async function markGiltighetsvarningSent(kommunSlug: string, arsmotesdatum: string, email: string): Promise<void> {
  await redis.sadd(giltighetsvarningKey(kommunSlug, arsmotesdatum), email.toLowerCase());
}
