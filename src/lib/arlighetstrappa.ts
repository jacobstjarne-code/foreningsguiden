/**
 * arlighetstrappa.ts — ARBETSORDER 2026-08-11, genomgående princip.
 *
 * "Varje påstående som bygger på data renderas bara när villkoret är
 * uppfyllt, och faller annars tillbaka ett steg. Aldrig uppåt i ett tal
 * vi inte räknat. Bygg det som en enda hjälpfunktion, inte som spridda
 * if-satser — så syns trappan i koden."
 *
 *   villkor uppfyllt   → påståendet
 *   villkor ej uppfyllt → nästa steg ner
 *   botten             → en formulering som inte kräver data alls
 *
 * Använd EN gemensam trappa per påstående, inte en if/else-kedja —
 * varje konsument (B1:s tvåbidragsblock, F①/F②/F③:s trösklar) bygger
 * sin egen array av steg med DENNA funktion, så mönstret är identiskt
 * och sökbart (grep "trappa(") oavsett vilket påstående det gäller.
 */
export interface TrappSteg<T> {
  /** Sant om det här stegets värde får visas. */
  villkor: boolean;
  varde: T;
}

/**
 * Returnerar värdet för det FÖRSTA steget vars villkor är uppfyllt.
 * Sista steget MÅSTE ha villkor: true — det är botten, formuleringen
 * som inte kräver någon data alls. Kastar annars (ett kodfel, inte ett
 * datafel — botten ska aldrig kunna saknas).
 */
export function trappa<T>(steg: TrappSteg<T>[]): T {
  for (const s of steg) {
    if (s.villkor) return s.varde;
  }
  throw new Error('trappa(): inget steg hade villkor: true — botten (sista steget) måste alltid vara sant.');
}
