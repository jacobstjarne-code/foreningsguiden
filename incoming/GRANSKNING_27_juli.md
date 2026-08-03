# GRANSKNING — Föreningsguiden, 27 juli 2026

*Fable/Design. Samma format som granskningen 26 juli: de 32 hålen punkt för punkt, plus vad som är nytt. Granskat live: foreningsguiden.se, /deadlines/, /om/. Som skeptisk kassör och som driftsansvarig.*

---

## Sammanfattning

Ett dygn har gett en verklig förbättring och ett verkligt problem.

**Förbättringen:** deadlinekalendern är nu en riktig datatillgång — flera hundra deadlines över 99 kommuner, med filter, och en ny rad som för första gången namnger vad det kostar att inte agera. Det är den första kommersiella meningen på sajten.

**Problemet:** inget av de 18 hålen i eller efter betalögonblicket har rört sig, och kalendern — sajtens surface med högst köpvilja — har fortfarande ingen enda sak man kan göra. Dessutom svarar förstasidan med gammal kod medan /deadlines/ är ny, så sajten är i två versioner samtidigt.

**Status: 5 lösta · 4 delvis · 6 ej bedömbara · 17 orörda.**

---

## Deploy-läget först, för det påverkar allt annat

**/deadlines/ är utrullad.** Bromölla är rättstavad där, filtren är nya, och kostnadsraden finns.

**Förstasidan är inte.** Samma katalog-H1 ("Kommunala föreningsbidrag, samlade på ett ställe"), ingen /matcha/-länk, och **"Brömölla" står kvar i länslistan** — samma kommun som är rätt på /deadlines/. Övriga länsfel kvar: Dalarna och Dalarnas län som två skilda län, Arjeplog under Västerbottens län, Bräcke under Västernorrlands län, Bengtsfors under Värmlands län.

Antingen byggdes inte förstasidan om, eller så har länsgrupperingen en egen datakälla som inte rättades. Verifiera innan något kallas klart — jag kan inte döma en tratt-först-sida som inte svarar.

---

## De 32 hålen

### Lösta (5)

| # | Hål | Hur | Rimligt? |
|---|---|---|---|
| H2 | Vi säger inte att vi inte är kommunen | "Vi är inte en kommun eller myndighet", hero + fot på varje sida | Ja. Välformulerat, inte defensivt i tonen. |
| H21 | Ingen kontaktväg | Kontaktlänk i foten överallt | Ja, minimalt men tillräckligt. |
| H23 | Ingen integritetspolicy | Länk i foten överallt | Ja. |
| H27 | Ingen driftinfo vid gammal avläsning | /om/: uppgifter äldre än ett halvår markeras som möjligen inaktuella | Ja, tröskeln är uttalad. Kontrollera att den faktiskt renderas i ytan när den slår till. |
| H18 | Ingen påminnelse om att skicka in | **Nytt:** /deadlines/ säger "En missad deadline kan betyda minskat eller uteblivet bidrag — i vissa kommuner dras beloppet ned direkt vid för sen ansökan." | **Delvis.** Kostnaden är namngiven, vilket var det svåra. Men påminnelsen går inte att aktivera. Samma knapp som H30. |

### Delvis lösta (4)

**H1 — avsändaren.** "Redaktionen Föreningsguiden" är namngiven, ansvarsstycket är bra. Men rubriken "Vilka vi är" följs fortfarande av `{{TODO: företagsnamn, organisationsnummer och en namngiven person...}}`, publicerat. **Tredje granskningen i rad.** En saknad sektion är neutral; en publicerad TODO på förtroendesidan är sämre än ingenting.

**H3 — priset syns först vid väggen.** Nu snarare försämrat: tre motstridiga besked är live samtidigt. Foten "allt är gratis medan vi bygger" · /om/ "öppnar senare i betan, väntelista" · registreringssidan 249 kr. Motstridig prisinformation är det som får den här målgruppen att backa.

**H24 — ojämn datakvalitet.** /om/ förklarar metoden väl, men ojämnheten markeras inte per kommun i ytan. En kassör i en tunt beskriven kommun drar fortfarande slutsatsen att tjänsten är dålig.

**H25 — flagga fel.** "Hör av dig" i prosa på /om/. Ingen mekanism vid själva uppgiften, där hon upptäcker felet.

### Kan inte bedömas — byggt men ej synligt publikt (6)

H8 registreringsansökan som produkt · H15 varaktig hemvist för utkastet · H16 format för inlämning · H17 inlämningsguide med bilagor · H5 återupptagning · H6 ändra svar.

Allt detta ska ligga i /matcha/ och utkastvyn. Inget är nåbart från den publika förstasidan.

### Orörda (17)

