/**
 * omverifiering-matning.ts — mätpasset i SYSTEMLARM_ANALYS_2026-09-24.md
 * avsnitt 3A, med Jacobs tillägg 2026-10-02.
 *
 * INGA PRODUKTIONSÄNDRINGAR. Skriptet läser Redis och hämtar sidor; det
 * skriver aldrig en signatur, aldrig en YAML-fil, aldrig en baslinje.
 * Enda utdata är de två rapportfilerna i incoming/.
 *
 * Kör lokalt: node scripts/omverifiering-matning.ts
 * Kräver KV_REST_API_URL/KV_REST_API_TOKEN — läses ur .env.local med
 * samma triviala parser som omverifiering-ko.ts, ingen ny dependency.
 *
 * Två mätningar:
 *
 * 1. Olästbara källor (senasteUtfall === 'otillganglig'). GET två gånger,
 *    en med cronens UA och en med en webbläsar-UA, och klassning:
 *      DÖD       404/410 med båda
 *      BLOCKERAD svarar med webbläsar-UA men inte med cronens
 *      INSTABIL  timeout, nätverksfel eller blandat utfall
 *      OK NU     svarar med båda
 *    Varje källa listas med de bidrag (kommun + id) som använder URL:en.
 *
 * 2. Granskningskön (senasteUtfall !== 'oforandrad'). Nya flaggor per dag
 *    de senaste 14 dagarna, flaggor per domän (topp 20), och hur ofta
 *    huvudinnehållet faktiskt rört sig. Innehållsregionen plockas i
 *    ordningen <main>, <article>, SiteVisions innehållsregion — samma
 *    ordning som specen anger.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

function laddaEnvLokalt(): void {
  if (!existsSync('.env.local')) return;
  for (const rad of readFileSync('.env.local', 'utf8').split('\n')) {
    const match = rad.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, namn, raVarde] = match;
    if (process.env[namn] !== undefined) continue;
    process.env[namn] = raVarde.replace(/^["']|["']$/g, '');
  }
}
laddaEnvLokalt();

const { hamtaFlaggadeMedKontext } = await import('../src/lib/omverifiering.ts');
const { strippaDynamiskInnehall, hashaText } = await import('../src/lib/omverifieringLogik.ts');

// Cronens UA, ordagrant ur src/lib/omverifiering.ts. Kopierad hit med
// flit: mätningen ska jämföra mot vad produktionen FAKTISKT skickar, så
// om konstanten där ändras ska den här raden inte följa med av sig själv.
const CRON_UA = 'Föreningsguiden-Omverifiering/1.0 (+https://foreningsguiden.se; kontakt: jacob.stjarne@gmail.com)';
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15000; // cronens 5 s är en del av problemet — mät utan den strypningen
const SAMTIDIGA = 6;      // botartighet: sex parallella, inte femtio

type Klass = 'DÖD' | 'BLOCKERAD' | 'INSTABIL' | 'OK NU';

interface Svar { status: number | null; fel: string | null; html: string | null; etag: string | null; lastModified: string | null }

async function hamta(url: string, ua: string, taBody: boolean): Promise<Svar> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': ua } });
    const html = taBody && res.ok ? await res.text() : null;
    return { status: res.status, fel: null, html, etag: res.headers.get('etag'), lastModified: res.headers.get('last-modified') };
  } catch (e) {
    return { status: null, fel: e instanceof Error ? e.name : String(e), html: null, etag: null, lastModified: null };
  } finally {
    clearTimeout(timer);
  }
}

function klassa(cron: Svar, webb: Svar): Klass {
  const dod = (s: Svar) => s.status === 404 || s.status === 410;
  const ok = (s: Svar) => s.status !== null && s.status >= 200 && s.status < 300;
  if (dod(cron) && dod(webb)) return 'DÖD';
  if (ok(webb) && !ok(cron)) return 'BLOCKERAD';
  if (ok(cron) && ok(webb)) return 'OK NU';
  return 'INSTABIL';
}

/**
 * Innehållsregionen, i specens ordning: <main>, <article>, SiteVisions
 * innehållsregion. Regex och inte en DOM-parser — ingen ny dependency för
 * ett engångsmätpass, och vi jämför hashar av samma extraktion mot sig
 * själv, inte korrekthet i trädet. Returnerar null när ingen region
 * hittas, så andelen "kunde inte avgränsas" blir synlig i rapporten i
 * stället för att tystas till en hash över hela sidan.
 */
