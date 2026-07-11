# DESIGN-UPPDRAG 2: Den kommersiella ytan — Föreningsguiden

*Skriven av Opus/Fable 2026-07-11. Andra designuppdraget. Det första (DESIGN_UPPDRAG.md) definierade systemet — tokens, komponenter, "civil klarhet med skav". Det står. Detta bygger vidare på det, utan att röra det.*

*Läses tillsammans med AFFARSMODELL.md (vad som säljs och varför) — det dokumentet är förutsättningen för detta. Läs det först.*

*Varje designval nedan har ett belägg. Det är avsiktligt: vi ska inte A/B-testa oss från A till B, vi ska börja på S. Beläggen står angivna så att Design kan avvika medvetet snarare än av okunskap.*

---

## 0. Uppgiften i en mening

Rita ytan där kassören går från *att veta* till *att göra* — och betala för det — utan att förtroendet vi byggt går sönder i övergången.

Det är svårare än det låter, och det är därför detta är ett eget uppdrag. Sajten har hittills sagt: "vi är sakliga, vi är oberoende, vi tjänar inget på dig." Nu ska samma sajt be om 149 kronor. Om det tonskiftet känns som ett byte av personlighet har vi förlorat. **Den kommersiella ytan måste vara lika underskattande som resten** — det är inte bara varumärkeston, det är kommersiellt nödvändigt (se §5).

---

## 1. Vad som säljs (sammanfattning — detaljer i AFFARSMODELL.md)

**Gratis, för alltid, indexerbart:** hela wikin. Bidrag, belopp, krav, deadlines, källor.

**149 kr:** ett ansökningsutkast för ett specifikt bidrag, skrivet mot kommunens faktiska kriterier och föreningens uppgifter.

**495 kr/år:** deadlinebevakning + **föreningsminnet** (vi kommer ihåg verksamhet, medlemsantal, tidigare ansökningar mellan gångerna) + utkasten ingår.

Grundprincipen som styr all design: **vi tar aldrig betalt för information, bara för arbete.** Om en yta ser ut att gömma information bakom betalning har vi ritat fel.

---

## 2. Flödet — och var väggen sitter

### 2.1 Det ungated flödet (det viktigaste beslutet i hela briefen)

**Belägg:** Kyle Poyar/ChartMogul/ProductLed 2026, 200 produkter: ungated freemium — där användaren provar INNAN konto skapas (Lovable, Perplexity, ChatGPT) — ger upp till **3x fler betalande**. Per 1 000 besökare: ungated 70 signups / 5,6 betalande; standard trial 45 / 3,6.

Konsekvens för designen: **inget registreringsformulär före värdet.** Kassören ska kunna:

1. Landa på kommunsidan från Google (gratis, som idag)
2. Klicka "Skapa ansökan" vid ett bidrag
3. Fylla i föreningens uppgifter (verksamhet, medlemsantal, vad ni vill göra) — **utan konto**
4. **Se utkastet börja skrivas fram** — mot Botkyrkas faktiska kriterier, med hennes förenings namn i texten
5. Möta väggen *där* — mitt i texten, när hon ser att den är bra

Steg 4 är produkten. Om Design flyttar registreringen före steg 4 har vi kastat bort 3x.

### 2.2 Väggens placering — "earned curiosity"

**Belägg:** Typeform-mönstret (access paywall). Låst innehåll visas *obskyrerat på den plats där det skulle stått* — inte som en separat skärm. Kraften ligger inte i låset utan i att användaren redan ser att det fungerar.

**Vår tillämpning:** utkastets första stycken renderas skarpt och läsbara. Resten fortsätter — synlig, men suddad/tonad — så att kassören ser att texten *finns*, att den är lång nog, att den har hennes förening i sig. Väggen ligger *inne i dokumentet*, inte framför det.

Den centrala regeln, som allt ovan följer av:

> **Cappa gratisnivån vid värdeögonblicket — inte före det.**
> *Free som ger bort hela jobbet konverterar ingen. Free som undanhåller första vinsten konverterar ingen heller.*

**Kritisk avvägning för Design:** hur mycket är "första vinsten"? För lite → hon vet inte om det är bra. För mycket → hon kopierar det gratis och går. Mitt förslag: **det första hela stycket, skarpt och komplett** — tillräckligt för att bedöma kvalitet och tonläge, för lite för att skicka in. Design får utmana det, men motivera.

