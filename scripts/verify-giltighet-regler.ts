/**
 * G1 valideringssvit för kommunernas strukturerade giltighetsregler,
 * delad i två (P4, Jacob 2026-08-17): "golden set — fasta namngivna
 * fall, växer bara när någon medvetet lägger till ett referensfall.
 * validator — varje rad i datan är strukturellt giltig, oavsett hur
 * många rader som finns. Med den delningen bryter inte bygget när GPT
 * lägger till en kommun." Samma mönster som verify-belopp-avser.ts.
 *
 * Rotorsak till delningen: den här filen höll tidigare EN kombinerad
 * kontroll — ett exakt totalt radantal ("20 rader, 19 kommuner") som
 * bara kunde ändras manuellt. Två separata concurrent research-commits
 * samma dag (kungalv/vaxjo, sen Malmö) lade till legitima nya
 * giltighetsvärden och fällde CI båda gångerna, trots att datan var
 * korrekt — bygget kände inte till att korpusen hade växt.
 *
 * DEL 1 — GOLDEN SET: namngivna referensfall, uppslagna via slug+id,
 * ALDRIG via ett totalt radantal. Växer bara när ett nytt fall
 * MEDVETET läggs till i FIXTURES/RULES.
 *
 * DEL 2 — VALIDATOR: körs över HELA den levande korpusen, oavsett
 * antal kommuner. De rent strukturella reglerna (typ-enum, status-enum,
 * typ↔status↔antal/datum-konsistens) valideras redan av schemat
 * (src/lib/kommuner.ts, npm run validera) och upprepas inte här. Det
 * schemat INTE täcker: att giltighet_regel.kalla_url faktiskt går att
 * spåra till en av kommunens egna giltighetsfritext-rader. Det var
 * exakt vaxjo-buggen 2026-08-17 (giltighet_regel.kalla_url pekade på
 * kommunens generella sida i stället för raden giltighetstexten kom
 * från) — en count-agnostisk validator hade fångat den automatiskt,
 * utan att vaxjo behövde vara ett namngivet golden-fall.
 *
 * Utöver de två delarna: käll-/klientkoppling (rad ~140) och
 * fast_datum/manader_efter_*-beräkningarna (rad ~180) är egna, redan
 * count-agnostiska golden-tester (fasta indata, fasta facit) — rörda
 * inte av denna delning.
 */

import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';
import {
  GILTIGHET_REGEL_TYPER, berakForfallodatum, regeltext, giltighetRegelGerDatum,
} from '../src/lib/kommunTyper.ts';
import type {
  GiltighetRegel, GiltighetRegelStatus, GiltighetRegelTyp,
} from '../src/lib/kommunTyper.ts';

interface ExpectedRule {
  typ: GiltighetRegelTyp;
  antal: number | null;
  datum: string | null;
  status: GiltighetRegelStatus;
}

interface Fixture {
  slug: string;
  id: string;
  text: string;
  rule: ExpectedRule;
}

const RULES: Record<string, ExpectedRule> = {
  berg: { typ: 'okand', antal: null, datum: null, status: 'okand' },
  boxholm: { typ: 'ingen_regel', antal: null, datum: null, status: 'ingen_regel' },
  bromolla: { typ: 'ingen_regel', antal: null, datum: null, status: 'ingen_regel' },
  enkoping: { typ: 'sammansatt', antal: null, datum: null, status: 'kontrollast' },
  helsingborg: { typ: 'manader_efter_beslut', antal: 12, datum: null, status: 'kontrollast' },
  jarfalla: { typ: 'okand', antal: null, datum: null, status: 'okand' },
  katrineholm: { typ: 'fast_datum', antal: null, datum: '03-31', status: 'kontrollast' },
  kungalv: { typ: 'ingen_regel', antal: null, datum: null, status: 'ingen_regel' },
  lund: { typ: 'manader_efter_beslut', antal: 13, datum: null, status: 'kontrollast' },
  malmo: { typ: 'manader_efter_arsmote', antal: 1, datum: null, status: 'kontrollast' },
  nacka: { typ: 'okand', antal: null, datum: null, status: 'okand' },
  norrtalje: { typ: 'manader_efter_arsmote', antal: 2, datum: null, status: 'kontrollast' },
  pitea: { typ: 'fast_datum', antal: null, datum: '04-01', status: 'kontrollast' },
  taby: { typ: 'fast_datum', antal: null, datum: '02-15', status: 'kontrollast' },
  tranas: { typ: 'ingen_regel', antal: null, datum: null, status: 'ingen_regel' },
  trelleborg: { typ: 'okand', antal: null, datum: null, status: 'okand' },
  umea: { typ: 'manader_efter_arsmote', antal: 12, datum: null, status: 'kontrollast' },
  vallentuna: { typ: 'manader_efter_arsmote', antal: 3, datum: null, status: 'kontrollast' },
  varberg: { typ: 'okand', antal: null, datum: null, status: 'okand' },
  vaxjo: { typ: 'ingen_regel', antal: null, datum: null, status: 'ingen_regel' },
};

