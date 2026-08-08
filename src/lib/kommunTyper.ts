/**
 * kommunTyper.ts — Typer, konstanter och RENA funktioner ur kommuner.ts,
 * utan beroende på `fs`/`path`. Utbrutet (matchningstratten, turn-11) för
 * att src/pages/matcha/index.astro:s klientskript kan importera formaterare
 * (formatDate, earliestDeadlineISO, todayISO, svenskLista) utan att dra in
 * loadKommuner()/DATA_DIR-koden — ett top-level `resolve(process.cwd(), ...)`
 * i kommuner.ts kraschade Vite-bygget för klientbundeln (inte tree-shakebart,
 * körs ovillkorligt vid modul-load, "path" kan inte externaliseras i
 * webbläsaren). kommuner.ts re-exporterar allt härifrån — alla befintliga
 * `import {...} from '../lib/kommuner'` fortsätter fungera oförändrat.
 */

import { strippaProcessSprak } from './anteckningFilter.ts';

export const KATEGORIER = ['idrott', 'kultur', 'social', 'pensionar', 'funktionsratt', 'ovrig'] as const;
export type Kategori = (typeof KATEGORIER)[number];

// Verksamhet — matchningstrattens EGEN taxonomi (GUIDE_TRATT_COPY.ts
// fraga_verksamhet.alternativ), skild från KATEGORIER. KATEGORIER styr
// bidragens navigering (/kommun/[slug]/[kategori]/); Verksamhet är ett
// hårdare behörighetsfilter på Bidrag.foreningstyp, extraherat ur
// malgrupp/krav. Se matching.ts.
export const VERKSAMHETER = ['idrott', 'kultur', 'hembygd', 'friluft', 'social', 'ungdom', 'annat'] as const;
export type Verksamhet = (typeof VERKSAMHETER)[number];

// 'okand' — källan är helt tyst om ansökningsförfarande (varken ett publicerat
// datum eller en uttrycklig löpande-formulering). Skild från 'lopande', som
// betyder att kommunen UTTRYCKLIGEN skriver löpande/rullande ansökan.
// 'lopande' får ALDRIG användas som utfyllnad för tystnad — se Västervik-
// reverten 2026-07 (c995f80 backad) för vad som händer när den regeln bryts.
//
// 'relativ' — tillagd 2026-08-03 (DATATILLSTAND_och_koprutan.md §2c).
// Skild från 'okand': en relativ frist är INTE ett hål i vår kunskap — vi
// har en fullständig, känd formel (t.ex. "60 dagar efter avslutad kurs"),
// bara inget absolut datum förrän besökaren fyller i sin egen
// referenspunkt. 'okand' migrerade tidigare in relativa frister av misstag
// (anteckning-textmönstret "Relativ tidsfrist: X" var det enda strukturella
// spåret) — det gav deadline_status: overifierat åt något vi faktiskt VET.
// Ett eget typ-värde, inte ett fjärde Datatillstand-värde: de tre andra
// fälten (belopp/krav/giltighet) har inget analogt "relativt" tillstånd,
// och Datatillstand ska vara samma skala för alla fyra.
export const DEADLINE_TYPER = ['fasta', 'lopande', 'okand', 'relativ'] as const;
export type DeadlineTyp = (typeof DEADLINE_TYPER)[number];

