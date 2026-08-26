// Arbetsorder 2026-08-03, punkt 5 — REGRESSIONSSKYDD. Fäller om antalet
// bidrag för en kommun minskar mellan commits, om inte minskningen är
// uttryckligt markerad i commit-meddelandet (nyckelordet "minskning",
// skiftlägesokänsligt — samma ord Jacob själv använde i arbetsordern).
// Skyddet mot att en gammal gren pushas och tyst raderar GPT:s arbete
// (Gislaved 12 → 2, det verkliga incidentfallet arbetsordern citerar).
//
// Två lägen, körda från olika git-hooks (se scripts/git-hooks/):
//
//   --mot=<ref>
//     Jämför STAGAD data/kommuner/*.yaml mot <ref> (vanligtvis HEAD).
//     Hittas en minskning: skriver .git/BIDRAG_REGRESSION_PENDING.json
//     och skriver ut ett besked. Blockerar INGET själv — commit-msg-
//     hooken (nästa steg i git-kedjan) läser filen och avgör.
//
//   --kontrollera-meddelande=<path>
//     Läser .git/BIDRAG_REGRESSION_PENDING.json (om den finns) och
//     kollar om commit-meddelandet i <path> nämner "minskning". Saknas
//     ordet: exit 1, blockerar commiten. Städar bort markörfilen oavsett
//     utfall, så den aldrig läcker in i nästa commit.
//
//   --ci-mot=<ref>
//     CI-variant: jämför HEAD mot <ref> (branchens merge-base mot main),
//     och söker "minskning" i HELA committrångets meddelanden
//     (git log <ref>..HEAD).
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import * as yaml from 'js-yaml';

// git rev-parse --absolute-git-dir (INTE hårdkodat '.git/') — i en
// worktree är .git en FIL (gitdir-pekare), inte en katalog, och
// '.git/X.json' kraschar med ENOTDIR. Bugg hittad 2026-08-03 kväll när
// arbetet flyttades till en riktig worktree (fg-production-batch-01)
// efter att ha byggts och testats enbart i en fristående scratchpad-klon.
const GIT_DIR = execSync('git rev-parse --absolute-git-dir', { encoding: 'utf-8' }).trim();
const MARKER_PATH = `${GIT_DIR}/BIDRAG_REGRESSION_PENDING.json`;

interface Regression {
  kommun: string;
  fore: number;
  efter: number;
}

function bidragCount(yamlText: string): number | null {
  try {
    const doc = yaml.load(yamlText) as { bidrag?: unknown[] };
    return Array.isArray(doc?.bidrag) ? doc.bidrag.length : null;
  } catch {
    return null; // trasig YAML hanteras av schemavalideringen, inte detta skript
  }
}

// AA1.2 (Jacobs order, säkerhetsfynd): denna kallades tidigare ALLTID
// för `git diff --cached`, oavsett läge — även från --ci-mot-grenen.
// I en ren CI-checkout finns ingenting stagat (--cached är tomt), så
// hittaRegressioner() jämförde noll filer och rapporterade "inga
// regressioner" oavsett vad som FAKTISKT ändrats mellan ref och HEAD.
// Falskt grönt, varje gång. Två separata funktioner nu — en per läge,
// ingen kan råka anropas från fel gren.
function andradeKommunFilerStaged(): string[] {
  const out = execSync('git diff --cached --name-only --diff-filter=M -- data/kommuner/*.yaml', { encoding: 'utf-8' });
  return out.split('\n').map((l) => l.trim()).filter(Boolean);
}

function andradeKommunFilerMotRef(ref: string): string[] {
  const out = execSync(`git diff --name-only --diff-filter=M ${ref}..HEAD -- data/kommuner/*.yaml`, { encoding: 'utf-8' });
  return out.split('\n').map((l) => l.trim()).filter(Boolean);
}

function hittaRegressioner(mot: string, filer: string[]): Regression[] {
  const regressioner: Regression[] = [];
  for (const fil of filer) {
    let fore: string;
    try {
      fore = execSync(`git show ${mot}:${fil}`, { encoding: 'utf-8' });
    } catch {
      continue; // ny fil, inget att jämföra mot
    }
    const efter = readFileSync(fil, 'utf-8');
    const foreAntal = bidragCount(fore);
    const efterAntal = bidragCount(efter);
    if (foreAntal !== null && efterAntal !== null && efterAntal < foreAntal) {
      const kommunMatch = fil.match(/data\/kommuner\/(.+)\.yaml$/);
      regressioner.push({ kommun: kommunMatch?.[1] ?? fil, fore: foreAntal, efter: efterAntal });
    }
  }
  return regressioner;
}

const args = process.argv.slice(2);
const motArg = args.find((a) => a.startsWith('--mot='))?.slice('--mot='.length);
const meddelandeArg = args.find((a) => a.startsWith('--kontrollera-meddelande='))?.slice('--kontrollera-meddelande='.length);
const ciMotArg = args.find((a) => a.startsWith('--ci-mot='))?.slice('--ci-mot='.length);

if (motArg) {
  const regressioner = hittaRegressioner(motArg, andradeKommunFilerStaged());
  if (regressioner.length === 0) {
    if (existsSync(MARKER_PATH)) unlinkSync(MARKER_PATH);
    process.exit(0);
  }
  writeFileSync(MARKER_PATH, JSON.stringify(regressioner, null, 2));
  console.log('Regressionsskydd: bidragsantal minskar för:');
  for (const r of regressioner) console.log(`  ${r.kommun}: ${r.fore} → ${r.efter}`);
  console.log('Nämn "minskning" (och varför) i commit-meddelandet, annars blockeras commiten.');
  process.exit(0);
} else if (meddelandeArg) {
  if (!existsSync(MARKER_PATH)) process.exit(0);
  const regressioner: Regression[] = JSON.parse(readFileSync(MARKER_PATH, 'utf-8'));
  const meddelande = readFileSync(meddelandeArg, 'utf-8');
  unlinkSync(MARKER_PATH);
  if (regressioner.length === 0) process.exit(0);
  if (/minskning/i.test(meddelande)) process.exit(0);
  console.error('BLOCKERAD — bidragsantal minskar utan att "minskning" nämns i commit-meddelandet:');
  for (const r of regressioner) console.error(`  ${r.kommun}: ${r.fore} → ${r.efter}`);
  console.error('Lägg till en rad i meddelandet som nämner "minskning" och varför, om minskningen är avsedd.');
  process.exit(1);
} else if (ciMotArg) {
  const regressioner = hittaRegressioner(ciMotArg, andradeKommunFilerMotRef(ciMotArg));
  if (regressioner.length === 0) {
    console.log('Regressionsskydd (CI): inga bidragsminskningar.');
    process.exit(0);
  }
  const meddelanden = execSync(`git log ${ciMotArg}..HEAD --format=%B`, { encoding: 'utf-8' });
  if (/minskning/i.test(meddelanden)) {
    console.log('Regressionsskydd (CI): minskning hittad men markerad i commit-historiken:');
    for (const r of regressioner) console.log(`  ${r.kommun}: ${r.fore} → ${r.efter}`);
    process.exit(0);
  }
  console.error('BLOCKERAD (CI) — bidragsantal minskar utan att "minskning" nämns i någon commit i intervallet:');
  for (const r of regressioner) console.error(`  ${r.kommun}: ${r.fore} → ${r.efter}`);
  process.exit(1);
} else {
  console.error('Använd --mot=<ref>, --kontrollera-meddelande=<path> eller --ci-mot=<ref>.');
  process.exit(2);
}
