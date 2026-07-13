# CODE-UPPDRAG: Den kommersiella ytan

*Skriven av Opus/Fable 2026-07-13. Arbetsorder till Code. Underlaget finns redan: AFFARSMODELL.md (vad som säljs och varför), DESIGN_UPPDRAG_2_KOMMERSIELL.md (hur ytan ska bete sig), och Designs ritade skärmar i `incoming/Föreningsguiden kommersiell.html` (leverans 2 — utkastvyn med väggen, paywallen, exempelutkastet).*

*Detta är projektets största orörda block. Allt är ritat. Ingenting är byggt.*

---

## 0. Läget

Vägen är byggd (femstationsprogressionen, live). Station 5 pekar idag på kommunens ansökningssystem via `station5Href()` med `UTKASTGENERATOR_BYGGD = false`. **Det är den default som detta uppdrag ersätter.**

Design ritade den kommersiella ytan i leverans 2 och den har legat orörd sedan dess. Läs `incoming/Föreningsguiden kommersiell.html` (turn 1–4) innan du börjar — särskilt **3a** (paywall, golv-nivån) och **4a** (exempelutkastet).

---

## 1. Bygg i denna ordning

### A. Exempelutkastet (`/exempel/[kommun]/[bidrag]/`)

**Börja här. Det är fristående, kräver ingen betalning, ingen inloggning, ingen generator.**

Ett komplett, läsbart ansökningsutkast från en *annan* förening i samma kategori — visar format, längd, ton och kravuppfyllnad utan att ge bort köparens eget arbete. Designs 4a.

- Tydligt märkt EXEMPEL med neutral mörk banner. **EXEMPEL-märkningen får aldrig använda oxblod/granskad-stämpeln** — den färgen är reserverad för verifiering (DESIGN_UPPDRAG.md).
- Texten skrivs av Fable. Bygg behållaren, lämna `{{FABLE:}}`-slot.
- Nås via diskret länk på väggen (steg B) och från station 5.
- **Indexerbar.** Den är gratis, den är innehåll, och den svarar på "hur skriver man en bidragsansökan" — en söktermsfamilj vi inte äger idag.

### B. Ungated-formuläret + utkastvyn med väggen

**Detta är produktens viktigaste skärm. Läs DESIGN_UPPDRAG_2 §2 innan du rör den.**

Hårda krav, i prioritetsordning:

1. **Ungated. Inget konto före värdet.** Belägget: ungated-flöden ger upp till 3x fler betalande (AFFARSMODELL §3.2). Flyttas registreringen före värdeögonblicket kastar vi bort tre fjärdedelar av intäkten. Ingen inloggning, ingen e-postgate, inget "skapa konto för att fortsätta".

2. **Formuläret är vägens slut, inte en separat skärm.** Station 1 (föreningstyp) är redan formulärets första fält — den valda typen ska följa med. Återanvänd samma tillståndslogik som progressionens filtrering; det är samma tratt (Designs handover, leverans 3, §3.2).

3. **Väggen sitter inne i dokumentet.** Earned curiosity: det första hela stycket renderas skarpt och komplett; fortsättningen syns men är tonad. Kassören ska se att texten finns, att den är lång nog, att hennes förenings namn står i den. Väggen är inte en separat skärm framför utkastet — den ligger mitt i det.

4. **Intensiteten är EN konfigurationsflagga**, inte tre skärmar (Designs rekommendation, leverans 2 §4). `intensitet: 'golv' | 'mattlig'`. Väggens copy, kostnadsram, ankarpris och social proof slås på/av via flaggan. Bygg **golv + de ärliga bitarna ur måttlig**. `kraftig` byggs inte — inte ens bakom avstängd flagga, om det inte kostar noll att lämna kvar.

5. **Förbjudet på ytan** (DESIGN_UPPDRAG_2 §5, och det är en teknisk regel, inte en smakfråga): nedräkningsklockor, "bara idag", falsk knapphet, förvalda kryssrutor, "9 tittar nu". Säljton sänker AI-citering ~26 % — och sök är vår enda distribution.

### C. Paywall-panelen

Long-scroll enligt DESIGN_UPPDRAG_2 §3. Elementen i ordning: rubrik (utfall, inte funktion) → pris öppet och omedelbart → lokal social proof → jämförelse 149 vs 495 med månadsankring (495/år = 41 kr/mån) → escape hatch → ansvarsrad.

**Nytt sedan Design ritade:** giltighetsfällan (AFFARSMODELL §2.3) hör hemma i 149-vs-495-jämförelsen, som skälet att välja abonnemanget. Fable skriver copyn. Bygg behållaren.

### D. Betalsteget

- **Swish först, visuellt.** Bäst konvertering online i Sverige.
- **Stripe Payment Element** — stödjer Swish natively, en integration ger Swish + kort.
- Kort som andrahandsval. Ingen fakturagate, ingen "kontakta oss".
- **Mobil-först.** Kassören sitter i soffan.
- 149 kr (utkast) och 495 kr/år (abonnemang). Priserna ska vara vad kassören faktiskt betalar.

### E. Kvitto/leverans

Hur utkastet når föreningen efter betalning — nedladdning, e-post, eller båda. Design har inte ritat detta (det ligger i deras kö). **Föreslå en lösning, bygg den inte förrän Jacob godkänt.**

---

## 2. Vad som INTE byggs nu

- **Utkastgeneratorn själv** (LLM-anropet som skriver ansökan mot kommunens kriterier). Den är en egen uppgift och kräver att föreningsprofilens datamodell finns (AFFARSMODELL §4.2). Bygg flödet runt den först, med ett stubbat generatoranrop — men **stubben får aldrig visa fabricerad text för en betalande kund**. Fram till dess är betalning avstängd.
- **Abonnemangets ackumulerande värde / föreningsminnet.** Design har inte ritat det. Det är den svåraste designfrågan och den avgör förnyelse.
- **Utskicksmotorn** (deadlinebevakning + "er status går ut"-varningen). Egen uppgift.

---

## 3. Grindar

1. **Stanna efter A.** Exempelutkastet är fristående och kan gå live direkt. Visa det innan du fortsätter.
2. **Stanna efter B.** Utkastvyn med väggen är produktens viktigaste skärm — den granskas innan paywall och betalning byggs.
3. **Betalning aktiveras inte** förrän generatorn finns och Fable skrivit ansvarscopyn. Bygg flödet, håll knappen avstängd.

## 4. Fable levererar

- Copy till exempelutkastet (A)
- Copy till väggen och paywallen (B, C) — inklusive giltighetsfällan i 149-vs-495-jämförelsen
- Ansvarsraden ("Vi skriver utkastet. Ansökan lämnar ni in själva, och beslutet fattar kommunen.") — finns redan i `VAGLEDNING.station5.ansvar`, återanvänd den
- Kvitto-/leveranscopy när E är beslutad

Lämna `{{FABLE:}}`-slots. Ingen svensk text skrivs av Code.

## 5. Det som ska bort när detta byggs

`UTKASTGENERATOR_BYGGD = false`, `station5Href()`-defaulten till kommunens ansökningssystem, och `data-utkastgenerator-byggd="false"` i HTML:en. De tre flaggorna finns just för detta ögonblick.