// Datatillstånd (arbetsorder 2026-08-03, DATATILLSTAND_och_koprutan.md;
// ÅTGÄRDSSPEC T1-T6, 2026-08-03 kväll — fyra-lägesrevisionen) — EN skala
// för fyra olika fält (belopp/deadline/krav på Bidrag, giltighet på
// Forutsattning), alla obligatoriska efter migrationen (kommuner.ts).
//
// Fyra värden, inte tre. 'angivet'/'overifierat' döptes om (ren
// namnbyte, ingen ny bedömning) för att täcka en skillnad de aldrig
// bar: ett värde som kommer från extraktionen är INTE samma sak som ett
// värde någon oberoende kontrollerat mot kommunens LEVANDE sida. Det var
// "Arvika-problemet" — ekern visade ett datum med full säkerhet, kortet
// hedgade samma datum, och båda hade rätt givet den gamla tvåvägs-
// uppdelningen (finns/finns inte), bara olika grad av försiktighet.
//
//   olast       Extraherat, INTE oberoende omkontrollerat. VÄRDET VISAS
//               överallt (D3) med en gemensam reservation: streckad
//               markör + "Inte kontrollerad mot kommunens sida sedan vi
//               hämtade den." + källänk. Detta ÄR dagens 'angivet' —
//               bara ärligare namngivet. Sätts av migrationen/GPT-
//               extraktionen, ALDRIG av ett researchpass som faktiskt
//               kontrollerat källan (det sätter 'kontrollast').
//   kontrollast Extraherat OCH oberoende bekräftat mot kommunens
//               levande sida. Full markering, ingen reservation. Sätts
//               ENDAST av ett researchpass — omrakna-datatillstand.ts
//               får aldrig skriva detta värde (samma skydd som
//               krav_fullstandiga).
//   ingen_regel Bekräftat att INGET värde finns — kommunen har
//               uttryckligen sagt att regeln/beloppet/kravet saknas.
//               Full markering, aktiv formulering ("Gislaved anger
//               ingen tidsgräns"), fylld markör (VoidState). Sätts
//               ENDAST av ett researchpass, ALDRIG av migrationen —
//               att gissa den vore exakt den klass av påhitt allt annat
//               i den här kodbasen vägrar göra. Detta ÄR dagens
//               'ingen_regel', oförändrat i sak — bara skyddat hårdare
//               (se omrakna-datatillstand.ts: rör aldrig ett fält som
//               redan är ingen_regel eller verifierad).
//   okand       Ett äkta hål i vår kunskap — inget värde, ingen
//               bekräftelse av att det saknas heller. Void (streckad
//               ram, dämpad text, källänk ut — VoidMark). Detta ÄR
//               dagens 'overifierat' — bara ärligare namngivet (samma
//               ord ska inte betyda både "vi vet inget alls" OCH "vi
//               har ett värde men har inte dubbelkollat det").
//
// (En parallell Code-session döpte samma skala FALT_STATUSAR/FaltStatus
// och lade giltighet_status direkt på Bidrag, med en duplicerad
// `giltighet: string | null` — löst till förmån för DENNA version vid
// sammanslagningen 2026-08-03: giltighet hör hemma på Forutsattning, där
// fältet redan fanns långt innan datatillstånd-arbetet, och används där
// av GiltighetsKontroll.astro/hittaGiltighetsregel(). Två källor för
// samma sak hade brutit "en sanning, ett ställe".)
export const DATATILLSTAND = ['olast', 'okand', 'ingen_regel', 'kontrollast'] as const;
export type Datatillstand = (typeof DATATILLSTAND)[number];

// H26 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): kommunen kan pausa eller
// avskaffa ett bidrag utan att ta bort YAML-raden. Valfritt fält —
// saknas det i källan defaultar validateBidrag (kommuner.ts) till
// 'aktiv', additivt mot de 99 befintliga filerna.
export const BIDRAG_STATUSAR = ['aktiv', 'pausad', 'avskaffat'] as const;
export type BidragStatus = (typeof BIDRAG_STATUSAR)[number];

export interface Deadlines {
  typ: DeadlineTyp;
  datum: string[]; // MM-DD, återkommande
}

export interface Bidrag {
  id: string;
  namn: string;
  kategori: Kategori[];
  malgrupp: string;
  deadlines: Deadlines;
  krav: string[];
  belopp: string | null;
  sen_ansokan: string;
  kalla_url: string;
  anteckning: string | null;

