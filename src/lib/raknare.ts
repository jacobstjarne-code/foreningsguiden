/**
 * raknare.ts — AH1.2 (Jacobs order): räknarna enligt R1 och R2. Båda
 * läses ur kravtabellen, inget hårdkodat.
 *
 * R1: "6 av 14 är förberedda i Gislaved" — INTE "kan skickas". Ett
 * bidrag kan aldrig skickas enbart ur lagret (D2-krav som datum,
 * redovisning, projektuppgifter — 21 % av alla kravrader, AE2 — löses
 * först vid ansökan). "Förberedd" = varje A-, B- och D1-krav besvarat.
 * C och D2 räknas aldrig in.
 *
 * R2: räckvidd är KOMMUN-SCOPAD, inte nationell. "Räcker för 6 av 14
 * bidrag i Gislaved" räknar bara bidrag i DEN VALDA KOMMUNEN. Det
 * nationella talet (mock 22d: "75 bidrag i hela Sverige") hör bara
 * hemma i betalrutan (AH1.8) som portabelt framtidsvärde — aldrig i
 * den löpande frågeflödets räckviddsrad.
 */

import { analyseraKravrader, bidragArForberett, type KravRadMedFalt } from './girigOrdning.ts';

export interface BidragMedKravRader {
  id: string;
  namn: string;
  kravRader: KravRadMedFalt[];
}

export function byggBidragMedKravRader(bidrag: { id: string; namn: string; krav: string[] }[]): BidragMedKravRader[] {
  return bidrag.map((b) => ({ id: b.id, namn: b.namn, kravRader: analyseraKravrader(b.krav) }));
}

/** R1: antal bidrag i kommunen som är förberedda (av det totala antalet). */
export function antalForberedda(
  bidragIKommunen: BidragMedKravRader[],
  besvarade: ReadonlySet<string>
): { forberedda: number; totalt: number } {
  const forberedda = bidragIKommunen.filter((b) => bidragArForberett(b.kravRader, besvarade)).length;
  return { forberedda, totalt: bidragIKommunen.length };
}

/** R2: hur många bidrag i kommunen kräver ETT GIVET fält — "räcker för X av Y". */
export function rackviddForFalt(faltId: string, bidragIKommunen: BidragMedKravRader[]): number {
  return bidragIKommunen.filter((b) => b.kravRader.some((rad) => rad.faltIds.includes(faltId))).length;
}

/**
 * Bidragstäckning för VARJE fält som förekommer i kommunen — grunden
 * för girigOrdning.ts:s tredje tiebreak-nivå OCH för R2:s räckviddsrad
 * efter varje svar. Beräknas en gång per sida, inte per fråga.
 */
export function byggBidragstackning(bidragIKommunen: BidragMedKravRader[]): Map<string, number> {
  const tackning = new Map<string, number>();
  for (const b of bidragIKommunen) {
    const faltIBidraget = new Set(b.kravRader.flatMap((rad) => rad.faltIds));
    for (const faltId of faltIBidraget) {
      tackning.set(faltId, (tackning.get(faltId) ?? 0) + 1);
    }
  }
  return tackning;
}