/**
 * Plockar ut elementets innehåll med balansräkning, inte med en
 * non-greedy regex. Ett <main> innehåller nästan alltid nästlade <div>,
 * så `[\s\S]*?</div>` kapar vid den FÖRSTA stängtaggen och ger en
 * stump. Här räknas öppnings- och stängtaggar så regionen blir hel.
 */
function elementInnehall(html: string, tagg: string, franIndex = 0): { innehall: string; slutIndex: number } | null {
  const oppna = new RegExp(`<${tagg}\\b[^>]*>`, 'gi');
  oppna.lastIndex = franIndex;
  const forsta = oppna.exec(html);
  if (!forsta) return null;
  if (/\/>$/.test(forsta[0])) return { innehall: '', slutIndex: oppna.lastIndex };
  const taggar = new RegExp(`<${tagg}\\b[^>]*>|</${tagg}\\s*>`, 'gi');
  taggar.lastIndex = forsta.index + forsta[0].length;
  let djup = 1;
  for (let m = taggar.exec(html); m; m = taggar.exec(html)) {
    djup += m[0].startsWith('</') ? -1 : 1;
    if (djup === 0) {
      return { innehall: html.slice(forsta.index + forsta[0].length, m.index), slutIndex: taggar.lastIndex };
    }
  }
  return null; // otaggad eller trasig HTML — räknas som "ingen region"
}

/**
 * Innehållsregionen, i specens ordning: <main>, <article>, SiteVisions
 * innehållsregion. Returnerar null när ingen region hittas, så andelen
 * "kunde inte avgränsas" blir synlig i rapporten i stället för att tystas
 * till en hash över hela sidan.
 */
function innehallsregion(html: string): { region: string; kalla: string } | null {
  const main = elementInnehall(html, 'main');
  if (main && main.innehall.trim()) return { region: main.innehall, kalla: 'main' };
  const article = elementInnehall(html, 'article');
  if (article && article.innehall.trim()) return { region: article.innehall, kalla: 'article' };
  // SiteVision: innehållsregionen är en sv-layout med ett svid-id. Sidhuvud
  // och meny är också sv-layouts, så den största balanserade träffen tas.
  let bast: string | null = null;
  const oppna = /<div\b[^>]*(?:id="svid\d+_[^"]*"|class="[^"]*sv-layout[^"]*")[^>]*>/gi;
  for (let m = oppna.exec(html); m; m = oppna.exec(html)) {
    const block = elementInnehall(html, 'div', m.index);
    if (block && (bast === null || block.innehall.length > bast.length)) bast = block.innehall;
  }
  if (bast && bast.trim()) return { region: bast, kalla: 'sitevision' };
  return null;
}

async function medGrans<T, R>(poster: T[], gransen: number, jobb: (p: T, i: number) => Promise<R>): Promise<R[]> {
  const ut: R[] = new Array(poster.length);
  let nasta = 0;
  await Promise.all(Array.from({ length: Math.min(gransen, poster.length) }, async () => {
    for (;;) {
      const i = nasta++;
      if (i >= poster.length) return;
      ut[i] = await jobb(poster[i], i);
    }
  }));
  return ut;
}

const IDAG = new Date().toISOString().slice(0, 10);
const flaggade = await hamtaFlaggadeMedKontext();
const olastbara = flaggade.filter((f) => f.senasteUtfall === 'otillganglig');
const andrade = flaggade.filter((f) => f.senasteUtfall === 'andrad');
console.log(`${flaggade.length} i kön: ${olastbara.length} olästbara, ${andrade.length} flaggade som ändrade.`);