  // A2 (Jacob 2026-08-08): processpår ur extraktionspasset — ALDRIG
  // renderat. anteckning är den användarvända motsvarigheten. Ingen
  // backfill av de 366 meningar som redan ligger fel i anteckning
  // (PROCESSSPRAK_STRUKET_2026-08-08.md) — de hanteras av A1:s filter
  // (strippaProcessSprak, anteckningFilter.ts) tills GPT ändå är i
  // respektive kommun. Rör aldrig detta fält från kod — bara research-
  // passet skriver hit.
  qa_anteckning: string | null;

  // Matchningsvillkor (matchningstratten, turn-11) — extraheras ur
  // krav/malgrupp av ett separat researchpass, INTE av Code. null = inget
  // känt krav — matchar ALLTID, filtrerar ALDRIG bort (se matching.ts).
  min_medlemmar: number | null;
  alder_min: number | null; // medlemmarnas ålder (t.ex. 7–25 år) — INTE föreningens egen ålder
  alder_max: number | null;
  min_verksamhetstid_manader: number | null; // föreningens EGEN ålder sedan bildande
  foreningstyp: Verksamhet[] | null; // behörighetsfilter — se Verksamhet ovan, skilt från kategori
  kraver_registrering: boolean | null; // kräver DETTA bidrag kommunens bidragsberättigad-status?
  sate_i_kommunen: boolean | null;

  status: BidragStatus; // H26 — se BIDRAG_STATUSAR ovan. Alltid satt efter validateBidrag, default 'aktiv'.

  // Datatillstånd (se Datatillstand ovan) — obligatoriska efter migrationen.
  belopp_status: Datatillstand;
  deadline_status: Datatillstand;
  krav_status: Datatillstand;
  // null = ej bedömt ännu (renderas som overifierat i UI, samma logik som
  // krav_status men en separat bedömning — krav KAN vara angivna utan att
  // vara KOMPLETTA). Sätts bara av ett researchpass, aldrig av migrationen.
  krav_fullstandiga: boolean | null;

  // SPEC: Omverifiering (2026-07-27). Kommun.verifierad finns bara på
  // KOMMUN-nivå — men kalla_url divergerar per bidrag i större kommuner
  // (Karlstad: ≥10 distinkta URL:er över ~28 bidrag), så ETT bidrag kan
  // ha blivit omkontrollerat/bekräftat vid ett ANNAT tillfälle än resten
  // av kommunens bidrag. null = aldrig satt per bidrag (skiljer sig från
  // "okänt datum" — betyder bara att bara kommun-nivåns verifierad finns
  // för det här bidraget hittills). Sätts ENDAST av en forskningssession
  // (samma "Code hittar inte på fakta"-princip som alla andra fält här)
  // — aldrig av omverifieringLogik.ts, som bara upptäcker ATT en källa
  // ändrats, aldrig VAD.
  senast_verifierad: string | null;
}

export interface Ansokningssystem {
  namn: string;
  url: string;
}

/**
 * Förutsättning — steg som krävs innan något bidrag i kommunen kan sökas
 * (FORUTSATTNINGAR.md §2). `ledtid` är null om kommunen inte publicerar en
 * faktisk siffra — gissa aldrig en handläggningstid.
 */
export interface Forutsattning {
  id: string;
  vad: string;
  beskrivning: string;
  system: string | null; // null när steget inte sker i ett digitalt system (t.ex. beslut på årsmötet)
  ledtid: number | null; // dagar
  ledtid_text: string | null;
  giltighet: string | null;
  giltighet_status: Datatillstand; // se Datatillstand ovan, obligatorisk efter migrationen
  ordning: number;
  kalla_url: string;
}

/**
 * Kommunsiffran — aha-rad på kommunsidan (KOMMUNSIFFRA, content.ts). Bara
 * kommuner som lämnat ut en egen sammanställning har den; null annars.
 * Gissa aldrig fram värden — bara det kommunen faktiskt publicerat.
 */
export interface Kommunsiffra {
  antal_foreningar: number;
  summa_kr: string; // förformaterat, t.ex. "781 117" — se KOMMUNSIFFRA.template
  bidragstyp: string;
  utlamnad_datum: string;
}

