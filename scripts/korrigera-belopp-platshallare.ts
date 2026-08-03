// Uppföljning 2026-08-03 (arbetsorder 2, Jacobs valideringsregel): rättar
// belopp_status från "angivet" till "overifierat" för exakt de bidrag
// hittaBeloppPlatshallare() (kommuner.ts) pekar ut — en platshållarfras
// ("Individuell bedömning" m.fl., se den funktionens filhuvud) är inte
// kommunens egna ord, och ska alltså inte påstå att vi har ett svar.
//
// Rör INTE belopp-värdet självt (det är fortfarande vad källan säger,
// bara inte ett specifikt tal) — bara statusfältet, som är en bedömning
// OM datan är kommun-specifik, inte datan själv.
//
// Samma textbaserade patchning som migrera-datatillstand.ts, men riktad
// mot EXAKT de bidrag-index en fil-parsning pekar ut — INTE genom att
// leta upp "id:"-raden i råtexten. Bugg hittad vid första försöket: vissa
// filer (almhult-stilen) har id sist i posten, EFTER belopp_status, så
// en linjär textscanning hinner aldrig se id:t innan den passerar raden
// den ska rätta. Parsning ger bidragets id oavsett fältordning.
import { readFileSync, writeFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { hittaBeloppPlatshallare } from '../src/lib/kommuner.ts';

const traffar = hittaBeloppPlatshallare();
const perFil = new Map<string, Set<string>>();
for (const t of traffar) {
  const set = perFil.get(t.kommunSlug) ?? new Set<string>();
  set.add(t.bidragId);
  perFil.set(t.kommunSlug, set);
}

let rattade = 0;

for (const [kommunSlug, bidragIds] of perFil) {
  const path = `data/kommuner/${kommunSlug}.yaml`;
  const originalText = readFileSync(path, 'utf-8');
  const doc = yaml.load(originalText) as { bidrag?: { id: string }[] };
  const lines = originalText.split('\n');
  const output: string[] = [];

  let section: 'none' | 'bidrag' = 'none';
  let bidragIdx = -1;
  const kvar = new Set(bidragIds);

  for (const line of lines) {
    if (/^bidrag:\s*$/.test(line)) {
      section = 'bidrag';
      bidragIdx = -1;
      output.push(line);
      continue;
    }
    if (/^[a-zA-Z_]/.test(line) && !/^bidrag:/.test(line)) {
      section = 'none';
    }
    if (section === 'bidrag' && /^(\s*)- \w+:/.test(line)) {
      bidragIdx++;
    }

    const currentId = section === 'bidrag' && bidragIdx >= 0 ? doc.bidrag?.[bidragIdx]?.id : undefined;

    if (
      currentId &&
      kvar.has(currentId) &&
      /^(\s*)belopp_status:\s*angivet\s*$/.test(line)
    ) {
      const indent = line.match(/^(\s*)/)?.[1] ?? '';
      output.push(`${indent}belopp_status: overifierat`);
      rattade++;
      kvar.delete(currentId);
      continue;
    }
    output.push(line);
  }

  if (kvar.size > 0) {
    console.error(`AVBRYTER — ${kommunSlug}: hittade inte belopp_status-raden för ${[...kvar].join(', ')}`);
    process.exit(1);
  }

  writeFileSync(path, output.join('\n'));
}

console.log(`${rattade} bidrag rättade (belopp_status: angivet → overifierat) över ${perFil.size} kommuner.`);