// --- Mätning 1: olästbara källor, två UA ---
console.log(`\nMätning 1: ${olastbara.length} olästbara källor × 2 UA ...`);
let gjorda = 0;
const olastbaraResultat = await medGrans(olastbara, SAMTIDIGA, async (f) => {
  const cron = await hamta(f.url, CRON_UA, false);
  const webb = await hamta(f.url, BROWSER_UA, false);
  if (++gjorda % 25 === 0) console.log(`  ${gjorda}/${olastbara.length}`);
  return {
    url: f.url,
    klass: klassa(cron, webb),
    statusCron: cron.status,
    felCron: cron.fel,
    statusWebb: webb.status,
    felWebb: webb.fel,
    konsekutivaFel: f.konsekutivaFel,
    flaggadSedan: f.flaggadSedan,
    senasteForsok: f.senasteForsok,
    bidrag: f.bidrag.map((b) => ({ kommun: b.kommun, kommunSlug: b.kommunSlug, bidragId: b.bidragId, bidragNamn: b.bidragNamn })),
  };
});

// --- Mätning 2: granskningskön ---
console.log(`\nMätning 2: ${andrade.length} flaggade källor, innehållshash ...`);
gjorda = 0;
const andradeResultat = await medGrans(andrade, SAMTIDIGA, async (f) => {
  const ett = await hamta(f.url, CRON_UA, true);
  const tva = ett.html ? await hamta(f.url, CRON_UA, true) : { ...ett, html: null };
  if (++gjorda % 25 === 0) console.log(`  ${gjorda}/${andrade.length}`);

  const helsidaNu = ett.html ? hashaText(strippaDynamiskInnehall(ett.html)) : null;
  const r1 = ett.html ? innehallsregion(ett.html) : null;
  const r2 = tva.html ? innehallsregion(tva.html) : null;
  const regionHash1 = r1 ? hashaText(strippaDynamiskInnehall(r1.region)) : null;
  const regionHash2 = r2 ? hashaText(strippaDynamiskInnehall(r2.region)) : null;

  return {
    url: f.url,
    flaggadSedan: f.flaggadSedan,
    // Vad flaggan drevs av: hash, eller header (etag/last-modified)
    drivkraft: f.baslinjeHash ? 'hash' : (f.baslinjeEtag || f.baslinjeLastModified) ? 'header' : 'okand',
    status: ett.status,
    fel: ett.fel,
    regionKalla: r1?.kalla ?? null,
    // Har helsidan återgått till baslinjen? Då var flaggan en transient.
    helsidaLikaBaslinje: f.baslinjeHash !== null && helsidaNu !== null ? helsidaNu === f.baslinjeHash : null,
    // Är helsidan densamma som när flaggan sattes? Skiljer en VERKLIG
    // engångsändring (lika senaste, olik baslinje) från en sida som ändras
    // vid varje hämtning (olik båda) — den skillnaden avgör 3B.
    helsidaLikaSenaste: f.senasteHash !== null && helsidaNu !== null ? helsidaNu === f.senasteHash : null,
    // Region-hash sparas så NÄSTA körning har en region-baslinje att
    // jämföra mot. Att den saknas i dag är hela anledningen till att
    // "oförändrad mot baslinjen" bara kan mätas på helsidenivå nu.
    regionHash: regionHash1,
    // Rör sig innehållsregionen mellan två hämtningar sekunder isär? Då är
    // den instabil av sig själv, oavsett baslinje.
    regionStabilInomPasset: regionHash1 !== null && regionHash2 !== null ? regionHash1 === regionHash2 : null,
    // Rör sig ETag mellan två hämtningar sekunder isär? Direkt bevis på
    // att headern är brus och inte en ändringssignal.
    etagStabilInomPasset: ett.etag !== null && tva.etag !== null ? ett.etag === tva.etag : null,
    etag: ett.etag,
    lastModified: ett.lastModified,
    bidrag: f.bidrag.map((b) => ({ kommun: b.kommun, kommunSlug: b.kommunSlug, bidragId: b.bidragId })),
  };
});