export interface Kommun {
  kommun: string;
  kommun_slug: string;
  lan: string;
  befolkning: number;
  forvaltning: string;
  ansokningssystem: Ansokningssystem;
  kalla_url: string;
  verifierad: string; // YYYY-MM-DD
  bidrag: Bidrag[];
  forutsattningar: Forutsattning[];
  kommunsiffra: Kommunsiffra | null;
}

/**
 * Den giltighetsregel som faktiskt ska räknas mot (GiltighetsKontroll.astro,
 * KommunProgression.astro station 3, cron/giltighetsvarning.ts). En kommun
 * kan ha flera förutsättningar och `giltighet` sitter inte alltid på den
 * första — Helsingborg har den på forutsattningar[1] (forutsattningar[0]
 * är "registrera dig", giltighet: null; forutsattningar[1] är "förbli
 * bidragsberättigad", giltighet satt). Ett rakt `forutsattningar[0]?.giltighet`
 * missar den regeln helt och tystnar tyst till "vi gissar inte" — bugg
 * hittad 2026-08-02 vid Playwright-verifiering av 1f Yta 2, ingen tidigare
 * kommun i datat hade en andra förutsättning med giltighet satt.
 */
export function hittaGiltighetsregel(forutsattningar: Forutsattning[]): string | null {
  return forutsattningar.find((f) => f.giltighet)?.giltighet ?? null;
}

/**
 * T4 (ÅTGÄRDSSPEC 2026-08-03 kväll): stämpeln räknas nu över FYRA fält,
 * inte tre — giltighet är kommun-nivå (Forutsattning), inte per-bidrag,
 * men en besökare som ansöker bryr sig om hur länge beslutet gäller lika
 * mycket som om belopp/deadline/krav. Samma forutsattning som
 * hittaGiltighetsregel() pekar ut (den som faktiskt bär giltighet-
 * VÄRDET) — annars kunde de två divergera och peka på olika poster.
 * Faller tillbaka på forutsattningar[0] om ingen bär ett värde (samma
 * "vi gissar inte"-princip: fallbacken pekar aldrig ut fel post, den
 * pekar bara på den enda rimliga kandidaten när ingen är bättre).
 */
export function hittaGiltighetsstatus(forutsattningar: Forutsattning[]): Datatillstand {
  const relevant = forutsattningar.find((f) => f.giltighet) ?? forutsattningar[0];
  return relevant?.giltighet_status ?? 'okand';
}

/**
 * 2b (arbetsorder 2026-08-03): "Till ansökan"-knappen använde kommunens
 * generiska ansokningssystem.url för ALLA bidrag — fel så fort ett bidrag
 * har en egen, mer specifik källa (Gislaveds Föreningsbidrag social
 * verksamhet ligger under omsorg-och-stod/, inte fritid-och-kultursidan
 * knappen pekade på). kalla_url är ett obligatoriskt fält på Bidrag — ska
 * alltid finnas — men fallbacken finns kvar defensivt, aldrig en tom href.
 * En sanning: samma funktion som knappen OCH källfotnoten ska derivera ur,
 * så de aldrig kan divergera igen (se testet i verify-matching.ts).
 */
export function bidragAnsokningsUrl(bidrag: Bidrag, kommun: Kommun): string {
  return bidrag.kalla_url || kommun.ansokningssystem.url;
}

/**
 * C5 (ÅTGÄRDSSPEC, 2026-08-03 kväll): köprutans beskrivning ska sälja mot
 * det system besökaren faktiskt öppnar — men bara om ett riktigt
 * e-tjänstsystem finns. Två namn i corpuset betyder uttryckligen att
 * ansökan går utanför ett system: "E-post" (arboga, arjeplog m.fl.) och
 * "Blankett" (pappersblankett). Verifierat mot hela corpuset 2026-08-03
 * — de enda två värdena av 161 unika ansokningssystem.namn som inte
 * beskriver ett faktiskt system att öppna.
 */
const INGET_ETJANSTSYSTEM = new Set(['e-post', 'blankett']);

