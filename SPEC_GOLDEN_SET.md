# GOLDEN SET — grinden som släpper utkastprodukten skarp

*Opus/Fable 2026-07-27. Definierar vad grinden mäter och hur ett facit ser ut. De faktiska 10–15 faciten skrivs mot verkliga bidrag ur data/kommuner/ — de kan inte skrivas ur minnet, eftersom ett påhittat krav i ett facit är samma fel som generatorn ska hindras från att göra.*

*Detta dokument räcker för Code att bygga testramen. Facit-innehållet följer separat.*

---

## 1. VAD GRINDEN ÄR

Generatorn körs mot 10–15 verkliga bidrag där en människa skrivit vad ett korrekt utkast ska innehålla. Output jämförs mot facit. **Betalning för utkastprodukten aktiveras först när grinden är grön.**

Grinden är inte en kvalitetsmätning av prosa. Den mäter fyra binära ting, och alla fyra måste vara uppfyllda för varje bidrag i uppsättningen.

## 2. DE FYRA KRITERIERNA

**K1 — Täckning.** Varje krav i bidragets `krav[]` bemöts i utkastet. Ett obemött krav = underkänt. Detta är kriteriet som gör produkten värd att betala för: kommunen avslår på formalia, och ett utkast som hoppar över ett krav lämnar exakt den luckan öppen.

**K2 — Ingen uppfinning.** Utkastet innehåller INGET krav, villkor eller påstående om kommunens regler som inte står i bidragets data. Ett tillagt krav = underkänt, även om det låter rimligt och även om det råkar vara sant. Generatorn får bara veta vad datan säger.

**K3 — Ärliga luckor.** Där föreningsprofilen saknar en uppgift som kravet efterfrågar ska utkastet markera luckan (`[Fyll i: X]`), inte hoppa över kravet och inte fylla i något plausibelt. En dold lucka är värre än en synlig — den ser färdig ut och avslås.

**K4 — Inget bifallslöfte.** Utkastet påstår aldrig, i någon formulering, att ansökan kommer beviljas eller att chansen ökar. Ansvarsraden finns med. En enda formulering som antyder utfall = underkänt.

## 3. FACIT-MALLEN

Ett facit skrivs per bidrag och innehåller:

```
BIDRAG: <kommun> / <bidragets namn>
KÄLLA: <kalla_url>

KRAV SOM MÅSTE BEMÖTAS (ur bidragets krav[]):
1. <kravet ordagrant ur datan>
   → Facit: <vad ett korrekt utkast ska säga om detta krav, givet testprofilen>
2. ...

FÖRUTSÄTTNINGAR SOM MÅSTE NÄMNAS (ur kommunens forutsattningar):
- <t.ex. registreringskrav, handläggningstid, giltighet>

LUCKOR SOM MÅSTE MARKERAS (givet testprofilen):
- <uppgift profilen saknar, t.ex. organisationsnummer, budget>

FÖRBJUDET I DETTA UTKAST:
- <krav som INTE står i datan men som en modell kan frestas lägga till —
   t.ex. "verksamhetsberättelse" när bidraget inte kräver det>
```

## 4. TESTPROFILERNA

Faciten skrivs mot tre fasta föreningsprofiler, så generatorn testas i olika dataläge:

**P1 — Komplett.** Alla trattsvar ifyllda, registrerad förening. Testar K1 och K4 i renodlad form: bemöts allt, lovas inget?

**P2 — Luckor.** Verksamhet och kommun ifyllda, storlek och verksamhetstid saknas. Testar K3: markeras luckorna, eller fylls de i?

**P3 — Oregistrerad.** `sokt: nej`. Testar registreringsgrenen: producerar generatorn registreringsutkastet FÖRST i stället för bidragsutkastet?

Varje bidrag i uppsättningen körs mot alla tre. 15 bidrag × 3 profiler = 45 körningar.

## 5. URVAL AV DE 10–15 BIDRAGEN

Uppsättningen väljs för spridning, inte för att vara lätt:

- **Minst 3 med rika, specifika krav** (Askersund, Arvika, Bjuv har sådana) — testar K1 hårt.
- **Minst 2 med `belopp: null`** — testar att generatorn inte hittar på ett belopp.
- **Minst 2 med `kraver_registrering: true`** — testar registreringsgrenen.
- **Minst 2 löpande utan fast deadline** — testar att den inte hittar på ett datum.
- **Minst 1 med tomma eller minimala `krav[]`** — testar att den inte fyller ut med plausibla krav när datan är tunn. Detta är det farligaste fallet och det mest sannolika att fälla generatorn.
- **Minst 1 från en kommun med `forutsattningar: []`** (t.ex. Arjeplog) — testar att den inte hittar på ett registreringskrav.

## 6. VEM SKRIVER VAD

**Fable/Jacob skriver faciten.** Inte Code. Om samma part bygger generatorn och skriver facit testar den sig själv — samma självgranskning som lät batch 3:s fantombidrag passera `loadKommuner()`.

**Code bygger testramen** mot detta dokument: en runner som kör generatorn mot varje (bidrag × profil), jämför mot facit enligt K1–K4, och rapporterar per kriterium vilket fall som fällde.

**Grinden är binär.** 45 av 45 måste passera alla fyra kriterier. Ett underkänt fall betyder att generatorn inte får kopplas till betalning — inte att facit ska mjukas upp.

## 7. NÄSTA STEG

1. Code bygger testramen mot detta dokument (kan börja nu).
2. Fable skriver de 10–15 faciten mot verkliga bidrag ur `data/kommuner/` (kräver filåtkomst).
3. Generatorn körs, grinden bedöms.
4. Grön grind → betalning för utkastprodukten aktiveras (efter partsvalet, som blockerar all skarp betalning).