// --- Sammanställning ---
const perKlass = (['DÖD', 'BLOCKERAD', 'INSTABIL', 'OK NU'] as Klass[])
  .map((k) => ({ klass: k, antal: olastbaraResultat.filter((r) => r.klass === k).length }));

const domanRakning = new Map<string, number>();
for (const f of flaggade) {
  try {
    const d = new URL(f.url).hostname.replace(/^www\./, '');
    domanRakning.set(d, (domanRakning.get(d) ?? 0) + 1);
  } catch { /* trasig URL räknas inte som domän */ }
}
const toppDomaner = [...domanRakning.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);

const forjontonDagar: { datum: string; antal: number }[] = [];
for (let i = 13; i >= 0; i--) {
  const d = new Date(Date.parse(`${IDAG}T00:00:00Z`) - i * 86400000).toISOString().slice(0, 10);
  forjontonDagar.push({ datum: d, antal: flaggade.filter((f) => f.flaggadSedan === d).length });
}

const medBaslinjehash = andradeResultat.filter((r) => r.helsidaLikaBaslinje !== null);
const aterstallda = medBaslinjehash.filter((r) => r.helsidaLikaBaslinje === true);
const medRegion = andradeResultat.filter((r) => r.regionStabilInomPasset !== null);
const regionStabil = medRegion.filter((r) => r.regionStabilInomPasset === true);
const medEtag = andradeResultat.filter((r) => r.etagStabilInomPasset !== null);
const etagInstabil = medEtag.filter((r) => r.etagStabilInomPasset === false);
const medBadaHashar = andradeResultat.filter((r) => r.helsidaLikaBaslinje !== null && r.helsidaLikaSenaste !== null);
const verkligEngangs = medBadaHashar.filter((r) => r.helsidaLikaSenaste === true && r.helsidaLikaBaslinje === false);
const standigtRorlig = medBadaHashar.filter((r) => r.helsidaLikaSenaste === false && r.helsidaLikaBaslinje === false);
const pct = (a: number, b: number) => (b === 0 ? '—' : `${((a / b) * 100).toFixed(1)} %`);

