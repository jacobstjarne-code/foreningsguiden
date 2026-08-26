/**
 * troskeljamforelse.ts — AF1.4 (Jacobs order): jämför profilens värde mot
 * bidragets tröskel. "Minst 45 minuter" jämförs mot mallens faktiska
 * längd.
 *
 * TRE UTFALL, ALDRIG BARA TVÅ (Jacobs ord): uppfyllt | ej_uppfyllt |
 * gar_inte_att_avgora. Samma disciplin som matching.ts:s MatchState/OKAND
 * (se filhuvudets kommentar där: "Ett jakande behörighetssvar på tomma
 * fält får inte grinda ett köp") — en jämförelse där ENA sidan saknas är
 * INTE samma sak som ett falskt utfall. Jacobs egen referens: "Aldrig ett
 * ja på ett tomt värde — samma fel som matchBidrag hade före OKAND."
 *
 * Riktningen (minst/högst) är ett anropsparametern, inte inbyggd per
 * fält — profilFalt.ts:s FALT_KATALOG har inget riktningsfält, och att
 * lägga till ett vore att bygga matchningslogik, inte lagret AF1 bad om.
 * Anroparen (framtida matchningskod, inte AF1) avgör riktningen utifrån
 * fältets namn ("Minsta X" → minst, "Högsta X" → hogst).
 */

export type Jamforelseutfall = 'uppfyllt' | 'ej_uppfyllt' | 'gar_inte_att_avgora';

export type Troskelriktning = 'minst' | 'hogst';

/** Numeriska tröskar (activity_duration, minimum_participants, m.fl.). */
export function jamforNumeriskTroskel(
  profilVarde: number | null | undefined,
  troskelVarde: number | null | undefined,
  riktning: Troskelriktning
): Jamforelseutfall {
  if (profilVarde == null || troskelVarde == null) return 'gar_inte_att_avgora';
  if (!Number.isFinite(profilVarde) || !Number.isFinite(troskelVarde)) return 'gar_inte_att_avgora';
  const uppfyllt = riktning === 'minst' ? profilVarde >= troskelVarde : profilVarde <= troskelVarde;
  return uppfyllt ? 'uppfyllt' : 'ej_uppfyllt';
}

/** Ja/nej-krav (leader_led, drug_free_activity, m.fl.) — kravVarde är nästan alltid true ("aktiviteten SKA vara ledarledd"). */
export function jamforIntygandeTroskel(
  profilVarde: boolean | null | undefined,
  kravVarde: boolean | null | undefined
): Jamforelseutfall {
  if (profilVarde == null || kravVarde == null) return 'gar_inte_att_avgora';
  return profilVarde === kravVarde ? 'uppfyllt' : 'ej_uppfyllt';
}
