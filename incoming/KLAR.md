# KLAR — vad som räknas som en färdig kommun

Skriven 17 augusti 2026. Ersätter känslan "det borde vara nog snart".

Problemet den löser: arbetet har rört sig i två veckor utan att något
blivit klart, för ingenting har haft en definition av klar. Varje pass
slutar med en order, ordern blir en commit, och nästa pass börjar med en
ny order. Aktivitet, inte framsteg.

Det här dokumentet är den enda måttstocken. GPT, Code och Opus mäter mot
den. Talet nedan är det enda som räknas som framsteg.

---

## Talet

**Kommuner som klarar helhetstestet: 0 av 10.**

Inte commits. Inte antal kontrollästa fält. Inte antal bidrag. Det här
talet, och ingenting annat, i varje rapport.

---

## Helhetstestet — tolv rader, alla mekaniskt mätbara

En kommun är klar när samtliga tolv gäller. Nio kan mätas med ett skript,
tre kräver en webbläsare.

### Data (skript)

1. Varje bidrag har `krav_status: kontrollast`
2. Varje bidrag har minst tre krav
3. Varje bidrag har `krav_fullstandiga: true`
4. Varje bidrag har `deadline_status: kontrollast` eller `ingen_regel`
5. Varje bidrag har `belopp_status: kontrollast` eller `ingen_regel`
6. Varje bidrag har `belopp_avser` satt till annat än `okand`
7. Varje bidrag har `foreningstyp` ifylld
8. Kommunen har `giltighet_regel` med `giltighet_regel_status: kontrollast`
9. Noll processpråk i `anteckning` (inga paragrafer, inga diarienummer)

### Yta (webbläsare)

10. Köpblocket är öppet för minst ett bidrag — alltså finns något att sälja
11. Ingen horisontell scroll vid 390 px, inga träffytor under 44 px
12. Hela vägen gången: förstasida → sök kommun → tre frågor → besked →
    kommunsida → bidragssida → bevakningsanmälan → bekräftelsemejl i en
    riktig inkorg. Ingen motsägelse, inget tomrum, inget påstående vi
    inte kan belägga.

---

## En kommun före tio

Ovanåker först, hela vägen till tolv av tolv. Ingen annan kommun startas
innan den är klar.

Skälet: ingen vet i dag hur lång tid en kommun tar, eller vad som går
sönder på väg till tolv. Tio parallella kommuner utan det svaret ger tio
halvfärdiga kommuner — samma läge som nu, i tio exemplar.

När Ovanåker är klar finns ett recept med känd kostnad. Då kan de nio gå
parallellt.

Ovanåkers utgångsläge 17 augusti: 12 bidrag, 11 kontrollästa krav,
11 kontrollästa deadlines, 6 kontrollästa belopp, 0 med `foreningstyp`,
ingen `giltighet_regel`. Alltså närmast klar av alla 290, och ändå inte
klar på sju av tolv rader.

---

## Listan, i ordning

Bandykommuner, valda efter räckvidd. Allsvenskan 2026/27 bekräftad från
Svenska Bandyförbundet; Elitseriens sammansättning ska verifieras innan
listan låses.

1. Ovanåker (Edsbyn) — 12 bidrag
2. Tranås — 9
3. Ljusdal — 4
4. Surahammar — 1
5. Nässjö — 11
6. Sandviken — 11
7. Katrineholm — 15
8. Motala — 14
9. Bollnäs — 17
10. Rättvik — 11

105 bidrag totalt.

---

## Vad som inte får hända

**Inga nya funktioner förrän talet är 1 av 10.** Inga designrundor, inga
nya ytor, inga nya fält. Det som finns räcker för att göra en kommun
klar, och om det inte gör det visar helhetstestet var.

**Ingen order utan att den flyttar talet.** En order som inte tar en
kommun närmare tolv av tolv väntar.

**Inget "nästan klart".** Elva av tolv är noll kommuner.
