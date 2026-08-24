/**
 * smoke-test.ts — Z2.3 (incoming/OPPNA_PUNKTER_Z1.md, auditens P1.7).
 * Körs mot en riktig URL EFTER deploy — sju kontroller, alla på faktiska
 * hämtningar, inte på byggutdata. Skälet: bygget har varit grönt varje
 * gång något gått sönder i produktion (GET-läckande formulär, försvunna
 * belopp). Ett skript som hämtar riktiga sidor efter deploy är det enda
 * som fångar den klassen.
 *
 * Körsätt:
 *   node --experimental-strip-types scripts/smoke-test.ts
 *     → mot https://foreningsguiden.se (default)
 *   node --experimental-strip-types scripts/smoke-test.ts --url=https://mitt-preview.vercel.app
 *     → mot valfri URL (preview-deployer, lokalt bygge bakom `astro preview` etc.)
 *
 * Fäller högt vid fel: process.exit(1) om NÅGON kontroll misslyckas,
 * och rapporterar vilken URL som fallerade och vad som saknades — inte
 * "smoke test failed".
 */

const urlArg = process.argv.find((a) => a.startsWith('--url='));
const BASE = (urlArg ? urlArg.slice('--url='.length) : 'https://foreningsguiden.se').replace(/\/$/, '');

interface Kontroll {
  namn: string;
  path: string;
  forvantadStatus: number;
  krav: (body: string) => string[]; // returnerar en lista SAKNADE krav (tom = allt hittades)
}

const KONTROLLER: Kontroll[] = [
  {
    namn: '1. Startsidan',
    path: '/',
    forvantadStatus: 200,
    krav: (body) => (body.includes('Vi samlar alla kommunala föreningsbidrag') ? [] : ['identitetsraden ("Vi samlar alla kommunala föreningsbidrag")']),
  },
  {
    namn: '2. Kommunsida (Gislaved)',
    path: '/kommun/gislaved/',
    forvantadStatus: 200,
    krav: (body) => {
      const saknas: string[] = [];
      if (!body.includes('Källan läst')) saknas.push('"Källan läst"');
      if (!/data-bidrag-id="[^"]+"/.test(body)) saknas.push('minst ett bidragsnamn (ingen data-bidrag-id i registret)');
      return saknas;
    },
  },
  {
    namn: '3. Nationellt stöd (LOK-stöd)',
    path: '/nationella-stod/lok-stod/',
    forvantadStatus: 200,
    krav: (body) => {
      const saknas: string[] = [];
      if (!body.includes('25 februari')) saknas.push('"25 februari"');
      if (!body.includes('25 augusti')) saknas.push('"25 augusti"');
      return saknas;
    },
  },
  {
    namn: '4. Idrottsingången',
    path: '/idrott/',
    forvantadStatus: 200,
    krav: (body) => (body.includes('Så funkar fristerna') ? [] : ['sanktionstrappan ("Så funkar fristerna")']),
  },
  {
    namn: '5. Deadlinekalendern',
    path: '/deadlines/',
    forvantadStatus: 200,
    krav: (body) => (/<tr data-niva="[^"]*"/.test(body) ? [] : ['minst en daterad rad (ingen <tr data-niva> i tabellen)']),
  },
  {
    namn: '6. Sitemap',
    path: '/sitemap-index.xml',
    forvantadStatus: 200,
    krav: () => [],
  },
  {
    namn: '7. Okänd rutt → egen 404',
    path: '/en-sida-som-aldrig-funnits-hos-foreningsguiden/',
    forvantadStatus: 404,
    krav: (body) => (body.includes('Sidan hittades inte') ? [] : ['sajtens egen 404-text ("Sidan hittades inte") — kan vara ett naket felmeddelande i stället']),
  },
];

async function korKontroll(k: Kontroll): Promise<{ ok: boolean; detalj: string }> {
  const url = `${BASE}${k.path}`;
  try {
    const res = await fetch(url);
    const body = await res.text();
    const felmeddelanden: string[] = [];
    if (res.status !== k.forvantadStatus) {
      felmeddelanden.push(`status ${res.status}, väntade ${k.forvantadStatus}`);
    }
    const saknasLista = k.krav(body);
    if (saknasLista.length > 0) {
      felmeddelanden.push(`saknar: ${saknasLista.join(', ')}`);
    }
    if (felmeddelanden.length > 0) {
      return { ok: false, detalj: `${url} — ${felmeddelanden.join(' · ')}` };
    }
    return { ok: true, detalj: url };
  } catch (e) {
    return { ok: false, detalj: `${url} — hämtningen misslyckades: ${(e as Error).message}` };
  }
}

const resultat = await Promise.all(KONTROLLER.map(async (k) => ({ k, r: await korKontroll(k) })));

let allaOk = true;
for (const { k, r } of resultat) {
  const status = r.ok ? 'OK  ' : 'FAIL';
  console.log(`${status}  ${k.namn}: ${r.detalj}`);
  if (!r.ok) allaOk = false;
}

console.log('');
if (allaOk) {
  console.log(`smoke-test: PASS — alla sju kontroller mot ${BASE}`);
  process.exit(0);
} else {
  console.log(`smoke-test: FAIL — se raderna märkta FAIL ovan för exakt URL och vad som saknades.`);
  process.exit(1);
}
