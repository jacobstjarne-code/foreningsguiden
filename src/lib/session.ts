/**
 * session.ts — Magic-link-inloggning för föreningskontot (H29,
 * GRANSKNING_foreningsguiden.md). Inget lösenord, inget nytt kontobegrepp:
 * inloggningen bevisar bara att du äger en e-post som redan har en
 * Subscriber-post (subscribers.ts) — samma redis-mönster som den filens
 * bekraftelsetoken (kort TTL, engångsbruk).
 *
 * Två sorters token, olika livslängd:
 *   - Inloggningstoken: skickas i mejl-länken, kort TTL (15 min),
 *     engångsbruk (raderas vid verifiering).
 *   - Sessionstoken: värdet i sessionscookien, längre TTL (30 dagar),
 *     återanvänds för varje sidladdning tills utloggning/utgång.
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const inloggningstokenKey = (token: string) => `inloggningstoken:${token}`;
const sessionKey = (token: string) => `session:${token}`;

const INLOGGNINGSTOKEN_TTL_SEKUNDER = 60 * 15; // 15 minuter
const SESSION_TTL_SEKUNDER = 60 * 60 * 24 * 30; // 30 dagar

export const SESSION_COOKIE_NAMN = 'fg_session';

/** Skapar en engångstoken för magic-länken. */
export async function skapaInloggningstoken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  await redis.set(inloggningstokenKey(token), email.toLowerCase(), { ex: INLOGGNINGSTOKEN_TTL_SEKUNDER });
  return token;
}

/** Verifierar och FÖRBRUKAR en inloggningstoken. Null om ogiltig/utgången. */
export async function verifieraInloggningstoken(token: string): Promise<string | null> {
  const email = await redis.get<string>(inloggningstokenKey(token));
  if (!email) return null;
  await redis.del(inloggningstokenKey(token));
  return email;
}

/** Skapar en ny, längre sessionstoken efter lyckad inloggning. */
export async function skapaSession(email: string): Promise<string> {
  const token = crypto.randomUUID();
  await redis.set(sessionKey(token), email.toLowerCase(), { ex: SESSION_TTL_SEKUNDER });
  return token;
}

/** Slår upp vilken e-post en sessionscookie tillhör. Null om ogiltig/utgången. */
export async function hamtaSessionEmail(sessionToken: string): Promise<string | null> {
  return redis.get<string>(sessionKey(sessionToken));
}

/** Utloggning — raderar sessionen server-sidan (cookien rensas separat av anroparen). */
export async function raderaSession(sessionToken: string): Promise<void> {
  await redis.del(sessionKey(sessionToken));
}
