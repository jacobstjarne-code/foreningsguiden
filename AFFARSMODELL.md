# AFFÄRSMODELL: Föreningsguiden

*Skriven av Opus/Fable 2026-07-11 efter marknadsresearch över tre fält: hur jämförbara tjänster (AI-ansökningsverktyg) faktiskt tjänar pengar, vad freemium-konvertering mäts till 2026, och hur svensk betalning konverterar. Detta dokument definierar VAD som säljs, VAR i flödet, och VARFÖR just där — så att Design kan forma den kommersiella ytan och Code bygga betalpunkten. Läses tillsammans med UPPDRAG_POC.md (produkt), SOKBARHETSSPEC.md (distribution) och DESIGN_UPPDRAG.md (form).*

*Bakgrund: PoC:n byggdes medvetet utan intäktsmodell ("framgångsmåttet är INTE intäkt"). Det var rätt för att testa efterfrågan, men lämnade en lucka: betalpunkten var aldrig ritad. Detta dokument stänger den.*

---

## 0. Grundprincipen (allt annat följer av denna)

**Vi tar aldrig betalt för information. Vi tar betalt för arbete.**

Det låter som en moralisk hållning men är en kommersiell nödvändighet, av tre skäl:

1. **Informationen är gratis hos kommunen.** Att ta betalt för "det finns fyra kulturbidrag i Botkyrka" är att sälja något som ligger ett klick bort på botkyrka.se. Första kassören som upptäcker det känner sig lurad — och förtroendet är hela vår tillgång.
2. **Betalvägg framför informationen dödar distributionen.** Hela go-to-market bygger på att Google och LLM:erna kan läsa allt (se SOKBARHETSSPEC). Muras sidorna in existerar vi inte i sök. Vi skulle strypa vår enda kanal.
3. **Marknaden bekräftar det.** Varenda jämförbar aktör (Grantable, Grantboost, Granted, FundRobin) har gratisnivå. Ingen tar betalt för att visa vilka bidrag som finns.

Men — och detta är nyanserat — ren *discovery* säljs faktiskt, och dyrt: Instrumentl tar ~179 USD/mån för att hitta och bevaka bidrag utan att skriva något. Betalningsvilja för "veta" finns alltså. **Fast** den återkommande kritiken mot dem i varje jämförelse är exakt densamma: *den hjälper dig inte att skriva*. Marknaden konvergerar mot end-to-end; de rena databaserna beskrivs som överprisade kvarlevor. Slutsats: veta kan säljas, men **göra** är det som vinner — och det är dessutom det enda som är förenligt med vår distributionsmodell.

Gränsen går alltså inte mellan *grund* och *detalj*. Den går mellan **veta** och **göra**.

---

## 1. Vad som är gratis (permanent, indexerbart, allt)

Hela wikin. Vilka bidrag som finns, belopp, krav, deadlines, förvaltning, ansökningssystem, källänk, verifieringsdatum. Kategorisidor, kalendern, metodsidan.

Detta är inte välgörenhet — det är tre funktioner i ett:
- **Distributionen** (SEO/GEO-motorn; se SOKBARHETSSPEC §0)
- **Förtroendebyggaren** (verifieringsstämpeln, källhänvisningen)
- **Ingrediensen** till den betalda produkten (utkastet skrivs mot kommunens faktiska kriterier — som vi redan strukturerat i YAML)

Wiki-känslan är inte ett fel att fixa. Den är fundamentet som gör det betalda möjligt.

---

## 2. Vad som kostar (arbetet)

### 2.1 Ansökningsutkast — 149 kr per styck

Ett utkast till ansökan för ett specifikt bidrag i en specifik kommun, genererat ur (a) kommunens faktiska kriterier och bedömningsgrunder som vi strukturerat, och (b) föreningens uppgifter (verksamhet, medlemsantal, vad man vill göra).

Köps i det ögonblick behovet är akut — deadline om två veckor, kassören inser att hon måste skriva. Priskänsligheten är låg då. **49 kr vore fel: det signalerar att det inte är värt något.** Jämför med vad arbetet ersätter — fyra timmars kvällspyssel, och risken att formulera fel och få avslag.

### 2.2 Föreningsabonnemang — 495 kr/år

**Viktigt: detta är INTE "samma sak fast obegränsat".** Om abonnemanget bara vore volymrabatt på utkast, skulle engångsköpet bara fånga de minst lönsamma kunderna och abonnemanget sälja sig självt vid tre ansökningar — vi skulle prissätta relationen som en rabatt i stället för som ett värde.

Abonnemanget säljer **att slippa hålla reda på det**:
- Deadlinebevakning för föreningens alla relevanta bidrag
- **Föreningsminnet** — vi kommer ihåg verksamhetsbeskrivning, medlemsantal, tidigare ansökningar, tonläge, så att utkast nummer två inte kräver att man skriver om allt
- Utkasten ingår