export function harEtjanstsystem(kommun: Kommun): boolean {
  return !INGET_ETJANSTSYSTEM.has(kommun.ansokningssystem.namn.trim().toLowerCase());
}

/**
 * 2c (arbetsorder 2026-08-03) + uppföljning 2026-08-03: ursprungligen
 * detekterad enbart via anteckning-mönstret "Relativ tidsfrist: {frist}"
 * (kolon = ett värde att visa, skiljer från t.ex. Åstorps datamodells-
 * kommentar "Relativ tidsfrist kan inte uttryckas..." utan kolon). Nu
 * strukturellt riktigt: deadlines.typ === 'relativ' är den EGENTLIGA
 * grinden (se DEADLINE_TYPER ovan) — anteckning-texten är bara källan
 * till formelns beskrivning, inte längre detektionsmekanismen. En bidrag
 * med typ 'relativ' men en anteckning som inte matchar kolon-mönstret
 * visar ändå hela anteckningen hellre än inget alls.
 */
/**
 * Uppföljning 2026-08-03 (punkt 3): "GRANSKAD"-stämpeln påstod full
 * granskning oavsett hur många av bidragets fält som faktiskt var
 * verifierade — noll av tre räknades som samma sak som tre av tre.
 *
 * T4 (ÅTGÄRDSSPEC, samma kväll, fyra-lägesrevisionen): utökad från tre
 * till fyra fält (+ giltighet, se hittaGiltighetsstatus ovan), och
 * granskat-kriteriet skärpt. 'olast' (extraherat, INTE oberoende
 * omkontrollerat) räknas INTE längre som granskat — bara 'kontrollast'
 * (oberoende bekräftat mot källan) och 'ingen_regel' (bekräftad
 * frånvaro) gör. Det är själva poängen med fyra-lägesrevisionen: ett
 * fält som bara är extraherat har inte granskats i den mening stämpeln
 * påstår, oavsett om vi råkar ha ett värde för det.
 * Noll granskade fält döljer stämpeln helt (VerificationStamp.astro) —
 * en "OGRANSKAT"-etikett hade bara varit ännu ett påstående om ett
 * tomrum, samma fälla som VoidMark redan finns för att undvika.
 */
export type Granskningsniva = 'fullt' | 'delvis' | 'ogranskat';

const GRANSKAT_STATUSAR: readonly Datatillstand[] = ['kontrollast', 'ingen_regel'];

export function bidragGranskningsniva(bidrag: Bidrag, giltighetStatus: Datatillstand): Granskningsniva {
  const statusar = [bidrag.belopp_status, bidrag.deadline_status, bidrag.krav_status, giltighetStatus];
  const antalGranskade = statusar.filter((s) => GRANSKAT_STATUSAR.includes(s)).length;
  if (antalGranskade === 0) return 'ogranskat';
  if (antalGranskade === statusar.length) return 'fullt';
  return 'delvis';
}

const RELATIV_FRIST_RE = /^Relativ tidsfrist:\s*(.+)$/;

export function relativFrist(bidrag: Bidrag): string | null {
  if (bidrag.deadlines.typ !== 'relativ') return null;
  const match = bidrag.anteckning?.match(RELATIV_FRIST_RE);
  if (match) return match[1];
  // A1 (Jacob 2026-08-08): fallbacken visar hela anteckningen när kolon-
  // mönstret inte matchar — men får aldrig visa RÅ text, samma
  // processspråksrisk som BidragCard.astro:s källrad.
  return strippaProcessSprak(bidrag.anteckning).kvar;
}

