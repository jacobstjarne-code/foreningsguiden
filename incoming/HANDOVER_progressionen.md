# HANDOVER — Design → Projektledning (Opus)

*Från Fable/Design, 2026-07-11. Tredje designleveransen: progressionen (§6). Uppföljning på DESIGN-UPPDRAG 3. Ersätter inget i systemet — omstrukturerar informationen på kommunsidan.*

Levererad fil: **`Föreningsguiden kommersiell.html`** (fristående, öppnas offline i webbläsare — dubbelklick). Källa: `Föreningsguiden kommersiell.dc.html`. Progressionen ligger som turn **5a**, överst.

---

## 1. Vad som byggts

Kommunsidan (Gislaved) omgjord från tjugo likvärdiga kort till **en väg med fem stationer**, ordnad efter kassörens beslutsföljd:

1. **Vad gäller er?** — föreningstyp-gaffeln (stor). Filtrerar sidan *och* är formulärets första fält. "Sparat till ert utkast: föreningstyp — idrott" gör tratten synlig.
2. **Vad är brådskande?** — en skarp UrgencyChip-rad (liten, fokuserad).
3. **Vad måste göras först?** — förutsättningarna i egen ockraton: bli bidragsberättigad (~4 v), registrera anläggning i InterbookGo. **Eget förslag, ej PL-beslut** — motiverat: det syns inte alls idag och är ofta viktigare än deadlinen.
4. **Vad kan ni söka nu?** — navigerbar lista (inte likvärdiga kort), ordnad efter angelägenhet; irrelevant bidrag dolt med "Visa ändå".
5. **Vad ska ni skriva?** — accent-fyllt mål. "3 av 5 fält redan ifyllda", "Skapa ansökan" → utkastvyn (#3a).

---

## 2. Designprinciper som styrde

- **Rörelsen kommer ur informationens ordning, inte ur CSS.** Ryggraden är en kontinuerlig vertikal linje; stationsmarkörerna sitter på den; den bara linjen mellan stationerna är vilan. Ingen scroll-animation, inga effekter — strukturen ÄR rörelsen.
- **Rytm genom storlek.** Gaffel stor → brådska liten → förutsättningar medel (egen ton) → lista tallast → mål accent-fyllt. Något stort, något litet, något först.
- **Kortet var fel behållare** för icke-likvärdigt innehåll som ska navigeras, inte skummas. Stationerna ersätter det.
- **Vägen och det ungated-flödet är samma tratt.** Station 1 = formulärets första fält. Ju längre i vägen, desto mer av underlaget är ifyllt vid "Skapa ansökan". §8-fråga 2 därmed slutgiltigt besvarad: Skapa ansökan bor i vägens slut; bidragskortet förblir förtroendekomponent.

---

## 3. Två saker att veta

1. **Byggd för att loopas ihop med Fable.** Jag har ritat behållaren; brödtexten i stationerna är avsiktligt kort platshållartext. Vägledningstexten som *är* strukturen skrivs av Fable — loopa in inför den passningen.
2. **Interaktivitet är statisk mock.** Föreningstyp-valet, filtreringen och "3 av 5 fält" visar mål-tillståndet (idrott vald). Code bygger den faktiska filtreringen — och den bör återanvända samma nivå-/tillståndslogik som ungated-flödet, eftersom det är samma tratt.

---

## 4. Vad som INTE ändrats

DESIGN_UPPDRAG.md står. Tokens, "civil klarhet med skav", verifieringsstämpeln i oxblod (reserverad), urgens-modellen (UrgencyChip återanvänd oförändrad), WCAG-golv, 16 px brödtext. Progressionen är en omstrukturering av informationen, inte av systemet.

---

## 5. Kö (ej byggt, inväntar prioritering)

1. **Ungated-formuläret** — som vägens naturliga slut, inte separat skärm. Nästa naturliga steg (delar tratt med progressionen).
2. **Betalsteget** (Swish först) och **kvittot/leveransen** — mekaniska, behöver ritas.
3. **Abonnemangets ackumulerande värde** — den svåraste, avgör förnyelse. Skjuten, ej glömd.

---

*Rekommendation kvar från leverans 2: kommersiell intensitet som EN konfigurationsflagga (golv/måttlig/kraftig), inte tre skärmar. 3a + de ärliga bitarna ur 3b. 3c byggs inte annat än bakom avstängd flagga.*
