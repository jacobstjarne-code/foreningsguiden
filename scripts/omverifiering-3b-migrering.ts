/**
 * omverifiering-3b-migrering.ts — engångsmigrering till 3B (Jacobs beslut
 * 2026-10-02). Körs EN gång, lokalt, efter att detektorn bytt signal.
 *
 * Varför den måste finnas: baslinjerna i Redis är hashar över HELA sidan.
 * Detektorn jämför nu regionhashen. Utan migrering skulle första cronkörningen
 * se "olik baslinje" för varenda källa och flagga alla 2 099 på en gång.
 *
 * Vad den gör, per källa i kön:
 *   1. GET med den nya UA:n, beräkna regionhashen.
 *   2. Skriv den som baslinje, tillsammans med aktuell ETag/Last-Modified.
 *   3. Sätt utfall till oforandrad och flaggadSedan till null — INGET flaggas
 *      av migreringen.
 *
 * Undantag, enligt beslutet:
 *   - De 250 källor som mätpasset klassade som VERKLIG ENGÅNGSÄNDRING (lika
 *     flaggningsögonblicket, olik baslinjen) lämnas HELT orörda. De är
 *     fortfarande flaggade, en människa ska titta, och auto-clear rullar
 *     baslinjen fram när ett forskningspass bumpat senast_verifierad.
 *   - De 235 som ändras vid varje hämtning stängs med orsak "brus" i
 *     senasteFel, så det går att se i adminvyn varför de försvann.
 *   - Olästbara källor (otillganglig) migreras inte — de har ingen body att
 *     hasha. De får sin baslinje första gången de svarar.
 *
 * Kör: node scripts/omverifiering-3b-migrering.ts [--torrkor]
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const TORRKOR = process.argv.includes('--torrkor');
const MATNING = 'incoming/OMVERIFIERING_MATNING_2026-10-02.json';
const UA = 'Mozilla/5.0 (compatible; Foreningsguiden/1.0; +https://foreningsguiden.se/om/)';
const TIMEOUT_MS = 15000;
const SAMTIDIGA = 6;

const { hamtaAllaSignaturer, hamtaSignatur } = await import('../src/lib/omverifiering.ts');
const { hashaInnehallsregion } = await import('../src/lib/omverifieringLogik.ts');
const { Redis } = await import('@upstash/redis');
const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });

const matning = JSON.parse(readFileSync(MATNING, 'utf8'));
const verkligEngangs = new Set<string>(
  matning.andrade.filter((r: any) => r.helsidaLikaSenaste === true && r.helsidaLikaBaslinje === false).map((r: any) => r.url)
);
const brus = new Set<string>(
  matning.andrade.filter((r: any) => r.helsidaLikaSenaste === false && r.helsidaLikaBaslinje === false).map((r: any) => r.url)
);
console.log(`Mätningen: ${verkligEngangs.size} verkliga engångsändringar (lämnas orörda), ${brus.size} brus (stängs).`);

const alla = await hamtaAllaSignaturer();
const attMigrera = alla.filter((s) => !verkligEngangs.has(s.url) && s.senasteUtfall !== 'otillganglig');
console.log(`${alla.length} signaturer i kön. ${attMigrera.length} migreras, ${alla.length - attMigrera.length} hoppas över (verkliga ändringar + olästbara).`);
if (TORRKOR) console.log('\n--- TORRKÖRNING, ingenting skrivs ---');

async function hamta(url: string): Promise<{ ok: boolean; etag: string | null; lastModified: string | null; hash: string | null; kalla: string | null }> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: c.signal, headers: { 'User-Agent': UA } });
    if (!r.ok) return { ok: false, etag: null, lastModified: null, hash: null, kalla: null };
    const html = await r.text();
    const { hash, kalla } = hashaInnehallsregion(html);
    return { ok: true, etag: r.headers.get('etag'), lastModified: r.headers.get('last-modified'), hash, kalla };
  } catch {
    return { ok: false, etag: null, lastModified: null, hash: null, kalla: null };
  } finally { clearTimeout(t); }
}

const nu = new Date().toISOString();
let i = 0, migrerade = 0, stangda = 0, misslyckade = 0;
const regionkallor = new Map<string, number>();

await Promise.all(Array.from({ length: SAMTIDIGA }, async () => {
  for (;;) {
    const n = i++;
    if (n >= attMigrera.length) return;
    const sig = attMigrera[n];
    const res = await hamta(sig.url);
    if ((n + 1) % 100 === 0) console.log(`  ${n + 1}/${attMigrera.length}`);
    if (!res.ok || res.hash === null) { misslyckade++; continue; }
    regionkallor.set(res.kalla!, (regionkallor.get(res.kalla!) ?? 0) + 1);
    const varBrus = brus.has(sig.url);
    const ny = {
      ...sig,
      baslinjeEtag: res.etag,
      baslinjeLastModified: res.lastModified,
      baslinjeHash: res.hash,
      senasteEtag: res.etag,
      senasteLastModified: res.lastModified,
      senasteHash: res.hash,
      senasteUtfall: 'oforandrad' as const,
      flaggadSedan: null,
      senasteForsok: nu,
      senastLyckad: nu,
      konsekutivaFel: 0,
      senasteFel: varBrus ? 'stängd 2026-10-02 vid 3B-migreringen, orsak: brus (helsidehashen rörde sig vid varje hämtning, innehållsregionen inte)' : null,
    };
    // Samma nyckelform som src/lib/omverifiering.ts:signaturKey — en sanning.
    if (!TORRKOR) await redis.set(`omverif:kalla:${encodeURIComponent(sig.url)}`, ny);
    migrerade++;
    if (varBrus) stangda++;
  }
}));

console.log(`\nMigrerade: ${migrerade}`);
console.log(`  varav brusflaggor stängda: ${stangda}`);
console.log(`Misslyckade hämtningar (orörda, får baslinje när de svarar): ${misslyckade}`);
console.log(`Orörda verkliga ändringar: ${alla.filter((s) => verkligEngangs.has(s.url)).length}`);
console.log('\nRegionkällor:', [...regionkallor.entries()].map(([k, v]) => `${k} ${v}`).join(', '));

if (!TORRKOR) {
  const kvar = (await hamtaAllaSignaturer()).filter((s) => s.senasteUtfall !== 'oforandrad');
  console.log(`\nKön efter migrering: ${kvar.length} (${kvar.filter((s) => s.senasteUtfall === 'andrad').length} andrad, ${kvar.filter((s) => s.senasteUtfall === 'otillganglig').length} otillganglig)`);
}