const FIXTURES: Fixture[] = [
  { slug: 'berg', id: 'berg-foreningsregister', text: 'Föreningsuppgifterna ska uppdateras årligen — minst en gång per år, och snarast vid förändringar', rule: RULES.berg },
  { slug: 'berg', id: 'berg-policy', text: 'Ska uppdateras årligen', rule: RULES.berg },
  { slug: 'boxholm', id: 'boxholm-nytt-regelverk', text: 'Från 1 januari 2024', rule: RULES.boxholm },
  { slug: 'bromolla', id: 'bromolla-andts-policy', text: 'Från 1 januari 2024', rule: RULES.bromolla },
  { slug: 'enkoping', id: 'enkoping-bidragsberattigad', text: 'Ett år från beslutsdatum, dock inte mer än en månad efter föreningens årsmöte', rule: RULES.enkoping },
  { slug: 'helsingborg', id: 'helsingborg-bidragsberattigad', text: 'Giltig ett år från beslutsdagen — måste sökas om varje år', rule: RULES.helsingborg },
  { slug: 'jarfalla', id: 'jarfalla-foreningsregister', text: 'Uppgifterna ska uppdateras årligen', rule: RULES.jarfalla },
  { slug: 'katrineholm', id: 'katrineholm-arlig-redovisning-registrering', text: 'Årlig inlämning krävs senast 31 mars varje år för fortsatt registrering, annars avregistreras föreningen.', rule: RULES.katrineholm },
  { slug: 'kungalv', id: 'kungalv-registerutdrag', text: 'Ska begäras vid varje nytillsättning av ledare med barnkontakt; rekommenderas ske regelbundet även för redan tillsatta ledare', rule: RULES.kungalv },
  { slug: 'lund', id: 'lund-bidragsberattigad', text: 'Görs om var 13:e månad', rule: RULES.lund },
  { slug: 'malmo', id: 'malmo-bidragsberattigad', text: 'Justerat årsmötesprotokoll ska lämnas inom 30 dagar efter årsmötet och obligatoriska årshandlingar ska lämnas varje år.', rule: RULES.malmo },
  { slug: 'nacka', id: 'nacka-bidragsberattigad-forening', text: 'Upphör om föreningen inte ansökt om eller beviljats aktivitetsbidrag för två på varandra följande ansökningsperioder', rule: RULES.nacka },
  { slug: 'norrtalje', id: 'norrtalje-arliga-arshandlingar', text: 'Handlingarna ska laddas upp senast två månader efter genomfört årsmöte, varje år, för fortsatt bidragsrätt', rule: RULES.norrtalje },
  { slug: 'pitea', id: 'pitea-bidragsberattigad-forening', text: 'Uppgifterna ska uppdateras senast 1 april varje år', rule: RULES.pitea },
  { slug: 'taby', id: 'taby-riktlinje-barn-ungdom-underskrift', text: '1 år — ska undertecknas och skickas in på nytt varje år, senast 15 februari', rule: RULES.taby },
  { slug: 'tranas', id: 'tranas-demokrati-och-trygghet', text: 'Årlig', rule: RULES.tranas },
  { slug: 'trelleborg', id: 'trelleborg-bidragsberattigad-forening', text: 'Uppgifterna i föreningsregistret måste aktivt godkännas varje tolvmånadersperiod för att ansökan om bidrag ska vara möjlig.', rule: RULES.trelleborg },
  { slug: 'umea', id: 'umea-bidragsberattigad', text: 'Föreningen måste årligen uppdatera sina uppgifter i systemet för att fortsatt vara bidragsberättigad', rule: RULES.umea },
  { slug: 'vallentuna', id: 'vallentuna-foreningsregistrering', text: 'Ingen tidsbestämd giltighet anges, men föreningen måste senast tre månader efter varje årsmöte skicka in verksamhetsberättelse, medlemsantal, ekonomisk redovisning, revisionsberättelse och undertecknat årsmötesprotokoll för att förbli bidragsberättigad — annars riskeras statusen.', rule: RULES.vallentuna },
  { slug: 'varberg', id: 'varberg-bidragsberattigad-forening', text: 'Kräver årlig uppdatering av uppgifter i föreningsregistret samt inlämning av årsmöteshandlingar', rule: RULES.varberg },
  { slug: 'vaxjo', id: 'vaxjo-bidragsberattigad-forening', text: 'Årlig ansökan om stödberättigad status krävs', rule: RULES.vaxjo },
];

