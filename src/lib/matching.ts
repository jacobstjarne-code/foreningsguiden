/**
 * matching.ts — Matchningstratten (turn-11). Jämför en Foreningsprofil mot
 * ett Bidrags matchningsfält (kommuner.ts) och avgör MATCHAR/SAKNAR/EJ_BEHORIG.
 *
 * Kärninvariant: ett MatchSkal skapas ENDAST när både bidragets villkor och
 * profilens svar är kända och säger emot varandra. Är endera null/obesvarad
 * hoppas kontrollen över — null filtrerar aldrig bort, en obesvarad fråga
 * filtrerar aldrig bort. Med alla matchningsfält null (dagens läge i alla
 * kommun-YAML) returnerar matchBidrag alltid MATCHAR — grov matchning är en
 * egenskap av den här logiken, inte ett separat kodläge.
 *
 * Ingen svensk text härifrån. `falt` är YAML-fältnamnet rakt av — sidan
 * mappar falt → rätt GUIDE_TRATT_COPY.ts-mall. Motorn känner inte till copy.
 */

import type { Bidrag, Kommun, Verksamhet } from './kommunTyper';
import type { Foreningsprofil, Medlemsbucket, Aldersbucket } from './foreningsprofil';

export type MatchState = 'MATCHAR' | 'SAKNAR' | 'EJ_BEHORIG' | 'OKAND';

export type MatchSkalFalt =
  | 'foreningstyp'
  | 'min_medlemmar'
  | 'min_verksamhetstid_manader'
  | 'kraver_registrering'
  | 'alder_min'
  | 'alder_max'
  | 'sate_i_kommunen';

export interface MatchSkal {
  falt: MatchSkalFalt;
  kravVarde: unknown;
  profilVarde: unknown;
}

export interface MatchResult {
  state: MatchState;
  skal: MatchSkal[];
}

// Bucketens ÖVRE gräns (bästa fallet) — en falsk MATCHAR är billigare än en
// falsk SAKNAR (kommunen fattar ändå det riktiga beslutet, Station 5:s
// ansvarstext säger det redan; en falsk SAKNAR avskräcker en giltig ansökan).
const MEDLEMSBUCKET_OVRE: Record<Medlemsbucket, number> = {
  xs: 24,
  s: 100,
  m: 500,
  l: Number.POSITIVE_INFINITY,
};

const TIDSBUCKET_OVRE_MANADER: Record<Aldersbucket, number> = {
  ny: 11,
  mellan: 36,
  etablerad: Number.POSITIVE_INFINITY,
};

// Fält vars avvikelse är MJUK (SAKNAR — åtgärdbart, eller "dubbelkolla ert
// svar", se GUIDE_TRATT_COPY.ts besked.behover-mallarnas ton). Allt annat
// är HÅRT (EJ_BEHORIG). sate_i_kommunen/alder_min/alder_max har ingen
// SAKNAR-mall i copyn och samlas inte in av tratten än — se matchBidrag.
const MJUKA_FALT: ReadonlySet<MatchSkalFalt> = new Set(['foreningstyp', 'min_medlemmar', 'min_verksamhetstid_manader', 'kraver_registrering']);

