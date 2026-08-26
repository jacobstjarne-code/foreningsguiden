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
 *     kollapsade bidragskort, de räknas separat och är avsiktligt långa;
 *     och inte register/kravlistor markerade class="referenslista", se
 *     AB1.9 nedan — den budgeten gäller prosalistor, inte sidans
 *     faktiska strukturerade innehåll)
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
 * Kräver att `npm run build` redan körts.
 *
 * AB1.7 (Jacobs order, 2026-08-26): fällde tidigare ALDRIG (alltid
 * process.exit(0)) — ren rapport. De tre täthetsbudgetarna ovan fäller
 * nu bygget (process.exit(1)) om de överskrids på en av fem guldsidor
 * (GULDSIDOR nedan: förstasidan, /idrott/, en kommunsida, en
 * bidragssida, den nationella detaljsidan) eller om en guldsida saknas
 * i bygget. Resten av urvalet (OVRIGA_URVAL) och fällbart-utan-[open]-
 * kontrollen fortsätter rapportera, aldrig fälla.
 *
 * AB1.9 (Jacobs order, 2026-08-26): öppna-listrader-budgeten fällde på
 * Gislaveds bidragsregister (#alla-bidrag, 15 rader) och LOK-sidans krav/
 * sanktioner/perioder/källor (20 rader) — inget av det är prosa uppstyckad
 * i punkter, allt är sidans strukturerade faktiska innehåll. class=
 * "referenslista" (KommunSidaFull.astro:s #alla-bidrag, nationella-stod/
 * [id]/index.astro:s fyra listor) undantar dem helt från räkningen i
 * stället för att korta dem — se countOppnaListrader/removeAllByClass.
 *
 * FÄLLBART-VILLKOR (E5.1, 2026-08-12): tredje gången samma buggfamilj —
 * en display-egenskap satt utan [open]-villkor på ett element inuti
 * <details> upphäver webbläsarens inbyggda kollaps (R7.4:s ul.bidrag-list,
 * VarmSkarm.astro:s .varm-skarm__kort-lista). Den här delen är käll-
 * kodsbaserad (.astro + CSS), inte byggd HTML — bygget är redan kollapsat
 * korrekt av webbläsaren oavsett vad CSS:en säger, så bara källan avslöjar
 * regeln. Körs alltid, oavsett om dist/client finns.
 *
 * Kör: node --experimental-strip-types scripts/lint-design-guard.ts
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { delaIMeningar } from '../src/lib/anteckningFilter.ts';

const DIST_CLIENT = join(process.cwd(), 'dist', 'client');
const SRC_DIR = join(process.cwd(), 'src');

const distClientFinns = existsSync(DIST_CLIENT);
if (!distClientFinns) {
  console.error('dist/client saknas — de HTML-baserade kontrollerna (svarsstycke/listrader/färgat drag) hoppas över. Källkodskontrollen (fällbart-villkor) körs ändå.');
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

/** Djup-medveten borttagning av VARJE element vars öppningstagg bär en given klass — samma teknik som extractByClass, men river bort alla träffar i stället för att returnera en. */
function removeAllByClass(html: string, className: string): string {
  const re = new RegExp(`<([a-z]+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`);
  let result = html;
  let m: RegExpExecArray | null;
  while ((m = re.exec(result))) {
    const tag = m[1];
    const closeTag = `</${tag}>`;
    let depth = 1;
    let cursor = m.index + m[0].length;
    while (depth > 0) {
      const nextOpen = result.slice(cursor).search(new RegExp(`<${tag}\\b`));
      const nextClose = result.indexOf(closeTag, cursor);
      if (nextClose === -1) break;
      const nextOpenAbs = nextOpen === -1 ? -1 : cursor + nextOpen;
      if (nextOpenAbs !== -1 && nextOpenAbs < nextClose) {
        depth++;
        cursor = nextOpenAbs + tag.length + 1;
      } else {
        depth--;
        cursor = nextClose + closeTag.length;
      }
    }
    result = result.slice(0, m.index) + result.slice(cursor);
  }
  return result;
}

/** <li> som INTE är kollapsade, inte är sidnavigation (brödsmulor räknas inte som "innehåll"), och inte tillhör en referenslista. */
function countOppnaListrader(html: string): number {
  // Fyra steg: (1) töm <nav>...</nav> — brödsmulor är strukturell
  // chrome på varje sida, inte ett skärmspecifikt innehållsval, (2) töm
  // <details>...</details> — bidragskortens krav-listor och FAQ-svaren,
  // (3) töm class="referenslista" (AB1.9, Jacobs order): "Radbudgeten om
  // fem öppna rader gäller prosalistor, inte register eller kravlistor
  // — Gislaveds bidragsregister och LOK-sidans kravlista är sidans
  // innehåll, och att korta dem är att dölja." Register/kravlistor är
  // strukturerad, uppräknelig faktadata (varje <li> en distinkt post —
  // ett bidrag, ett krav, en sanktionsnivå, en källa), inte prosa
  // uppstyckad i punkter för att kringgå räkningen — det senare är vad
  // budgeten faktiskt ska fånga. (4) ta bort <li> vars ENDA kvarvarande
  // innehåll nu är tomt — annars räknas <li> som bara wrappar ett
  // kollapsat bidragskort (R5.8) som en "öppen" rad.
  const utanNav = html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, '');
  const utanDetails = utanNav.replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');
  const utanReferenslistor = removeAllByClass(utanDetails, 'referenslista');
  const utanTommaLi = utanReferenslistor.replace(/<li\b[^>]*>\s*<\/li>/g, '');
  const matches = utanTommaLi.match(/<li\b/g);
  return matches ? matches.length : 0;
}

function countFargatDrag(html: string): number {
  const matches = html.match(/class="[^"]*\bbtn-primary\b[^"]*"/g);
  return matches ? matches.length : 0;
}

// --- Fällbart-villkor: display satt utan [open] på <details>-barn ---------

interface CssRegel {
  selector: string;
  body: string;
}

/** Enkel djup-medveten CSS-parser. @-regler (@media m.fl.) beskrivs inte
 * som en regel i sig — vi kliver ner i deras kropp så de inre reglerna
 * fångas precis som toppnivå-regler. */
function parseCssRules(css: string, regler: CssRegel[] = []): CssRegel[] {
  const utanKommentarer = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let cursor = 0;
  while (cursor < utanKommentarer.length) {
    const braceIdx = utanKommentarer.indexOf('{', cursor);
    if (braceIdx === -1) break;
    const prelude = utanKommentarer.slice(cursor, braceIdx).trim();
    let depth = 1;
    let j = braceIdx + 1;
    while (j < utanKommentarer.length && depth > 0) {
      if (utanKommentarer[j] === '{') depth++;
      else if (utanKommentarer[j] === '}') depth--;
      j++;
    }
    const body = utanKommentarer.slice(braceIdx + 1, j - 1);
    if (prelude.startsWith('@')) {
      parseCssRules(body, regler);
    } else if (prelude) {
      regler.push({ selector: prelude, body });
    }
    cursor = j;
  }
  return regler;
}

/** Tar bort HTML-kommentarer och Astro/JSX-mallkommentarer INNAN detaljblock
 * söks — annars matchar startRe en bokstavlig "<details>" som bara nämns i
 * ett dokumentationsstycke (hände i BidragCard.astro rad 57) som om den vore
 * riktig markup, vilket förfalskar hela block-avgränsningen därefter. */
function stripAstroComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function extractStyleBlocks(source: string): string {
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/g;
  const delar: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) delar.push(m[1]);
  return delar.join('\n');
}

