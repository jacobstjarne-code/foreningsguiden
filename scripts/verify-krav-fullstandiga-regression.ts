// Jacobs uppföljning 2026-08-03 (efter datatillstånd-sammanslagningen) —
// REGRESSIONSSKYDD för krav_fullstandiga. Samma mönster som
// verify-ingen-bidrag-regression.ts (bidragsantal), men för ett annat
// incidentfall: krav_fullstandiga (true ELLER false, ÅTGÄRDSSPEC C7 —
// tre värden: true=komplett, false=ofullständigt, null=obedömt) kan
// BARA sättas till ett icke-null värde av ett researchpass som faktiskt
// läst normdokumentet — till skillnad från belopp_status/deadline_status/
// krav_status (som är mekaniska, härledda ur om fältet har ett värde) är
// krav_fullstandiga en bedömning som inte går att räkna om. Just därför
// är den UNDANTAGEN från omrakna-datatillstand.ts (se den filens
// huvudkommentar, gäller null lika mycket som true/false) — men
// undantaget skyddar bara mot skriptet självt, inte mot en framtida
// bugg i ett annat skript, en dålig merge, eller en hand-redigering som
// råkar ta bort raden. Detta skript är det oberoende skyddsnätet (D4:
// "En körning som minskar antalet icke-null krav_fullstandiga ska
// fällas"): fäller om en bidragspost som HADE ett icke-null värde
// (true eller false) tappar det till null, om inte ändringen
// uttryckligt markeras i commit-meddelandet.
//
// Samma tre lägen som verify-ingen-bidrag-regression.ts, se den filen för
// den fulla förklaringen av hook-kedjan.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';

// git rev-parse --absolute-git-dir (INTE hårdkodat '.git/') — samma
// worktree-bugg som verify-ingen-bidrag-regression.ts, se den filens
// kommentar.
const GIT_DIR = execSync('git rev-parse --absolute-git-dir', { encoding: 'utf-8' }).trim();
const MARKER_PATH = `${GIT_DIR}/KRAV_FULLSTANDIGA_REGRESSION_PENDING.json`;

interface Regression {
  kommun: string;
  bidragId: string;
}

function kravFullstandigaIds(yamlText: string): Set<string> | null {
  try {
    const doc = yaml.load(yamlText) as { bidrag?: { id: string; krav_fullstandiga?: unknown }[] };
    if (!Array.isArray(doc?.bidrag)) return null;
    return new Set(doc.bidrag.filter((b) => b.krav_fullstandiga === true || b.krav_fullstandiga === false).map((b) => b.id));
  } catch {
    return null; // trasig YAML hanteras av schemavalideringen, inte detta skript
  }
}

function andradeKommunFiler(): string[] {
  const out = execSync('git diff --cached --name-only --diff-filter=M -- data/kommuner/*.yaml', { encoding: 'utf-8' });
  return out.split('\n').map((l) => l.trim()).filter(Boolean);
}

function hittaRegressioner(mot: string): Regression[] {
  const regressioner: Regression[] = [];
  for (const fil of andradeKommunFiler()) {
    let fore: string;
    try {
      fore = execSync(`git show ${mot}:${fil}`, { encoding: 'utf-8' });
    } catch {
      continue; // ny fil, inget att jämföra mot
    }
    const efter = readFileSync(fil, 'utf-8');
    const foreIds = kravFullstandigaIds(fore);
    const efterIds = kravFullstandigaIds(efter);
    if (!foreIds || !efterIds) continue;
    const kommunMatch = fil.match(/data\/kommuner\/(.+)\.yaml$/);
    const kommun = kommunMatch?.[1] ?? fil;
    for (const id of foreIds) {
      if (!efterIds.has(id)) regressioner.push({ kommun, bidragId: id });
    }
  }
  return regressioner;
}

const args = process.argv.slice(2);
const motArg = args.find((a) => a.startsWith('--mot='))?.slice('--mot='.length);
const meddelandeArg = args.find((a) => a.startsWith('--kontrollera-meddelande='))?.slice('--kontrollera-meddelande='.length);
const ciMotArg = args.find((a) => a.startsWith('--ci-mot='))?.slice('--ci-mot='.length);

if (motArg) {
  const regressioner = hittaRegressioner(motArg);
  if (regressioner.length === 0) {
    if (existsSync(MARKER_PATH)) unlinkSync(MARKER_PATH);
    process.exit(0);
  }
  writeFileSync(MARKER_PATH, JSON.stringify(regressioner, null, 2));
  console.log('Regressionsskydd: krav_fullstandiga (icke-null) tappat till null för:');
  for (const r of regressioner) console.log(`  ${r.kommun} — ${r.bidragId}`);
  console.log('Nämn "minskning" (och varför) i commit-meddelandet, annars blockeras commiten.');
  process.exit(0);
} else if (meddelandeArg) {
  if (!existsSync(MARKER_PATH)) process.exit(0);
  const regressioner: Regression[] = JSON.parse(readFileSync(MARKER_PATH, 'utf-8'));
  const meddelande = readFileSync(meddelandeArg, 'utf-8');
  unlinkSync(MARKER_PATH);
  if (regressioner.length === 0) process.exit(0);
  if (/minskning/i.test(meddelande)) process.exit(0);
  console.error('BLOCKERAD — krav_fullstandiga (icke-null) tappat till null utan att "minskning" nämns i commit-meddelandet:');
  for (const r of regressioner) console.error(`  ${r.kommun} — ${r.bidragId}`);
  console.error('Lägg till en rad i meddelandet som nämner "minskning" och varför, om ändringen är avsedd.');
  process.exit(1);
} else if (ciMotArg) {
  const regressioner = hittaRegressioner(ciMotArg);
  if (regressioner.length === 0) {
    console.log('Regressionsskydd (CI): ingen krav_fullstandiga-förlust.');
    process.exit(0);
  }
  const meddelanden = execSync(`git log ${ciMotArg}..HEAD --format=%B`, { encoding: 'utf-8' });
  if (/minskning/i.test(meddelanden)) {
    console.log('Regressionsskydd (CI): förlust hittad men markerad i commit-historiken:');
    for (const r of regressioner) console.log(`  ${r.kommun} — ${r.bidragId}`);
    process.exit(0);
  }
  console.error('BLOCKERAD (CI) — krav_fullstandiga (icke-null) tappat till null utan att "minskning" nämns i någon commit i intervallet:');
  for (const r of regressioner) console.error(`  ${r.kommun} — ${r.bidragId}`);
  process.exit(1);
} else {
  console.error('Använd --mot=<ref>, --kontrollera-meddelande=<path> eller --ci-mot=<ref>.');
  process.exit(2);
}
