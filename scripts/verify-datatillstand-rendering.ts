// Uppföljning 2026-08-03 (punkt 5): "Ett test: fäller om ett värde med
// status okand renderas som ett påstående någonstans i utdatan."
// Uppdaterad ÅTGÄRDSSPEC T1/D1/T5 (samma kväll, fyra-lägesrevisionen —
// angivet/overifierat döpta om till olast/okand, D1 skärpt till
// verifierad + minst tre krav). Kräver att `npm run build` redan körts
// (dist/client finns).
//
// Tre konkreta invarianter, en per spärr som byggdes i samma svep:
// 1. Köprutan (station 5) länkar aldrig till ett bidrag som inte klarar
//    D1 (krav_status: verifierad OCH minst tre krav) — genereraUtkast()
//    har inget att strukturera annars (se KommunProgression.astro).
// 2. "Sen ansökan" renderas aldrig för ett bidrag med deadline_status:
//    okand — konsekvensen av att söka sent är meningslös utan en känd
//    deadline att vara sen mot (harRiktigSenAnsokanText).
// 3. Belopp med belopp_status: okand OCH belopp === null renderas
//    ALDRIG som rå text — VoidMark ("Ej angivet i källan") måste synas.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadKommuner } from '../src/lib/kommuner.ts';

const DIST_KOMMUN_DIR = join(process.cwd(), 'dist', 'client', 'kommun');

if (!existsSync(DIST_KOMMUN_DIR)) {
  console.error('dist/client/kommun saknas — kör `npm run build` innan detta test.');
  process.exit(1);
}

const kommuner = loadKommuner();
const problem: string[] = [];

for (const kommun of kommuner) {
  const indexPath = join(DIST_KOMMUN_DIR, kommun.kommun_slug, 'index.html');
  if (!existsSync(indexPath)) continue;
  const html = readFileSync(indexPath, 'utf-8');

  // --- Invariant 1: köprutans mål-href ---
  const kopRutaHrefMatch = html.match(/data-progression-kopruta-cta[^>]*href="([^"]+)"/)
    ?? html.match(/href="([^"]+)"[^>]*data-progression-kopruta-cta/);
  if (kopRutaHrefMatch) {
    const bidragIdMatch = kopRutaHrefMatch[1].match(/\/utkast\/([\w-]+)\/?$/);
    const bidragId = bidragIdMatch?.[1];
    const bidrag = kommun.bidrag.find((b) => b.id === bidragId);
    if (bidrag && !(bidrag.krav_status === 'kontrollast' && bidrag.krav.length >= 3)) {
      problem.push(`${kommun.kommun_slug}: köprutan länkar till ${bidrag.id} som inte klarar D1 (krav_status: ${bidrag.krav_status}, ${bidrag.krav.length} krav)`);
    }
  }

  // --- Invariant 2 & 3: per bidrag-kort ---
  for (const bidrag of kommun.bidrag) {
    const cardStart = html.indexOf(`id="bidrag-${bidrag.id}"`);
    if (cardStart === -1) continue;
    const cardEnd = html.indexOf('bidrag-card__cta', cardStart);
    const card = html.slice(cardStart, cardEnd === -1 ? cardStart + 4000 : cardEnd + 200);

    if (bidrag.deadline_status === 'okand' && /Sen ansökan/.test(card)) {
      problem.push(`${kommun.kommun_slug}/${bidrag.id}: "Sen ansökan" renderas trots deadline_status: okand`);
    }

    if (bidrag.belopp === null) {
      if (!card.includes('fg-void')) {
        problem.push(`${kommun.kommun_slug}/${bidrag.id}: belopp är null men VoidMark (.fg-void) syns inte i kortet`);
      }
    }
  }
}

if (problem.length === 0) {
  console.log(`Datatillstånd-renderingstest: ${kommuner.length} kommuner kontrollerade, inga påståenden om okända fält hittades.`);
  process.exit(0);
}

console.error(`Datatillstånd-renderingstest FAIL — ${problem.length} fynd:\n`);
for (const p of problem) console.error(`  ${p}`);
process.exit(1);
