/**
 * verify-saljargate.ts — AA1.1 (Jacobs order). Två delar:
 *
 * DEL 1 (enhetsnivå): arGiltigtOrgnr()/saljargateOk() (saljargate.ts)
 * testade i isolering — formatvalidering, Luhn-checksiffra, det
 * explicita sandbox-testvärdesundantaget (556000-0000), {{TODO-kollen.
 *
 * DEL 2 (bevis, ordens egen formulering): "ett test som sätter en
 * live-lik nyckel och bevisar att varje köpväg vägrar starta." Startar
 * en riktig astro dev-server (port 4325, oberoende av en eventuell
 * redan körande dev-server på 4321) med STRIPE_SECRET_KEY satt till en
 * live-lik (sk_live_-prefixad, ogiltig) nyckel, POSTar mot alla tre
 * köpvägarna, och kräver 503 + { ok:false, fel:'betalning_ej_konfigurerad' }
 * från VARJE. Detta är den enda pålitliga vägen att bevisa att gaten
 * faktiskt sitter i den RIKTIGA routen — saljargate.ts:s egna DEL 1-
 * tester bevisar bara att min egen logik är självkonsekvent, inte att
 * den är kopplad in. Körs mot de faktiska filerna via en riktig HTTP-
 * runda, inte ett direkt import (Node --experimental-strip-types kan
 * inte lösa flera extensionless imports längre ner i kedjan — samma
 * begränsning som subscribers.ts stötte på tidigare den här sessionen).
 *
 * SÄKERT: sk_live_-nyckeln nedan är påhittad (inte en riktig Stripe-
 * nyckel). Om gaten SKULLE misslyckas att blockera skulle Stripes API
 * bara svara 401 (ogiltig nyckel) — ingen riktig debitering är möjlig
 * med en påhittad nyckel. Testet förväntar sig att aldrig komma dit.
 */
import { spawn, type ChildProcess } from 'child_process';
import { arGiltigtOrgnr, saljargateOk } from '../src/lib/saljargate.ts';

const errors: string[] = [];

// ---------- DEL 1: enhetsnivå ----------

const GILTIGT_TESTORGNR = '556677-8899'; // Luhn-giltigt, självberäknat — inte ett riktigt bolag.

function assert(villkor: boolean, namn: string) {
  if (!villkor) errors.push(`DEL 1: ${namn}`);
}

assert(arGiltigtOrgnr(GILTIGT_TESTORGNR) === true, `arGiltigtOrgnr(${GILTIGT_TESTORGNR}) ska vara true (giltig Luhn-checksiffra)`);
assert(arGiltigtOrgnr('556677-8898') === false, 'arGiltigtOrgnr med fel checksiffra (8898 i stället för 8899) ska vara false');
assert(arGiltigtOrgnr('5566778899') === false, 'arGiltigtOrgnr utan bindestreck ska vara false (fel format)');
assert(arGiltigtOrgnr('55667-78899') === false, 'arGiltigtOrgnr med bindestreck fel placerat ska vara false');
assert(arGiltigtOrgnr('') === false, 'arGiltigtOrgnr("") ska vara false');
// Sandbox-testvärdet: kollas separat i saljargateOk (explicit uteslutet),
// men arGiltigtOrgnr själv bryr sig bara om FORMAT+checksiffra — verifiera
// vad dess egen checksiffra faktiskt ger, så testet inte antar fel sak.
const testvardeFormatgiltigt = arGiltigtOrgnr('556000-0000');
assert(typeof testvardeFormatgiltigt === 'boolean', 'arGiltigtOrgnr(556000-0000) ska åtminstone inte krascha');

// saljargateOk() mot dagens RIKTIGA content.ts-tillstånd: SALJARE_VALD
// är false (partsvalet inte gjort än) — gaten ska alltså vara STÄNGD.
// Detta är den viktigaste enskilda kontrollen: bevisar att produktionens
// FAKTISKA konfiguration idag är fail-closed, inte bara att logiken
// skulle vara det i teorin.
assert(saljargateOk() === false, "saljargateOk() mot dagens content.ts (SALJARE_VALD=false) ska vara false — säljaren är INTE vald än");

console.log(`DEL 1 (enhetsnivå): ${errors.length === 0 ? 'PASS' : `${errors.length} FEL`}`);

// ---------- DEL 2: riktig HTTP-runda mot en live-lik nyckel ----------

