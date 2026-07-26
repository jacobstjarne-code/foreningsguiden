/**
 * priser.ts — Produktpriser, en sanning. Egen fil utan beroenden (samma skäl
 * som kommunTyper.ts bröts ut ur kommuner.ts): en statiskt byggd sida
 * (registrera/index.astro, getStaticPaths) importerar priset direkt, och
 * får då INTE dra in Redis-/Stripe-klientinstansiering i onödan — det hade
 * hänt om priset legat i kop.ts (top-level `new Redis(...)`) eller
 * registrering.ts (Stripe-SDK, dessutom en API-route som sidor inte ska
 * importera från).
 */

// TODO(Jacob/Fable): bekräfta belopp innan skarp aktivering — ingen spec
// (AFFARSMODELL/KVALITETSSPEC/SLUTSPEC_LANSERING/Betalintegration) anger
// ett kronbelopp för just Registreringshjälpen. 149 kr vald som
// platshållare (samma nivå som utkastets ursprungspris innan
// 07-20-revideringen till 249 kr).
export const PRIS_REGISTRERINGSHJALP_ORE = 14900;
