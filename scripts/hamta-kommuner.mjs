#!/usr/bin/env node
/**
 * hamta-kommuner.mjs — hämtar Sveriges 290 kommuner (kod, namn, länstillhörighet,
 * befolkning) från SCB:s officiella PxWeb-API och genererar src/lib/kommunlan.ts.
 *
 * VARFÖR DETTA SKRIPT FINNS:
 * Tidigare versioner av kommunlan.ts (och den raderade kommunslugar.ts) skrevs
 * genom att en modell producerade raderna direkt ("från minnet" eller härlett ur
 * data/kommuner/), vilket introducerade felstavade transkriberingar (t.ex.
 * "jarfaella", "sodertaelje" i kommunlan.ts, commit 9e96588 och tidigare).
 * Detta skript gör hämtningen KONTROLLERBAR: råsvaret från SCB sparas oförändrat
 * i data/scb-kommuner.json, och kommunlan.ts genereras ENDAST genom att läsa den
 * filen — aldrig genom modellkunskap, aldrig genom gissning.
 *
 * FLÖDE:
 *   1. Hämta metadata för SCB-tabellen BE0101A/BefolkManadCKM (GET) för att hitta
 *      senaste tillgängliga månad (Tid-variabeln).
 *   2. Hämta hela regiontabellen (POST, json-stat2) för den månaden: alla 290
 *      kommuner + 21 län + Riket, med folkmängd (ålder=totalt, kön=totalt).
 *   3. Spara RÅSVARET oförändrat som data/scb-kommuner.json.
 *   4. Läs data/scb-kommuner.json (INTE minnet av steg 2 — filen på disk) och
 *      generera src/lib/kommunlan.ts därur.
 *
 * OM NÅGOT STEG MISSLYCKAS (nätverksfel, icke-200-svar, oväntad JSON-struktur,
 * fel antal kommuner/län): skriptet avslutar med felkod och skriver INGEN
 * kommunlan.ts. Ingen fallback till tidigare data, ingen fallback till en
 * hårdkodad lista. "Blockerad — SCB-hämtning misslyckades" är den enda tillåtna
 * utgången vid fel.
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SCB_TABLE_URL = 'https://api.scb.se/OV0104/v1/doris/sv/ssd/BE/BE0101/BE0101A/BefolkManadCKM';
const DATA_OUT = path.join(ROOT, 'data', 'scb-kommuner.json');
const TS_OUT = path.join(ROOT, 'src', 'lib', 'kommunlan.ts');

function fail(message) {
  console.error(`\nBLOCKERAD — SCB-hämtning misslyckades: ${message}\n`);
  process.exit(1);
}

/** Mekanisk slug-regel (Krav 2). Ingen modell inblandad — ren teckenersättning. */
function slugify(namn) {
  return namn
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchLatestTid() {
  let res;
  try {
    res = await fetch(SCB_TABLE_URL);
  } catch (err) {
    fail(`nätverksfel vid metadata-hämtning (${err.message})`);
  }
  if (!res.ok) {
    fail(`metadata-hämtning gav HTTP ${res.status}`);
  }
  let meta;
  try {
    meta = await res.json();
  } catch (err) {
    fail(`metadata-svaret gick inte att tolka som JSON (${err.message})`);
  }
  const tidVar = Array.isArray(meta.variables)
    ? meta.variables.find((v) => v.code === 'Tid')
    : undefined;
  if (!tidVar || !Array.isArray(tidVar.values) || tidVar.values.length === 0) {
    fail('metadata-svaret saknade Tid-variabeln eller dess värden — oväntat svarsformat');
  }
  // Tid-värdena är kronologiskt sorterade (t.ex. "2026M05" sist) enligt SCB:s
  // PxWeb-konvention. Sista elementet = senast tillgängliga månad.
  return tidVar.values[tidVar.values.length - 1];
}

async function fetchRegionData(tid) {
  const query = {
    query: [
      { code: 'Region', selection: { filter: 'all', values: ['*'] } },
      { code: 'Alder', selection: { filter: 'item', values: ['TotSA'] } },
      { code: 'Kon', selection: { filter: 'item', values: ['TotSa'] } },
      { code: 'ContentsCode', selection: { filter: 'item', values: ['000007SF'] } },
      { code: 'Tid', selection: { filter: 'item', values: [tid] } },
    ],
    response: { format: 'json-stat2' },
  };
  let res;
  try {
    res = await fetch(SCB_TABLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
  } catch (err) {
    fail(`nätverksfel vid datahämtning (${err.message})`);
  }
  if (!res.ok) {
    fail(`datahämtning gav HTTP ${res.status}`);
  }
  const rawText = await res.text();
  return rawText;
}

function parseRegionRows(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail(`data/scb-kommuner.json gick inte att tolka som JSON (${err.message})`);
  }

  const region = data?.dimension?.Region;
  const index = region?.category?.index;
  const label = region?.category?.label;
  const values = data?.value;

  if (!index || !label || !Array.isArray(values)) {
    fail('oväntad JSON-struktur i SCB-svaret (dimension.Region.category.index/label eller value saknas)');
  }

  const entries = Object.entries(index).sort((a, b) => a[1] - b[1]);

  let currentLan = null;
  const rows = [];
  for (const [code] of entries) {
    if (code === '00') continue; // Riket — inte en kommun eller ett län
    if (code.length === 2) {
      currentLan = label[code];
      continue;
    }
    if (code.length !== 4) {
      fail(`oväntad regionkod-längd i SCB-svaret: "${code}"`);
    }
    if (!currentLan) {
      fail(`kommunkod "${code}" saknar föregående länskod i SCB-svarets ordning`);
    }
    const namn = label[code];
    const befolkning = values[index[code]];
    if (typeof befolkning !== 'number') {
      fail(`saknad eller icke-numerisk befolkningssiffra för "${namn}" (${code})`);
    }
    rows.push({ kod: code, namn, lan: currentLan, befolkning });
  }

  if (rows.length !== 290) {
    fail(`förväntade 290 kommuner, fick ${rows.length} — avbryter, skriver ingen kommunlan.ts`);
  }

  const lanNames = new Set(rows.map((r) => r.lan));
  if (lanNames.size !== 21) {
    fail(`förväntade 21 distinkta län, fick ${lanNames.size} — avbryter, skriver ingen kommunlan.ts`);
  }

  return rows;
}

// SLUG_UNDANTAG: enda stället i hela flödet där en slug får avvika från den
// mekaniska å/ä/ö-regeln. Beslutad konvention vid slugkollision efter
// normalisering: länssuffix. Håbo och Habo kolliderar båda till "habo" —
// Håbo (Uppsala län) får "habo-uppsala", Habo (Jönköpings län) får
// "habo-jonkoping". Denna karta är enda stället undantag får bo. Nästa
// kollision (om någon uppstår vid framtida SCB-uppdatering) läggs till här,
// inte som en ad-hoc-specialregel någon annanstans i koden.
const SLUG_UNDANTAG = {
  '0305': 'habo-uppsala',   // Håbo, Uppsala län
  '0643': 'habo-jonkoping', // Habo, Jönköpings län
};

function generateTsSource(rows, tid) {
  const withSlugs = rows
    .map((r) => ({ ...r, slug: SLUG_UNDANTAG[r.kod] || slugify(r.namn) }))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

  // Hård assertion: efter SLUG_UNDANTAG-tillämpning ska alla 290 slugs vara
  // unika. Samma hårdhetsnivå som kontrollerna i parseRegionRows (290 kommuner,
  // 21 län) — om detta inte stämmer skrivs ingen kommunlan.ts.
  const uniqueSlugs = new Set(withSlugs.map((r) => r.slug));
  if (uniqueSlugs.size !== 290) {
    fail(`förväntade 290 unika slugs efter SLUG_UNDANTAG-tillämpning, fick ${uniqueSlugs.size} — avbryter, skriver ingen kommunlan.ts`);
  }

  // Slug-kollisionskontroll (för filhuvudet, INTE för att blockera skrivning —
  // en mekanisk kollision som Håbo/Habo är ett känt, dokumenterat sakförhållande,
  // inte ett hämtningsfel).
  const bySlug = new Map();
  for (const r of withSlugs) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, []);
    bySlug.get(r.slug).push(r);
  }
  const collisions = [...bySlug.entries()].filter(([, list]) => list.length > 1);

  const today = new Date().toISOString().slice(0, 10);

  const collisionNote =
    collisions.length > 0
      ? `\n * KÄND SLUG-KOLLISION (ej egenhändigt löst — se rapport): ${collisions
          .map(([slug, list]) => `${list.map((r) => r.namn).join(' och ')} ger båda slug "${slug}"`)
          .join('; ')}.\n * getMunicipalityBySlug() returnerar för närvarande bara förstaträffen.\n * Kräver ett medvetet disambigueringsbeslut innan båda publiceras.`
      : '';

  const header = `/**
 * kommunlan.ts — Sveriges 290 kommuner enligt SCB:s kommunregister.
 * GENERERAD AV scripts/hamta-kommuner.mjs — REDIGERA INTE DENNA FIL FÖR HAND.
 * Källa: SCB (Statistiska Centralbyrån), officiellt API (api.scb.se), tabell
 *   BE/BE0101/BE0101A/BefolkManadCKM. Kommunnamn, kommunkod och länstillhörighet
 *   härledda direkt ur regiondimensionens kod/namn-metadata i SCB:s svar (2-siffriga
 *   koder = län, 4-siffriga koder = kommuner, länstillhörighet = närmast föregående
 *   länskod i SCB:s egen svarsordning). Befolkning: samma tabell, månad ${tid}
 *   (senast tillgängliga vid hämtningstillfället), ålder=totalt, kön=totalt.
 * Hämtningsdatum: ${today}
 * Råsvar (oförändrat): data/scb-kommuner.json
 *
 * DENNA TABELL FÅR ALDRIG HÄRLEDAS UR data/kommuner/ ELLER NÅGON BEFINTLIG
 * DATAFIL. Föregående version av DENNA TABELL (kommunlan.ts, commit 9e96588 och
 * tidigare) innehöll "jarfaella" och "sodertaelje" — de felstavade
 * transkriberingar den skulle fånga — eftersom den härleddes ur data/kommuner/
 * (eller skrevs ur minnet) i stället för ur en oberoende källa. Den raderade
 * kommunslugar.ts raderades i commit 6050734 innan någon läste den — det är
 * INTE belagt att den innehöll samma fel; felstavningarna är dokumenterade i
 * kommunlan.ts, inte i den raderade filen.
 * ${collisionNote}
 */`;

  const rowsSource = withSlugs
    .map(
      (r) =>
        `  { slug: "${r.slug}", namn: "${r.namn.replace(/"/g, '\\"')}", lan: "${r.lan.replace(/"/g, '\\"')}", befolkning: ${r.befolkning} },`
    )
    .join('\n');

  return `${header}

export interface Municipality {
  slug: string;
  namn: string;
  lan: string;
  befolkning: number;
}

export const KOMMUNLAN: Municipality[] = [
${rowsSource}
];

export function getMunicipalityBySlug(slug: string): Municipality | undefined {
  return KOMMUNLAN.find((k) => k.slug === slug);
}
`;
}

async function main() {
  const tid = await fetchLatestTid();
  const raw = await fetchRegionData(tid);

  // Steg 3: spara råsvaret OFÖRÄNDRAT innan något tolkas.
  await mkdir(path.dirname(DATA_OUT), { recursive: true });
  await writeFile(DATA_OUT, raw, 'utf-8');
  console.log(`Sparade råsvar: ${path.relative(ROOT, DATA_OUT)} (${raw.length} tecken)`);

  // Steg 4: generera kommunlan.ts genom att LÄSA filen på disk, inte variabeln i minnet.
  const rawFromDisk = await readFile(DATA_OUT, 'utf-8');
  const rows = parseRegionRows(rawFromDisk);
  const tsSource = generateTsSource(rows, tid);

  await mkdir(path.dirname(TS_OUT), { recursive: true });
  await writeFile(TS_OUT, tsSource, 'utf-8');
  console.log(`Genererade: ${path.relative(ROOT, TS_OUT)} (${rows.length} kommuner)`);
}

main().catch((err) => {
  fail(err?.message || String(err));
});