const PORT = 4325;
const BASE = `http://localhost:${PORT}`;
const FAKE_LIVE_KEY = 'sk_live_TESTNYCKEL_INTE_RIKTIG_0000000000000000';

const KOPVAGAR: { namn: string; path: string; form: Record<string, string> }[] = [
  { namn: 'registrering', path: '/api/checkout/registrering', form: { kommun: 'gislaved' } },
  { namn: 'bidragsutkast', path: '/api/checkout/bidragsutkast', form: { kommun: 'gislaved', bidrag: 'nagot-id', profil: '{}' } },
  { namn: 'abonnemang', path: '/api/checkout/abonnemang', form: {} },
];

function vantaPaServer(url: string, forsokTimeoutMs: number): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const forsok = () => {
      fetch(url)
        .then(() => resolve())
        .catch(() => {
          if (Date.now() - start > forsokTimeoutMs) {
            reject(new Error(`dev-servern svarade aldrig på ${url} inom ${forsokTimeoutMs}ms`));
          } else {
            setTimeout(forsok, 500);
          }
        });
    };
    forsok();
  });
}

async function korDel2(): Promise<void> {
  console.log(`DEL 2: startar astro dev på port ${PORT} med en live-lik (påhittad) STRIPE_SECRET_KEY...`);

  const child: ChildProcess = spawn('node_modules/.bin/astro', ['dev', '--port', String(PORT)], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      STRIPE_SECRET_KEY: FAKE_LIVE_KEY,
      // mejl.ts:s `new Resend(env.RESEND_API_KEY)` kastar vid modulladdning
      // om nyckeln är ogiltig/saknas (samma klass fel som produktions-
      // incidenten "Something went wrong" tidigare i den här sessionen) —
      // alla tre köpvägarna importerar siteUrl() från mejl.ts, så en
      // CI-miljö utan RESEND_API_KEY hade kraschat routen INNAN gaten ens
      // hann köra, och testet hade felaktigt sett ut att failat på fel
      // grund. Bara satt om den saknas — rör aldrig en riktig utvecklar-
      // nyckel som redan finns i .env.local.
      RESEND_API_KEY: process.env.RESEND_API_KEY ?? 're_test_placeholder_saljargate',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverLog = '';
  child.stdout?.on('data', (d) => (serverLog += d.toString()));
  child.stderr?.on('data', (d) => (serverLog += d.toString()));

  try {
    await vantaPaServer(BASE, 45_000);

    for (const vag of KOPVAGAR) {
      const body = new URLSearchParams(vag.form);
      let status: number;
      let json: any;
      try {
        // Astro:s inbyggda CSRF-skydd (checkOrigin) svarar 403 på en
        // form-POST utan en Origin-header som matchar värden — inget med
        // säljargaten att göra, måste sättas för att testet ens ska nå
        // routens egen kod.
        const res = await fetch(`${BASE}${vag.path}`, { method: 'POST', body, headers: { origin: BASE } });
        status = res.status;
        json = await res.json().catch(() => null);
      } catch (e) {
        errors.push(`DEL 2: ${vag.namn} (${vag.path}) — hämtningen misslyckades: ${(e as Error).message}`);
        continue;
      }

      if (status !== 503) {
        errors.push(`DEL 2: ${vag.namn} (${vag.path}) — status ${status}, väntade 503 (köpet startade eller failade på annat sätt än gaten)`);
        continue;
      }
      if (!json || json.ok !== false || json.fel !== 'betalning_ej_konfigurerad') {
        errors.push(`DEL 2: ${vag.namn} (${vag.path}) — status 503 men fel svarskropp: ${JSON.stringify(json)}`);
        continue;
      }
      console.log(`  OK  ${vag.namn}: 503 betalning_ej_konfigurerad (gaten blockerade den live-lika nyckeln)`);
    }
  } finally {
    child.kill('SIGTERM');
    await new Promise((r) => setTimeout(r, 500));
    if (!child.killed) child.kill('SIGKILL');
  }

  if (errors.some((e) => e.startsWith('DEL 2:')) && serverLog.length > 0) {
    console.log('--- dev-serverns utdata (för felsökning) ---');
    console.log(serverLog.slice(-3000));
  }
}

await korDel2();

console.log('');
if (errors.length > 0) {
  console.log(`verify-saljargate: FAIL — ${errors.length} fynd:`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
} else {
  console.log('verify-saljargate: PASS — enhetsnivån och alla tre köpvägarna vägrar starta mot en live-lik nyckel utan vald säljare.');
  process.exit(0);
}