/** Matchar ett enskilt bidrag mot en föreningsprofil. */
export function matchBidrag(profil: Foreningsprofil, bidrag: Bidrag): MatchResult {
  const skal: MatchSkal[] = [];

  if (bidrag.foreningstyp !== null && profil.verksamhet.length > 0) {
    const overlapp = bidrag.foreningstyp.some((v: Verksamhet) => profil.verksamhet.includes(v));
    if (!overlapp) {
      skal.push({ falt: 'foreningstyp', kravVarde: bidrag.foreningstyp, profilVarde: profil.verksamhet });
    }
  }

  if (bidrag.min_medlemmar !== null && profil.storlek !== null) {
    if (MEDLEMSBUCKET_OVRE[profil.storlek] < bidrag.min_medlemmar) {
      skal.push({ falt: 'min_medlemmar', kravVarde: bidrag.min_medlemmar, profilVarde: profil.storlek });
    }
  }

  if (bidrag.min_verksamhetstid_manader !== null && profil.alder !== null) {
    if (TIDSBUCKET_OVRE_MANADER[profil.alder] < bidrag.min_verksamhetstid_manader) {
      skal.push({ falt: 'min_verksamhetstid_manader', kravVarde: bidrag.min_verksamhetstid_manader, profilVarde: profil.alder });
    }
  }

  // kraver_registrering: skäl bara när profilen INTE svarat "ja" (redan
  // registrerad). Svarar profilen "ja" produceras inget skäl — bidraget är
  // MATCHAR även om kraver_registrering är true, och visaBorjaHar (nedan)
  // visar sedan 2026-07-30 INTE "Börja här"-bannern för den föreningen
  // heller (golden set-facit 14, arvika-sociala-stodforeningar — en redan
  // registrerad förening ska aldrig hänvisas till registreringsutkastet
  // igen bara för att ETT av hennes matchade bidrag kräver registrering).
  if (bidrag.kraver_registrering === true && profil.sokt !== 'ja') {
    skal.push({ falt: 'kraver_registrering', kravVarde: true, profilVarde: profil.sokt });
  }

  // alder_min/alder_max (medlemmarnas ålder) och sate_i_kommunen: tratten
  // samlar inte in profildata för dessa än (ingen fråga om medlemsålder
  // eller säte skilt från kommunval) — profilsidan är därmed alltid
  // "obesvarad" och ingen skal produceras. Latent tills en framtida fråga
  // 6/7 börjar samla in det (se matching-motorns filhuvud).

  const hard = skal.some((s) => !MJUKA_FALT.has(s.falt));
  // M2.7 (Jacob 2026-08-17): "Ett jakande behörighetssvar på tomma fält
  // får inte grinda ett köp." Utan skal-poster (inget villkor sa emot
  // profilen) betydde MATCHAR hittills två olika saker som råkade se
  // lika ut: en verklig, prövad matchning ELLER "vi har inget att pröva
  // mot" (bidragHarMatchningsvillkor false — 2719/2808 aktiva bidrag,
  // uppmätt 2026-08-17). OKAND skiljer dem åt. bidragHarMatchningsvillkor
  // definieras längre ner i filen (function-hissning, samma mönster som
  // harMatchningsdata redan bygger på).
  const state: MatchState = hard
    ? 'EJ_BEHORIG'
    : skal.length > 0
      ? 'SAKNAR'
      : bidragHarMatchningsvillkor(bidrag)
        ? 'MATCHAR'
        : 'OKAND';

  return { state, skal };
}

/**
 * Visar "Börja här"-gruppen (grupp 3) — kommun-scopad, oberoende av
 * enskilda bidrags state.
 *
 * FIX 2026-07-30 (Jacob, golden set-facit 14 arvika-sociala-stodforeningar):
 * kraver_registrering ska bara trigga "Börja här" TILLSAMMANS MED
 * profil.sokt !== 'ja' — aldrig ensamt. Den gamla OR-varianten
 * (`sokt !== 'ja' || matchandeBidrag.some(kraver_registrering)`) visade
 * bannern även för en förening som redan svarat "ja" (registrerad), bara
 * för att ETT av hennes matchade bidrag råkade ha kraver_registrering
 * satt — motsägde matchBidrags egen kommentar om att ett sådant bidrag
 * ändå ska räknas MATCHAR. Eftersom "kräver A OCH B" alltid är en delmängd
 * av "kräver A ensamt" kollapsar den korrekta logiken matematiskt till
 * bara `profil.sokt !== 'ja'` — matchandeBidrag/kraver_registrering
 * påverkar inte längre utfallet, men parametern behålls: signaturen delas
 * med anropsstället i utkastGenerator.ts (registreringForst), och en
 * framtida per-bidrag-registreringsstatus (skild från den grova
 * sokt-frågan) kan behöva den igen.
 */
export function visaBorjaHar(profil: Foreningsprofil, matchandeBidrag: Bidrag[]): boolean {
  void matchandeBidrag;
  return profil.sokt !== 'ja';
}

// Fälten som räknas som "riktig matchningsdata" — samma fem som faktiskt
// kan producera ett MatchSkal i matchBidrag ovan. sate_i_kommunen är
// medvetet UTESLUTET: ingen fråga i tratten samlar in ett motsvarande
// profilsvar, så fältet kan aldrig påverka matchningen även om det fylls
// i — att räkna det här skulle kunna slå på "skarp" kostnadsram/SAKNAR-
// rendering utan att matchningen faktiskt blivit skarpare för användaren.
function bidragHarMatchningsvillkor(bidrag: Bidrag): boolean {
  return (
    bidrag.min_medlemmar !== null ||
    bidrag.alder_min !== null ||
    bidrag.alder_max !== null ||
    bidrag.min_verksamhetstid_manader !== null ||
    bidrag.foreningstyp !== null ||
    bidrag.kraver_registrering !== null
  );
}