interface PersistedForutsattning {
  id: string;
  giltighet: string | null;
  kalla_url: string;
}

interface PersistedKommun {
  kommun_slug: string;
  forutsattningar?: PersistedForutsattning[];
  giltighet_regel?: GiltighetRegel | null;
  giltighet_regel_status?: GiltighetRegelStatus | null;
}

const docs = new Map<string, PersistedKommun>();
for (const file of readdirSync('data/kommuner').filter((name) => name.endsWith('.yaml'))) {
  const doc = yaml.load(readFileSync(`data/kommuner/${file}`, 'utf8')) as PersistedKommun;
  docs.set(doc.kommun_slug, doc);
}

const fail: string[] = [];

// DEL 1 — GOLDEN SET. Uppslag per namngivet fall (slug+id), inget
// totalt radantal någonstans i denna loop.
for (const fixture of FIXTURES) {
  const doc = docs.get(fixture.slug);
  const row = doc?.forutsattningar?.find((item) => item.id === fixture.id);
  if (!doc || !row) {
    fail.push(`${fixture.slug}/${fixture.id}: raden saknas`);
    continue;
  }
  if (row.giltighet !== fixture.text) fail.push(`${fixture.slug}/${fixture.id}: ursprunglig fritext ändrad`);
  if (!doc.giltighet_regel) {
    fail.push(`${fixture.slug}: giltighet_regel saknas`);
    continue;
  }
  const actual = doc.giltighet_regel;
  const expected = fixture.rule;
  if (actual.typ !== expected.typ || actual.antal !== expected.antal || actual.datum !== expected.datum) {
    fail.push(`${fixture.slug}: väntat ${JSON.stringify(expected)}, fick ${JSON.stringify(actual)}`);
  }
  if (doc.giltighet_regel_status !== expected.status) {
    fail.push(`${fixture.slug}: status ${doc.giltighet_regel_status}, väntat ${expected.status}`);
  }
  if (actual.kalla_url !== row.kalla_url) fail.push(`${fixture.slug}/${fixture.id}: provenance-URL divergerar`);
}

// DEL 2 — VALIDATOR. Körs över alla kommuner i data/kommuner, oavsett
// antal — växer automatiskt, kräver ingen uppdatering här. Kollar bara
// kommuner där G1-extraktionen redan kört (giltighet_regel satt); en
// kommun med obehandlad giltighetsfritext (olast, väntar på G1) är
// normalt pipeline-läge, inte ett fel.
let provenanceKontrollerade = 0;
for (const doc of docs.values()) {
  if (!doc.giltighet_regel) continue;
  const giltighetRader = (doc.forutsattningar ?? []).filter((row) => typeof row.giltighet === 'string');
  if (giltighetRader.length === 0) continue;
  provenanceKontrollerade++;
  const sparbar = giltighetRader.some((row) => row.kalla_url === doc.giltighet_regel!.kalla_url);
  if (!sparbar) {
    fail.push(`${doc.kommun_slug}: giltighet_regel.kalla_url matchar ingen av kommunens giltighetsfritext-rader — provenance bruten`);
  }
}

if (!GILTIGHET_REGEL_TYPER.includes('fast_datum')) fail.push('fast_datum saknas i GILTIGHET_REGEL_TYPER');

