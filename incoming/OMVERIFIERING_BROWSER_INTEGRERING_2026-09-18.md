# Omverifiering – browserfynd införda lokalt 18 september 2026

Arbetskatalog: `fg-production-batch-01`, gren `main`. `main` är lokalt fast-forwardad till `omverifiering-steg2-2026-09-17` (`1ce031f`); detta är ännu inte pushat eller verifierat på foreningsguiden.se. De fem äldre AB1.9-kodändringarna som var okommitterade i arbetskopian är bevarade i en namngiven Git-stash. Ospårade dokument i `incoming/` har inte rörts.

Full browsergenomgång med källänkar: [OMVERIFIERING_BROWSERKONTROLL_2026-09-18.md](OMVERIFIERING_BROWSERKONTROLL_2026-09-18.md). Nedan är vad som faktiskt ändrats i datafilerna vid integrationen.

- **Felaktiga eller obelagda kalenderdatum:** Hässleholm har fått kommunens 1 april i stället för 12 maj. Ludvika (arrangemang/projekt), båda sociala Malmöposterna, Heby (socialt stöd), Varberg (Byapengen), Orust (lovaktiviteter), Hagfors (65+), Gällivare (två socialnämndsstöd), Vaggeryds sammanslagna verksamhets-/lokalpost samt Sandvikens sammanslagna stiftelsepost har fått `deadlines.typ: okand` där källan bara anger ett visst års omgång, där perioderna skiljer sig eller där sista dag inte går att belägga. Klippans sponsring är uttryckligen en 2026-post och har också fått okänd nästa frist. Historiska, belagda datum finns kvar i respektive anteckning.
- **Flyttade källor och sakrättningar:** Hässleholm, Klippan, Ängelholm, Skurup, Bräcke, Heby, Hagfors och Gällivare har fått fungerande primärkällor där den tidigare länken var död eller felriktad. Högsbys e-tjänst belägger 1 mars–30 juni även för det särskilda vägbidraget. Gävles beräkningsanteckning anger två verksamhetsår med ett års eftersläpning. Bräckes taxa anger Torpet och ishallens undantag. Ängelholms och Skurups gamla krav har sänkts från `kontrollast` när ersättningskällan inte bekräftar dem.
- **Fortfarande öppet:** Årsspecifika deadlines stöds inte strukturellt av dagens MM-DD-modell. Sandvikens två stiftelser och Vaggeryds två ansökningsvägar bör separeras innan deras olika datum kan visas utan vilseledning. Interbook/BankID-skyddade detaljkrav, Torsås beloppsnormer, Lommas aktuella föreskrift, Svalövs nya taxor samt Täby/Sundbyberg/Trollhättans status kräver ytterligare primärunderlag. Inga sådana värden har gissats in.

Kontroller: `npm run validera`, `npm run verify:matching`, `npm run verify:kommun-klar`, `npm run build` och `git diff --check` gick igenom lokalt. **Inte STÄNGT som leverans:** ändringarna måste granskas i en riktig webbläsare mot en deployment innan de kan kallas klara enligt projektets arbetsregel.

## STÄNGT

Inget obelagt datum, belopp eller avskaffandebeslut har fyllts i. Årsspecifik kalenderrepresentation, kommunbesked bakom inloggning och faktisk live-kontroll öppnar de återstående punkterna.
