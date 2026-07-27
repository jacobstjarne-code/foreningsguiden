/**
 * kommunefterfragan.ts — Lagring för H4:s "Meddela mig när {kommun} täcks"
 * (SPEC_ATERSTAENDE_HAL.md, Kluster 4). EGEN modul, inte en tredje gren i
 * vantelista.ts: den filens primärnyckel är BARA e-post
 * (`vantelista:<email>`) — en person kan alltså bara ha EN rad totalt,
 * vilket skulle skriva över en tidigare kommunefterfrågan om samma person
 * senare frågar efter en ANNAN otäckt kommun. Nyckeln här är kommun+e-post
 * tillsammans, så flera efterfrågningar från samma person bevaras.
 *
 * Samma redis.set+sadd-recept som abonnemang.ts/kop.ts. Ingen dubbel
 * opt-in (samma resonemang som vantelista.ts: en engångsanmälan, inget
 * återkommande utskick att bekräfta).
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const kommunefterfraganKey = (kommunSlug: string, email: string) => `kommunefterfragan:${kommunSlug}:${email.toLowerCase()}`;
const KOMMUNEFTERFRAGAN_INDEX_KEY = 'kommunefterfragan:index';

export interface KommunEfterfraganEntry {
  email: string;
  kommunSlug: string;
  registrerad: string; // ISO
}

/** Sparar en efterfrågan. Idempotent per (kommunSlug, email) — samma person+kommun skriver aldrig två indexposter. */
export async function addKommunEfterfragan(email: string, kommunSlug: string): Promise<void> {
  const normalized = email.toLowerCase();
  const key = kommunefterfraganKey(kommunSlug, normalized);
  const entry: KommunEfterfraganEntry = { email: normalized, kommunSlug, registrerad: new Date().toISOString() };
  await redis.set(key, entry);
  await redis.sadd(KOMMUNEFTERFRAGAN_INDEX_KEY, key);
}

/**
 * Adminvyn: ALLA efterfrågningar, sorterade per kommun (H4:s eget syfte —
 * "prioriteringsdata för nästa extraktionsbatch", koncentrationen per
 * kommun ska synas direkt), senaste först inom varje kommun.
 */
export async function hamtaAllaKommunEfterfragningar(): Promise<KommunEfterfraganEntry[]> {
  const keys = await redis.smembers(KOMMUNEFTERFRAGAN_INDEX_KEY);
  const entries = await Promise.all(keys.map((key) => redis.get<KommunEfterfraganEntry>(key)));
  return entries
    .filter((e): e is KommunEfterfraganEntry => e !== null)
    .sort((a, b) => a.kommunSlug.localeCompare(b.kommunSlug) || b.registrerad.localeCompare(a.registrerad));
}
