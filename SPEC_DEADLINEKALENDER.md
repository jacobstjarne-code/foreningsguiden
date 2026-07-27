# SPEC: Deadlinekalendern

*Opus/Fable 2026-07-27. Designs granskning 27 juli, punkt N2 och N3:3. Kalendern är sajtens yta med högst köpvilja — en kassör som tittar på datum hon kan missa, i en tabell som just sagt att det kostar pengar att missa dem. Bevakningsknappen sitter nu där. Men den drunknar.*

---

## Problemet

Hundratals rader i en platt tabell. "God tid" upprepas rad efter rad. Kategorikolumnen har upp till sex värden per rad. Beloppen finns i datan och visas aldrig.

Design: *"Urgens ska bara märkas när den avviker."* En kolumn där nästan alla rader har samma värde bär noll information och kostar bredd.

---

## 1. Månadsgruppering med disclosure

Gruppera raderna per månad. **Öppen som default: innevarande och nästa månad.** Övriga månader kollapsade med rubrik och antal ("September 2026 · 34 deadlines").

Samma disclosure-mönster som länslistan på förstasidan redan använder — inte ett nytt mönster.

Raderna ska ligga kvar i DOM även när månaden är kollapsad (CSS/`hidden`, aldrig borttagna) så att sökmotorer och webbläsarens sidsökning hittar dem.

## 2. Släpp Läge-kolumnen

Ta bort kolumnen helt. Urgens visas i stället **bara på de rader där den avviker** — en `UrgencyChip` intill datumet på rader inom brådskande tröskel, ingenting på de övriga.

`getUrgency()` och `UrgencyChip` finns redan; det är en flytt, inte ett nytt bygge.

Effekten: raderna som faktiskt brådskar syns, i stället för att drunkna i en kolumn där allt ser likadant ut.

## 3. En primär kategori per rad

Visa första värdet i `kategori[]`. Finns fler, visa antalet: "Kultur +2".

Sex värden per rad är samma sak som ingen kategori — filtret bär den funktionen, kolumnen ska bara orientera.

## 4. Belopp i raderna

Visa beloppstaket där `parseBeloppTak()` returnerar ett otvetydigt värde. Ingenting där den returnerar null.

Formatering: "Upp till 40 000 kr". Aldrig ett gissat tal, aldrig en taxa som "1 000 kr/timme" — `parseBeloppTak()` filtrerar redan bort dem och den logiken är verifierad mot Sundbyberg.

Design: detta är inte säljtryck, det är sakuppgiften. En rad som säger "Upp till 40 000 kr · sista dag om 5 dagar" är varför kalendern finns.

---

## Vad som INTE ändras

Filtren, sorteringen, bevakningsknappen per rad, och datakällan. Detta är en omarbetning av hur raderna presenteras, inte av vad de innehåller.

Bevakningsknappen ska fungera oförändrat i den nya strukturen — inklusive i en månad som just öppnats.

---

## Verifiering

Kalendern har flera hundra rader över 140 kommuner. Kontrollera på riktig data, inte på ett urval:

- Att kollapsade månader inte tappar rader ur DOM (sök på ett bidrag i en kollapsad månad med webbläsarens sidsökning — det ska hittas).
- Att `UrgencyChip` bara syns på rader inom tröskeln, och att tröskeln stämmer med den som används på kommunsidan.
- Att belopp visas där `parseBeloppTak()` ger ett värde och saknas där den ger null — stickprov mot minst en kommun med blandad beloppstäckning (Ale) och en utan publicerade belopp (Arjeplog).
- Att bevakningsknappen fungerar i en månad som öppnats efter sidladdning.