/** <details>...</details>, djup-medveten (samma teknik som extractByClass). */
function extractDetailsBlocks(source: string): string[] {
  const block: string[] = [];
  const startRe = /<details\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(source))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let cursor = start;
    while (depth > 0) {
      const nextOpenRel = source.slice(cursor).search(/<details\b/);
      const nextClose = source.indexOf('</details>', cursor);
      if (nextClose === -1) { cursor = source.length; break; }
      const nextOpenAbs = nextOpenRel === -1 ? -1 : cursor + nextOpenRel;
      if (nextOpenAbs !== -1 && nextOpenAbs < nextClose) {
        depth++;
        cursor = nextOpenAbs + '<details'.length;
      } else {
        depth--;
        cursor = nextClose + '</details>'.length;
      }
    }
    block.push(source.slice(start, Math.max(start, cursor - '</details>'.length)));
    startRe.lastIndex = cursor;
  }
  return block;
}

/** Klassnamn ur EN tagg-attributsträng (mellan taggnamn och `>`), inte hela blocket —
 * annars fångar vi klasser på barnbarn, vilket är fel nivå (se filhuvud-kommentar). */
function extractClassNamesFromAttrs(attrs: string): string[] {
  const namn = new Set<string>();
  const attrRe = /class="([^"]*)"/;
  const m = attrRe.exec(attrs);
  if (m) for (const cls of m[1].split(/\s+/)) if (cls) namn.add(cls);
  // class:list={[ 'a', cond && 'b' ]} — plocka citerade strängar heuristiskt.
  const listM = /class:list=\{[^}]*\}/.exec(attrs);
  if (listM) {
    const strRe = /['"]([^'"]+)['"]/g;
    let sm: RegExpExecArray | null;
    while ((sm = strRe.exec(listM[0]))) {
      for (const cls of sm[1].split(/\s+/)) if (cls) namn.add(cls);
    }
  }
  return [...namn];
}