---

## 3. Paywall-anatomin

**Belägg (Mojo/RevenueCat 2026):** long-scroll paywall med social proof och jämförelse gav +20 % konvertering mot kort paywall. Trial-inkluderande/strukturerade paywallskärmar vinner **64,5 %** av A/B-tester mot rent visuella layouter (Adapty, 16 000 appar).

Elementen, i den ordning de bör mötas:

1. **Rubrik: utfall, inte funktion.** Inte "Lås upp premium". Snarare något i stil med att ansökan till *det specifika bidraget* är klar att skickas in. Fable skriver copyn — Design ritar ytan och säger vad den behöver.
2. **Priset, öppet och omedelbart.** Ingen fördröjd prisavslöjning, inga toggles som gömmer. **Belägg:** dold prissättning är den vanligaste konverteringsdödaren; svenska kassörer har dessutom noll tolerans för prenumerationsfällor.
3. **Social proof — lokal och verifierbar.** *"34 föreningar i Gislaved bevakar det här bidraget."* Siffran finns redan i Designs egen mockup. Det är den enda sortens social proof som fungerar för den här målgruppen: inte logotyper, inte omdömen — grannföreningen.
4. **Jämförelse 149 vs 495 med prisankring.** **Belägg:** att ankra årspriset mot månadsekvivalent gav +30 % trial-start och +10 % årsval med **noll prisförändring**. 495 kr/år = **41 kr/månad**. Sätt den siffran bredvid — men (viktigt) utan att bli manipulativ: *"Rabatten ska vara verklig och tydligt förklarad."* Vår ärliga ram: en enda missad deadline kostar hela bidraget.
5. **Escape hatch.** En tydlig väg tillbaka till det gratis. Vi tar inte informationen som gisslan — och att visa det stärker förtroendet.
6. **Ansvarsraden.** "Vi skriver utkastet — ansökan lämnar ni in själva, och beslutet fattar kommunen." Samma register som metodsidan. Detta är inte finstilt, det är en förtroendesignal och det ska synas.

---

## 4. Betalningen

**Belägg:** Swish är det betalsätt online som ger bäst konvertering i Sverige (8+ miljoner användare, BankID, låg friktion). Stripe stödjer Swish natively via Payment Element — en integration ger Swish + kort.

- **Swish först, visuellt.** Det är det svenska kassörer förväntar sig och litar på.
- Kort som andrahandsval.
- **Ingen fakturagate, ingen "kontakta oss".** Båda produkterna betalas direkt. Kassörer kvittoredovisar rutinmässigt — det är hur föreningar fungerar.
- Betalflödet ska klara mobil. Kassören sitter i soffan, inte vid skrivbordet.

---

## 5. Tonen — och varför den är kommersiell, inte bara estetisk

**Belägg (GEO-forskning, se SOKBARHETSSPEC §3.5):** promotionton **sänker** AI-citering med ~26 %. Och separat: dark patterns och manipulativ prisframing "får förtroendet du byggt att försvinna snabbt".

Det betyder att den underskattande tonen inte är en stilpreferens vi kan offra för konvertering — **den ÄR konverteringsstrategin**, i två led: den håller oss citerbara i sök (vår enda distribution), och den är det enda som gör att en kassör vågar lita på oss med föreningens pengar.

**Förbjudet på den kommersiella ytan:** nedräkningsklockor, "bara idag", falsk knapphet, förvalda kryssrutor, dolda villkor, "5 andra tittar på detta just nu". Allt som en 60-årig kassör skulle beskriva som "sånt där säljtrams".

**Eftersträvat:** samma sakliga, lugna register som resten av sajten. Priset står där. Vad man får står där. Vad man inte får står också där.

---

## 6. Progressionen — från katalog till väg (Jacobs invändning, 2026-07-11)

Efter att 1.0 stått live: sidan känns tråkig och "wiki". Diagnosen är inte estetisk — den är strukturell, och Design behöver den rätt för att kunna lösa den.

