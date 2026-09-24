/**
 * medlemsunderlag.ts — AF1.5 (Jacobs ord): "Medlemsunderlaget kräver
 * födelsedata per medlem, och det är en annan sorts data än allt vi
 * lagrat hittills. Bygg schemat så att det kan bäras senare, men lagra
 * inget nu."
 *
 * INERT — bara typer. INGEN lagring, INGEN Redis-nyckel, INGEN route,
 * INGEN funktion som skapar/uppdaterar/raderar ett Medlemsunderlag.
 * Detta skiljer filen från profilSvar.ts/aktivitetsmall.ts, som båda har
 * konstruktionsfunktioner — den skillnaden är medveten, inte en glömd
 * halvfärdig implementation. Se AF1-rapporten till Jacob för kostnaden
 * (personuppgiftsbiträde, lagringstid, radering) som måste beslutas
 * INNAN någon av dessa typer får en lagringsväg.
 *
 * Varför en annan sorts data än allt annat i profillagret: profilSvar.ts
 * lagrar FÖRENINGENS egna uppgifter (organisationsnummer, stadgar,
 * medlemsantal som ETT tal). Det här är uppgifter om NAMNGIVNA FYSISKA
 * PERSONER under 18 år, inklusive födelsedata — personuppgifter i GDPR:s
 * mening, med särskilt känslig karaktär eftersom det gäller barn.
 */

export interface MedlemsunderlagRad {
  fornamn: string;
  efternamn: string;
  fodelsedatum: string; // ISO — kravrader specificerar ofta "namn och födelsedata ska föras" ordagrant (se AE1-exempel för attendance_retention)
  medlemSedan: string | null; // ISO — okänt om inte kommunen kräver det
}

export interface Medlemsunderlag {
  aktivitetsmallId: string; // scopat till EN aktivitetsmall, samma nivå som D1-svaren (AF1.2) — inte föreningen som helhet
  avserAr: number; // vilket verksamhetsår underlaget gäller
  rader: MedlemsunderlagRad[];
}
