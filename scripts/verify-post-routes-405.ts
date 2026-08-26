/**
 * verify-post-routes-405.ts — AB1.6 (Jacobs order): en POST-bara route
 * ska svara 405 på GET, inte Astros egen 404 för en oexporterad metod.
 * Fixen är `export const GET: APIRoute = () => metodEjTillaten('POST');`
 * (src/lib/httpSvar.ts) i varje POST-bar route-fil. Detta skript vaktar
 * mot att en FRAMTIDA route-fil (ny eller redigerad) glömmer paret —
 * statisk källtextskanning, ingen server behövs.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const API_DIR = join(process.cwd(), 'src', 'pages', 'api');
const errors: string[] = [];
let kontrollerade = 0;

function* alla(dir: string): Generator<string> {
  for (const namn of readdirSync(dir)) {
    const full = join(dir, namn);
    if (statSync(full).isDirectory()) yield* alla(full);
    else if (namn.endsWith('.ts')) yield full;
  }
}

for (const fil of alla(API_DIR)) {
  const kalla = readFileSync(fil, 'utf-8');
  const harPost = /export const POST[\s:]/.test(kalla);
  if (!harPost) continue;
  const harGet = /export const GET[\s:]/.test(kalla);
  const harAll = /export const ALL[\s:]/.test(kalla); // en ALL-hanterare täcker redan GET, giltigt undantag
  kontrollerade++;
  if (!harGet && !harAll) {
    errors.push(`${relative(process.cwd(), fil)} exporterar POST men ingen GET (eller ALL) — GET ger Astros 404 i stället för 405.`);
  } else if (harGet && !kalla.includes('metodEjTillaten')) {
    errors.push(`${relative(process.cwd(), fil)} har en egen GET-hanterare som inte använder metodEjTillaten() — kontrollera att den faktiskt svarar 405, inte 200/404 av misstag.`);
  }
}

if (kontrollerade === 0) {
  console.error('verify-post-routes-405: FAIL — 0 POST-routes hittade, regexen matchar troligen inte längre filernas form.');
  process.exit(1);
}

if (errors.length > 0) {
  console.error(`verify-post-routes-405: FAIL — ${errors.length} fynd:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`verify-post-routes-405: PASS — alla ${kontrollerade} POST-bara routes svarar 405 på GET.`);
  process.exit(0);
}
