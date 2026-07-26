/**
 * priser.ts — Produktpriser, en sanning. Egen fil utan beroenden (samma skäl
 * som kommunTyper.ts bröts ut ur kommuner.ts): en statiskt byggd sida
 * (registrera/index.astro, getStaticPaths) importerar priset direkt, och
 * får då INTE dra in Redis-/Stripe-klientinstansiering i onödan — det hade
 * hänt om priset legat i kop.ts (top-level `new Redis(...)`) eller
 * registrering.ts (Stripe-SDK, dessutom en API-route som sidor inte ska
 * importera från).
 */

// H8 (GRANSKNING_foreningsguiden.md): "registreringsutkast" ersätter det
// tidigare manuella "Registreringshjälp"-erbjudandet (149 kr, "vi hör av
// oss inom kort") — helt automatiserad leverans, samma motor och samma
// pris som bidragsutkastet (249 kr, SLUTSPEC_LANSERING_2026-07-20.md).
// Namnbytet på konstanten speglar att produkten faktiskt bytt identitet,
// inte bara pris.
export const PRIS_REGISTRERINGSUTKAST_ORE = 24900;
