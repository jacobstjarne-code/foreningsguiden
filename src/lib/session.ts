/**
 * session.ts — Magic-link-inloggning för föreningskontot (H29,
 * GRANSKNING_foreningsguiden.md). Inget lösenord, inget nytt kontobegrepp:
 * inloggningen bevisar bara att du äger en e-post som redan har en
 * Subscriber-post (subscribers.ts) — samma redis-mönster som den filens
 * bekraftelsetoken (kort TTL, engångsbruk).
 *
 * Tre sorters token, olika livslängd:
 *   - Inloggningstoken: skickas i mejl-länken, kort TTL (15 min),
 *     engångsbruk (raderas vid verifiering).
 *   - Sessionstoken: värdet i sessionscookien, längre TTL (30 dagar),
 *     återanvänds för varje sidladdning tills utloggning/utgång.
 *   - Epostbytestoken (H29-tillägg): skickas till den NYA adressen när
 *     kontot byter e-post. Kort TTL (15 min), engångsbruk. Kräver ALLTID
 *     en redan inloggad session för att skapas (se api/byt-epost.ts) —
 *     annars kan vem som helst döpa om en känd förenings-adress till sin
 *     egen, eftersom bekräftelsen bara går till den nya adressen
 *     (angriparens egen). Se plan-filens säkerhetsresonemang.
 */

import { Redis } from '@upstash/redis';

const env = import.meta.env as unknown as Record<string, string>;
const redis = new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN });

const inloggningstokenKey = (token: string) => `inloggningstoken:${token}`;
const sessionKey = (token: string) => `session:${token}`;
const epostbytestokenKey = (token: string) => `epostbytestoken:${token}`;

const INLOGGNINGSTOKEN_TTL_SEKUNDER = 60 * 15; // 15 minuter
const SESSION_TTL_SEKUNDER = 60 * 60 * 24 * 30; // 30 dagar
const EPOSTBYTESTOKEN_TTL_SEKUNDER = 60 * 15; // 15 minuter

export interface EpostbyteData {
  oldEmail: string;
  newEmail: string;
}

export const SESSION_COOKIE_NAMN = 'fg_session';

export interface InloggningstokenData {
  email: string;
  // H15/H16/H17 (SPEC: Det som återstår, 2026-07-28): en obekräftad
  // besökare som kommer från kop-bekräftelsemejlets länk ska landa
  // DIREKT på sitt köp efter inloggning, inte på generella /mina-sidor/.
  // Skickas som en SERVER-lagrad väg mot detta token, inte som en
  // querysträng på magic-länken — samma "=" -i-URL-rotorsak som redan
  // motiverar path-parametrar överallt annars i den här filen
  // (verifiera-inloggning/[token].ts).
  returTo: string | null;
}

/** Skapar en engångstoken för magic-länken. `returTo` — se InloggningstokenData. */
export async function skapaInloggningstoken(email: string, returTo: string | null = null): Promise<string> {
  const token = crypto.randomUUID();
  const data: InloggningstokenData = { email: email.toLowerCase(), returTo };
  await redis.set(inloggningstokenKey(token), data, { ex: INLOGGNINGSTOKEN_TTL_SEKUNDER });
  return token;
}

/** Verifierar och FÖRBRUKAR en inloggningstoken. Null om ogiltig/utgången. */
export async function verifieraInloggningstoken(token: string): Promise<InloggningstokenData | null> {
  const data = await redis.get<InloggningstokenData>(inloggningstokenKey(token));
  if (!data) return null;
  await redis.del(inloggningstokenKey(token));
  return data;
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

/** Skapar en engångstoken för e-postbytets bekräftelselänk (skickas till NYA adressen). */
export async function skapaEpostbytestoken(oldEmail: string, newEmail: string): Promise<string> {
  const token = crypto.randomUUID();
  const data: EpostbyteData = { oldEmail: oldEmail.toLowerCase(), newEmail: newEmail.toLowerCase() };
  await redis.set(epostbytestokenKey(token), data, { ex: EPOSTBYTESTOKEN_TTL_SEKUNDER });
  return token;
}

/** Verifierar och FÖRBRUKAR en epostbytestoken. Null om ogiltig/utgången. */
export async function verifieraEpostbytestoken(token: string): Promise<EpostbyteData | null> {
  const data = await redis.get<EpostbyteData>(epostbytestokenKey(token));
  if (!data) return null;
  await redis.del(epostbytestokenKey(token));
  return data;
}