**Betalning:** H10 bokföringsbart kvitto · H11 faktura · H12 Swish-motpart · H13 återbetalningspolicy · H14 betalfel-tillstånd
**Efter köp:** H19 utfallsslinga · H20 kvittosidan som säljer vidare
**Drift:** H22 ändringsbevakning när kommunen ändrar sig · H26 tillstånd för stängt/borttaget bidrag
**Återkomst:** H28 förra årets ansökan uppdaterad · H29 föreningen äger kontot, inte kassören · H30 deadlinebevakning som abonnemangets ansikte · H31 väg till nästa förening · H32 efterspelet (komplettering, omprövning, återredovisning)
**Övrigt:** H4 fel kommun = återvändsgränd · H7 ingen väg ut med beskedet · H9 ett bidrag i taget

---

## Nytt sedan i går

### N1 · Kalendern har högsta köpviljan och noll mekanismer *(blockerande för affären)*

Vem som är där: en kassör som tittar på datum hon kan missa, i en tabell som just berättat att det kostar pengar att missa dem. Mest kvalificerade avsikten på hela sajten. Varje rad är en död länk till en kommunsida.

Vad varje rad borde kunna: **"Bevaka den här"** — mejlpåminnelse före sista dag.

Varför det är den viktigaste enskilda ändringen:
- Enda funktionen som gör henne återkommande (H30) — grunden för hela abonnemangsvärdet.
- Helt inom §5: hon ber om påminnelsen, vi skickar den, ingenting säljs.
- Kräver **ingen betalintegration** — byggbar i dag.
- Fångar mejladressen vid högsta avsikt i stället för i en betalvägg som inte finns än.
- Ger efterfrågedata: vad som bevakas styr batch 2.
- Utan den är kalendern en gratis referens vem som helst kan kopiera. Med den är den en tjänst.

/om/ lovar redan "e-postbevakning som påminner innan sista ansökningsdag". Funktionen är alltså utlovad och osynlig samtidigt — sämsta av två världar.

### N2 · Kalendern har ärvt textproblemet i grövre form *(allvarlig)*

- Hundratals rader i en tabell, ingen månadsgruppering.
- **"God tid" upprepas rad efter rad** — kolumnen bär noll information när nästan allt har samma värde. Urgens ska bara märkas när den avviker.
- Kategorikolumnen har upp till sex värden per rad ("Idrott, Kultur, Social, Pensionär, Funktionsrätt, Övrigt") — samma sak som ingen kategori.
- 99 kommunnamn öppet i filtret före första raden.

Åtgärd: månadsgruppering med disclosure (månad kollapsad, "Snart" öppen), släpp Läge-kolumnen, en primär kategori per rad.

### N3 · Okommersiell av fem strukturella skäl, inte av för lite säljtryck *(kommersiell)*

1. **Ingen produkt har ett namn.** Ordet "utkast" finns inte på förstasidan. Hon kan inte vilja ha något som saknar substantiv.
2. **Enda gången pengar nämns är för att säga att inget kostar.** "Allt är gratis medan vi bygger" i foten tränar henne att detta är ett uppslagsverk. När betalväggen kommer upplevs den som ändrade villkor.
3. **Värdet är osynligt trots att datan bär det.** Beloppen finns på kommunsidorna men aldrig i kalendern eller på förstasidan. "Upp till 40 000 kr, sista dag om 5 dagar" är inte säljtryck — det är sakuppgiften.
4. **Varje handling är navigering, ingen är åtagande.** Alla knappar leder till mer läsning.
5. **Hela förtroendearbetet är defensivt.** Varje mening begränsar vår roll; ingen hävdar en förmåga. Trovärdig avsändare utan erbjudande.

---

## Fyra saker i dag

1. **"Bevaka den här" på varje deadlinerad.** (N1, H30, H18) Ingen betalintegration behövs. Flyttar sajten från katalog till tjänst mer än något annat.
2. **Belopp i deadlineraderna.** (N3:3) Finns i datan.
3. **Ta bort "Vilka vi är"-rubriken, synka prisbeskedet till ett besked.** (H1, H3) Timmar.
4. **Verifiera att förstasidan är deployad**, och rätta länsdatan i dess källa.

---

## Domen

Hon möter fortfarande en katalog — men en katalog som för första gången säger något sant om vad det kostar att inte agera. Ett riktigt steg. Skillnaden till en tjänst är nu en enda knapp: något hon kan **göra** på den yta där hon redan är oroad. Bygg bevakningsknappen och sajten byter karaktär utan att en krona behöver kunna betalas.

---

*Systemet oförändrat: tokens, "civil klarhet med skav", oxblod reserverad för verifiering, urgens-modellen, WCAG-golv, 16 px brödtext.*