### 2.3 Giltighetsfällan — abonnemangets konkreta krok

*Tillagd 2026-07-13, efter researchen till station 3 (se FORUTSATTNINGAR.md §3.2). Upptäcktes efter att detta dokument först skrevs — och den gör 495-kronorserbjudandet konkret i stället för abstrakt.*

Godkännandet som bidragsberättigad förening **löper ut**, och kommunerna säger det inte högt:

- **Helsingborg:** giltigt ett år från beslutsdagen, måste sökas om varje år
- **Enköping:** ett år — **dock som längst en månad efter genomfört årsmöte**
- **Lund:** görs om var 13:e månad
- **Umeå och Berg:** uppgifterna måste uppdateras årligen för att statusen ska bestå

En förening som fick bidrag förra året **kan ha förlorat sin behörighet utan att veta om det.** Statusen dog i tysthet efter årsmötet. Och när kassören upptäcker det — två veckor före deadline — gör handläggningstiden att det redan är för sent.

Detta är abonnemangets starkaste enskilda säljargument, och det ska sägas rakt ut: **vi säger till innan er status går ut.** Konkret, ekonomiskt (en förlorad behörighet = ett förlorat bidragsår), och omöjligt att hålla reda på själv. Det är dessutom sant för hela abonnemangets löfte: värdet ligger i att slippa hålla reda på det — inte i volym utkast.

**Konsekvens för paywall-copy (DESIGN_UPPDRAG_2 §3):** giltighetsfällan hör hemma i jämförelsen 149 vs 495, som skälet att välja abonnemanget. Inte som skrämsel — som fakta.

---

Föreningsminnet är inte en bonusfunktion, det är **den starkaste differentiatorn i hela marknaden**. Grantable vinner jämförelser på exakt detta ("organizational memory"): varje grant writer känner igen att man börjar varje ansökan med att klistra in mission, program, historik — igen och igen. Den som slipper det stannar. Och notera vad det betyder strategiskt: det är en vallgrav som **växer med användningen**, och det är samma pipeline-tänk som redan är vår kärnkompetens.

Kassören som byts ut nästa år ärver en föreningsprofil i stället för ett tomt ark. Det är vad som bär 495 kr och det är vad som får dem att förnya.

---

## 3. Konverteringsdesignen — var betalväggen sitter

Detta avsnitt är den "utstuderade" delen. Vi börjar inte på A och B — vi börjar på S, med det marknaden redan bevisat.

### 3.1 Den centrala regeln

> **Cappa gratisnivån vid värdeögonblicket — inte före det.**
> *"Free som ger bort hela jobbet konverterar ingen. Free som undanhåller första vinsten konverterar ingen heller."*

Det betyder konkret: kassören ska **se att det fungerar, med sin egen förenings uppgifter**, innan hon betalar. Inte läsa om att det skulle kunna fungera.

### 3.2 Ungated freemium — 3x-lyftet

Kyle Poyars 2026-data (200 produkter, ChartMogul/ProductLed): **ungated freemium-upplevelser — där användaren provar INNAN konto skapas, som Lovable och Perplexity — ger upp till 3x fler betalande.** Per 1 000 besökare: ungated ger 70 signups och 5,6 betalande; standard free trial ger 45 signups och 3,6 betalande.

Applicerat på oss: **kassören ska kunna börja skapa utkastet utan att registrera sig.** Hon fyller i föreningens uppgifter, ser de första styckena skrivas fram — mot Botkyrkas faktiska kriterier — och möter väggen där. Inte vid ett registreringsformulär, inte vid ett "skapa konto för att fortsätta". Vid det ögonblick då hon ser att texten är bra.

### 3.3 Vad benchmarken faktiskt säger (och inte säger)

- Freemium-median: **8 %** free-to-paid — men fördelningen är **bimodal**: ~25 % konverterar under 2,5 %, ~25 % ligger på 10–15 %. **10x-gap mellan topp- och bottenkvartil.** Medianen säger ingenting om var vi ska ligga; den säger att designen avgör allt.
- B2B-median lägre: ~2,6–3,7 %. Bra: 3–5 %. Utmärkt: 8–12 %. **AI-nativa produkter ligger högre: bra 6–8 %, utmärkt 15–20 %.**
- Hard paywall konverterar 5,5x bättre per nedladdning (12,1 % vs 2,2 %) och ger 2x LTV — **men är otillämpligt för oss**: det förutsätter att man kan strypa toppen av tratten, och vår topp ÄR affären (SEO). Noteras för att avfärdas medvetet, inte av okunskap.
- Trial-inkluderande paywall-skärmar vinner **64,5 %** av A/B-tester mot rent visuella layouter.