/**
 * Uppföljning 2026-08-03 (arbetsorder, punkt 2): sen_ansokan ska bara
 * visas när fältet faktiskt bär vad som händer vid en för sen ansökan —
 * inte "Ej angivet i källan" (sentinelvärdet, 2e) och inte en feltaggning
 * där fältet bara restaterar deadline-cykeln ("15 mars varje år" — ett
 * datum, ingen konsekvens). "varje år" verifierat (grep över hela datat,
 * 2026-08-03) att ALDRIG förekomma i en genuin konsekvens-text — bara i
 * den här feltaggningsklassen (12 träffar, se rapporten till Jacob för
 * vilka kommuner).
 *
 * Ärver deadline_status (uppföljning, punkt 2 i den andra arbetsordern):
 * sen_ansokan saknar ett eget statusfält, men "vad händer om man söker
 * sent" är meningslöst utan en känd deadline att vara sen MOT — en
 * kvarglömd sen_ansokan-text på ett bidrag vi inte ens vet deadlinen för
 * (deadline_status: 'okand', ett äkta hål) skulle annars påstå en
 * konsekvens av något odefinierat. 'olast' spärrar INTE (fyra-
 * lägesrevisionen, T3): vi HAR en deadline, bara inte oberoende
 * omkontrollerad — samma reservation gäller överallt (D3), inte en
 * anledning att dölja fältet helt.
 */
export function harRiktigSenAnsokanText(bidrag: Bidrag): boolean {
  if (bidrag.deadline_status === 'okand') return false;
  if (bidrag.sen_ansokan === 'Ej angivet i källan') return false;
  if (/varje år/i.test(bidrag.sen_ansokan)) return false;
  return true;
}

/**
 * 1d (SPEC_HUVUDPROCESSEN §1d, Jacob 2026-08-02): en förutsättnings
 * beskrivning som bockningsbara punkter i stället för ett textblock.
 * Delar ENDAST på meningsgräns (.!?) — ALDRIG på kommatecken. Ett
 * tidigare test (förra sprinten) visade att kommatecken-splittring
 * garblar texten för många kommuner, eftersom kommatecken i svensk
 * löptext inte bara skiljer listelement (uppräkningar, bisatser,
 * "X, Y och Z" blandat med annat). Meningsgränsen är den enda gränsen
 * vi litar på utan att gissa struktur som inte står där.
 *
 * Ger EN punkt (hela texten oförändrad) när beskrivningen bara är en
 * mening — det ÄR flaggan: anroparen ska då rendera prosa som i dag
 * (samma utseende som innan denna funktion fanns), inte tvinga fram en
 * checklista med ett enda kryss. Ingen separat "kuraterings"-lista
 * behövs — fallback-läget är självsynligt (prosa i stället för
 * kryssrutor) för den som tittar på sidan.
 */
export function delaUppKravPunkter(beskrivning: string): string[] {
  return beskrivning
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Antal dagar sedan `verifierad`-datumet. */
export function daysSinceVerified(verifierad: string): number {
  const ms = Date.now() - new Date(verifierad).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export const STALE_THRESHOLD_DAYS = 180;

export function isStale(verifierad: string): boolean {
  return daysSinceVerified(verifierad) > STALE_THRESHOLD_DAYS;
}

const MANADSNAMN = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
];

/** Formaterar ett ISO-datum (YYYY-MM-DD) som svensk klartext: "10 juli 2026". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MANADSNAMN[m - 1]} ${y}`;
}

/** Formaterar ett återkommande MM-DD-datum (deadlines.datum) som svensk klartext utan år: "31 januari". */
export function formatRecurringDate(mmdd: string): string {
  const [m, d] = mmdd.split('-').map(Number);
  return `${d} ${MANADSNAMN[m - 1]}`;
}

// Kalenderns månadsgruppering (SPEC_DEADLINEKALENDER.md, 2026-07-27) —
// "YYYY-MM" som gruppnyckel, ren sträng/heltalsaritmetik precis som
// nextOccurrenceISO ovan, inga Date-objekt.

/** "YYYY-MM" ur ett ISO-datum (YYYY-MM-DD) — kalenderns gruppnyckel. */
export function manadNyckel(iso: string): string {
  return iso.slice(0, 7);
}

/** Nästa månads "YYYY-MM"-nyckel, med årsrullning vid december. */
export function nastaManadNyckel(manad: string): string {
  const [y, m] = manad.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
}

/** Svensk rubrikklartext för en "YYYY-MM"-nyckel, versal månad: "September 2026". */
export function formatManadRubrik(manad: string): string {
  const [y, m] = manad.split('-').map(Number);
  const namn = MANADSNAMN[m - 1];
  return `${namn.charAt(0).toUpperCase()}${namn.slice(1)} ${y}`;
}

const VECKODAGAR = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];

