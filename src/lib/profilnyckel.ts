/**
 * profilnyckel.ts — AG1.2 (Jacobs beslut): "Inget kontosystem. Mejladress
 * plus föreningsnamn står som nyckel... Bygg inte föreningsentiteten."
 *
 * Löser aktivitetsmall.ts:s tidigare öppna fråga ("vad en aktivitetsmall
 * hänger under") och gör den etablerade, ospårade praxisen i den här
 * kodbasen (email+kommunSlug som sammansatt nyckel, ingen inloggning —
 * subscribers.ts, kommunefterfragan.ts) till en delad, namngiven typ i
 * stället för att varje fil som behöver den (aktivitetsmall.ts,
 * dokumentverifiering.ts) definierar sin egen email+namn-form som kan
 * glida isär.
 *
 * INGEN Förening-entitet, inget id, ingen databas-rad för föreningen
 * själv — nyckeln ÄR (email, föreningsnamn), inte en referens till en
 * post som representerar föreningen. Samma svaghet gäller HELA vägen:
 * den som kan de två strängarna kommer åt profilen. Se AF1-rapporten
 * till Jacob (H29-frågan) för varför dokumentåtkomst (dokumentverifiering.ts)
 * medvetet gates hårdare än resten.
 */

export interface Profilnyckel {
  email: string;
  foreningsnamn: string;
}

/** Normaliserad sträng för lagring/jämförelse — samma email.toLowerCase()-idiom som subscribers.ts. */
export function profilnyckelSträng(nyckel: Profilnyckel): string {
  return `${nyckel.email.trim().toLowerCase()}:${nyckel.foreningsnamn.trim()}`;
}

export function normaliseraProfilnyckel(nyckel: Profilnyckel): Profilnyckel {
  return { email: nyckel.email.trim().toLowerCase(), foreningsnamn: nyckel.foreningsnamn.trim() };
}