const rapport = `# Omverifieringen mätt — ${IDAG}

Mätpasset i \`incoming/SYSTEMLARM_ANALYS_2026-09-24.md\` avsnitt 3A, med
Jacobs tillägg 2026-10-02. Kört lokalt mot produktions-Redis via
\`.env.local\`. **Inga produktionsändringar** — skriptet läser, hämtar och
skriver rapport, aldrig en signatur eller en baslinje.

Skript: \`scripts/omverifiering-matning.ts\`. Hela listan: \`OMVERIFIERING_MATNING_${IDAG}.json\`.

## Läget i kön

| | |
|---|---|
| I kön totalt | ${flaggade.length} |
| Olästbara (\`otillganglig\`) | ${olastbara.length} |
| Flaggade som ändrade (\`andrad\`) | ${andrade.length} |

## 1. Olästbara källor, cronens UA mot webbläsar-UA

Två GET per källa, ${TIMEOUT_MS / 1000} sekunders timeout (cronens är 5 s —
den strypningen är en del av det som mäts, så den används inte här).

| Klass | Antal | Andel | Betyder |
|---|---|---|---|
${perKlass.map((k) => `| ${k.klass} | ${k.antal} | ${pct(k.antal, olastbara.length)} | ${
  k.klass === 'DÖD' ? '404 eller 410 med båda UA — dokumentet finns inte längre'
  : k.klass === 'BLOCKERAD' ? 'svarar med webbläsar-UA men inte med cronens'
  : k.klass === 'INSTABIL' ? 'timeout, nätverksfel eller blandat utfall'
  : 'svarar med båda — felet var tillfälligt'} |`).join('\n')}

### DÖDA källor

${olastbaraResultat.filter((r) => r.klass === 'DÖD').length === 0 ? '_Inga._' : `| URL | cron | webb | Bidrag som använder den |
|---|---|---|---|
${olastbaraResultat.filter((r) => r.klass === 'DÖD').map((r) =>
  `| \`${r.url}\` | ${r.statusCron ?? r.felCron} | ${r.statusWebb ?? r.felWebb} | ${r.bidrag.map((b) => `${b.kommun}/${b.bidragId}`).join(', ') || '_ingen (URL finns inte i YAML längre)_'} |`).join('\n')}`}

### BLOCKERADE källor

${olastbaraResultat.filter((r) => r.klass === 'BLOCKERAD').length === 0 ? '_Inga._' : `| URL | cron | webb | Bidrag |
|---|---|---|---|
${olastbaraResultat.filter((r) => r.klass === 'BLOCKERAD').map((r) =>
  `| \`${r.url}\` | ${r.statusCron ?? r.felCron} | ${r.statusWebb ?? r.felWebb} | ${r.bidrag.map((b) => `${b.kommun}/${b.bidragId}`).join(', ') || '_ingen_'} |`).join('\n')}`}

### INSTABILA källor

${olastbaraResultat.filter((r) => r.klass === 'INSTABIL').length === 0 ? '_Inga._' : `| URL | cron | webb | Bidrag |
|---|---|---|---|
${olastbaraResultat.filter((r) => r.klass === 'INSTABIL').map((r) =>
  `| \`${r.url}\` | ${r.statusCron ?? r.felCron} | ${r.statusWebb ?? r.felWebb} | ${r.bidrag.map((b) => `${b.kommun}/${b.bidragId}`).join(', ') || '_ingen_'} |`).join('\n')}`}

### OK NU

${olastbaraResultat.filter((r) => r.klass === 'OK NU').length === 0 ? '_Inga._' : `| URL | cron | webb | Bidrag |
|---|---|---|---|
${olastbaraResultat.filter((r) => r.klass === 'OK NU').map((r) =>
  `| \`${r.url}\` | ${r.statusCron} | ${r.statusWebb} | ${r.bidrag.map((b) => `${b.kommun}/${b.bidragId}`).join(', ') || '_ingen_'} |`).join('\n')}`}

## 2. Granskningskön

### Nya flaggor per dag, senaste 14 dagarna

| Datum | Nya flaggor |
|---|---|
${forjontonDagar.map((d) => `| ${d.datum} | ${d.antal} |`).join('\n')}

Flaggor utan \`flaggadSedan\` (källor som aldrig setts ändrade, bara varit
otillgängliga sedan första kontrollen): ${flaggade.filter((f) => !f.flaggadSedan).length}.
Flaggor äldre än 14 dagar: ${flaggade.filter((f) => f.flaggadSedan && f.flaggadSedan < forjontonDagar[0].datum).length}.

### Flaggor per domän, topp 20

| Domän | Flaggor | Andel av kön |
|---|---|---|
${toppDomaner.map(([d, n]) => `| ${d} | ${n} | ${pct(n, flaggade.length)} |`).join('\n')}

### Har huvudinnehållet faktiskt rört sig?

Innehållsregionen plockas i ordningen \`<main>\`, \`<article>\`,
SiteVisions innehållsregion. Fördelning av vilken som användes:

| Region | Antal |
|---|---|
${['main', 'article', 'sitevision'].map((k) => `| \`${k}\` | ${andradeResultat.filter((r) => r.regionKalla === k).length} |`).join('\n')}
| ingen region hittad | ${andradeResultat.filter((r) => r.regionKalla === null && r.status !== null && r.status < 300).length} |
| svarade inte | ${andradeResultat.filter((r) => r.status === null || r.status >= 300).length} |

