/**
 * vantelista.ts — Lagring för utkasttjänstens väntelista (SPRINT §Spår B,
 * SPRINT_COPY.ts §VÄNTELISTA). Egen, enklare mekanism än subscribers.ts:
 * ingen dubbel opt-in (kvittot lovar inget bekräftelsemejl — "Vi hör av oss
 * när utkasttjänsten öppnar", inte "kolla din inkorg"), och ingen koppling
 * till deadlinebevakningen. Två saker mäts: klick (intresse, oavsett om
 * någon fyller i e-post) och faktiska köanmälningar (adress + vilket bidrag).
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const VANTELISTA_INDEX_KEY = 'vantelista:index';
const vantelistaRecordKey = (email: string) => `vantelista:${email.toLowerCase()}`;
const klickKey = (kommunSlug: string, bidragId: string) => `vantelista:klick:${kommunSlug}:${bidragId}`;

export interface VantelistaEntry {
  email: string;
  kommunSlug: string;
  bidragId: string;
  registrerad: string; // ISO-datum
}

/** Sparar en köanmälan. Idempotent nog för syftet — senaste anmälan vinner. */
export async function addVantelista(email: string, kommunSlug: string, bidragId: string): Promise<void> {
  const normalized = email.toLowerCase();
  const record: VantelistaEntry = {
    email: normalized,
    kommunSlug,
    bidragId,
    registrerad: new Date().toISOString(),
  };
  await redis.set(vantelistaRecordKey(normalized), record);
  await redis.sadd(VANTELISTA_INDEX_KEY, normalized);
}

/** Räknar ett klick på väntelista-knappen — intentmätning, oberoende av om formuläret fylls i. */
export async function logVantelistaKlick(kommunSlug: string, bidragId: string): Promise<void> {
  await redis.incr(klickKey(kommunSlug, bidragId));
}
