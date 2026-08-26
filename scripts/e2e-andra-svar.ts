/**
 * e2e-andra-svar.ts — AA1.3 (Jacobs order, riktig bugg + E2E-krav:
 * "annars återkommer den"). Reproducerar och verifierar fixen för:
 *
 *   Sparad profil med Falun, öppna /matcha/, tryck "Ändra svar".
 *   Fråga ett visas med Falun vald och bara "Byt". Ingen väg framåt
 *   utan att välja om samma kommun.
 *
 * Rot: goStep(1) (klicket på "Ändra svar"/omstartKnapp) bytte bara
 * vilket <div data-tratt-steg> som var synligt — den rörde ALDRIG
 * kommunfrågans EGNA delvy (kommunväljaren vs. den hopfällda
 * "Vald: X / Byt"-raden). En returnerande session hade redan kört
 * visaValdKommun() vid sidladdning, så väljaren var dold — och enda
 * vägen tillbaka till den gick via "Byt", inte via "Ändra svar" eller
 * "Tillbaka" (samma bugg, matcha/index.astro tillbakaKnapp).
 *
 * Fix (matcha/index.astro, goStep()): landar man på steg 1 visas
 * kommunväljaren alltid, samma väg som Byt-knappen redan använder.
 * Strukturell fix i goStep() själv, inte en patch per knapp.
 *
 * Startar en riktig astro dev-server (port 4329) och kör hela flödet
 * i en riktig webbläsare (Playwright/Chromium) — samma
 * spawn-astro-dev-mönster som verify-saljargate.ts DEL 2, redan
 * beprövat i det här repot.
 */
import { spawn, type ChildProcess } from 'child_process';
import { chromium } from 'playwright';

const PORT = 4329;
const BASE = `http://localhost:${PORT}`;
const errors: string[] = [];

function assert(villkor: boolean, namn: string) {
  console.log(`${villkor ? 'OK  ' : 'FAIL'}  ${namn}`);
  if (!villkor) errors.push(namn);
}

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
  // AB1.2 (Astro 6→7-uppgraderingen): se verify-saljargate.ts:s kommentar
  // om samma fynd — ASTRO_DEV_BACKGROUND=0 håller processen detta skript
  // spawnar i förgrunden, så child.kill() nedan faktiskt dödar servern.
  env: { ...process.env, ASTRO_DEV_BACKGROUND: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
child.stdout?.on('data', (d) => (serverLog += d.toString()));
child.stderr?.on('data', (d) => (serverLog += d.toString()));

try {
  console.log(`Startar astro dev på port ${PORT}...`);
  await vantaPaServer(BASE, 45_000);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/matcha/`);
    await page.evaluate(() => {
      const profil = {
        kommunSlug: 'falun',
        verksamhet: [],
        storlek: null,
        alder: null,
        sokt: null,
        uppdaterad: new Date().toISOString(),
        foreningsnamn: null,
        giltighet: null,
        bevakadeBidrag: [],
      };
      localStorage.setItem('foreningsguiden:foreningsprofil:v2', JSON.stringify(profil));
    });
    await page.reload();
    await page.waitForTimeout(800); // hamtaKommunData() är async

    const beskedSynligt = await page.isHidden('[data-tratt-besked]').then((h) => !h);
    assert(beskedSynligt, 'Returnerande session med sparad kommun (Falun) hoppar till besked (steg 4)');

    await page.click('[data-tratt-omstart]');
    await page.waitForTimeout(200);

    const steg1Synligt = await page.isHidden('[data-tratt-steg="1"]').then((h) => !h);
    assert(steg1Synligt, '"Ändra svar" tar till steg 1 (frågan syns)');

    const valjareSynlig = await page.isHidden('[data-tratt-kommunvaljare]').then((h) => !h);
    const valdRadSynlig = await page.isHidden('[data-tratt-kommun-vald]').then((h) => !h);
    assert(valjareSynlig, 'Kommunväljaren (riktig, klickbar fråga) är synlig efter "Ändra svar" — INTE bara "Vald: Falun"');
    assert(!valdRadSynlig, 'Den hopfällda "Vald: X / Byt"-raden är INTE synlig (skulle blockera vägen framåt)');

    await page.fill('[data-kommunvaljare-input]', 'Falun');
    const falunLank = page.locator('[data-kommunvaljare-kommun][data-slug="falun"]').first();
    await falunLank.waitFor({ state: 'visible', timeout: 5000 });
    await falunLank.click();
    await page.waitForTimeout(700); // 450ms auto-advance + marginal

    const steg2Synligt = await page.isHidden('[data-tratt-steg="2"]').then((h) => !h);
    assert(steg2Synligt, 'Väljer man kommunen på nytt avancerar det korrekt till fråga 2 (ingen dödläge)');

    // Samma underliggande bugg skulle träffa "Tillbaka" (steg 2 → 1) identiskt.
    await page.click('[data-tratt-tillbaka]');
    await page.waitForTimeout(200);
    const valjareSynligEfterTillbaka = await page.isHidden('[data-tratt-kommunvaljare]').then((h) => !h);
    assert(valjareSynligEfterTillbaka, '"Tillbaka" från steg 2 till steg 1 visar också kommunväljaren (samma rotfix)');
  } finally {
    await browser.close();
  }
} finally {
  child.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 500));
  if (!child.killed) child.kill('SIGKILL');
  if (errors.length > 0 && serverLog.length > 0) {
    console.log('--- dev-serverns utdata (för felsökning) ---');
    console.log(serverLog.slice(-3000));
  }
}

console.log('');
if (errors.length > 0) {
  console.log(`e2e-andra-svar: FAIL — ${errors.length} fynd: ${errors.join(' | ')}`);
  process.exit(1);
} else {
  console.log('e2e-andra-svar: PASS — "Ändra svar" och "Tillbaka" leder båda till en genuint redigerbar fråga 1, ingen dödläge.');
  process.exit(0);
}