/** Direkta barn-taggar av ett <details>-block (djup 0), <summary> undantagen —
 * det är BARA dessa webbläsaren döljer när <details> saknar [open]. En klass
 * djupare ner ärver dolt-läget av sin förälder oavsett egen display-regel,
 * så att kolla hela blocket (som v1 gjorde) gav 40+ falska träffar. */
function extractDirectChildren(block: string): { tag: string; attrs: string }[] {
  const tagRe = /<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let depth = 0;
  const barn: { tag: string; attrs: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(block))) {
    const isClose = m[0].startsWith('</');
    const isSelfClose = /\/\s*>$/.test(m[0]);
    if (isClose) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0 && m[1] !== 'summary') barn.push({ tag: m[1], attrs: m[2] });
    if (!isSelfClose) depth++;
  }
  return barn;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function samlaAstroFiler(dir: string): string[] {
  const resultat: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) resultat.push(...samlaAstroFiler(full));
    else if (entry.name.endsWith('.astro')) resultat.push(full);
  }
  return resultat;
}

function lintFallbartUtanOppenVillkor() {
  const globalCssPath = join(SRC_DIR, 'styles', 'global.css');
  const globalCss = existsSync(globalCssPath) ? readFileSync(globalCssPath, 'utf-8') : '';
  const globalaRegler = parseCssRules(globalCss);

  for (const filPath of samlaAstroFiler(SRC_DIR)) {
    const source = stripAstroComments(readFileSync(filPath, 'utf-8'));
    const detailsBlock = extractDetailsBlocks(source);
    if (detailsBlock.length === 0) continue;

    const lokalaRegler = parseCssRules(extractStyleBlocks(source));
    const allaRegler = [...lokalaRegler, ...globalaRegler];
    const relPath = filPath.replace(process.cwd() + '/', '');

    const kolladeElement = new Set<string>();
    for (const block of detailsBlock) {
      for (const barn of extractDirectChildren(block)) {
        const klasser = extractClassNamesFromAttrs(barn.attrs);
        if (klasser.length === 0) continue;
        const elementNyckel = klasser.slice().sort().join(' ');
        if (kolladeElement.has(elementNyckel)) continue;
        kolladeElement.add(elementNyckel);

        const matchandeRegler = allaRegler.filter((regel) =>
          klasser.some((klass) => new RegExp(`\\.${escapeRegExp(klass)}(?![\\w-])`).test(regel.selector))
        );

        // Om NÅGON regel (villkorad eller ej) gömmer elementet är mönstret
        // redan säkert — t.ex. bas-klass + modifier-klass där modifiern
        // default:ar till none (VarmSkarms fixade .varm-skarm__kort-lista--
        // resten). Flagga bara när ingen regel alls sätter none.
        const harNagonNoneRegel = matchandeRegler.some((regel) => {
          const dm = /display\s*:\s*([a-zA-Z-]+)/.exec(regel.body);
          return dm && dm[1].trim().toLowerCase() === 'none';
        });
        if (harNagonNoneRegel) continue;

        const ovillkoradIckeNone = matchandeRegler.find((regel) => {
          if (/\[open\]/i.test(regel.selector)) return false;
          const dm = /display\s*:\s*([a-zA-Z-]+)/.exec(regel.body);
          return dm && dm[1].trim().toLowerCase() !== 'none';
        });
        if (!ovillkoradIckeNone) continue;

        const dm = /display\s*:\s*([a-zA-Z-]+)/.exec(ovillkoradIckeNone.body)!;
        // AB1.7: alltid rapport, aldrig blockerande — en annan bugg-
        // klass (strukturell CSS-korrekthet) än guldsidornas
        // täthetsbudget, och källkodsbaserad (hela src/, inte de fem
        // sidorna) så "blockerande" hade inte varit meningsfullt scopat.
        fynd.push({
          sida: relPath,
          typ: 'fällbart innehåll utan [open]-villkor',
          varde: `<${barn.tag} class="${klasser.join(' ')}"> — display: ${dm[1].trim()} i "${ovillkoradIckeNone.selector.trim()}", ingen display:none-regel någonstans för elementet`,
          budget: 'direkt barn till <details> (ej <summary>) ska ha minst en display:none-regel, annars villkoras med [open]',
          blockerar: false,
        });
      }
    }
  }
}

