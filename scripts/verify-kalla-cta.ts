// Arbetsorder 2026-08-03, punkt 2b — "Lägg ett test som fäller när fotnot
// och knapp pekar olika." Kollar den FAKTISKT byggda HTML:en (inte bara
// funktionen bidragAnsokningsUrl i isolering) — det är där regressionen
// skulle synas om någon råkade lägga tillbaka kommun.ansokningssystem.url
// på ett anropsställe. Kräver att `npm run build` redan körts (dist/client
// finns) — samma förutsättning som resten av byggverifieringen.
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const DIST_KOMMUN_DIR = join(process.cwd(), 'dist', 'client', 'kommun');

if (!existsSync(DIST_KOMMUN_DIR)) {
  console.error('dist/client/kommun saknas — kör `npm run build` innan detta test.');
  process.exit(1);
}

function extractCards(html: string): string[] {
  // Toppnivå-<li class="bidrag-card...">...</li> med korrekt djupspårning
  // (krav-listan inuti kortet har egna <li>, ett naivt indexOf('</li>')
  // skulle klippa av vid FÖRSTA krav-punkten i stället för kortets slut).
  const cards: string[] = [];
  let pos = 0;
  while (true) {
    const start = html.indexOf('<li class="bidrag-card', pos);
    if (start === -1) break;
    let depth = 1;
    let cursor = start + 1;
    while (depth > 0) {
      const nextOpen = html.indexOf('<li', cursor);
      const nextClose = html.indexOf('</li>', cursor);
      if (nextClose === -1) break;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + 3;
      } else {
        depth--;
        cursor = nextClose + 5;
      }
    }
    cards.push(html.slice(start, cursor));
    pos = cursor;
  }
  return cards;
}

let checked = 0;
const mismatches: string[] = [];

for (const slug of readdirSync(DIST_KOMMUN_DIR)) {
  const indexPath = join(DIST_KOMMUN_DIR, slug, 'index.html');
  if (!existsSync(indexPath)) continue;
  const html = readFileSync(indexPath, 'utf-8');
  const alldelIdx = html.indexOf('id="alla-bidrag"');
  if (alldelIdx === -1) continue;

  for (const card of extractCards(html.slice(alldelIdx))) {
    const namnMatch = card.match(/<h3>(.*?)<\/h3>/);
    const kallaMatch = card.match(/Källa:\s*<a[^>]*href="([^"]+)"/);
    const ctaMatch = card.match(/href="([^"]+)"\s*class="btn-primary bidrag-card__cta"/);
    if (!kallaMatch || !ctaMatch) continue; // pausat/avskaffat bidrag saknar CTA — inget att jämföra
    checked++;
    if (kallaMatch[1] !== ctaMatch[1]) {
      mismatches.push(`${slug} — ${namnMatch?.[1] ?? '?'}: källa=${kallaMatch[1]} cta=${ctaMatch[1]}`);
    }
  }
}

if (mismatches.length === 0) {
  console.log(`Kalla/CTA-test: ${checked} bidragskort kontrollerade, alla stämmer.`);
  process.exit(0);
}

console.error(`Kalla/CTA-test FAIL — ${mismatches.length} kort där knappen INTE pekar dit fotnoten säger:\n`);
for (const m of mismatches) console.error(`  ${m}`);
process.exit(1);