| Mått | Antal | Av | Andel |
|---|---|---|---|
| Helsidehash **oförändrad mot baslinjen** nu | ${aterstallda.length} | ${medBaslinjehash.length} | ${pct(aterstallda.length, medBaslinjehash.length)} |
| Innehållsregion **stabil** mellan två hämtningar i samma pass | ${regionStabil.length} | ${medRegion.length} | ${pct(regionStabil.length, medRegion.length)} |
| ETag **ändrad** mellan två hämtningar sekunder isär | ${etagInstabil.length} | ${medEtag.length} | ${pct(etagInstabil.length, medEtag.length)} |
| Helsidehash lika **flaggningsögonblicket**, olik baslinjen — verklig engångsändring | ${verkligEngangs.length} | ${medBadaHashar.length} | ${pct(verkligEngangs.length, medBadaHashar.length)} |
| Helsidehash olik **både** baslinje och flaggningsögonblick — ändras vid varje hämtning | ${standigtRorlig.length} | ${medBadaHashar.length} | ${pct(standigtRorlig.length, medBadaHashar.length)} |

Flaggornas drivkraft:

| Drivkraft | Antal |
|---|---|
${['hash', 'header', 'okand'].map((d) => `| ${d} | ${andradeResultat.filter((r) => r.drivkraft === d).length} |`).join('\n')}

### Vad som är och inte är jämförbart

Baslinjen i Redis är en hash över **hela** den strippade sidan, inte över
innehållsregionen. Det finns alltså ingen lagrad region-baslinje att
jämföra mot, och "oförändrad mot baslinjen" kan bara mätas på helsidenivå.
Därför tre mått i stället för ett: helsidehash mot baslinje (var flaggan en
transient?), regionens stabilitet inom passet (rör sig innehållet av sig
självt?) och ETagens stabilitet inom passet (är headern brus?). Det tredje
måttet är det som direkt besvarar om detektorn bör byta signal.

De två sista raderna i måtttabellen skiljer de fall som avgör 3B. Lika
flaggningsögonblicket men olik baslinjen betyder att sidan ändrades EN gång
och sedan låg still — flaggan var sann och en människa bör titta. Olik båda
betyder att helsidehashen rör sig vid varje hämtning, alltså att signalen
mäter brus i stället för innehåll.

\`regionHash\` sparas per källa i JSON-filen. Nästa körning har därmed den
region-baslinje som saknas i dag.

För källor flaggade via header (\`baslinjeHash\` är null) finns ingen
helsidehash att jämföra mot alls — de räknas bara i de två senare måtten.
`;

mkdirSync('incoming', { recursive: true });
writeFileSync(`incoming/OMVERIFIERING_MATNING_${IDAG}.md`, rapport);
writeFileSync(`incoming/OMVERIFIERING_MATNING_${IDAG}.json`, JSON.stringify({
  matning: IDAG,
  cronUa: CRON_UA,
  browserUa: BROWSER_UA,
  timeoutMs: TIMEOUT_MS,
  ikon: flaggade.length,
  olastbara: olastbaraResultat,
  andrade: andradeResultat,
  perKlass,
  toppDomaner,
  forjontonDagar,
}, null, 1));

console.log('\n--- Olästbara per klass ---');
for (const k of perKlass) console.log(`  ${k.klass.padEnd(10)} ${k.antal}`);
console.log('\n--- Topp 5 domäner ---');
for (const [d, n] of toppDomaner.slice(0, 5)) console.log(`  ${String(n).padStart(4)}  ${d}`);
console.log(`\nHelsidehash oförändrad mot baslinjen: ${aterstallda.length}/${medBaslinjehash.length} (${pct(aterstallda.length, medBaslinjehash.length)})`);
console.log(`Region stabil inom passet:            ${regionStabil.length}/${medRegion.length} (${pct(regionStabil.length, medRegion.length)})`);
console.log(`ETag ändrad inom passet:              ${etagInstabil.length}/${medEtag.length} (${pct(etagInstabil.length, medEtag.length)})`);
console.log(`Verklig engångsändring:               ${verkligEngangs.length}/${medBadaHashar.length} (${pct(verkligEngangs.length, medBadaHashar.length)})`);
console.log(`Ändras vid varje hämtning:            ${standigtRorlig.length}/${medBadaHashar.length} (${pct(standigtRorlig.length, medBadaHashar.length)})`);
console.log(`\nSkrivet: incoming/OMVERIFIERING_MATNING_${IDAG}.md + .json`);
