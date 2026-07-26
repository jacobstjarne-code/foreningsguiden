/**
 * adminSession.ts — Adminvyns egen sessionsmekanism, skild från
 * session.ts (som bevisar att du äger en förenings-e-post). Här finns
 * bara EN admin (Jacob) och ingen identitet att bevisa utöver ett delat
 * lösenord (ADMIN_SECRET, samma miljövariabelmönster som CRON_SECRET i
 * cron/paminnelser.ts) — därför ingen e-post inblandad alls.
 *
 * Kortare TTL än användarsessionen (7 dagar mot 30) eftersom detta är
 * ett delat, känsligare lösenord som ger tillgång till alla
 * prenumeranters och köpares uppgifter.
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const adminSessionKey = (token: string) => `adminsession:${token}`;
const ADMIN_SESSION_TTL_SEKUNDER = 60 * 60 * 24 * 7; // 7 dagar

export const ADMIN_SESSION_COOKIE_NAMN = 'fg_admin_session';

/** Kollar lösenordet mot ADMIN_SECRET. Skapar en sessionstoken vid rätt lösenord, annars null. */
export async function loggaInAdmin(losenord: string): Promise<string | null> {
  const secret = env.ADMIN_SECRET?.trim();
  if (!secret || losenord !== secret) return null;

  const token = crypto.randomUUID();
  await redis.set(adminSessionKey(token), true, { ex: ADMIN_SESSION_TTL_SEKUNDER });
  return token;
}

/** Sant om sessionscookien pekar på en giltig, oförbrukad admin-session. */
export async function arAdminInloggad(sessionToken: string | undefined): Promise<boolean> {
  if (!sessionToken) return false;
  return (await redis.get(adminSessionKey(sessionToken))) === true;
}

export async function loggaUtAdmin(sessionToken: string): Promise<void> {
  await redis.del(adminSessionKey(sessionToken));
}
