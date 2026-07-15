# KVALITETSSPEC: Vad "bra" betyder — och hur vi vet det

*Skriven av Opus/Fable 2026-07-13. Förarbetet till utkastgeneratorn. Detta dokument fanns inte, och dess frånvaro var projektets största blinda fläck: vi har byggt en produkt som ska skriva bidragsansökningar utan att ha sett en enda verklig bidragsansökan.*

*Läses före CODE_UPPDRAG_KOMMERSIELL.md §2 (utkastgeneratorn). Ingen betalning aktiveras förrän §5 är uppfylld.*

---

## 0. Utgångsläget, ärligt

**Vi vet inte om våra ansökningar blir bra. Vi har ingen aning.**

Vi vet vad kommunen *kräver* — det står i vårt data, och vi kan säkerställa att varje krav bemöts. Det är formell fullständighet, och det är inte ingenting: en ansökan som missar ett krav får avslag oavsett hur välskriven den är.

Men vi vet inte vad som gör att en ansökan **beviljas** när tio föreningar söker ur samma pott. Det är ett urval. Urvalskriterierna är delvis outtalade, delvis politiska, delvis handläggarens omdöme.

Vad vi konkret saknar:
- Vi har aldrig sett en beviljad ansökan
- Vi har aldrig sett en avslagen
- Vi vet inte vad handläggare faktiskt fäster vikt vid
- Vi vet inte om de läser texten eller bockar av formalia

Denna lucka ska stängas **innan någon betalar 149 kronor.**

---

## 1. Två sorters kvalitet — håll isär dem

**Formell fullständighet.** Bemöter ansökan varje krav kommunen ställer? Är budgeten balanserad? Är deadline hållen, förutsättningarna uppfyllda? Detta kan vi verifiera **redan idag**, ur vårt eget data. Det är en checklista, och den är mekaniskt kontrollerbar.

**Konkurrenskraft.** Beviljas ansökan när den ställs mot andra? Detta kan vi **inte** verifiera idag. Det kräver utfallsdata.

Löftet till kunden får bara omfatta det första (se §5). Allt annat är att sälja något vi inte har.

---

## 2. Så tar vi reda på vad som beviljas

### 2.1 Beviljade OCH avslagna ansökningar — huvudkällan

Bidragsansökningar som lämnats in till en kommun är **allmänna handlingar** och kan begäras ut. Ingen konkurrent har gjort detta. Det är billigt, lagligt och det är den enda källan som säger vad som faktiskt korrelerar med beslut.

**Metodregler (bindande — de skyddar mot att vi bygger en självbekräftande modell):**

1. **En kommun i taget. Börja där vi redan kan regelverket.** Läser vi tjugo ansökningar från tjugo kommuner ser vi "mönster" som i själva verket är kommunala regelskillnader. Föreslagen startkommun: **Gislaved** (minst, mest strukturerad data, överblickbar volym) eller **Helsingborg** (rikt regelverk, publicerad handläggningsordning).

2. **Begär ut BÅDA utfallen.** Om nio av tio ansökningar innehåller en detaljerad budget, och alla beviljade har det, betyder det ingenting — det kan vara att alla har det. **Avslagen är den dyrare men mer informativa halvan**, och de är precis vad ingen skulle tänka på att be om. En modell byggd enbart på vinnare är survivorship bias i renodlad form.

3. **Generalisera inte förrän mönstret håller inom kommunen.** Först när något står sig över hela populationen i en kommun prövar vi om det bär till nästa. Motsatsen — att anta att wins är mönster — är hur man bygger en modell som bekräftar sig själv.

4. **Ideellt föreningsliv är inte anonymt.** Ansökningarna innehåller namn, personuppgifter och ibland känsliga verksamhetsbeskrivningar. De används som **analysunderlag internt** — de publiceras aldrig, citeras aldrig med namn, och matas aldrig in i ett exempel som går live.

### 2.2 Handläggarsamtal — nedviktat, men inte avskrivet

Handläggare ger oss vad de **tror** att de belönar. Handlingarna ger oss vad som faktiskt korrelerar med beslut. Där de två går isär är det handläggarens självbild som är fel.

De är alltså inte en källa till sanning — de är en källa till **hypoteser som vi prövar mot handlingarna**. Intervjun ställer frågan, handlingarna svarar.

Realistisk förväntan (Jacobs bedömning, delas): handläggare kommer sannolikt att vara ovilliga att uttala sig, eftersom de ser sig som objektiva bedömare och inte vill uppfattas som att de coachar sökande. Räkna med tunn skörd. Gör det ändå, i den kommun vi redan begärt ut handlingar från — då har vi konkreta frågor i stället för allmänna.

### 2.3 Utfallsmätning — den enda vallgraven som växer

Fråga föreningen efteråt: **fick ni bidraget?**

Det ger oss något ingen annan har: en återkopplingsslinga mellan vad vi skrev och vad kommunen beslutade. Över tid gör det "vi kan skriva ansökningar" till **"vi vet vad som beviljas i Gislaved"** — och det är en helt annan produkt, med en helt annan prissättning.

Bygg in det i produkten från dag ett: en enkel uppföljningsfråga efter kommunens beslutsdatum. Det är billigt att bygga och omöjligt att retrofit:a, eftersom man inte kan fråga i efterhand om man aldrig visste vem som sökte vad.

---

## 3. Vad generatorn måste garantera (byggkrav)

Detta är kontrollerbart redan idag, ur befintligt data, och ska vara **maskinellt verifierat** — inte en förhoppning:

