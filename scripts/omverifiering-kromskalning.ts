/**
 * omverifiering-kromskalning.ts — reservlösningen i 3B (Jacob 2026-10-02).
 *
 * 3B-migreringen gav 717 av 1674 källor en baslinje från HELA sidan, eftersom
 * de saknar main, article och SiteVision-region. För dem kvarstod alltså
 * bruset 3B skulle bli kvitt. hashaInnehallsregion skalar nu bort kromet i
 * stället (sidhuvud, nav, sidfot, aside, landmärkesroller, brödsmulor,
 * cookierutor, script/style/noscript), och de källorna behöver en NY baslinje
 * från den hashen — annars flaggas alla 717 vid nästa cronkörning.
 *
 * Skriptet hämtar varje berörd källa TVÅ gånger, så stabiliteten mellan två
 * hämtningar kan mätas innan baslinjen skrivs. Ingenting flaggas.
 *
 * Kör: node scripts/omverifiering-kromskalning.ts [--torrkor]
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const TORRKOR = process.argv.includes('--torrkor');
const UA = 'Mozilla/5.0 (compatible; Foreningsguiden/1.0; +https://foreningsguiden.se/om/)';
const TIMEOUT_MS = 15000;
const SAMTIDIGA = 6;

const { hamtaAllaSignaturer } = await import('../src/lib/omverifiering.ts');
const { hashaInnehallsregion, plockaInnehallsregion } = await import('../src/lib/omverifieringLogik.ts');
const { Redis } = await import('@upstash/redis');
const redis = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! });

async function hamtaHtml(url: string): Promise<string | null> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { method: 'GET', redirect: 'follow', signal: c.signal, headers: { 'User-Agent': UA } });
    return r.ok ? await r.text() : null;
  } catch { return null; } finally { clearTimeout(t); }
}

// De 250 verkliga engångsändringarna lämnas orörda, precis som i
// 3B-migreringen — deras baslinje ska INTE rullas fram av en migrering.
const matning = JSON.parse(readFileSync('incoming/OMVERIFIERING_MATNING_2026-10-02.json', 'utf8'));
const verkligEngangs = new Set<string>(
  matning.andrade.filter((r: any) => r.helsidaLikaSenaste === true && r.helsidaLikaBaslinje === false).map((r: any) => r.url)
);

const alla = await hamtaAllaSignaturer();
const kandidater = alla.filter((s) => s.senasteUtfall !== 'otillganglig' && !verkligEngangs.has(s.url));
console.log(`${alla.length} signaturer. ${kandidater.length} kandidater (olästbara och verkliga ändringar uteslutna).`);

const nu = new Date().toISOString();
let i = 0, berorda = 0, stabila = 0, instabila = 0, misslyckade = 0, ejBerorda = 0;
const instabilaUrler: string[] = [];

await Promise.all(Array.from({ length: SAMTIDIGA }, async () => {
  for (;;) {
    const n = i++;
    if (n >= kandidater.length) return;
    const sig = kandidater[n];
    if ((n + 1) % 100 === 0) console.log(`  ${n + 1}/${kandidater.length}`);

    const html1 = await hamtaHtml(sig.url);
    if (html1 === null) { misslyckade++; continue; }
    // Bara källor UTAN avgränsad region berörs — de andra har redan rätt
    // baslinje ur 3B-migreringen.
    if (plockaInnehallsregion(html1).kalla !== 'helsida') { ejBerorda++; continue; }
    berorda++;

    const html2 = await hamtaHtml(sig.url);
    const h1 = hashaInnehallsregion(html1);
    const h2 = html2 === null ? null : hashaInnehallsregion(html2);
    const stabil = h2 !== null && h1.hash === h2.hash;
    if (stabil) stabila++; else { instabila++; instabilaUrler.push(sig.url); }

    if (!TORRKOR) {
      await redis.set(`omverif:kalla:${encodeURIComponent(sig.url)}`, {
        ...sig,
        baslinjeHash: h1.hash,
        senasteHash: h1.hash,
        senasteUtfall: 'oforandrad' as const,
        flaggadSedan: null,
        senasteForsok: nu,
        senastLyckad: nu,
        konsekutivaFel: 0,
      });
    }
  }
}));

const pct = (a: number, b: number) => (b === 0 ? '—' : `${((a / b) * 100).toFixed(1)} %`);
console.log(`\nKällor utan avgränsad region (kromskalade): ${berorda}`);
console.log(`  stabila mellan två hämtningar: ${stabila} (${pct(stabila, berorda)})`);
console.log(`  instabila:                     ${instabila} (${pct(instabila, berorda)})`);
console.log(`Källor med egen region (orörda): ${ejBerorda}`);
console.log(`Misslyckade hämtningar:          ${misslyckade}`);
if (instabilaUrler.length > 0) {
  console.log('\nInstabila (första 20):');
  for (const u of instabilaUrler.slice(0, 20)) console.log(`  ${u.slice(0, 110)}`);
}
writeFileSync('/tmp/kromskalning.json', JSON.stringify({ berorda, stabila, instabila, misslyckade, ejBerorda, instabilaUrler }, null, 1));
