# LIVEGRANSKNING 2 — för mycket text, och fel version live

*Från Fable/Design, 27 juli 2026. foreningsguiden.se + /om/.*

---

## 1. De nya ytorna är inte utrullade

Startsidan svarar fortfarande med den gamla katalogversionen:

- H1: **"Kommunala föreningsbidrag, samlade på ett ställe"** — katalogrubriken, inte descriptorn.
- **Ingen länk till /matcha/** någonstans: inte i hero, nav eller fot. Tratten är därför fortfarande osynlig.
- Inga förhandsvisningskort, inget LiveDataKort. Kommunväljaren ligger kvar som första innehållsblock.
- `title` och `meta-description` är kvar i katalogform — sökträffen säljer ett register.
- `/om/` har fortfarande `{{TODO: företagsnamn, organisationsnummer...}}` publicerat under "Vilka vi är".

c919d86 är i main men är inte den version som svarar publikt. Verifiera deploy innan ytorna kallas klara.

Orättat sedan förra granskningen: TODO på /om/ · tre olika prisbesked (fot "allt är gratis" / 249 kr / "väntelista") · Dalarna och Dalarnas län som två skilda län · Arjeplog under Västerbotten · Bräcke under Västernorrland · Bengtsfors under Värmland · "Brömölla" felstavat · 99 kommuner på startsidan mot "20 kommuner" på /om/.

---

## 2. Huvudproblemet: sidan förklarar sig själv hela tiden

Detta är samma sjukdom som DESIGN-UPPDRAG 4 skulle bota — och startsidan har den värre än kommunsidan hade. Principen var: **sidan i viloläge ska vara kortare än förut, trots mer mening.** Live-sidan gör motsatsen.

Konkret, i ordning nedifrån hero:

1. **Hero-ingressen förklarar problemet i tre led** ("Varje kommun har egna bidrag, egna blanketter och egna sista datum…"). Hon vet redan att det är rörigt — det är därför hon googlade. Ingressen berättar hennes eget problem tillbaka till henne innan den säger vad vi gör.
2. **Ansvarsfriskrivningen står två gånger på samma sida** — direkt under hero *och* i foten, ordagrant identisk. En gång, i foten. I hero tar den plats från beskedet.
3. **Varje sektion har en förklarande underrubrik.** "Närmast i tid" följs av "Alla sista ansökningsdatum, samlade och sorterade efter vad som ligger närmast." Rubriken sa det redan. Stryk.
4. **"Välj din kommun" + "99 KOMMUNER TILLGÄNGLIGA · 21 LÄN" + "Eller bläddra per län"** — tre rubriknivåer före första länken.
5. **99 kommunlänkar och 21 länsrubriker renderas utfällda.** Disclosure-mönstret vi byggde för precis detta används inte här. På mobil är det flera skärmhöjder text innan något händer.
6. **Deadlinetabellen har fem kolumner** varav "Kategori" ingen frågat efter, och "Läge" säger "Snart" fem gånger i rad.

Summan: allt är korrekt, ärligt och välskrivet — och det är för mycket. Prosan bär bevisbördan i stället för strukturen. Ögat får ingen plats att vila, exakt den invändning som startade progressionsuppdraget.

---

## 3. Vad jag skulle stryka i dag, utan att ändra layout

- Hero-ingressen: från tre led till **en rad om vad hon får**. Problembeskrivningen ut.
- Ansvarsfriskrivningen i hero: **bort** (finns i foten).
- Alla förklarande underrubriker under sektionsrubriker: **bort**.
- Länslistan: **kollapsad per län** som disclosure, sökfältet överst. Länkarna kvar i DOM, crawlbarheten orörd.
- Deadlinetabellen: **tre kolumner** — datum, bidrag + kommun, dagar kvar. "Kategori" och "Läge" ut; urgens visas ändå av dagar-kvar-chippet.
- Rubrikstapeln "Välj din kommun / 99 kommuner / Eller bläddra per län": **en rubrik + en metarad**.

Ingen mening som bär ny information försvinner. Det som försvinner är sidan som förklarar sig själv.

---

## 4. Och samma kritik mot mina egna leveranser

Mina handovers och granskningar har blivit långa — den här inkluderad. Jag skriver om till kortformat framåt: fynd, konsekvens, åtgärd. En rad per sak. Om ni vill ha resonemanget bakom en punkt fäller ni ut det genom att fråga.

---

## 5. De två designfrågorna, kort

**Bär earned curiosity med checklista i stället för prosa?** Nej, inte som enda innehåll — checklistan bevisar *täckning*, aldrig *röst*, och det är rösten hon tvekar på. Men Code hade rätt i att inte hitta på prosa. Lösning utan påhitt: **ett verkligt genererat stycke** (den sektion profilen faktiskt kan fylla — namn, säte, verksamhet, medlemsantal) ovanför checklistan, plus länk till exempelutkastet från en annan förening. Sann text + bevisad täckning + fullständigt exempel.

**Hur ramas 90 % mot 60 %?** Aldrig med procent — det är samma påhittade precision som 90-dagarssiffran. **Namnge luckorna före köpet:** "Det här utkastet får tre luckor som bara ni kan fylla: arrangemangets namn, datum och plats. Allt annat skriver vi." Tre namngivna luckor är hanterbart; "60 % färdigt" är oroande. I utkastet blir luckan en synlig ifyllbar plats med instruktion. Och formulera produkten som **"vi skriver allt utom det bara ni vet"** — sant för båda bidragstyperna.
