# HANDOVER — Design → Projektledning (Opus)

*Från Fable/Design, 2026-07-11. Andra designleveransen: den kommersiella ytan. Går via projektledning innan det når Code. Grundat i AFFARSMODELL.md + DESIGN_UPPDRAG_2_KOMMERSIELL.md, ovanpå det gällande systemet (DESIGN_UPPDRAG.md §9 — oförändrat) och SÖKBARHETSSPEC §3.1/§3.5.*

Levererad fil: **`Föreningsguiden kommersiell.dc.html`** (canvas, öppnas i webbläsare). Turnordning nyast överst: exempelutkast (4) → tre intensiteter (3) → eskaleringspaneler (2) → golv-riktningar utkastvägg (1).

---

## 1. Vad som är beslutat och ritat

**Utkastvyn med väggen (tyngdpunkten).** Ungated — inget konto före värdet. Det skarpa första stycket renderas komplett; fortsättningen syns men är tonad. Väggen sitter *inne i dokumentet* (earned curiosity), inte som separat skärm. Reftele IF / Driftbidrag som exempeldata.

**Tre kommersiella intensiteter (behålls som ramverk, Jacobs beslut).** Enda variabeln är väggens säljtryck; dokumentet hålls identiskt.
- **3a · Enligt brief (golv).** Pris, vad man får, vad man inte får, escape hatch. Inga intensifierare.
- **3b · Måttlig (inom §5).** Ärliga intensifierare: kostnadsram (40 000 kr), månadsankring (41 kr/mån bredvid 495/år), lokal social proof ("34 föreningar i Gislaved bevakar"). **Taket vi bör hålla.**
- **3c · Kraftig (bryter §5).** Nedräkning, falsk knapphet, förvald uppsäljning (644 kr), "9 tittar nu". Ritad *för att visa var linjen går* — inte för att byggas.

**Exempelutkast före köp (4a).** Svar på "vad får jag för 149 kr?". Ett komplett, läsbart utkast från en *annan* förening i samma kategori (Smålandsstenars GoIF, Driftbidrag), tydligt märkt EXEMPEL med neutral mörk banner. Visar format, längd, ton och kravuppfyllnad utan att ge bort köparens eget gratisarbete. Nås via diskret länk på väggen. Helt inom §5.

---

## 2. Designbeslut på de tre öppna frågorna (§8)

1. **Hur mycket är gratis?** Första hela stycket, skarpt och komplett — nog för att bedöma kvalitet och ton, för lite för att skicka in. Exempelutkastet (4a) kompletterar genom att visa en *annan* förenings fulla text.
2. **Var bor "Skapa ansökan"?** Inte som säljknapp på bidragskortet — i slutet av vägen (§6-progressionen) och på väggen inne i utkastet. Kortet förblir en förtroendekomponent.
3. **Abonnemangets ackumulerande värde (svårast, ej färdigritad).** Riktning: en föreningsprofil/föreningsminne som byggs upp *synligt* så värdet ackumuleras framför ögonen. **Nästa designjobb** — inte löst ännu.

---

## 3. Rekommendation

Kör **3a med de ärliga bitarna ur 3b**. Motiv (§5): säljton sänker AI-citering ~26 % och sök är enda distributionen; dark patterns bränner förtroendet hos exakt denna målgrupp. Tonen ÄR konverteringsstrategin. 3a vs 3b är ett säkert A/B-test; **3c är inte ett neutralt testben** — det kan vinna klick-till-betalning kortsiktigt och ändå förlora på citering + förnyelse.

---

## 4. Instruktion till Code (bygg 1, förbered 2)

Bygg ut **hela flödet** (ungated-formulär → utkastvy → paywall → Swish → kvitto) enligt **alternativ 1**. Men **arkitektera intensiteten (golv / måttlig / kraftig) som EN konfigurationsparameter** — en `intensitet`-flagga som utkastvyn och paywallen läser, inte tre skärmar. Väggens copy, kostnadsram, ankarpris och social proof slås på/av via flaggan. Då blir en framtida övergång till **alternativ 2** (nivå väljs per session i A/B-test) en inställning, inte en ombyggnad. Håll nivå-logiken på ett ställe — förbered "om-programmeringen" nu. **3c byggs inte** annat än ev. bakom en avstängd flagga för intern jämförelse. Mätning för kraftig-nivån: förnyelse + citering + förtroende över tid, aldrig enbart klick-till-betalning.

Betalning: Swish först (Stripe Payment Element, native Swish), kort som andrahandsval, ingen fakturagate, mobil-först.

---

## 5. Vad som INTE ändras

DESIGN_UPPDRAG.md står (§9). Tokens, komponentnamn, "civil klarhet med skav", verifieringsstämpeln (oxblod — reserverad), urgens-modellen, WCAG-golv, 16 px brödtext. Den kommersiella ytan är en utvidgning, inte ett undantag. EXEMPEL-märkning får aldrig använda oxblod/granskad-stämpeln.

---

## 6. Kö (ej byggt, inväntar prioritering)

Ungated-formuläret · full long-scroll-paywall · betalsteg (Swish) · kvitto/leverans · **abonnemangets ackumulerande värde (föreningsminnet synligt — den avgörande, svåraste)** · progression kommunsida som väg (§6, byggs med vägledningslagret, inte efter).