/** Veckodag för ett ISO-datum, gemener: "onsdag". UTC — samma dygnsgräns som daysUntil. */
export function formatWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return VECKODAGAR[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

const MANADSFORKORTNING = ['JAN', 'FEB', 'MAR', 'APR', 'MAJ', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];

/** Formaterar ett ISO-datum som VerificationStamp-format: "03 JUL". */
export function formatStampDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MANADSFORKORTNING[m - 1]}`;
}

/** "a" / "a och b" / "a, b och c" — svensk uppräkning för mall-variabler. */
export function svenskLista(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} och ${items[items.length - 1]}`;
}

/** Svensk genitivform: "Gislaved" → "Gislaveds", men "Borås" → "Borås'" (namn på -s tar bara apostrof). */
export function possessiv(kommun: string): string {
  return /s$/i.test(kommun) ? `${kommun}'` : `${kommun}s`;
}

const KR_TAL = '(\\d[\\d\\s]*\\d|\\d)\\s*kr(?:onor)?';
// Fall 1: HELA strängen är bara "N kr" — ingen konkurrerande formel/sats
// att missförstå. Fall 2: talet är EXPLICIT inramat som ett tak ("max",
// "högst", "upp till", "dock högst") — utan den inramningen kan en
// kr-siffra lika gärna vara en per-timme-taxa ("1 000 kr/aktivitetstimme")
// eller en fast delsumma i en flerledad formel, inte en gräns. Kräver
// inramningen — annars summerar vi taxor som om de vore tak.
const BELOPP_ENDA_TAL_RE = new RegExp(`^\\s*${KR_TAL}\\s*$`, 'i');
const BELOPP_TAK_RE = new RegExp(`(?:max|högst|upp till|dock högst)\\s+${KR_TAL}`, 'i');

/**
 * Parsar ETT absolut krontak ur Bidrag.belopp fri text, eller null om
 * ingen otvetydig sådan siffra finns (procentbaserade belopp, per-enhet-
 * taxor utan uttalat tak, flerledade formler). Grund för matchningstrattens
 * kostnadsram — summera ALDRIG in ett null-resultat som noll; hoppa över
 * det bidraget helt i summeringen.
 */
export function parseBeloppTak(belopp: string | null): number | null {
  if (!belopp) return null;
  const match = belopp.match(BELOPP_ENDA_TAL_RE) ?? belopp.match(BELOPP_TAK_RE);
  if (!match) return null;
  const siffra = Number(match[1].replace(/\s/g, ''));
  return Number.isFinite(siffra) && siffra > 0 ? siffra : null;
}

export interface BeloppSumma {
  total: number;
  capped: number; // antal bidrag med ett parseat tak — bidrar till total
  uncapped: number; // antal bidrag UTAN parseat tak — exkluderade, kan höja den sanna summan
}

export interface BeloppTackning {
  medBelopp: number; // bidrag.belopp !== null — kommunen har publicerat NÅGOT beloppsvärde
  utanBelopp: number; // bidrag.belopp === null
}

/**
 * Räknar hur många av kommunens bidrag som har ett publicerat belopp
 * (`belopp !== null`) kontra inte — grövre än parseBeloppTak/sumBeloppTak
 * (som mäter om ett publicerat belopp gick att tolka som ett krontak).
 * H24 (SPEC_ATERSTAENDE_HAL.md, Kluster 4): grund för täckningsbadgen —
 * medBelopp === 0 && utanBelopp > 0 betyder att INGET av kommunens bidrag
 * har ett publicerat belopp, en kommunegenskap, inte ett dataglapp hos oss.
 */