**Problem 1: kortet är fel behållare för innehållet.** Ett kort är en *jämförelse*-komponent — det fungerar när man skummar många likvärdiga enheter och väljer en. Våra kort bär i stället ett helt regelverk var (målgrupp, fem krav, deadlines, belopp, källa). Tjugo textväggar i rad = mycket innehåll, samtidigt tomt. Ögat får ingenstans att vila och ingenting att följa.

**Problem 2: sidan vet inte vad kassören ska göra härnäst.** Alla kort ligger i samma plan, ingenting kommer före något annat. Men verkligheten är inte platt: ett bidrag har deadline om nio dagar; ett annat kräver att föreningen först blir bidragsberättigad — vilket tar veckor och alltså måste påbörjas NU även om ansökan sker i mars. **Datat har en berättelse som layouten plattar ut.**

**Lösningen: sidan ska vara en väg, inte en katalog.** Samma data, ordnad efter kassörens beslutsföljd i stället för efter kommunens kategoriindelning:

1. **Vad gäller er?** (föreningstyp → relevanta bidrag; allt annat tonas ner)
2. **Vad är brådskande?** (urgens — UrgencyChip finns redan)
3. **Vad måste göras först?** (förutsättningar: bli bidragsberättigad, registrera i InterbookGo/Rbok — tar tid, måste startas i förväg)
4. **Vad kan ni söka nu?**
5. **Vad ska ni skriva?** → utkastet

Rytm och hierarki följer av detta: något är stort, något är litet, något kommer först. Vila mellan stegen. Inte tjugo likvärdiga kort.

**Varför detta är viktigare än det låter:** samma rörelse löser tre saker samtidigt — den gör wikin till en **guide** (Jacobs invändning), den gör sidan **svar-först och därmed citerbar av LLM:er** (SOKBARHETSSPEC §3.1), och den bygger **rampen till betalpunkten**: utkastet blir vägens sista steg, inte en knapp som sitter bredvid. Det är också svaret på öppen fråga 2 nedan — "Skapa ansökan" bor inte på kortet, den bor i slutet av vägen.

**Konsekvens för arbetsordningen:** vägledningslagret (Fables nästa jobb) är inte text som läggs ovanpå korten — det ÄR strukturen. Design och Fable bygger den tillsammans, inte i tur och ordning.

## 7. Det som ska ritas (leveranser)

1. **Ungated-formuläret** — föreningens uppgifter, inget konto. Mobil + desktop. Ska kännas som två minuters jobb, inte en ansökan i sig.
2. **Utkastvyn med väggen** — det skarpa första stycket, den tonade fortsättningen, paywallen inne i dokumentet. **Detta är den viktigaste skärmen i hela produkten.** Rita den först, rita den flera gånger.
3. **Paywall-panelen** enligt §3 — long-scroll, social proof, 149/495-jämförelsen med månadsankring, escape hatch, ansvarsrad.
4. **Betalsteget** — Swish först, kort som alternativ, mobilanpassat.
5. **Kvittot/leveransen** — hur utkastet levereras efter betalning. Nedladdning? E-post? Båda? Design föreslår.
6. **Abonnemangets egen yta** — föreningsminnet är abonnemangets själ och det är osynligt. Hur *visar* man att vi kommer ihåg? (Förslag att utforska: en föreningsprofil som byggs upp synligt, så att värdet ackumuleras framför ögonen.)

## 8. Öppna frågor till Design

1. **Hur mycket av utkastet är gratis?** Mitt förslag: första hela stycket. Utmana gärna — men motivera mot regeln i §2.2.
2. **Var bor "Skapa ansökan"-knappen** på bidragskortet, utan att kortet börjar se ut som en annons? Kortet är idag en förtroendekomponent; den får inte bli en säljyta.
3. **Hur ser abonnemangets ackumulerande värde ut visuellt?** Detta är den svåraste designfrågan i uppdraget, och den som avgör om folk förnyar.

## 9. Vad som INTE ändras

DESIGN_UPPDRAG.md står. Tokens, komponentnamn, "civil klarhet med skav", verifieringsstämpeln, urgens-modellen, WCAG-golvet, 16 px brödtext. Den kommersiella ytan är en **utvidgning** av systemet, inte ett undantag från det. Om paywallen ser ut att komma från en annan sajt har vi ritat fel.