const giltighetskontrollKalla = readFileSync('src/components/GiltighetsKontroll.astro', 'utf8');
const varmSkarmKalla = readFileSync('src/components/VarmSkarm.astro', 'utf8');
const cronKalla = readFileSync('src/pages/api/cron/giltighetsvarning.ts', 'utf8');
if (!giltighetskontrollKalla.includes('data-regel-datum={regel?.datum')) {
  fail.push('GiltighetsKontroll trådar inte regel.datum till klienten');
}
if (!varmSkarmKalla.includes('data-regel-datum={kommun.giltighet_regel?.datum')) {
  fail.push('VarmSkarm trådar inte regel.datum till klienten');
}
if (!cronKalla.includes('await sendGiltighetsvarningNiva1(') || !cronKalla.includes('await markGiltighetsvarningSent(')) {
  fail.push('giltighetsmejlets nivå 1 är inte kopplad till sändning + idempotensmarkering');
}

// L1.3 (Jacob 2026-08-17): tre spärrar innan mejl 5 går ut. Källtextkoll
// (samma stil som cronKalla-kollen ovan) — säkerställer att spärrarna
// inte tyst kan försvinna i en framtida omskrivning utan att grinden
// märker det.
if (!cronKalla.includes('giltighetRegelGerDatum(regel, kommun.giltighet_regel_status)')) {
  fail.push('cronet skickar giltighet_regel_status till giltighetRegelGerDatum — spärren mot icke-kontrollästa regler saknas');
}
if (!cronKalla.includes('forfallodatum < today')) {
  fail.push('cronet saknar spärren mot ett redan passerat förfallodatum');
}
if (!cronKalla.includes('if (!arsmotesdatum) continue')) {
  fail.push('cronet saknar den explicita spärren mot ett tomt årsmötesdatum');
}
if (!giltighetskontrollKalla.includes('giltighetRegelGerDatum(regel, kommun.giltighet_regel_status)')) {
  fail.push('GiltighetsKontroll skickar inte giltighet_regel_status till giltighetRegelGerDatum — widgeten kan visa nivå 1 för en icke-kontrolläst regel');
}

