# DESIGN-UPPDRAG: Föreningsguiden — PoC

*Skriven av Opus/Fable 2026-07-10. Uppdragsbeskrivning för Design-instansen. Läses tillsammans med UPPDRAG_POC.md i samma mapp, som beskriver produkt, sidstruktur och datamodell. Redaktionella/strategiska frågor går till Fable/Jacob — gissa inte.*

*Namn beslutat 2026-07-10: **Föreningsguiden** (foreningsguiden.se). Se namnbesluts-noten i UPPDRAG_POC.md för skäl.*

---

## 1. Vad designen ska åstadkomma

Föreningsguiden samlar kommunala föreningsbidrag — regler, deadlines, ansökningsvägar — för föreningskassörer och ideella eldsjälar. Sajtens hela värde vilar på **förtroende**: en kassör ska våga lita på ett deadline-datum från oss i stället för att dubbelkolla mot kommunens sida. Designens jobb är att signalera det förtroendet omedelbart.

**Designposition: civil klarhet.** Tydligare än en kommunsida, seriösare än en startup, varmare än en myndighet. Referenspunkter i känsla (inte i stil att kopiera): 1177:s lugn, Skatteverkets nya klarspråkighet, brittiska gov.uk:s radikala enkelhet. INTE: SaaS-landningssida, gradienter, illustrerade blobbar, "AI-estetik".

**Anti-mönster att aktivt undvika:** allt som får sajten att likna de LLM-genererade innehållssajter som kommer att översvämma nischen. Vår visuella skillnad ÄR en förtroendesignal.

## 2. Målgrupp och konsekvenser

Föreningskassörer och styrelseledamöter, ofta 45–75 år, blandad teknikvana, mobil och desktop ungefär lika viktiga. Konsekvenser:

- Generös grundtextstorlek (min 16 px brödtext, gärna 18), hög kontrast, inga tunna snitt i småstorlek.
- WCAG 2.1 AA som golv — kontrast, fokusmarkeringar, tangentbordsnavigering. Detta är också rätt signal: tillgänglighet läses som seriositet av just denna målgrupp.
- Ingen funktion får gömma sig bakom hover. Touch-mål minst 44 px.
- Datum skrivs alltid ut ("31 mars 2027"), aldrig enbart numeriskt — deadlines är kärninnehållet och får inte kunna misläsas.

## 3. Fabriksperspektivet (styr arkitekturen)

Detta är vertikal 1 av flera på samma motor (vertikal 2: stipendier för studenter). Designa därför ett **tokenbaserat system, inte en sajt**:

- Alla färger, typsnitt, radier, avstånd som CSS-variabler i ett basdokument.
- Per-vertikal theming = accentfärg + eventuellt typsnittspar. Strukturen, komponenterna och gråskalan delas.
- Komponenterna namnges domänneutralt (`datakort`, `deadlinelista`, `kallrad` — inte `kommunkort`).

## 4. Komponenter att designa (prioritetsordning)

1. **Datakortet** — ett bidrag: namn, kategori, målgrupp, deadline(s), krav, ansökningslänk, källänk + verifieringsdatum. Sajtens vanligaste komponent. Verifieringsraden ("Kontrollerad mot [kommun].se 10 juli 2026 →") ska vara synlig utan att dominera — den är förtroendemekaniken. Designa även varianten med inaktualitetsflagga (>180 dagar sedan verifiering).
2. **Deadlinekalendern** — sajtens unika sida och mest krävande yta. Kronologisk lista över alla deadlines, filtrerbar på kommun/kategori. Måste fungera utmärkt på mobil (kassören kollar i soffan). Utforska: gruppering per månad, "närmast först", visuell brådska-gradering (inom 2 veckor / inom 2 månader / senare) — men undvik alarmism, det ska kännas som en kompetent kalender, inte en countdown.
3. **E-postregistreringen** — "Bevaka deadlines för din kommun." Ska kännas som en tjänst, inte en nyhetsbrevsfälla: tydlig ändamålstext (copy från Fable), kommunval, lugn formgivning. Detta är PoC:ns konverteringspunkt.
4. **Kommunsidans huvud** — kommunnamn, förvaltning, ansökningssystem, antal bidrag, senast verifierad. Ska ge omedelbar "här är allt om din kommun"-känsla.
5. **Navigering/sidfot** — kommunväljare (10 nu, ska tåla 290), kategorinav, metodlänk. Sidfoten bär källpolicy och GDPR-länkar.

## 5. Identitet

- Namn **Föreningsguiden** (foreningsguiden.se, beslutat). Designa ändå ordmärket rent typografiskt utan symbolintegration i PoC — håller framtida namn-/brand-extension (föreningsjuridik m.m.) billig. Notera tonen: "guide" ska läsas som kompetent vägledning, inte som lifestyle/kupong — formgivningens seriositet bär den skillnaden, inte namnet.
- Färgriktning: förslagsvis en mörk, stabil bas (djupblå/grafit-familjen läses "institution") med EN varm accent för deadlines/CTA. Design-instansen tar fram 2–3 riktningar som statiska mockups av datakortet + kalendern innan något systematiseras. Jacob väljer.
- Typografi: systemnära eller en (1) välbeprövad läsvänlig sans via variabel font. Ingen display-typografi. Prestanda är en SEO-faktor.
- Uttryckligen INTE Bandy Managers parchment/koppar — annan produkt, annan känsla, och vertikalerna ska inte se besläktade ut utåt.

## 6. Leveranser och format

1. **Riktningsval:** 2–3 mockups (datakort + kalenderutsnitt, mobil + desktop) → Jacob väljer riktning.
2. **Tokendokument:** CSS-variabler (färg, typo-skala, spacing, radier, skuggor) som Code kan klistra in.
3. **Komponentmockups:** samtliga fem komponenter ovan i vald riktning, mobil + desktop, inklusive tomt-läge och inaktualitetsflagga.
4. **Sidlayouter:** startsida, kommunsida, kalender — wireframe-nivå räcker, komponenterna bär detaljen.

Format: statiska HTML/CSS-mockups (som i Bandy Manager-flödet) så Code kan lyfta värden direkt. Ingen Figma-omväg.

## 7. Synk med Code (viktigt)

Code har byggt skelett + en kommun (Gislaved) med minimal, tokenbaserad CSS (alla värden som CSS-variabler i `src/styles/global.css`, inga hårdkodade värden i komponenter) — det arbetet blockeras INTE av design. Ditt tokendokument ersätter variabelvärdena; strukturen består. Men tokendokumentet (leverans 2) måste vara klart **innan Codes steg 3** (full generering + deploy till preview), annars byggs styling två gånger. Riktningsvalet (leverans 1) är därför första prioritet.

## 8. Öppna frågor (Jacob)

1. Riktningsval efter leverans 1.
2. Namnet är beslutat (Föreningsguiden) — påverkar ordmärket. Domänregistrering är Jacobs åtgärd, se UPPDRAG_POC.md §9.1.
