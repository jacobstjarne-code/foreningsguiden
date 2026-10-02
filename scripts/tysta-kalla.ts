/**
 * tysta-kalla.ts — sätter tystadTill på källor som matchar ett mönster.
 *
 * Till för kända, daterade lägen där ett dagligt systemlarm inte tillför
 * något. Källan kontrolleras och flaggas som vanligt och syns i adminvyn; det
 * är bara systemlarmets KÄLLOR- och GRANSKNINGSKÖ-villkor som tiger om den
 * fram till datumet.
 *
 * Kör: node scripts/tysta-kalla.ts <mönster> <ISO-datum> [--torrkor]
 * Exempel: node scripts/tysta-kalla.ts svedala 2026-10-16
 */
import { readFileSync, existsSync } from 'node:fs';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const [monster, datum] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const TORRKOR = process.argv.includes('--torrkor');
if (!monster || !/^\d{4}-\d{2}-\d{2}$/.test(datum ?? '')) {
  console.error('Användning: node scripts/tysta-kalla.ts <mönster> <YYYY-MM-DD> [--torrkor]');
  process.exit(1);
}

const { hamtaAllaSignaturer } = await import('../src/lib/omverifiering.ts');
const { Redis } = await import('@upstash/redis');
const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });

const traffar = (await hamtaAllaSignaturer()).filter((s) => s.url.includes(monster));
console.log(`${traffar.length} källor matchar "${monster}"${TORRKOR ? ' (torrkörning)' : ''}:`);
for (const s of traffar) {
  if (!TORRKOR) await redis.set(`omverif:kalla:${encodeURIComponent(s.url)}`, { ...s, tystadTill: datum });
  console.log(`  ${s.senasteUtfall.padEnd(13)} ${s.url.slice(0, 100)}`);
}
console.log(`\n${TORRKOR ? 'Skulle tystas' : 'Tystade'} till och med ${datum}.`);