export function beloppTackning(kommun: Kommun): BeloppTackning {
  let medBelopp = 0;
  let utanBelopp = 0;
  for (const bidrag of kommun.bidrag) {
    if (bidrag.belopp !== null) medBelopp++;
    else utanBelopp++;
  }
  return { medBelopp, utanBelopp };
}

/**
 * Summerar parseBeloppTak() över en lista bidrag. Ett bidrag utan parseat
 * tak bidrar varken till total eller capped — bara till uncapped, så
 * anroparen kan visa en fotnot om vad som utelämnats (Design turn-14).
 */
export function sumBeloppTak(bidragLista: Bidrag[]): BeloppSumma {
  let total = 0;
  let capped = 0;
  for (const bidrag of bidragLista) {
    const tak = parseBeloppTak(bidrag.belopp);
    if (tak !== null) {
      total += tak;
      capped++;
    }
  }
  return { total, capped, uncapped: bidragLista.length - capped };
}

/**
 * Tidigaste kommande deadline för ett bidrag, som ISO-datum — null om bidraget
 * söks löpande (inget datum att jämföra mot). Underlag för progressionens
 * station 2/4-sortering (FORUTSATTNINGAR.md §4).
 */
export function earliestDeadlineISO(bidrag: Bidrag, today: string): string | null {
  if (bidrag.deadlines.typ === 'lopande') return null;
  const occurrences = bidrag.deadlines.datum.map((mmdd) => nextOccurrenceISO(mmdd, today));
  return occurrences.sort()[0] ?? null;
}

/** Dagens datum som YYYY-MM-DD (lokal tid). */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Räknar ut nästa förekomst av ett återkommande MM-DD-datum relativt `todayISO`,
 * som ett fullt ISO-datum (YYYY-MM-DD). Ren sträng/heltalsjämförelse — inga
 * Date-objekt inblandade, så tidszon kan aldrig ge en off-by-one.
 */
export function nextOccurrenceISO(mmdd: string, today: string): string {
  const [ty] = today.split('-').map(Number);
  const todayKey = today.slice(5); // "MM-DD"
  const year = mmdd >= todayKey ? ty : ty + 1;
  return `${year}-${mmdd}`;
}

/** Antal dagar från `today` till `dateISO` (kan bli 0 om det är idag). */
export function daysUntil(dateISO: string, today: string): number {
  const toUTC = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUTC(dateISO) - toUTC(today)) / (1000 * 60 * 60 * 24));
}

/**
 * ISO-datum minus N dagar, UTC — samma dygnsgräns som daysUntil. H19
 * (SPEC: Kluster 1, utfallsslingan): nextOccurrenceISO rullar bara
 * FRAMÅT och kan alltså aldrig hitta "deadlinen som var 14 dagar sedan"
 * — den frågan går åt andra hållet, därav en egen funktion i stället för
 * att försöka vända nextOccurrenceISO baklänges.
 */
export function subtractDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export type Urgency = 'urgent' | 'attention' | 'positive';

/** Urgens-modellen (tokens.css §04): ≤3 dagar bråttom, 4–14 snart, annars god tid. */
export function getUrgency(days: number): Urgency {
  if (days <= 3) return 'urgent';
  if (days <= 14) return 'attention';
  return 'positive';
}

export interface DeadlineEntry {
  kommun: string;
  kommunSlug: string;
  bidragId: string;
  bidragNamn: string;
  kategori: Kategori[];
  isLopande: boolean;
  dateISO: string | null; // null för löpande — kan inte placeras kronologiskt
  belopp: string | null; // rå fritext ur Bidrag.belopp — kalendern kör den genom parseBeloppTak() själv
  deadlineStatus: Datatillstand; // TILLSTANDET_OLAST.md 4c yta 3/4 — markören i kalender- och förstasidesraden
}

export const KATEGORI_LABELS: Record<Kategori, string> = {
  idrott: 'Idrott',
  kultur: 'Kultur',
  social: 'Social',
  pensionar: 'Pensionär',
  funktionsratt: 'Funktionsrätt',
  ovrig: 'Övrigt',
};
