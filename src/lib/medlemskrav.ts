/**
 * medlemskrav.ts — AG1.1 (Jacobs order): "Medlemsantal sparas inte i
 * profilen. Frågas per bidrag, återanvänds inte. Markera de bidrag som
 * har medlemskrav så ytan vet att den frågan alltid ställs."
 *
 * VARFÖR EN EGEN, SEPARAT DETEKTOR — INTE EN DEL AV kravKoppling.ts:s
 * MATCHARE: MATCHARE kopplar krav till ÅTERANVÄNDBARA profilfält (ett
 * lagrat svar som gäller över flera bidrag). Medlemsantal är motsatsen
 * — "relevant ålder/status" definieras olika av varje bidrag (6–20 år
 * hos ett, 65+ hos ett annat), så det finns inget EN siffra att lagra
 * och återanvända (samma brist AE1 själv flaggade, §"Var
 * normaliseringen brister" — se profilFalt.ts:s filhuvud för hela
 * resonemanget bakom borttaget member_count_filtered).
 *
 * Den här modulen svarar därför bara på EN fråga per bidrag: "innehåller
 * något av bidragets krav ett medlemsantalsvillkor?" — booleskt, inget
 * tal extraheras eller lagras. Ytan använder svaret för att ALLTID visa
 * frågan för de bidrag som är markerade, aldrig för att förifylla den
 * från profilen.
 */

import type { AktivitetsbidragRad } from './aktivitetsbidragKorpus.ts';
import { normaliseraKravText } from './kravKoppling.ts';

/** Booleskt, medvetet — se filhuvud för varför inget tal extraheras. */
export function kravUttryckerMedlemsantal(kravText: string): boolean {
  const t = normaliseraKravText(kravText);
  return /minst\s+\d+\s*(?:aktiva\s+|betalande\s+)?medlemmar/.test(t);
}

/** Bidrags-id:n vars kravtext uttrycker ett medlemsantalsvillkor. */
export function identifieraMedlemskravsBidrag(bidragLista: AktivitetsbidragRad[]): string[] {
  return bidragLista.filter((b) => b.krav.some((rad) => kravUttryckerMedlemsantal(rad))).map((b) => b.id);
}