/**
 * Sant när MINST ETT bidrag i kommunen har något ifyllt matchningsvillkor
 * — dvs. researchpasset har börjat extrahera data för den här kommunen.
 * Styr om matchningstrattens kostnadsram/SAKNAR-grupp får presentera en
 * "skarp", personlig siffra (harMatchningsdata true) eller måste falla
 * tillbaka på en ofiltrerad, ärlig kommun-pott (false — dagens läge för
 * alla 80 kommuner, innan Haiku-passet fyllt i fälten). Utan den här
 * spärren ser ALLA bidrag ut att matcha så fort alla fält är null (grov
 * matchning per design, se matchBidrag) — det är rätt för själva
 * matchningen, men fel att presentera som en personlig kostnadsram.
 */
export function harMatchningsdata(kommun: Kommun): boolean {
  return kommun.bidrag.some(bidragHarMatchningsvillkor);
}

export interface MatchKommunResult {
  matchar: Bidrag[];
  saknar: { bidrag: Bidrag; skal: MatchSkal[] }[];
  ejBehorig: { bidrag: Bidrag; skal: MatchSkal[] }[];
  // M2.7 — bidrag utan ett enda ifyllt matchningsvillkor. Inte samma sak
  // som saknar (som kräver ett FAKTISKT motsägande skäl) — okand betyder
  // "vi har inget att pröva mot alls". Egen hink, faller ALDRIG in i
  // matchar eller saknar av misstag (se matchBidrag).
  okand: Bidrag[];
  borjaHar: boolean;
}

/** Matchar alla bidrag i en kommun mot en föreningsprofil, grupperat för tregruppersbeskedet. */
export function matchKommun(profil: Foreningsprofil, kommun: Kommun): MatchKommunResult {
  const matchar: Bidrag[] = [];
  const saknar: { bidrag: Bidrag; skal: MatchSkal[] }[] = [];
  const ejBehorig: { bidrag: Bidrag; skal: MatchSkal[] }[] = [];
  const okand: Bidrag[] = [];

  for (const bidrag of kommun.bidrag) {
    // H26 — ett pausat/avskaffat bidrag är inget att söka och ska aldrig
    // kunna MATCHA, SAKNA eller vara EJ_BEHORIG. Filtreras bort tidigt,
    // inte i matchBidrag (som prövar villkor mot en profil — status är
    // inget villkor, det är om bidraget överhuvudtaget existerar just nu).
    if (bidrag.status !== 'aktiv') continue;
    const { state, skal } = matchBidrag(profil, bidrag);
    if (state === 'MATCHAR') matchar.push(bidrag);
    else if (state === 'EJ_BEHORIG') ejBehorig.push({ bidrag, skal });
    else if (state === 'OKAND') okand.push(bidrag);
    else saknar.push({ bidrag, skal });
  }

  return { matchar, saknar, ejBehorig, okand, borjaHar: visaBorjaHar(profil, matchar) };
}