### 3.4 Paywall-designen (till Design)

Marknadsdatan pekar på fyra saker nästan ingen gör, och de är alla applicerbara:

1. **Long-scroll paywall med social proof och jämförelse slår kort paywall.** (Mojo: +20 % i vissa marknader enbart på layout.) Vår sociala proof är lokal och trovärdig: *"34 föreningar i Gislaved bevakar det här bidraget"* — den siffran finns redan i mockupen från Design.
2. **Ankring av årspriset mot månadsekvivalent** gav +30 % trial-start och +10 % årsval, med noll prisförändring. För oss: 495 kr/år = **41 kr/månad** — och en enda missad deadline kostar hela bidraget.
3. **Design, layout, informationshierarki och prissättningspresentation är geo-specifika lägen som nästan ingen drar.** Svensk föreningskontext är en egen geo. Ingen har designat en paywall för en 60-årig kassör i en bandyklubb.
4. **Berättelsen ska hålla ihop** från sökresultat → kommunsida → utkastet → paywall. Testet: läs H1, svar-först-blocket, utkastets första stycke och paywall-rubriken i följd. Är det en berättelse eller fyra?

### 3.5 Betalningen (svensk marknad — hög konverteringspåverkan)

- **Swish är det betalsätt online som ger bäst konvertering i Sverige** — 8+ miljoner användare, BankID-autentisering, låg friktion, låg transaktionsavgift. Icke-förhandlingsbart för 149-kronorsköpet.
- **Kort som andra alternativ.** Klarna/faktura är byggt för större köp och tillför lite här — men kan övervägas för 495-kronorsabonnemanget.
- **Stripe stödjer Swish natively** via Payment Element/Checkout — en integration, inget extra arbete. Det avgör teknikvalet: Stripe, inte separat Swish API-anslutning.
- **Båda produkterna ska gå att betala direkt** (Jacobs beslut, korrekt): kassörer kvittoredovisar rutinmässigt i föreningar. Ingen fakturagate, ingen "kontakta oss".
- Transaktionsavgift ~0,2–3,5 % + 1–3 kr: vid 149 kr ≈ 5 kr. Marginellt.

---

## 4. Vad detta kräver att vi bygger

I prioritetsordning. **Inget av detta byggs innan Jacob säger till** — dokumentet definierar bara vad som väntar.

1. **Vägledningslagret** (gratis, men det som gör wikin till en guide). "Er förening är kulturförening med ungdomsverksamhet i Botkyrka → dessa två bidrag är relevanta, det största är X, börja med att bli bidragsberättigade i InterbookGo, det tar tid." Genereras i hög grad ur befintlig YAML. Gör sidorna djupare, mer citerbara av LLM:er (svar-först-logiken älskar sådana svar), OCH bygger rampen till betalpunkten. **Detta är nästa Fable-jobb.**
2. **Föreningsprofilen** (datamodell): verksamhet, medlemsantal, kategori, tidigare ansökningar. Grunden för både utkast och föreningsminne.
3. **Utkastgeneratorn**: föreningsprofil × bidragets kriterier → ansökningsutkast. Kärnprodukten.
4. **Ungated-flödet + paywall** enligt §3.
5. **Stripe med Swish.**
6. **Utskicksmotorn** (deadlinebevakning) — som redan är flaggad, nu med kommersiell motivering.

---

## 5. Vad vi mäter (ersätter inget, kompletterar §8 i UPPDRAG_POC)

12-veckorsbeslutet står kvar som det är — SEO-signalerna avgör om nischen bär. Men när betalpunkten finns, mät:

- **Ungated → påbörjat utkast** (kom hon till värdeögonblicket?)
- **Påbörjat utkast → betalning** (höll värdeögonblicket?)
- **Utkast → abonnemang** (bar föreningsminnet?)
- Riktvärde att sikta mot: **6–8 % är "bra" för en AI-nativ produkt, 15–20 % är utmärkt.** Under 2,5 % betyder att betalväggen sitter fel — inte att marknaden saknas.

---

## 6. Öppna frågor (Jacob)

1. **Momsregistrering och prissättning inkl/exkl moms** — 149 kr och 495 kr bör vara vad kassören faktiskt betalar (inkl. moms), inte exkl. Kräver beslut om AB:ets momshantering.
2. **Utkastets ansvarsgräns.** Vi genererar ett utkast — vi lovar inte bifall. Copyn måste vara lika skarp som metodsidans ansvarsbegränsning ("vi avgör inte din ansökan"). Fable skriver den när produkten definieras.
3. **Prisnivåerna är hypoteser, inte fakta.** 149/495 är kalibrerade mot marknadslogik och svensk föreningsverklighet, men aldrig testade. De ska A/B-testas — men från S, inte A.
