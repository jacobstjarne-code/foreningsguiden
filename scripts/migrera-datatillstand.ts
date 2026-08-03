// Arbetsorder 2026-08-03, punkt 2 — MIGRATION, körs EN gång, committas.
// Lägger till belopp_status/deadline_status/krav_status/krav_fullstandiga
// på varje bidrag, och giltighet_status på varje förutsättning, i ALLA
// data/kommuner/*.yaml. Regel (Jacobs egen, ordagrant):
//   fältet har ett värde  → status = angivet
//   fältet är null        → status = overifierat
//   Ingen null blir ingen_regel — det kan bara ett researchpass sätta.
//
// Textbaserad insättning (INTE yaml.load+dump) — ett round-trip via
// js-yaml skriver om citattecken, nyckelordning och radbrytningar för
// hela filen, vilket hade gett en oläsbar diff och krockat med GPT:s
// parallella redigeringar av SAMMA filer. I stället: parsa för att
// BERÄKNA värdena, men patcha in nya rader textuellt direkt efter varje
// bidrags/förutsättnings kalla_url-rad (finns exakt en gång per post,
// verifierat 2026-08-03 — aldrig flerradig, alltid ett rent
// "kalla_url: https://...").
//
// Självverifiering per fil: den patchade texten måste parsa som giltig
// YAML OCH ge exakt lika många bidrag/förutsättningar som originalet,
// annars skrivs filen INTE och skriptet avbryter — hellre stanna än
// halvskriva 290 filer.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const DIR = 'data/kommuner';
const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));

const counts = {
  belopp: { angivet: 0, overifierat: 0 },
  deadline: { angivet: 0, overifierat: 0 },
  krav: { angivet: 0, overifierat: 0 },
  giltighet: { angivet: 0, overifierat: 0 },
};

let filerAndrade = 0;
let bidragAndrade = 0;
let forutsattningarAndrade = 0;

for (const file of files) {
  const path = `${DIR}/${file}`;
  const originalText = readFileSync(path, 'utf-8');
  const doc = yaml.load(originalText) as { bidrag?: any[]; forutsattningar?: any[] };

  const lines = originalText.split('\n');
  const output: string[] = [];

  let section: 'none' | 'bidrag' | 'forutsattningar' = 'none';
  let bidragIdx = -1;
  let forutsattningIdx = -1;

  for (const line of lines) {
    output.push(line);

    if (/^bidrag:\s*$/.test(line)) {
      section = 'bidrag';
      bidragIdx = -1;
      continue;
    }
    if (/^forutsattningar:\s*$/.test(line)) {
      section = 'forutsattningar';
      forutsattningIdx = -1;
      continue;
    }
    // Ett nytt 0-indenterat toppnyckel-fält avslutar bidrag/forutsattningar-
    // sektionen. VIKTIGT: vissa filer (t.ex. gislaved.yaml) har 0-indenterade
    // listobjekt ("- id: ...") direkt under bidrag:/forutsattningar: — de
    // börjar också med ett icke-blankt tecken (bindestrecket) men är INTE
    // en ny toppnyckel. Kräver bokstav/understreck direkt, inte "-".
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:|^forutsattningar:/.test(line)) {
      section = 'none';
    }

    // Nytt listobjekt = ny bidrag-/forutsattning-post — OAVSETT vilket
    // fält som råkar stå FÖRST i posten. Bugg hittad 2026-08-03: flera
    // filer (t.ex. almhult.yaml) har "- namn: ..." med id: sist i posten
    // i stället för "- id: ..." — ett snävare mönster missade 531 av
    // 2802 bidrag helt (531 tysta noll-insättningar, självverifieringen
    // fångade det INTE eftersom bidrag-antalet per fil ändå stämde).
    // Säkert generellt mönster: bara bidrag/forutsattningar är listor av
    // FLERFÄLTSOBJEKT i det här schemat — kategori/krav/datum är listor
    // av rena strängar (inget "- ord:" däri), så "- vad_som_helst:" kan
    // aldrig vara något annat än en ny post i just dessa två sektioner.
    const nyttListobjekt = /^(\s*)- \w+:/.test(line);
    if (nyttListobjekt && section === 'bidrag') bidragIdx++;
    if (nyttListobjekt && section === 'forutsattningar') forutsattningIdx++;

    const kallaMatch = line.match(/^(\s*)kalla_url:/);
    if (!kallaMatch) continue;
    const indent = kallaMatch[1];

    if (section === 'bidrag' && bidragIdx >= 0 && doc.bidrag?.[bidragIdx]) {
      const b = doc.bidrag[bidragIdx];
      const beloppStatus = b.belopp !== null && b.belopp !== undefined ? 'angivet' : 'overifierat';
      const deadlineStatus = b.deadlines?.typ === 'okand' ? 'overifierat' : 'angivet';
      const kravStatus = Array.isArray(b.krav) && b.krav.length > 0 ? 'angivet' : 'overifierat';
      counts.belopp[beloppStatus]++;
      counts.deadline[deadlineStatus]++;
      counts.krav[kravStatus]++;
      output.push(`${indent}belopp_status: ${beloppStatus}`);
      output.push(`${indent}deadline_status: ${deadlineStatus}`);
      output.push(`${indent}krav_status: ${kravStatus}`);
      output.push(`${indent}krav_fullstandiga: null`);
      bidragAndrade++;
    } else if (section === 'forutsattningar' && forutsattningIdx >= 0 && doc.forutsattningar?.[forutsattningIdx]) {
      const f = doc.forutsattningar[forutsattningIdx];
      const giltighetStatus = f.giltighet !== null && f.giltighet !== undefined ? 'angivet' : 'overifierat';
      counts.giltighet[giltighetStatus]++;
      output.push(`${indent}giltighet_status: ${giltighetStatus}`);
      forutsattningarAndrade++;
    }
  }

  const patchedText = output.join('\n');

  // Självverifiering — se filhuvudet.
  let patchedDoc: { bidrag?: unknown[]; forutsattningar?: unknown[] };
  try {
    patchedDoc = yaml.load(patchedText) as typeof patchedDoc;
  } catch (e) {
    console.error(`AVBRYTER — ${file} blev ogiltig YAML efter patchning: ${(e as Error).message}`);
    process.exit(1);
  }
  const originalBidragCount = doc.bidrag?.length ?? 0;
  const patchedBidragCount = patchedDoc.bidrag?.length ?? 0;
  const originalForutsattningCount = doc.forutsattningar?.length ?? 0;
  const patchedForutsattningCount = patchedDoc.forutsattningar?.length ?? 0;
  if (originalBidragCount !== patchedBidragCount || originalForutsattningCount !== patchedForutsattningCount) {
    console.error(
      `AVBRYTER — ${file}: bidrag ${originalBidragCount}→${patchedBidragCount}, ` +
      `forutsattningar ${originalForutsattningCount}→${patchedForutsattningCount} (ska vara oförändrat).`
    );
    process.exit(1);
  }

  if (patchedText !== originalText) {
    writeFileSync(path, patchedText);
    filerAndrade++;
  }
}

console.log(`${filerAndrade} filer patchade, ${bidragAndrade} bidrag, ${forutsattningarAndrade} förutsättningar.\n`);
console.log('belopp_status:  ', counts.belopp);
console.log('deadline_status:', counts.deadline);
console.log('krav_status:    ', counts.krav);
console.log('giltighet_status:', counts.giltighet);
