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

export type MatchState = 'MATCHAR' | 'SAKNAR' | 'EJ_BEHORIG';

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
  const state: MatchState = hard ? 'EJ_BEHORIG' : skal.length > 0 ? 'SAKNAR' : 'MATCHAR';

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
  borjaHar: boolean;
}

/** Matchar alla bidrag i en kommun mot en föreningsprofil, grupperat för tregruppersbeskedet. */
export function matchKommun(profil: Foreningsprofil, kommun: Kommun): MatchKommunResult {
  const matchar: Bidrag[] = [];
  const saknar: { bidrag: Bidrag; skal: MatchSkal[] }[] = [];
  const ejBehorig: { bidrag: Bidrag; skal: MatchSkal[] }[] = [];

  for (const bidrag of kommun.bidrag) {
    // H26 — ett pausat/avskaffat bidrag är inget att söka och ska aldrig
    // kunna MATCHA, SAKNA eller vara EJ_BEHORIG. Filtreras bort tidigt,
    // inte i matchBidrag (som prövar villkor mot en profil — status är
    // inget villkor, det är om bidraget överhuvudtaget existerar just nu).
    if (bidrag.status !== 'aktiv') continue;
    const { state, skal } = matchBidrag(profil, bidrag);
    if (state === 'MATCHAR') matchar.push(bidrag);
    else if (state === 'EJ_BEHORIG') ejBehorig.push({ bidrag, skal });
    else saknar.push({ bidrag, skal });
  }

  return { matchar, saknar, ejBehorig, borjaHar: visaBorjaHar(profil, matchar) };
}