// L1.2 (Jacob 2026-08-17): "Kontrollera berakForfallodatum() mot varje
// regeltyp som faktiskt förekommer i de tjugo. Ett testfall per typ med
// känt svar... Det här är första gången vi räknar ett datum och lovar en
// människa något i framtiden." Fyra riktiga G1-kommuner (en per typ som
// faktiskt förekommer) plus två syntetiska fall (kalenderar och
// antal=1-ordformen) som ingen kommun har än — regeltext()/
// berakForfallodatum() ska ändå ge rätt svar den dagen G1 sätter dem.
//
// Jacobs eget exempel för manader_efter_arsmote var "Enköping 1" —
// Enköpings regel är sammansatt: ett år från beslut, men högst en månad
// efter årsmötet. Den får därför aldrig reduceras till en månadsregel.
// De riktiga kommunerna med den typen är
// Norrtälje (antal 2) och Vallentuna (antal 3), använda nedan i stället
// — flaggat i leveransrapporten, inte tyst bytt ut.
for (const golden of [
  { namn: 'Norrtälje (manader_efter_arsmote, antal 2)', regel: { typ: 'manader_efter_arsmote' as const, antal: 2, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2026-05-01', fras: 'i 2 månader efter årsmötet' },
  { namn: 'Vallentuna (manader_efter_arsmote, antal 3)', regel: { typ: 'manader_efter_arsmote' as const, antal: 3, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2026-06-01', fras: 'i 3 månader efter årsmötet' },
  { namn: 'Helsingborg (manader_efter_beslut, antal 12)', regel: { typ: 'manader_efter_beslut' as const, antal: 12, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2027-03-01', fras: 'i ett år från beslutsdagen' },
  { namn: 'Lund (manader_efter_beslut, antal 13)', regel: { typ: 'manader_efter_beslut' as const, antal: 13, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2027-04-01', fras: 'i tretton månader från beslutsdagen' },
  { namn: 'syntetisk (manader_efter_arsmote, antal 1 — "en månad"-ordformen; Malmö fick detta värde 2026-08-17, se RULES.malmo/FIXTURES ovan för den riktiga kommunraden)', regel: { typ: 'manader_efter_arsmote' as const, antal: 1, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2026-04-01', fras: 'i en månad efter årsmötet' },
  { namn: 'syntetisk (kalenderar, ingen kommun har typen än)', regel: { typ: 'kalenderar' as const, antal: null, datum: null, kalla_url: '' }, today: '2026-08-17', forfaller: '2026-12-31', fras: 'kalenderåret ut' },
]) {
  const forfallodatum = berakForfallodatum(golden.regel, '2026-03-01', golden.today);
  if (forfallodatum !== golden.forfaller) {
    fail.push(`${golden.namn}: förfallodatum ${forfallodatum}, väntat ${golden.forfaller}`);
  }
  const fras = regeltext(golden.regel);
  if (fras !== golden.fras) {
    fail.push(`${golden.namn}: regeltext "${fras}", väntat "${golden.fras}"`);
  }
}

// L1.3 — giltighetRegelGerDatum() kräver status som obligatoriskt andra
// argument sedan L1.3 (2026-08-17): "inget mejl när giltighet_regel_
// status inte är kontrollast" — testar funktionen direkt, inte bara
// källtextnärvaron ovan.
{
  const beraknbarRegel: GiltighetRegel = { typ: 'manader_efter_arsmote', antal: 2, datum: null, kalla_url: '' };
  if (giltighetRegelGerDatum(beraknbarRegel, 'kontrollast') !== true) {
    fail.push('giltighetRegelGerDatum: kontrollast + beräkningsbar typ ska ge true');
  }
  for (const status of ['okand', 'ingen_regel', null] as const) {
    if (giltighetRegelGerDatum(beraknbarRegel, status) !== false) {
      fail.push(`giltighetRegelGerDatum: status "${status}" ska ge false trots en typ som annars vore beräkningsbar`);
    }
  }
  if (giltighetRegelGerDatum(null, 'kontrollast') !== false) {
    fail.push('giltighetRegelGerDatum: null-regel ska alltid ge false, oavsett status');
  }
  const sammansattRegel: GiltighetRegel = { typ: 'sammansatt', antal: null, datum: null, kalla_url: '' };
  if (giltighetRegelGerDatum(sammansattRegel, 'kontrollast') !== false ||
      berakForfallodatum(sammansattRegel, '2026-03-01', '2026-08-18') !== null ||
      regeltext(sammansattRegel) !== null) {
    fail.push('sammansatt giltighetsregel får aldrig ge gissat datum eller regeltext');
  }
}

for (const golden of [
  { slug: 'taby', datum: '02-15', before: '2026-02-14', sameYear: '2026-02-15', after: '2026-02-16', nextYear: '2027-02-15', fras: 'till och med 15 februari varje år' },
  { slug: 'katrineholm', datum: '03-31', before: '2026-03-30', sameYear: '2026-03-31', after: '2026-04-01', nextYear: '2027-03-31', fras: 'till och med 31 mars varje år' },
]) {
  const regel = docs.get(golden.slug)?.giltighet_regel;
  if (!regel || regel.typ !== 'fast_datum' || regel.datum !== golden.datum) {
    fail.push(`${golden.slug}: fast_datum-golden saknas`);
    continue;
  }
  if (berakForfallodatum(regel, '2026-01-01', golden.before) !== golden.sameYear) {
    fail.push(`${golden.slug}: datum före årets frist ger inte årets förekomst`);
  }
  if (berakForfallodatum(regel, '2026-01-01', golden.after) !== golden.nextYear) {
    fail.push(`${golden.slug}: passerad frist rullar inte till nästa år`);
  }
  if (regeltext(regel) !== golden.fras) fail.push(`${golden.slug}: fel regeltext för fast_datum`);
}

if (fail.length > 0) {
  console.error(`verify:giltighet-regler FAIL — ${fail.length} fel`);
  for (const problem of fail) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`verify:giltighet-regler — golden set: ${FIXTURES.length} rader / ${new Set(FIXTURES.map((r) => r.slug)).size} kommuner. Validator: provenance kontrollerad för ${provenanceKontrollerade} kommuner (hela korpusen med giltighet_regel satt).`);
console.log('fast_datum golden: Täby 02-15 PASS, Katrineholm 03-31 PASS');
console.log('PASS');
