// Permanent, körbar-om-igen version av den engångskorrigering som gjordes
// 2026-08-03 vid sammanslagningen med en parallell Code-sessions egen
// (bevisligen felräknade) statuslogik. IDEMPOTENT: strippar befintliga
// belopp_status/deadline_status/krav_status/giltighet_status (och det
// felplacerade giltighet/giltighet_status på Bidrag) och räknar om
// mekaniskt mot den faktiska datan, oavsett vad som stod där innan.
//
// ÅTGÄRDSSPEC T1/T2 (2026-08-03 kväll, fyra-lägesrevisionen): skriptet
// sätter BARA 'olast' (fältet har ett värde) eller 'okand' (fältet
// saknar värde) — ALDRIG 'verifierad' (kräver ett researchpass som
// oberoende kontrollerat mot kommunens levande sida) och ALDRIG
// 'ingen_regel' (kräver ett researchpass som bekräftat att regeln
// saknas). Kör ALLTID korrigera-belopp-platshallare.ts direkt efter
// (platshållarfraser är osynliga för den mekaniska regeln).
//
// SKYDD (T2, "samma skydd som krav_fullstandiga redan har"): ett fält
// vars NUVARANDE värde är 'ingen_regel' eller 'verifierad' rörs ALDRIG
// — varken strippas eller skrivs om. Bugg hittad 2026-08-03 kväll: en
// tidigare version av det här skriptet stripp+omräknade ALLA fyra fält
// ovillkorligt, vilket tyst nollställde den enda genuina 'ingen_regel'
// som fanns i corpuset (gislaved-namndens-forfogande.belopp_status) till
// 'overifierat'/'okand' — upptäckt och återställt manuellt, se commit-
// historiken. Assertion nedan avbryter om körningen ändå skulle skriva
// verifierad/ingen_regel någonstans (kan bara hända vid en buggad
// omskrivning, aldrig vid korrekt bruk).
//
// UNDANTAGET, medvetet: krav_fullstandiga rörs ALDRIG av det här
// skriptet (varken null, true eller false) — se dess eget filhuvud i
// kommunTyper.ts. Samma logik, samma motivering.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import yaml from 'js-yaml';

const DIR = 'data/kommuner';
const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));

const BIDRAG_FALT = ['belopp_status', 'deadline_status', 'krav_status'] as const;
const SKYDDADE = new Set(['ingen_regel', 'kontrollast']);

let filerAndrade = 0;
const rortaFiler: string[] = [];
const counts = {
  belopp: { olast: 0, okand: 0 },
  deadline: { olast: 0, okand: 0 },
  krav: { olast: 0, okand: 0 },
  giltighet: { olast: 0, okand: 0 },
};

