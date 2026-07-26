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
  // registrerad). Svarar profilen "ja" produceras inget skäl — bidraget kan
  // vara MATCHAR även om kraver_registrering är true (se visaBorjaHar för
  // varför "Börja här"-bannern ändå kan visas i det fallet).
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

/** Visar "Börja här"-gruppen (grupp 3) — kommun-scopad, oberoende av enskilda bidrags state. */
export function visaBorjaHar(profil: Foreningsprofil, matchandeBidrag: Bidrag[]): boolean {
  return profil.sokt !== 'ja' || matchandeBidrag.some((b) => b.kraver_registrering === true);
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
    const { state, skal } = matchBidrag(profil, bidrag);
    if (state === 'MATCHAR') matchar.push(bidrag);
    else if (state === 'EJ_BEHORIG') ejBehorig.push({ bidrag, skal });
    else saknar.push({ bidrag, skal });
  }

  return { matchar, saknar, ejBehorig, borjaHar: visaBorjaHar(profil, matchar) };
}