interface Fynd {
  sida: string;
  typ: string;
  varde: string;
  budget: string;
  blockerar: boolean;
}

const fynd: Fynd[] = [];

// AB1.7 (Jacobs order): skriptet rapporterade alltid, fällde aldrig — tio
// avvikelser kunde ligga kvar obemärkt. De tre täthetsbudgetarna
// (svarsstycke/listrader/färgat drag) blir nu blockerande, men BARA på
// fem guldsidor — resten av sajten (290 kommuner, alla bidragssidor)
// fortsätter rapportera som förut. Grinden ska bevisa att disciplinen
// håller där det syns mest, inte drunkna i brus från hela corpuset.
function lintaSida(relPath: string, html: string, blockerar: boolean) {
  const svarForst = extractByClass(html, 'ekern__svar-forst');
  if (svarForst) {
    const text = stripTags(svarForst);
    const meningar = delaIMeningar(text).filter((m) => m.trim().length > 0);
    if (meningar.length > SVARSSTYCKE_MAX_MENINGAR) {
      fynd.push({ sida: relPath, typ: 'svarsstycke', varde: `${meningar.length} meningar`, budget: `≤ ${SVARSSTYCKE_MAX_MENINGAR}`, blockerar });
    }
  }

  const listrader = countOppnaListrader(html);
  if (listrader > OPPNA_LISTRADER_MAX) {
    fynd.push({ sida: relPath, typ: 'öppna listrader', varde: String(listrader), budget: `≤ ${OPPNA_LISTRADER_MAX}`, blockerar });
  }

  const fargatDrag = countFargatDrag(html);
  if (fargatDrag > FARGAT_DRAG_MAX) {
    fynd.push({ sida: relPath, typ: 'färgat drag (.btn-primary)', varde: String(fargatDrag), budget: `= ${FARGAT_DRAG_MAX}`, blockerar });
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

// AB1.7 (Jacobs order): fem guldsidor där de tre täthetsbudgetarna
// (svarsstycke/listrader/färgat drag) FÄLLER bygget — förstasidan,
// /idrott/, en kommunsida, en bidragssida, den nationella detaljsidan.
const GULDSIDOR = [
  'index.html',
  'idrott/index.html',
  'kommun/gislaved/index.html',
  'kommun/gislaved/bidrag/gislaved-startbidrag/index.html',
  'nationella-stod/lok-stod/index.html',
];

// Resten av urvalet — samma sidor som innan AB1.7, men bara rapport,
// aldrig blockerande. 290 kommuner skulle dränka rapporten i brus från
// samma mall, samma princip som verifieringens "Gislaved/Arvika/en
// kommun utan foreningstyp".
const OVRIGA_URVAL = [
  'kommun/arvika/index.html',
  'kommun/norrtalje/index.html',
  'matcha/index.html',
  'pris/index.html',
  'om/index.html',
  'deadlines/index.html',
];

let guldsidaSaknas = false;

if (distClientFinns) {
  for (const rel of GULDSIDOR) {
    const full = join(DIST_CLIENT, rel);
    if (!existsSync(full)) {
      console.error(`GULDSIDA SAKNAS I BYGGET: ${rel} — kan inte kontrolleras, byggfel snarare än en täthetsavvikelse.`);
      guldsidaSaknas = true;
      continue;
    }
    lintaSida(rel, readFileSync(full, 'utf-8'), true);
  }
  for (const rel of OVRIGA_URVAL) {
    const full = join(DIST_CLIENT, rel);
    if (!existsSync(full)) continue;
    lintaSida(rel, readFileSync(full, 'utf-8'), false);
  }
}

// Källkodsbaserad, kräver inte dist/client — körs alltid.
lintFallbartUtanOppenVillkor();

const blockerandeFynd = fynd.filter((f) => f.blockerar);
const rapportFynd = fynd.filter((f) => !f.blockerar);

if (fynd.length === 0) {
  console.log('Täthetsbudget: inga överskridanden i urvalet.');
} else {
  if (blockerandeFynd.length > 0) {
    console.log(`Täthetsbudget: ${blockerandeFynd.length} BLOCKERANDE överskridande(n) på guldsidorna:\n`);
    for (const f of blockerandeFynd) {
      console.log(`  ${f.sida} — ${f.typ}: ${f.varde} (budget ${f.budget})`);
    }
    console.log('');
  }
  if (rapportFynd.length > 0) {
    console.log(`Täthetsbudget: ${rapportFynd.length} överskridande(n) utanför guldsidorna — rapport, fäller inte bygget.\n`);
    for (const f of rapportFynd) {
      console.log(`  ${f.sida} — ${f.typ}: ${f.varde} (budget ${f.budget})`);
    }
  }
}

console.log(`\nBrödtextgolv (A4): ${BRODTEXT_GOLV_PX}px — kontrollerad manuellt mot tokens.css --fg-text-body, inte mätt här (kräver en layoutmotor).`);
console.log('Ej täckt av det här skriptet (kräver en riktig webbläsare): renderad läsbredd i px, "metodik bakom länk" utanför kända fraser.');

// AB1.7 (Jacobs order): fällde ALDRIG (alltid exit 0) — tio avvikelser
// kunde stå kvar obemärkt. De tre täthetsbudgetarna fäller nu på de fem
// guldsidorna (index/idrott/en kommunsida/en bidragssida/den nationella
// detaljsidan); en saknad guldsida (byggfel) fäller lika hårt. Resten av
// urvalet, och fällbart-utan-[open]-kontrollen, fortsätter bara rapportera.
if (blockerandeFynd.length > 0 || guldsidaSaknas) {
  console.log(`\nGULDSIDEGRIND: ${blockerandeFynd.length} blockerande fynd${guldsidaSaknas ? ' + minst en saknad guldsida' : ''} — fäller bygget.`);
  process.exit(1);
}
process.exit(0);
