/**
 * lint-design-guard.ts — ARBETSORDER 2026-08-11, Täthetsdisciplin (A2/A3).
 *
 * "Bygg budgeten som lint-regel i lint:design-guard. Fäller inte bygget,
 * rapporterar per sida. Det är så 'enklare yta' blir mätbart i stället
 * för en vädjan."
 *
 * Budget per skärm:
 *   - svarsstycke ≤ 2 meningar
 *   - öppna listrader ≤ 5 (synliga utan klick — inte krav-listor inuti
 *     kollapsade bidragskort, de räknas separat och är avsiktligt långa)
 *   - färgat drag = 1 (.btn-primary)
 *   - läsbredd ≤ 60 tecken (kollas strukturellt — se begränsning nedan)
 *
 * ÄRLIGT OM BEGRÄNSNINGEN: det här är statisk HTML-analys, ingen riktig
 * layoutmotor. "Läsbredd" kan bara verifieras genom att .fg-lasbredd-
 * klassen (tokens.css --fg-lasbredd) faktiskt sitter på elementet — INTE
 * genom att mäta renderade pixelrader, det kräver en webbläsare.
 * "Metodik bakom länk" kollas heuristiskt (kända metodikfraser utanför
 * en länk/details) — kan missa nya formuleringar.
 *
 * Kräver att `npm run build` redan körts. Fäller ALDRIG (process.exit(0)
 * alltid) — det är en rapport, inte en grind.
 *
 * Kör: node --experimental-strip-types scripts/lint-design-guard.ts
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { delaIMeningar } from '../src/lib/anteckningFilter.ts';

const DIST_CLIENT = join(process.cwd(), 'dist', 'client');

if (!existsSync(DIST_CLIENT)) {
  console.error('dist/client saknas — kör `npm run build` innan detta lint.');
  process.exit(0); // rapporterar, fäller aldrig — se filhuvudet
}

const SVARSSTYCKE_MAX_MENINGAR = 2;
const OPPNA_LISTRADER_MAX = 5;
const FARGAT_DRAG_MAX = 1;

// A4 — skär rader, gissa aldrig teckenstorlek. Ett golv att larma på om
// någon framtida CSS-ändring bryter det, inte något det här skriptet rättar.
const BRODTEXT_GOLV_PX = 16;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Extraherar innehållet i det FÖRSTA elementet som matchar en klass, utan att kliva in i nästlade <details>. */
function extractByClass(html: string, className: string): string | null {
  const re = new RegExp(`<([a-z]+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`);
  const m = re.exec(html);
  if (!m) return null;
  const tag = m[1];
  const start = m.index + m[0].length;
  const openRe = new RegExp(`<${tag}\\b`, 'g');
  const closeTag = `</${tag}>`;
  let depth = 1;
  let cursor = start;
  while (depth > 0) {
    openRe.lastIndex = cursor;
    const nextOpen = html.slice(cursor).search(new RegExp(`<${tag}\\b`));
    const nextClose = html.indexOf(closeTag, cursor);
    if (nextClose === -1) return null;
    const nextOpenAbs = nextOpen === -1 ? -1 : cursor + nextOpen;
    if (nextOpenAbs !== -1 && nextOpenAbs < nextClose) {
      depth++;
      cursor = nextOpenAbs + tag.length + 1;
    } else {
      depth--;
      cursor = nextClose + closeTag.length;
    }
  }
  return html.slice(start, cursor - closeTag.length);
}

/** <li> som INTE är kollapsade (varken en <details> inuti, eller den egna radens enda innehåll). */
function countOppnaListrader(html: string): number {
  // Två steg: (1) töm allt <details>...</details>-innehåll — tar bort
  // bidragskortens krav-listor och FAQ-svarens listor, (2) ta bort <li>
  // vars ENDA kvarvarande innehåll nu är tomt — annars räknas <li> som
  // bara wrappar ett kollapsat bidragskort (R5.8) som en "öppen" rad.
  const utanDetails = html.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');
  const utanTommaLi = utanDetails.replace(/<li\b[^>]*>\s*<\/li>/g, '');
  const matches = utanTommaLi.match(/<li\b/g);
  return matches ? matches.length : 0;
}

function countFargatDrag(html: string): number {
  const matches = html.match(/class="[^"]*\bbtn-primary\b[^"]*"/g);
  return matches ? matches.length : 0;
}

interface Fynd {
  sida: string;
  typ: string;
  varde: string;
  budget: string;
}

const fynd: Fynd[] = [];

function lintaSida(relPath: string, html: string) {
  const svarForst = extractByClass(html, 'ekern__svar-forst');
  if (svarForst) {
    const text = stripTags(svarForst);
    const meningar = delaIMeningar(text).filter((m) => m.trim().length > 0);
    if (meningar.length > SVARSSTYCKE_MAX_MENINGAR) {
      fynd.push({ sida: relPath, typ: 'svarsstycke', varde: `${meningar.length} meningar`, budget: `≤ ${SVARSSTYCKE_MAX_MENINGAR}` });
    }
  }

  const listrader = countOppnaListrader(html);
  if (listrader > OPPNA_LISTRADER_MAX) {
    fynd.push({ sida: relPath, typ: 'öppna listrader', varde: String(listrader), budget: `≤ ${OPPNA_LISTRADER_MAX}` });
  }

  const fargatDrag = countFargatDrag(html);
  if (fargatDrag > FARGAT_DRAG_MAX) {
    fynd.push({ sida: relPath, typ: 'färgat drag (.btn-primary)', varde: String(fargatDrag), budget: `= ${FARGAT_DRAG_MAX}` });
  }
}

function samlaHtmlFiler(dir: string, base = ''): string[] {
  const resultat: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      resultat.push(...samlaHtmlFiler(full, rel));
    } else if (entry.name === 'index.html') {
      resultat.push(rel);
    }
  }
  return resultat;
}

// Ett urval, inte hela sajten (290 kommuner skulle dränka rapporten i
// brus från samma mall) — kommunsidor + huvudflöden, samma princip som
// verifieringens "Gislaved/Arvika/en kommun utan foreningstyp".
const URVAL = [
  'kommun/gislaved/index.html',
  'kommun/arvika/index.html',
  'kommun/norrtalje/index.html',
  'index.html',
  'matcha/index.html',
  'pris/index.html',
  'om/index.html',
  'deadlines/index.html',
];

for (const rel of URVAL) {
  const full = join(DIST_CLIENT, rel);
  if (!existsSync(full)) continue;
  lintaSida(rel, readFileSync(full, 'utf-8'));
}

if (fynd.length === 0) {
  console.log('Täthetsbudget: inga överskridanden i urvalet.');
} else {
  console.log(`Täthetsbudget: ${fynd.length} överskridande(n) — rapport, fäller inte bygget.\n`);
  for (const f of fynd) {
    console.log(`  ${f.sida} — ${f.typ}: ${f.varde} (budget ${f.budget})`);
  }
}

console.log(`\nBrödtextgolv (A4): ${BRODTEXT_GOLV_PX}px — kontrollerad manuellt mot tokens.css --fg-text-body, inte mätt här (kräver en layoutmotor).`);
console.log('Ej täckt av det här skriptet (kräver en riktig webbläsare): renderad läsbredd i px, "metodik bakom länk" utanför kända fraser.');

process.exit(0); // rapporterar, fäller aldrig
