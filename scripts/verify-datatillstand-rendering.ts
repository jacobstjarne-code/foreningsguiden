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
// A6.2 (2026-08-11) — samma fälla som verify-kalla-cta.ts: invariant 2/3
// hoppar tyst över ett bidrag (`continue`) om cardStart===-1, dvs. om
// id="bidrag-X"-strängen inte hittas i den byggda HTML:en (t.ex. efter
// en markupändring). Utan en egen räknare skulle ALLA bidrag kunna
// missas tyst och problem.length===0 ändå läsas som ett godkännande —
// kommuner.length (loopens YTTRE räknare) bevisar bara att filer
// öppnades, inte att någon kort-invariant faktiskt kontrollerades.
let kortKontrollerade = 0;

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
    kortKontrollerade++;
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

if (kortKontrollerade === 0) {
  console.error('Datatillstånd-renderingstest FAIL — 0 bidragskort kontrollerade. id="bidrag-X"-strängen matchar troligen inte längre den byggda markupen.');
  process.exit(1);
}

if (problem.length === 0) {
  console.log(`Datatillstånd-renderingstest: ${kommuner.length} kommuner, ${kortKontrollerade} bidragskort kontrollerade, inga påståenden om okända fält hittades.`);
  process.exit(0);
}

console.error(`Datatillstånd-renderingstest FAIL — ${problem.length} fynd:\n`);
for (const p of problem) console.error(`  ${p}`);
process.exit(1);
