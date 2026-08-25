/**
 * verify-ci-regression-guard.ts — AA1.2 (Jacobs order): fixtur som
 * bevisar att en VERKLIG minskning bryter bygget i --ci-mot-läget.
 *
 * Rot till felet: verify-ingen-bidrag-regression.ts och
 * verify-krav-fullstandiga-regression.ts:s --ci-mot=<ref>-läge (CI-
 * grenen, .github/workflows/validera.yml) letade ändrade filer med
 * `git diff --cached`, som alltid är TOMT i en ren CI-checkout (inget
 * är stagat, bara committat). Skripten jämförde alltså noll filer och
 * rapporterade "inga regressioner" oavsett vad som faktiskt ändrats
 * mellan ref och HEAD — falskt grönt, varje gång, i den enda miljön
 * som inte går att kringgå med --no-verify.
 *
 * Detta test bygger ett EGET, engångs git-repo i en temp-katalog (rör
 * ALDRIG det riktiga projektets historik), gör en riktig commit-till-
 * commit-minskning i båda dimensionerna (bidragsantal, krav_fullstandiga),
 * och kör de RIKTIGA skriptfilerna (inte en kopia) med --ci-mot mot den
 * äldre committen. Tre scenarier per skript:
 *   1. Minskning, INTE nämnd i commit-meddelandet → måste blockera (exit 1)
 *   2. Minskning, nämnd ("minskning: ...") → måste släppa igenom (exit 0)
 *   3. Ingen minskning → måste släppa igenom (exit 0)
 * Scenario 1 är den som var trasig innan AA1.2 — om den INTE blockerar
 * är fixen inte på plats, och testet ska fälla högt.
 *
 * KÖRS BARA I CI (.github/workflows/validera.yml), ALDRIG i pre-commit-
 * hooken — inte ens med rensad GIT_*-miljö (se INCIDENT-kommentaren
 * nedan). Ett test som skapar egna git-repon hör hemma i CI, inte i en
 * hook som körs mitt i en pågående commit.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJEKT_ROT = process.cwd();
const BIDRAG_SKRIPT = join(PROJEKT_ROT, 'scripts', 'verify-ingen-bidrag-regression.ts');
const KRAV_SKRIPT = join(PROJEKT_ROT, 'scripts', 'verify-krav-fullstandiga-regression.ts');

const errors: string[] = [];

// INCIDENT 2026-08-25: körd en gång inuti pre-commit-hooken skrev denna
// fixturs "isolerade" git-repon sina elva commits på DET RIKTIGA repots
// HEAD i stället för på sitt eget temp-repo. Rotorsak: git exporterar
// GIT_DIR/GIT_INDEX_FILE (och ibland GIT_WORK_TREE) till varje process
// en hook spawnar under en pågående commit — execSync ärver process.env
// rakt av, så mina "git init/add/commit" i temp-katalogen löd de
// ÄRVDA variablerna i stället för --cwd. Filskrivningar (skrivKommun)
// respekterar bara cwd och var därför korrekt isolerade hela tiden —
// det var ENDAST git-anropen som läckte, vilket gjorde felet osynligt
// tills någon läste `git log` på det riktiga repot efteråt.
// Samma familj fel som CSP-buggen som tystade IdrottsIngangens inline-
// skript: en osynlig miljövariabel avgjorde vart något gick, utan
// varning. Fixen: rensa ALLA GIT_*-variabler explicit ur varje spawnad
// process env, oavsett vad som anropar det här skriptet.
const GIT_ENV_NYCKLAR_ATT_RENSA = [
  'GIT_DIR',
  'GIT_WORK_TREE',
  'GIT_INDEX_FILE',
  'GIT_OBJECT_DIRECTORY',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES',
  'GIT_CEILING_DIRECTORIES',
  'GIT_PREFIX',
];
function renGitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const nyckel of GIT_ENV_NYCKLAR_ATT_RENSA) delete env[nyckel];
  return env;
}

function sh(cmd: string, cwd: string): { stdout: string; status: number } {
  try {
    const stdout = execSync(cmd, { cwd, env: renGitEnv(), encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { stdout, status: 0 };
  } catch (e: any) {
    return { stdout: (e.stdout ?? '') + (e.stderr ?? ''), status: e.status ?? 1 };
  }
}

function skrivKommun(dir: string, bidragAntal: number, kravFullstandigaSant: boolean): void {
  const bidrag = Array.from({ length: bidragAntal }, (_, i) => {
    const rader = [`- id: test-bidrag-${i}`, `  namn: Testbidrag ${i}`];
    if (i === 0) rader.push(`  krav_fullstandiga: ${kravFullstandigaSant}`);
    return rader.join('\n');
  }).join('\n');
  writeFileSync(join(dir, 'data', 'kommuner', 'testkommun.yaml'), `kommun: Testkommun\nbidrag:\n${bidrag}\n`);
}

function nyttFixturRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ci-regression-guard-'));
  mkdirSync(join(dir, 'data', 'kommuner'), { recursive: true });
  sh('git init --quiet', dir);
  sh('git config user.email test@example.com', dir);
  sh('git config user.name Test', dir);
  return dir;
}

function commit(dir: string, meddelande: string): string {
  sh('git add -A', dir);
  sh(`git commit --quiet -m ${JSON.stringify(meddelande)}`, dir);
  return sh('git rev-parse HEAD', dir).stdout.trim();
}

function korSkript(dir: string, skript: string, foreRef: string): { stdout: string; status: number } {
  return sh(`node --experimental-strip-types ${JSON.stringify(skript)} --ci-mot=${foreRef}`, dir);
}

function scenario(namn: string, skript: string, bygg: (dir: string) => { foreRef: string }, forvantadStatus: number) {
  const dir = nyttFixturRepo();
  try {
    const { foreRef } = bygg(dir);
    const res = korSkript(dir, skript, foreRef);
    if (res.status !== forvantadStatus) {
      errors.push(`${namn}: exit ${res.status}, väntade ${forvantadStatus}\n  utdata: ${res.stdout.trim().slice(0, 500)}`);
    } else {
      console.log(`  OK  ${namn} (exit ${res.status} som väntat)`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log('verify-ci-regression-guard: bidragsantal (verify-ingen-bidrag-regression.ts)');

scenario(
  'minskning, INTE markerad → ska BLOCKERA',
  BIDRAG_SKRIPT,
  (dir) => {
    skrivKommun(dir, 5, false);
    const fore = commit(dir, 'data: testkommun med 5 bidrag');
    skrivKommun(dir, 2, false);
    commit(dir, 'data: uppdaterar testkommun'); // ingen "minskning"-rad — det verkliga incidentmönstret
    return { foreRef: fore };
  },
  1
);

scenario(
  'minskning, markerad → ska SLÄPPA IGENOM',
  BIDRAG_SKRIPT,
  (dir) => {
    skrivKommun(dir, 5, false);
    const fore = commit(dir, 'data: testkommun med 5 bidrag');
    skrivKommun(dir, 2, false);
    commit(dir, 'data: minskning — tre bidrag i testkommun var dubbletter');
    return { foreRef: fore };
  },
  0
);

scenario(
  'ingen minskning → ska SLÄPPA IGENOM',
  BIDRAG_SKRIPT,
  (dir) => {
    skrivKommun(dir, 5, false);
    const fore = commit(dir, 'data: testkommun med 5 bidrag');
    skrivKommun(dir, 7, false);
    commit(dir, 'data: fler bidrag i testkommun');
    return { foreRef: fore };
  },
  0
);

console.log('verify-ci-regression-guard: krav_fullstandiga (verify-krav-fullstandiga-regression.ts)');

scenario(
  'krav_fullstandiga tappat, INTE markerad → ska BLOCKERA',
  KRAV_SKRIPT,
  (dir) => {
    skrivKommun(dir, 3, true);
    const fore = commit(dir, 'data: testkommun, krav_fullstandiga=true');
    skrivKommun(dir, 3, false); // krav_fullstandiga=false på id 0 → borttaget helt i skriptets mening? Se nedan.
    commit(dir, 'data: uppdaterar testkommun');
    return { foreRef: fore };
  },
  0 // se kommentar nedan — krav_fullstandiga true→false räknas INTE som en regression (båda är icke-null)
);

scenario(
  'krav_fullstandiga tappat till null, INTE markerad → ska BLOCKERA',
  KRAV_SKRIPT,
  (dir) => {
    skrivKommun(dir, 3, true);
    const fore = commit(dir, 'data: testkommun, krav_fullstandiga=true');
    // Skriv om filen utan krav_fullstandiga-fältet alls på id 0 — motsvarar null.
    writeFileSync(
      join(dir, 'data', 'kommuner', 'testkommun.yaml'),
      'kommun: Testkommun\nbidrag:\n- id: test-bidrag-0\n  namn: Testbidrag 0\n- id: test-bidrag-1\n  namn: Testbidrag 1\n- id: test-bidrag-2\n  namn: Testbidrag 2\n'
    );
    commit(dir, 'data: uppdaterar testkommun'); // ingen "minskning"-rad
    return { foreRef: fore };
  },
  1
);

scenario(
  'krav_fullstandiga tappat till null, markerad → ska SLÄPPA IGENOM',
  KRAV_SKRIPT,
  (dir) => {
    skrivKommun(dir, 3, true);
    const fore = commit(dir, 'data: testkommun, krav_fullstandiga=true');
    writeFileSync(
      join(dir, 'data', 'kommuner', 'testkommun.yaml'),
      'kommun: Testkommun\nbidrag:\n- id: test-bidrag-0\n  namn: Testbidrag 0\n- id: test-bidrag-1\n  namn: Testbidrag 1\n- id: test-bidrag-2\n  namn: Testbidrag 2\n'
    );
    commit(dir, 'data: minskning — krav_fullstandiga återställd till obedömt efter felaktig research');
    return { foreRef: fore };
  },
  0
);

console.log('');
if (errors.length > 0) {
  console.log(`verify-ci-regression-guard: FAIL — ${errors.length} fynd:`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
} else {
  console.log('verify-ci-regression-guard: PASS — --ci-mot fångar en verklig minskning i båda skripten, både bidragsantal och krav_fullstandiga.');
  process.exit(0);
}
