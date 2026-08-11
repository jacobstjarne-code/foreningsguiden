// Arbetsorder 2026-08-03, punkt 2b — "Lägg ett test som fäller när fotnot
// och knapp pekar olika." Kollar den FAKTISKT byggda HTML:en (inte bara
// funktionen bidragAnsokningsUrl i isolering) — det är där regressionen
// skulle synas om någon råkade lägga tillbaka kommun.ansokningssystem.url
// på ett anropsställe. Kräver att `npm run build` redan körts (dist/client
// finns) — samma förutsättning som resten av byggverifieringen.
//
// D1/D2 (ARBETSORDER 2026-08-11): bidragets fulla innehåll (källa + CTA)
// flyttade från kommunsidans fällda <li class="bidrag-card"> till bidragets
// EGNA S2-sida (/kommun/[slug]/bidrag/[bidragId]/) — BidragDjup.astro,
// samma komponent, ny plats. Skriptet skannar nu dit i stället. Ett bidrag
// per sida, ingen multi-kort-djupspårning behövs längre (den gamla
// extractCards() fanns bara för att flera fällda kort låg i SAMMA fil).
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST_KOMMUN_DIR = join(process.cwd(), 'dist', 'client', 'kommun');

if (!existsSync(DIST_KOMMUN_DIR)) {
  console.error('dist/client/kommun saknas — kör `npm run build` innan detta test.');
  process.exit(1);
}

let checked = 0;
const mismatches: string[] = [];

for (const slug of readdirSync(DIST_KOMMUN_DIR)) {
  const bidragDir = join(DIST_KOMMUN_DIR, slug, 'bidrag');
  if (!existsSync(bidragDir)) continue;

  for (const bidragId of readdirSync(bidragDir)) {
    const indexPath = join(bidragDir, bidragId, 'index.html');
    if (!existsSync(indexPath)) continue;
    const html = readFileSync(indexPath, 'utf-8');

    const kallaMatch = html.match(/Källa:\s*<a[^>]*href="([^"]+)"/);
    // A5.2 (2026-08-11): CTA-knappen bytte klass (btn-primary → fg-btn--ghost,
    // ett drag per sida). Matcha på bidrag-card__cta + href oavsett
    // klassordning eller vilken knappstil som gäller just nu — annars
    // tystnar testet igen nästa gång knappstilen ändras (samma fälla som
    // hände här: 0 kort kontrollerade räknades som "alla stämmer").
    const ctaMatch = html.match(/<a\s+href="([^"]+)"\s+class="[^"]*\bbidrag-card__cta\b[^"]*"/);
    if (!kallaMatch || !ctaMatch) continue; // pausat/avskaffat bidrag saknar CTA — inget att jämföra
    checked++;
    if (kallaMatch[1] !== ctaMatch[1]) {
      mismatches.push(`${slug}/${bidragId}: källa=${kallaMatch[1]} cta=${ctaMatch[1]}`);
    }
  }
}

// A5.2-regressionen (2026-08-11): en trasig extraktionsregex fick `checked`
// att stanna på 0 medan `mismatches.length === 0` ändå var sant — ett grönt
// falskt godkännande. 0 kontrollerade kort är alltid ett testfel, aldrig
// "inget att jämföra".
if (checked === 0) {
  console.error('Kalla/CTA-test FAIL — 0 bidragskort kontrollerade. Extraktionsregexen (namn/källa/CTA) matchar troligen inte längre den byggda markupen.');
  process.exit(1);
}

if (mismatches.length === 0) {
  console.log(`Kalla/CTA-test: ${checked} bidragskort kontrollerade, alla stämmer.`);
  process.exit(0);
}

console.error(`Kalla/CTA-test FAIL — ${mismatches.length} kort där knappen INTE pekar dit fotnoten säger:\n`);
for (const m of mismatches) console.error(`  ${m}`);
process.exit(1);