1. **Varje krav i `krav`-listan bemöts explicit.** Generatorn får inte producera ett utkast där ett krav saknas svar. Detta ska faila, inte varna.
2. **Budgeten går ihop.** Summan av posterna = angiven summa. Sökt belopp ≤ eventuellt tak i `belopp`.
3. **Deadline och förutsättningar flaggas.** Om föreningen inte är bidragsberättigad (station 3) ska utkastet inte kunna beställas utan att detta sägs först — annars säljer vi en ansökan som inte kan lämnas in.
4. **Inga fabricerade fakta om föreningen.** Generatorn får bara använda vad föreningen själv fyllt i. Saknas en uppgift ska utkastet lämna en tydligt markerad lucka — aldrig gissa medlemsantal, grundningsår eller verksamhet.
5. **Inga fabricerade fakta om kommunen.** Kraven, beloppen och datumen kommer ur vårt verifierade data. Generatorn hittar inte på kriterier.

---

## 4. Golden set — kalibreringsmålet

**Exempelutkasten på sajten ska produceras av generatorn, inte av Fable.** Skäl (Jacobs, och det är rätt): exempelsidan är ett löfte om vad produkten levererar. Handskriver Fable dem och generatorn sedan skriver sämre, har vi ljugit i skyltfönstret — och det upptäcks första gången någon jämför.

Golden set är därför inte innehåll som publiceras. Det är ett **kalibreringsmål**:

- Fable skriver 3–4 exempel för hand (olika kommuner, olika kategorier — kultur, idrott, social, pensionär). De definierar röst, format och kvalitetsnivå.
- Generatorn byggs.
- **Generatorn godkänns först när dess output står sig mot golden set** i blindjämförelse.
- Därefter genereras samtliga ~75 exempelsidor. De blir per definition ärliga — de *är* produktens arbete.

**Exempelföreningarna ska vara tydligt fiktiva.** Designs mock använde Reftele IF och Smålandsstenars GoIF — verkliga föreningar i Gislaved. Att lägga påhittade ansökningar och budgetar i munnen på identifierbara organisationer är inte acceptabelt på en sajt vars hela värde är att uppgifterna stämmer. Konstruerade namn, kontrollerat fiktiva.

**Bannern måste säga det.** Nuvarande text ("En annan förenings färdiga utkast") antyder en riktig förening som gett oss sin ansökan. Det är inte sant. Ny text: *"Ett påhittat utkast, skrivet mot [kommunens] riktiga krav — så att ni ser format, längd och ton innan ni beställer. Föreningen finns inte; ert utkast skrivs mot er egen."*

---

## 5. Löftet — vad vi får och inte får säga

**Får sägas** (verifierbart):
- Utkastet bemöter varje krav kommunen ställer
- Det är skrivet mot rätt kriterier, för rätt bidrag, i rätt kommun
- Det sparar timmar
- Vi säger till innan er behörighet går ut (giltighetsfällan — AFFARSMODELL §2.3)

**Får INTE sägas** förrän §2 gett belägg:
- Att utkastet ökar chansen att få bidraget
- Att det är "bättre" än vad föreningen skrivit själv
- Något om beviljandegrad, träffsäkerhet eller framgång

Detta är inte försiktighet, det är produktsäkerhet: **överdriften spränger förtroendet första gången någon får avslag** — och avslag kommer att ske, eftersom bidragspotter är begränsade. En förening som fått avslag på ett utkast vi lovade skulle "öka chanserna" blir en fiende. En förening som fått avslag på ett utkast vi lovade skulle "bemöta alla krav" har fortfarande fått vad den betalade för.

---

## 6. Hedge mot instruktionsdrift (mekanism, inte föresats)

*Denna sektion finns för att Fable — dokumentets författare — själv bröt mot sina egna regler i detta projekt: skrev in "ingen svensk text skrivs av Code" och "vi påstår aldrig något vi inte verifierat", och föreslog sedan att handskriva 75 exempelutkast som skulle utge sig för att vara produktens output. Goda föresatser räcker inte. Regler behöver mekanismer.*

**Regel 1 — Kvalitetspåståenden kräver spårbart belägg.**
Varje påstående i produktens copy om vad utkastet gör (§5) ska kunna spåras till antingen (a) ett fält i vårt verifierade data, eller (b) en post i utfallsanalysen (§2). Ett påstående utan belägg är en **bugg**, inte en formulering. Code ska kunna avvisa copy som saknar belägg — det är inte Fables ensak.

**Regel 2 — Ingen syntetisk output presenterad som mänsklig, ingen mänsklig output presenterad som syntetisk.**
Exempelsidorna är generatorns arbete och ska vara det. Om en människa skrivit dem ska sidan säga det.

**Regel 3 — Den som skriver spec:en är inte undantagen från spec:en.**
Om Fable föreslår något som bryter mot ett dokument Fable själv skrivit, ska Code eller Design säga ifrån. Det har hänt en gång i detta projekt och fångades av Jacob, inte av processen.

---

## 7. Ordning härnäst

1. **Begär ut handlingar** i en kommun — beviljade *och* avslagna. (Jacob; mejl till registrator.)
2. **Fable skriver golden set** (3–4 exempel) som kalibreringsmål.
3. **Föreningsprofilens datamodell** (AFFARSMODELL §4.2) — vad generatorn behöver veta om föreningen.
4. **Generatorn byggs**, med byggkraven i §3 som maskinella tester.
5. **Blindjämförelse mot golden set.** Godkänns generatorn? Om nej — iterera, publicera inte.
6. **Generera ~75 exempelsidor.** Fable granskar innan publicering.
7. **Betalning aktiveras.** Inte före.
