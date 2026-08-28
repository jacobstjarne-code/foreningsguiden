/**
 * girigOrdning.ts — AH1.1 (Jacobs order): frågemotorn. Girig ordning i
 * två steg (R3), omräknad efter varje svar. Ingen statisk lista.
 *
 * ALGORITMEN ÄR AE2:s (incoming/AE2_ANVANDARENS_MATT.md), INTE UPPFUNNEN
 * HÄR: "i varje steg väljs fältet som just då färdigställer flest ännu
 * obesvarade kravrader. Vid lika marginal används kvarvarande berörda
 * rader, bidragstäckning och därefter fältnamn som deterministisk
 * skiljeregel." Samma tre-nivås tiebreak återskapas exakt nedan
 * (tarBortNu → kvarvarandeBerorda → bidragstackning → faltId), så att
 * en framtida jämförelse mot AE2:s tabeller (66 svar, median 1 vid 29
 * svar) är möjlig — även om just AH1 kör kommun-scopat, inte nationellt.
 *
 * EN KRAVRAD KAN KRÄVA FLERA FÄLT SAMTIDIGT (kravKoppling.ts:s
 * allaFaltITexten, inte det gamla första-träff-vinner). En rad räknas
 * besvarad först när ALLA dess fält är besvarade — AE2:s egen regel,
 * "nödvändigt för att inte kalla en sammansatt regel löst efter bara
 * ett delsvar."
 *
 * R3, STEG 1 FÖRE STEG 2: steg 1 är girigt BARA inom det öppna
 * bidragets egna kravrader — en fråga bidraget inte kräver får aldrig
 * visas på dess skärm. Steg 2 kommer bara när steg 1 är uttömt (alla
 * det öppna bidragets fält antingen besvarade eller omöjliga att
 * besvara via profilen, dvs C/D2/custom) och är girigt över ÖVRIGA
 * bidrag i samma kommun, under egen rubrik ("För kommande bidrag") —
 * aldrig blandat in bland det öppna bidragets egna frågor.
 */

import { allaFaltITexten } from './kravKoppling.ts';
import { hamtaFaltdefinition } from './profilFalt.ts';

export interface KravRadMedFalt {
  text: string;
  // Fälten raden uttrycker, ur allaFaltITexten. Tom array = C/D2 eller
  // ett A/B/D1-koncept utan registrerat mönster — aldrig besvarningsbar
  // via profilen, räknas därför aldrig in (R1: "C och D2 räknas aldrig
  // in").
  faltIds: string[];
}

export function analyseraKravrader(krav: string[]): KravRadMedFalt[] {
  return krav.map((text) => ({ text, faltIds: allaFaltITexten(text) }));
}

function radArLost(rad: KravRadMedFalt, besvarade: ReadonlySet<string>): boolean {
  return rad.faltIds.length === 0 || rad.faltIds.every((f) => besvarade.has(f));
}

/** R1: bidraget är "förberett" när varje A/B/D1-kravrad är löst. C/D2 räknas aldrig in. */
export function bidragArForberett(kravRader: KravRadMedFalt[], besvarade: ReadonlySet<string>): boolean {
  return kravRader.every((rad) => radArLost(rad, besvarade));
}

interface Kandidat {
  faltId: string;
  tarBortNu: number; // rader som blir lösta OM detta fält besvaras nu
  kvarvarandeBerorda: number; // olösta rader som fältet förekommer i (helt eller delvis)
}

function kandidaterFran(kravRader: KravRadMedFalt[], besvarade: ReadonlySet<string>): Map<string, Kandidat> {
  const kandidater = new Map<string, Kandidat>();
  for (const rad of kravRader) {
    if (rad.faltIds.length === 0) continue;
    const olosta = rad.faltIds.filter((f) => !besvarade.has(f));
    if (olosta.length === 0) continue; // redan löst
    for (const faltId of olosta) {
      // 'fil'-fält (dokument) är inte frågebara i den här motorn — AF2:s
      // dokumentverifiering.ts är den avsedda, starkare vägen dit, och
      // "bygg inte uppladdningen" gäller fortfarande (AH1.3: "ja/nej
      // eller värde", inga filer). Fältet räknas ändå i olosta.length
      // ovan — en rad som BARA väntar på ett dokument ska inte falskt
      // låtsas vara löst av att dess andra fält besvaras.
      if (hamtaFaltdefinition(faltId)?.datatyp === 'fil') continue;
      const k = kandidater.get(faltId) ?? { faltId, tarBortNu: 0, kvarvarandeBerorda: 0 };
      k.kvarvarandeBerorda++;
      if (olosta.length === 1) k.tarBortNu++;
      kandidater.set(faltId, k);
    }
  }
  return kandidater;
}

/**
 * Väljer bästa nästa fält ur en radmängd. `bidragstackning` = hur många
 * bidrag (i kommunen) som kräver respektive fält — AE2:s tredje
 * tiebreak-nivå, samma tal som raknare.ts:s rackviddForFalt() räknar.
 * null = inget kvar att fråga i den här radmängden.
 */
export function valjBastaFalt(
  kravRader: KravRadMedFalt[],
  besvarade: ReadonlySet<string>,
  bidragstackning: ReadonlyMap<string, number>
): string | null {
  const kandidater = [...kandidaterFran(kravRader, besvarade).values()];
  if (kandidater.length === 0) return null;
  kandidater.sort((a, b) => {
    if (b.tarBortNu !== a.tarBortNu) return b.tarBortNu - a.tarBortNu;
    if (b.kvarvarandeBerorda !== a.kvarvarandeBerorda) return b.kvarvarandeBerorda - a.kvarvarandeBerorda;
    const tackA = bidragstackning.get(a.faltId) ?? 0;
    const tackB = bidragstackning.get(b.faltId) ?? 0;
    if (tackB !== tackA) return tackB - tackA;
    return a.faltId.localeCompare(b.faltId); // deterministisk sista skiljeregel
  });
  return kandidater[0].faltId;
}

export type Fragesteg = 1 | 2;

export interface NastaFragaResultat {
  faltId: string;
  steg: Fragesteg;
}

/**
 * R3: steg 1 (öppna bidragets egna olösta rader) alltid före steg 2
 * (övriga bidrag i kommunen). `ovrigaBidragRader` ska vara unionen av
 * ALLA andra aktivitetsbidrags kravrader i samma kommun — anroparen
 * (sidan) bygger den unionen, den här funktionen vet inget om kommunen
 * eller bidragslistan.
 */
export function nastaFraga(
  oppetBidragRader: KravRadMedFalt[],
  ovrigaBidragRader: KravRadMedFalt[],
  besvarade: ReadonlySet<string>,
  bidragstackning: ReadonlyMap<string, number>
): NastaFragaResultat | null {
  const steg1 = valjBastaFalt(oppetBidragRader, besvarade, bidragstackning);
  if (steg1) return { faltId: steg1, steg: 1 };
  const steg2 = valjBastaFalt(ovrigaBidragRader, besvarade, bidragstackning);
  if (steg2) return { faltId: steg2, steg: 2 };
  return null;
}