for (const file of files) {
  const path = `${DIR}/${file}`;
  const originalText = readFileSync(path, 'utf-8');
  const originalDoc = yaml.load(originalText) as { bidrag?: any[]; forutsattningar?: any[] };

  // Pass 1: strippa OVILLKORLIGT det felplacerade giltighet/giltighet_status
  // på Bidrag (aldrig ett giltigt tillstånd att skydda), men lämna
  // belopp_status/deadline_status/krav_status ORÖRDA där de redan är
  // skyddade (ingen_regel/verifierad) — bara strippa dem där de är
  // 'olast'/'okand' (ska räknas om).
  const lines = originalText.split('\n');
  const stripped: string[] = [];
  let section: 'none' | 'bidrag' | 'forutsattningar' = 'none';
  let bidragIdx = -1;
  let forutsattningIdx = -1;

  for (const line of lines) {
    if (/^bidrag:\s*$/.test(line)) { section = 'bidrag'; bidragIdx = -1; stripped.push(line); continue; }
    if (/^forutsattningar:\s*$/.test(line)) { section = 'forutsattningar'; forutsattningIdx = -1; stripped.push(line); continue; }
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:|^forutsattningar:/.test(line)) section = 'none';

    const nyttListobjekt = /^(\s*)- \w+:/.test(line);
    if (nyttListobjekt && section === 'bidrag') bidragIdx++;
    if (nyttListobjekt && section === 'forutsattningar') forutsattningIdx++;

    if (section === 'bidrag') {
      const giltighetMatch = /^\s*(giltighet_status|giltighet):\s*.*$/.test(line);
      if (giltighetMatch) continue; // felplacerat på Bidrag, alltid bort

      const faltMatch = line.match(/^\s*(belopp_status|deadline_status|krav_status):\s*(\S+)\s*$/);
      if (faltMatch) {
        const [, falt, varde] = faltMatch;
        const b = originalDoc.bidrag?.[bidragIdx];
        if (SKYDDADE.has(b?.[falt])) { stripped.push(line); continue; } // skyddat, rör inte
        continue; // olast/okand — strippa, räknas om i pass 2
      }
    }
    if (section === 'forutsattningar') {
      const faltMatch = line.match(/^\s*giltighet_status:\s*(\S+)\s*$/);
      if (faltMatch) {
        const f = originalDoc.forutsattningar?.[forutsattningIdx];
        if (SKYDDADE.has(f?.giltighet_status)) { stripped.push(line); continue; }
        continue;
      }
    }
    stripped.push(line);
  }
  const strippedText = stripped.join('\n');
  const strippedDoc = yaml.load(strippedText) as { bidrag?: any[]; forutsattningar?: any[] };

  if ((originalDoc.bidrag?.length ?? 0) !== (strippedDoc.bidrag?.length ?? 0) ||
      (originalDoc.forutsattningar?.length ?? 0) !== (strippedDoc.forutsattningar?.length ?? 0)) {
    console.error(`AVBRYTER (stripp) — ${file}: post-antal ändrades.`);
    process.exit(1);
  }
  for (let i = 0; i < (originalDoc.forutsattningar?.length ?? 0); i++) {
    if (originalDoc.forutsattningar![i].giltighet !== strippedDoc.forutsattningar![i].giltighet) {
      console.error(`AVBRYTER (stripp) — ${file}: forutsattningar[${i}].giltighet ändrades av misstag.`);
      process.exit(1);
    }
  }
  for (let i = 0; i < (originalDoc.bidrag?.length ?? 0); i++) {
    const o = originalDoc.bidrag![i];
    const s = strippedDoc.bidrag![i];
    if (o.namn !== s.namn || o.belopp !== s.belopp || JSON.stringify(o.krav) !== JSON.stringify(s.krav) ||
        JSON.stringify(o.deadlines) !== JSON.stringify(s.deadlines) || o.krav_fullstandiga !== s.krav_fullstandiga) {
      console.error(`AVBRYTER (stripp) — ${file}: bidrag[${i}] sakinnehåll (eller krav_fullstandiga) ändrades av misstag.`);
      process.exit(1);
    }
  }

  // Pass 2: sätt in olast/okand för EXAKT de fält som strippades (var
  // olast/okand innan, alltså inte skyddade) — skyddade fält ligger kvar
  // orörda på sin ursprungliga plats, se pass 1.
  const doc = strippedDoc;
  const lines2 = strippedText.split('\n');
  const output: string[] = [];
  section = 'none';
  bidragIdx = -1;
  forutsattningIdx = -1;

  for (const line of lines2) {
    output.push(line);
    if (/^bidrag:\s*$/.test(line)) { section = 'bidrag'; bidragIdx = -1; continue; }
    if (/^forutsattningar:\s*$/.test(line)) { section = 'forutsattningar'; forutsattningIdx = -1; continue; }
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:|^forutsattningar:/.test(line)) section = 'none';

    const nyttListobjekt = /^(\s*)- \w+:/.test(line);
    if (nyttListobjekt && section === 'bidrag') bidragIdx++;
    if (nyttListobjekt && section === 'forutsattningar') forutsattningIdx++;

    const kallaMatch = line.match(/^(\s*)kalla_url:/);
    if (!kallaMatch) continue;
    const indent = kallaMatch[1];

    if (section === 'bidrag' && bidragIdx >= 0 && originalDoc.bidrag?.[bidragIdx]) {
      const orig = originalDoc.bidrag[bidragIdx];
      const b = doc.bidrag![bidragIdx];
      if (!SKYDDADE.has(orig.belopp_status)) {
        const status = b.belopp !== null && b.belopp !== undefined ? 'olast' : 'okand';
        counts.belopp[status]++;
        output.push(`${indent}belopp_status: ${status}`);
      }
      if (!SKYDDADE.has(orig.deadline_status)) {
        const status = b.deadlines?.typ === 'okand' ? 'okand' : 'olast';
        counts.deadline[status]++;
        output.push(`${indent}deadline_status: ${status}`);
      }
      if (!SKYDDADE.has(orig.krav_status)) {
        const status = Array.isArray(b.krav) && b.krav.length > 0 ? 'olast' : 'okand';
        counts.krav[status]++;
        output.push(`${indent}krav_status: ${status}`);
      }
    } else if (section === 'forutsattningar' && forutsattningIdx >= 0 && originalDoc.forutsattningar?.[forutsattningIdx]) {
      const orig = originalDoc.forutsattningar[forutsattningIdx];
      if (!SKYDDADE.has(orig.giltighet_status)) {
        const f = doc.forutsattningar![forutsattningIdx];
        const status = f.giltighet !== null && f.giltighet !== undefined ? 'olast' : 'okand';
        counts.giltighet[status]++;
        output.push(`${indent}giltighet_status: ${status}`);
      }
    }
  }

  const finalText = output.join('\n');
  let finalDoc: { bidrag?: any[]; forutsattningar?: any[] };
  try {
    finalDoc = yaml.load(finalText) as typeof finalDoc;
  } catch (e) {
    console.error(`AVBRYTER (insättning) — ${file} blev ogiltig YAML: ${(e as Error).message}`);
    process.exit(1);
  }
  if ((finalDoc.bidrag?.length ?? 0) !== (originalDoc.bidrag?.length ?? 0) ||
      (finalDoc.forutsattningar?.length ?? 0) !== (originalDoc.forutsattningar?.length ?? 0)) {
    console.error(`AVBRYTER (insättning) — ${file}: post-antal ändrades.`);
    process.exit(1);
  }
  for (let i = 0; i < (originalDoc.bidrag?.length ?? 0); i++) {
    const o = originalDoc.bidrag![i];
    const n = finalDoc.bidrag![i];
    if (o.krav_fullstandiga !== n.krav_fullstandiga) {
      console.error(`AVBRYTER (insättning) — ${file}: bidrag[${i}].krav_fullstandiga ändrades av misstag.`);
      process.exit(1);
    }
    // Skyddsassertion (T2): skriptet fick ALDRIG skriva verifierad/ingen_regel.
    // Skyddade fält som redan HADE de värdena är förstås oförändrade (samma
    // värde in som ut) — bara en NY förekomst där originalet inte redan var
    // skyddat är ett skriptfel.
    for (const falt of BIDRAG_FALT) {
      if (SKYDDADE.has(n[falt]) && !SKYDDADE.has(o[falt])) {
        console.error(`AVBRYTER (insättning) — ${file}: bidrag[${i}].${falt} blev "${n[falt]}" — skriptet får aldrig sätta det värdet.`);
        process.exit(1);
      }
    }
  }
  for (let i = 0; i < (originalDoc.forutsattningar?.length ?? 0); i++) {
    const o = originalDoc.forutsattningar![i];
    const n = finalDoc.forutsattningar![i];
    if (SKYDDADE.has(n.giltighet_status) && !SKYDDADE.has(o.giltighet_status)) {
      console.error(`AVBRYTER (insättning) — ${file}: forutsattningar[${i}].giltighet_status blev "${n.giltighet_status}" — skriptet får aldrig sätta det värdet.`);
      process.exit(1);
    }
  }

  if (finalText !== originalText) {
    writeFileSync(path, finalText);
    filerAndrade++;
    rortaFiler.push(path);
  }
}

// T6, regel 2 (blandningsspärren): markör för att en mekanisk omräkning
// kört, med VILKA filer som rördes — pre-commit-hooken läser den och
// fäller om samma filer i den staged diffen introducerar ett NYTT
// verifierad/ingen_regel (ett tecken på att ett researchpass och en
// mekanisk körning blandats i samma commit, se
// verify-mekanisk-verifiering-blandning.ts).
if (rortaFiler.length > 0) {
  const gitDir = execSync('git rev-parse --absolute-git-dir', { encoding: 'utf-8' }).trim();
  writeFileSync(`${gitDir}/OMRAKNING_KORD.json`, JSON.stringify(rortaFiler, null, 2));
}

console.log(`${filerAndrade} filer omräknade (krav_fullstandiga och ingen_regel/verifierad: orörda).\n`);
console.log('belopp_status:  ', counts.belopp);
console.log('deadline_status:', counts.deadline);
console.log('krav_status:    ', counts.krav);
console.log('giltighet_status:', counts.giltighet);