// ---------------------------------------------------------------------
// SPEC B3 (Design, runda 6, 2026-08-06) — trattens BESKED-skärm.
// ---------------------------------------------------------------------
// Egen, medvetet enklare funktion — INTE en ersättning för matchBidrag/
// matchKommun ovan, som fortfarande är den riktiga behörighetsmotorn och
// används oförändrad av utkastGenerator.ts, checkout/bidragsutkast.ts,
// registrera/utkast-sidorna och flera cron-jobb. B3:s kärnbeslut:
// "Sortera, aldrig filtrera" — foreningstyp finns bara i 25 av 290
// kommuner, så ett KRAV-baserat filter (matchBidrags MATCHAR/SAKNAR/
// EJ_BEHORIG, som även prövar min_medlemmar/kraver_registrering/etc.)
// ger fel svar i de 265 som saknar fältet. Den här funktionen gör bara
// EN sak: sorterar (aldrig utesluter) kommunens AKTIVA bidrag efter om
// verksamhetssvaret överlappar bidragets EGEN kategorisering — och,
// sedan M2.3, hur säkert det överlappet är (relevansniva nedan).
//
// "kategori eller föreningstyp" (B3, D-B): kategori (Kategori[], samma
// taxonomi som kommunens navigering) och foreningstyp (Verksamhet[],
// matchBidrags taxonomi) är TVÅ OLIKA fältuppsättningar — kategori
// saknar hembygd/friluft/ungdom/annat, foreningstyp saknar pensionar/
// funktionsratt/ovrig. Där de delar samma strängvärde (idrott/kultur/
// social) fångar jämförelsen överlappet ändå; en förening som svarat
// "Hembygd" kan alltså bara hamna i den överlappande gruppen via ett
// bidrags foreningstyp, aldrig via kategori — det är korrekt, inte en
// bugg, eftersom kategori-taxonomin inte HAR ett hembygd-värde.
//
// M2.3 (Jacob 2026-08-17, precisionsordern): "Passar er verksamhet"/"Kan
// gälla er ändå" var två rubriker som båda överclaimade — den ena med för
// mycket säkerhet, den andra genom att INTE säga varför den inte hörde
// hemma i den första. Ersatt av tre nivåer, i STRIKT ORDNING (foreningstyp
// prövas alltid först — den finns bara i 25/290 kommuner, se ovan, men där
// den finns är den ett riktigt, kommunuttalat krav, starkare signal än
// kategori som alltid är ifylld):
//
//   troligen_relevant    bidrag.foreningstyp finns OCH överlappar profilen
//   kan_vara_relevant    foreningstyp saknas, kategori överlappar
//   gar_inte_att_bedoma  varken foreningstyp eller kategori överlappar
//
// Nivå tre är INTE "matchar inte" — frånvaro av kategoriöverlapp bevisar
// ingen obehörighet (samma "null filtrerar aldrig bort"-princip som
// matchBidrag). Skäl-copyn (GUIDE_TRATT_COPY.ts) får aldrig antyda det.
// Motorn känner inte till copy (se filhuvudet) — bara matchandeForeningstyp
// (de VÄRDEN som faktiskt överlappade, för skälets "{foreningstyp}"-
// interpolation), ingen svensk text härifrån.
export type Relevansniva = 'troligen_relevant' | 'kan_vara_relevant' | 'gar_inte_att_bedoma';

export interface TrattRad {
  bidrag: Bidrag;
  niva: Relevansniva;
  // Bara ifylld när niva === 'troligen_relevant'.
  matchandeForeningstyp: Verksamhet[];
}

function bedomRelevans(profil: Foreningsprofil, bidrag: Bidrag): TrattRad {
  if (bidrag.foreningstyp !== null) {
    const matchande = bidrag.foreningstyp.filter((v) => profil.verksamhet.includes(v));
    if (matchande.length > 0) return { bidrag, niva: 'troligen_relevant', matchandeForeningstyp: matchande };
  }
  const kategoriOverlappar = bidrag.kategori.some((k) => (profil.verksamhet as readonly string[]).includes(k));
  if (kategoriOverlappar) return { bidrag, niva: 'kan_vara_relevant', matchandeForeningstyp: [] };
  return { bidrag, niva: 'gar_inte_att_bedoma', matchandeForeningstyp: [] };
}

export interface TrattSortering {
  troligenRelevant: TrattRad[];
  kanVaraRelevant: TrattRad[];
  garInteAttBedoma: TrattRad[];
}

export function sorteraForTratt(profil: Foreningsprofil, kommun: Kommun): TrattSortering {
  const troligenRelevant: TrattRad[] = [];
  const kanVaraRelevant: TrattRad[] = [];
  const garInteAttBedoma: TrattRad[] = [];

  for (const bidrag of kommun.bidrag) {
    // H26 — samma regel som matchKommun: ett pausat/avskaffat bidrag är
    // inget att söka. Det här är bidragets EGET tillstånd, inte ett
    // svar-baserat filter, så det bryter inte mot "sortera aldrig
    // filtrera" (som handlar om ATT INTE utesluta baserat på PROFILEN).
    if (bidrag.status !== 'aktiv') continue;

    // Obesvarad verksamhetsfråga (i praktiken hindrat av tratten/
    // igenkänningsraden innan sorteraForTratt någonsin anropas, men
    // motorn ska ändå aldrig gissa): varken foreningstyp eller kategori
    // kan jämföras mot ett tomt svar — sant att vi inte kan bedöma det,
    // inte en gissning.
    const rad =
      profil.verksamhet.length > 0
        ? bedomRelevans(profil, bidrag)
        : { bidrag, niva: 'gar_inte_att_bedoma' as const, matchandeForeningstyp: [] as Verksamhet[] };

    if (rad.niva === 'troligen_relevant') troligenRelevant.push(rad);
    else if (rad.niva === 'kan_vara_relevant') kanVaraRelevant.push(rad);
    else garInteAttBedoma.push(rad);
  }

  return { troligenRelevant, kanVaraRelevant, garInteAttBedoma };
}
