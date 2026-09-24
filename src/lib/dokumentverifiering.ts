/**
 * dokumentverifiering.ts — AF2.5 (Jacobs order): grinden för dokument-
 * åtkomst, inte uppladdningen. "Bygg inte uppladdningen — bara grinden,
 * så den finns när ytan kommer."
 *
 * VARFÖR EN EGEN, STARKARE MEKANISM ÄN PROFILENS ÖVRIGA FÄLT: profilen
 * och aktivitetsmallarna (AF1.1/AF1.2) bärs av samma svaga nyckel som
 * redan är etablerad praxis i den här kodbasen (email+kommunSlug/namn,
 * ingen verifiering — se subscribers.ts, kommunefterfragan.ts). Det
 * håller för textfält (medlemsantal, organisationsnummer). Det håller
 * INTE för uppladdade dokument, eftersom AF1.5:s medlemsunderlag —
 * namn och födelsedata på barn — är precis den sortens fil som kommer
 * bifogas. En läckt textrad är ett obehag; en läckt PDF med en klass
 * barns personnummer är en anmälningspliktig incident. Se AF1-rapporten
 * till Jacob (H29-frågan) för den fulla avvägningen.
 *
 * SAMMA TOKEN-IDIOM SOM subscribers.ts:s bekraftelsetoken (crypto.
 * randomUUID, Redis-nyckel + TTL, engångsbruk) — inte en ny primitiv.
 * Skillnaden: kortare TTL (1 timme, inte 7 dagar) eftersom syftet är
 * "bevisa att du har inkorgen just nu", inte en bekräftelse som kan
 * vänta dagar.
 *
 * MEDVETET INERT PÅ EN PUNKT: ingen route (`src/pages/api/...`) skickar
 * mejlet eller tar emot en fil. Det är nästa steg, när Design har levererat
 * ytan för dokumentuppladdning — inte AF2:s.
 *
 * AG1 (Jacob 2026-08-27): nyckeln formaliserad som profilnyckel.ts:s
 * Profilnyckel — samma typ som aktivitetsmall.ts nu hänger sina mallar
 * under, inte en egen email+foreningsnamn-form som kan glida isär.
 */

import { Redis } from '@upstash/redis';
import { normaliseraProfilnyckel, type Profilnyckel } from './profilnyckel.ts';

const env = (import.meta.env ?? process.env) as unknown as Record<string, string>;
const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

const TOKEN_TTL_SEKUNDER = 60 * 60; // 1 timme — kort avsiktligt, se filhuvud
const dokumentTokenKey = (token: string) => `dokumentverifiering:${token}`;

export interface DokumentVerifieringEntry {
  nyckel: Profilnyckel;
  utfardad: string; // ISO
}

/**
 * Utfärdar ett engångstoken för DEN HÄR profilen. Anroparen (framtida
 * route) ansvarar för att mejla länken — den funktionen finns inte här,
 * se filhuvud.
 */
export async function utfardaDokumentToken(nyckel: Profilnyckel): Promise<string> {
  const token = crypto.randomUUID();
  const entry: DokumentVerifieringEntry = {
    nyckel: normaliseraProfilnyckel(nyckel),
    utfardad: new Date().toISOString(),
  };
  await redis.set(dokumentTokenKey(token), JSON.stringify(entry), { ex: TOKEN_TTL_SEKUNDER });
  return token;
}

/**
 * Verifierar och FÖRBRUKAR ett token — engångsbruk, samma disciplin som
 * confirmSubscriberByToken (subscribers.ts): en andra användning av
 * samma länk ska aldrig ge åtkomst. null = ogiltigt, utgånget, eller
 * redan förbrukat.
 */
export async function verifieraDokumentToken(token: string): Promise<DokumentVerifieringEntry | null> {
  const key = dokumentTokenKey(token);
  const rad = await redis.get<string>(key);
  if (!rad) return null;
  await redis.del(key);
  return JSON.parse(rad) as DokumentVerifieringEntry;
}
