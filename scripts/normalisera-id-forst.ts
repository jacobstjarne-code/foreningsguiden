/**
 * normalisera-id-forst.ts — ENGÅNGSSKRIPT (Jacob 2026-10-02).
 *
 * Skriver om alla filer i data/kommuner/ så att `id` är FÖRSTA nyckeln i
 * varje bidrag och varje forutsattning. Inga värden ändras, bara
 * nyckelordningen.
 *
 * Varför: filerna blandar två format. I de flesta står `- id:` först, i
 * andra (lomma.yaml, nybro.yaml, hagfors.yaml m.fl.) står `id:` sist i
 * posten. Varje skript som läser "fälten efter id-raden" eller söker bakåt
 * efter postens början kopplar då fält till fel bidrag. Det har kostat tre
 * separata lagningar av samma hjälpare under 2026 (se commit-meddelandet).
 *
 * Kör: node scripts/normalisera-id-forst.ts [--torrkor]
 *
 * Kontroll efteråt: bygg om och jämför dist/client/kommun-data/*.json mot
 * en kopia tagen före. De ska vara BYTEIDENTISKA — JSON-serialiseringen
 * följer objektens nyckelordning, så ett identiskt resultat bevisar att
 * ingenting annat än YAML-radernas ordning rörts.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const TORRKOR = process.argv.includes('--torrkor');
const KATALOG = 'data/kommuner';

/**
 * Flyttar id-raden först i varje list-item under den angivna nyckeln.
 * Arbetar på RADER, inte på ett parsat träd — en yaml.dump skulle
 * normalisera citering, radbrytning och ankare i hela filen och göra
 * diffen oläslig. Här rör vi bara radordningen.
 */
function idForst(rader: string[], listnyckel: string): { rader: string[]; flyttade: number } {
  const start = rader.findIndex((l) => l.rstrip?.() === listnyckel || l.replace(/\s+$/, '') === `${listnyckel}:`);
  if (start === -1) return { rader, flyttade: 0 };

  // Listindraget: första '- '-raden efter nyckeln.
  let li = -1;
  for (let i = start + 1; i < rader.length; i++) {
    if (rader[i].trim().startsWith('- ')) { li = rader[i].length - rader[i].trimStart().length; break; }
    if (rader[i].trim() !== '' && !rader[i].startsWith(' ')) break; // nästa toppnyckel
  }
  if (li === -1) return { rader, flyttade: 0 };

  const itemStart = (i: number) =>
    rader[i].startsWith(' '.repeat(li) + '- ') && rader[i].length - rader[i].trimStart().length === li;

  // Listans slut: första icke-tomma raden med mindre indrag än li.
  let slut = rader.length;
  for (let i = start + 1; i < rader.length; i++) {
    const indrag = rader[i].length - rader[i].trimStart().length;
    if (rader[i].trim() !== '' && indrag < li) { slut = i; break; }
  }

  const gransar: number[] = [];
  for (let i = start + 1; i < slut; i++) if (itemStart(i)) gransar.push(i);
  gransar.push(slut);

  const ut = rader.slice(0, start + 1);
  let flyttade = 0;
  for (let n = 0; n < gransar.length - 1; n++) {
    const block = rader.slice(gransar[n], gransar[n + 1]);
    const fi = li + 2;
    const idIndex = block.findIndex((l) => new RegExp(`^(${' '.repeat(li)}- |${' '.repeat(fi)})id:`).test(l));
    if (idIndex === -1 || idIndex === 0) { ut.push(...block); continue; }

    // id-raden står inte först. Plocka ut den, gör den till list-item-raden,
    // och gör den gamla första raden till en vanlig fältrad.
    const idRad = block[idIndex].trim().replace(/^- /, ''); // "id: slug"
    const forsta = block[0].slice(li + 2); // texten efter "- "
    const kvar = block.filter((_, i) => i !== idIndex && i !== 0);
    ut.push(`${' '.repeat(li)}- ${idRad}`, `${' '.repeat(fi)}${forsta}`, ...kvar);
    flyttade++;
  }
  ut.push(...rader.slice(slut));
  return { rader: ut, flyttade };
}

let filer = 0, bidragFlyttade = 0, forutsattningarFlyttade = 0, andradeFiler: string[] = [];
for (const fil of readdirSync(KATALOG).filter((f) => f.endsWith('.yaml')).sort()) {
  const vag = `${KATALOG}/${fil}`;
  const original = readFileSync(vag, 'utf8');
  let rader = original.split('\n');
  const a = idForst(rader, 'bidrag');
  rader = a.rader;
  const b = idForst(rader, 'forutsattningar');
  rader = b.rader;
  filer++;
  bidragFlyttade += a.flyttade;
  forutsattningarFlyttade += b.flyttade;
  const ny = rader.join('\n');
  if (ny !== original) {
    andradeFiler.push(`${fil} (${a.flyttade} bidrag, ${b.flyttade} forutsattningar)`);
    if (!TORRKOR) writeFileSync(vag, ny);
  }
}

console.log(`${filer} filer lästa.`);
console.log(`${andradeFiler.length} filer ${TORRKOR ? 'skulle skrivas om' : 'omskrivna'}: ${bidragFlyttade} bidrag + ${forutsattningarFlyttade} forutsattningar fick id först.`);
for (const f of andradeFiler) console.log(`  ${f}`);
