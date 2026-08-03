// Permanent, körbar-om-igen version av den engångskorrigering som gjordes
// 2026-08-03 vid sammanslagningen med en parallell Code-sessions egen
// (bevisligen felräknade — se DECISIONS/HANDOVER samma datum) statuslogik.
// Till skillnad från migrera-datatillstand.ts (engångsskript, kraschar om
// statusfält redan finns — skrivet för filer som ALDRIG haft dem) är detta
// skriptet IDEMPOTENT: det strippar befintliga belopp_status/
// deadline_status/krav_status/giltighet_status (och det felplacerade
// giltighet/giltighet_status på Bidrag) och räknar om alla fyra mekaniskt
// mot den faktiska datan, oavsett vad som stod där innan. Säkert att köra
// om — även flera gånger i rad ger samma resultat (verifierat: en andra
// körning direkt efter en första ger "0 filer ändrade").
//
// Kör igen varje gång en extern datakälla (den parallella GPT-
// extraktionspipen, en annan Code-session) landar bidragsinnehåll vars
// statusfält inte litar på — mekaniska tre: fältet har ett värde →
// angivet, annars overifierat. Kör ALLTID korrigera-belopp-platshallare.ts
// direkt efter (platshållarfraser är osynliga för den mekaniska regeln;
// se den filens huvudkommentar).
//
// UNDANTAGET, medvetet: krav_fullstandiga rörs ALDRIG av det här skriptet
// — varken strippas eller skrivs om. Det fältet är INTE mekaniskt härlett
// (det säger inte "har krav-listan innehåll", det säger "har ett
// researchpass BEDÖMT att listan är komplett") — bara ett researchpass får
// sätta det, aldrig ett omräkningsskript. Ett tidigare skript i den här
// sessionen rörde fältet ändå (bevarade visserligen `true`-värden genom
// strip+återinsättning, men principen var fel: ett generellt
// omräkningspass ska inte ens TEORETISKT kunna tappa en manuell bedömning).
// verify-krav-fullstandiga-regression.ts är det oberoende skyddsnätet mot
// att just den klassen bugg smyger sig in i EN ANNAN framtida ändring.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';

const DIR = 'data/kommuner';
const files = readdirSync(DIR).filter((f) => f.endsWith('.yaml'));

const STRIP_BIDRAG = /^\s*(belopp_status|deadline_status|krav_status|giltighet_status|giltighet):\s*.*$/;
const STRIP_FORUTSATTNING = /^\s*giltighet_status:\s*.*$/;

let filerAndrade = 0;
const counts = {
  belopp: { angivet: 0, overifierat: 0 },
  deadline: { angivet: 0, overifierat: 0 },
  krav: { angivet: 0, overifierat: 0 },
  giltighet: { angivet: 0, overifierat: 0 },
};

for (const file of files) {
  const path = `${DIR}/${file}`;
  const originalText = readFileSync(path, 'utf-8');
  const originalDoc = yaml.load(originalText) as { bidrag?: any[]; forutsattningar?: any[] };

  // Pass 1: strippa belopp_status/deadline_status/krav_status/
  // giltighet_status/giltighet på Bidrag — INTE krav_fullstandiga (se
  // huvudkommentaren ovan för varför det fältet är undantaget).
  const lines = originalText.split('\n');
  const stripped: string[] = [];
  let section: 'none' | 'bidrag' | 'forutsattningar' = 'none';
  for (const line of lines) {
    if (/^bidrag:\s*$/.test(line)) { section = 'bidrag'; stripped.push(line); continue; }
    if (/^forutsattningar:\s*$/.test(line)) { section = 'forutsattningar'; stripped.push(line); continue; }
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:|^forutsattningar:/.test(line)) section = 'none';

    if (section === 'bidrag' && STRIP_BIDRAG.test(line)) continue;
    if (section === 'forutsattningar' && STRIP_FORUTSATTNING.test(line)) continue;
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

  // Pass 2: räkna om och sätt in belopp_status/deadline_status/krav_status/
  // giltighet_status — mekaniskt, mot den faktiska datan. krav_fullstandiga
  // rörs inte här heller — ordningen på övriga fält efter kalla_url-raden
  // är oförändrad mot innan.
  const doc = strippedDoc;
  const lines2 = strippedText.split('\n');
  const output: string[] = [];
  section = 'none';
  let bidragIdx = -1;
  let forutsattningIdx = -1;

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
    } else if (section === 'forutsattningar' && forutsattningIdx >= 0 && doc.forutsattningar?.[forutsattningIdx]) {
      const f = doc.forutsattningar[forutsattningIdx];
      const giltighetStatus = f.giltighet !== null && f.giltighet !== undefined ? 'angivet' : 'overifierat';
      counts.giltighet[giltighetStatus]++;
      output.push(`${indent}giltighet_status: ${giltighetStatus}`);
    }
  }

  const finalText = output.join('\n');
  let finalDoc: { bidrag?: any[]; forutsattningar?: unknown[] };
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
    if (originalDoc.bidrag![i].krav_fullstandiga !== finalDoc.bidrag![i].krav_fullstandiga) {
      console.error(`AVBRYTER (insättning) — ${file}: bidrag[${i}].krav_fullstandiga ändrades av misstag.`);
      process.exit(1);
    }
  }

  if (finalText !== originalText) {
    writeFileSync(path, finalText);
    filerAndrade++;
  }
}

console.log(`${filerAndrade} filer omräknade (krav_fullstandiga: orört, se skriptets huvudkommentar).\n`);
console.log('belopp_status:  ', counts.belopp);
console.log('deadline_status:', counts.deadline);
console.log('krav_status:    ', counts.krav);
console.log('giltighet_status:', counts.giltighet);
