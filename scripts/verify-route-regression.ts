/**
 * verify-route-regression.ts — AB1.2 (Jacobs order, dependency-uppgraderingar):
 * "Kör full ruttregression efteråt — 6 154 URL:er ska fortfarande svara
 * 200." Läser den BYGGDA sitemapen (dist/client/sitemap-0.xml — kräver
 * att `npm run build` redan körts) och hämtar varenda URL mot en riktig
 * astro dev-server, med begränsad parallellism. Rapporterar exakt vilka
 * URL:er som inte gav 200, aldrig en generisk "regression failed".
 *
 * Samma ASTRO_DEV_BACKGROUND=0-fynd som verify-saljargate.ts/
 * e2e-andra-svar.ts (Astro 7: bakgrundsläge för AI-agenter kan annars
 * få child.kill() att döda fel process och lämna en föräldralös server).
 *
 * Kör: npm run verify:route-regression
 */
import { spawn, type ChildProcess } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PORT = 4341;
const BASE = `http://localhost:${PORT}`;
const CONCURRENCY = 24;
const SITEMAP_PATH = join(process.cwd(), 'dist', 'client', 'sitemap-0.xml');

if (!existsSync(SITEMAP_PATH)) {
  console.error(`verify-route-regression: FAIL — ${SITEMAP_PATH} saknas. Kör \`npm run build\` först.`);
  process.exit(1);
}

const xml = readFileSync(SITEMAP_PATH, 'utf-8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error('verify-route-regression: FAIL — 0 URL:er i sitemapen, regexen matchar troligen inte längre dess form.');
  process.exit(1);
}
console.log(`${urls.length} URL:er i sitemapen.`);

function vantaPaServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const forsok = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > timeoutMs) reject(new Error(`dev-servern svarade aldrig på ${url} inom ${timeoutMs}ms`));
          else setTimeout(forsok, 500);
        });
    };
    forsok();
  });
}

const child: ChildProcess = spawn('node_modules/.bin/astro', ['dev', '--port', String(PORT)], {
  cwd: process.cwd(),
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
child.stdout?.on('data', (d) => (serverLog += d.toString()));
child.stderr?.on('data', (d) => (serverLog += d.toString()));

const fel: string[] = [];

try {
  console.log(`Startar astro dev på port ${PORT}...`);
  await vantaPaServer(BASE, 45_000);

  let klara = 0;
  let queue = [...urls];
  async function arbetare() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) continue;
      const parsed = new URL(url);
      const localUrl = `${BASE}${parsed.pathname}${parsed.search}`;
      try {
        const res = await fetch(localUrl, { redirect: 'manual' });
        if (res.status !== 200) fel.push(`${res.status} — ${parsed.pathname}${parsed.search}`);
      } catch (e) {
        fel.push(`FETCH-FEL (${(e as Error).message}) — ${parsed.pathname}${parsed.search}`);
      }
      klara++;
      if (klara % 1000 === 0) console.log(`  ${klara}/${urls.length}...`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => arbetare()));
} finally {
  child.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 500));
  if (!child.killed) child.kill('SIGKILL');
  if (fel.length > 0 && serverLog.length > 0) {
    console.log('--- dev-serverns utdata (för felsökning) ---');
    console.log(serverLog.slice(-3000));
  }
}

console.log('');
if (fel.length === 0) {
  console.log(`verify-route-regression: PASS — alla ${urls.length} URL:er svarade 200.`);
  process.exit(0);
} else {
  console.log(`verify-route-regression: FAIL — ${fel.length} av ${urls.length} URL:er svarade INTE 200:`);
  for (const f of fel.slice(0, 50)) console.log(`  ${f}`);
  if (fel.length > 50) console.log(`  ... och ${fel.length - 50} till.`);
  process.exit(1);
}
