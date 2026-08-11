/**
 * diagnos-giltighetsvarning.ts — engångsdiagnos (Jacob 2026-08-11, C3
 * REVIDERAD): "har dagens cron skickat något till en verklig mottagare?
 * Rapportera antal utskick och antal bevakare med giltighetsbevakning."
 *
 * Läser PRODUKTIONS-Redis via .env.local (vercel env pull). Skriver
 * ingenting, ändrar ingenting — bara läser. Importerar MEDVETET inte
 * subscribers.ts (den använder import.meta.env, en Astro/Vite-global som
 * inte finns i en vanlig node/tsx-körning) — samma nyckelmönster
 * återskapat direkt mot Redis i stället, för att slippa ändra
 * produktionskod bara för en engångsdiagnos.
 *
 * Kör: npx tsx scripts/diagnos-giltighetsvarning.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { Redis } from '@upstash/redis';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const match = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, namn, raVarde] = match;
    if (process.env[namn] !== undefined) continue;
    process.env[namn] = raVarde.replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const INDEX_KEY = 'prenumeranter:index';
const recordKey = (email: string) => `prenumerant:${email.toLowerCase()}`;

interface SubscriberLite {
  email: string;
  confirmed: boolean;
  giltighetArsmoten?: Record<string, string>;
}

const emails = await redis.smembers(INDEX_KEY);
const records = await Promise.all(emails.map((e) => redis.get<SubscriberLite>(recordKey(e))));
const bekraftade = records.filter((r): r is SubscriberLite => r !== null && r.confirmed);

console.log(`Bekräftade prenumeranter totalt: ${bekraftade.length}`);

const medGiltighetsbevakning = bekraftade.filter((s) => s.giltighetArsmoten && Object.keys(s.giltighetArsmoten).length > 0);
console.log(`Med giltighetsbevakning (giltighetArsmoten satt): ${medGiltighetsbevakning.length}`);

for (const s of medGiltighetsbevakning) {
  for (const [kommunSlug, arsmotesdatum] of Object.entries(s.giltighetArsmoten!)) {
    console.log(`  ${s.email} — ${kommunSlug} — årsmöte ${arsmotesdatum}`);
  }
}

console.log('\n--- Skickade giltighetsvarningar (giltighetsvarningskickad:*) ---');
let cursor = 0;
let totaltSkickade = 0;
const nycklar: string[] = [];
do {
  const [nyCursor, keys] = await redis.scan(cursor, { match: 'giltighetsvarningskickad:*', count: 100 });
  cursor = Number(nyCursor);
  nycklar.push(...keys);
} while (cursor !== 0);

if (nycklar.length === 0) {
  console.log('Inga giltighetsvarningskickad:*-nycklar hittades — cronet har ALDRIG skickat något.');
} else {
  for (const key of nycklar) {
    const medlemmar = await redis.smembers(key);
    totaltSkickade += medlemmar.length;
    console.log(`  ${key}: ${medlemmar.join(', ')}`);
  }
  console.log(`\nTotalt antal (kommun, datum, mottagare)-utskick: ${totaltSkickade}`);
}
