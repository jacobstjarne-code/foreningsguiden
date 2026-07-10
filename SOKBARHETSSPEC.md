# SÖKBARHETSSPEC: Föreningsguiden — SEO + GEO från grunden

*Skriven av Opus/Fable 2026-07-11 efter en researchrunda över fem fält: programmatisk SEO 2026, generativ motoroptimering (GEO/citering i LLM:er), llms.txt-status, schema.org-strukturerad data, och AI-crawlerhantering. Detta är go-to-market-dokumentet. Läses tillsammans med UPPDRAG_POC.md (produkt/data) och DESIGN_UPPDRAG.md (form). Redaktionella/strategiska beslut går till Fable/Jacob — gissa inte.*

---

## 0. Varför den här sajten är ovanligt välplacerad (läs först)

Två insikter ur researchen som avgör hela ansatsen, för de säger att vi inte spelar samma spel som en generisk innehållssajt:

**Ett — vi lever i AI-svarsmotorernas blinda fläck.** De genererande motorerna (ChatGPT, Perplexity, Google AI Overviews) är starka på "vad är X"-frågor men svaga på "hur mycket / vilka regler / sista datum i [specifik ort]". Föreningsguidens hela innehåll ÄR den senare sorten: per-kommun, faktatätt, lokalt. Det är inte en nisch vi råkar hamna i — det är exakt den frågetyp där de stora modellerna behöver en extern källa och citerar den. Vi konkurrerar inte med Wikipedia om breda svar; vi äger de smala.

**Två — GEO belönar precis det vår data redan är.** Den akademiska grunden för GEO (Princeton/Georgia Tech/Allen Institute, KDD 2024) visade att "faktatäthet" — konkreta siffror, datum, källhänvisningar — höjer sannolikheten att bli citerad av en LLM med upp till 40 %, medan nyckelordsstoppning har noll eller negativ effekt. Vår YAML är faktatäthet i ren form: belopp, deadlines, krav, källa, verifieringsdatum. Vi behöver inte lägga till fakta för att bli citerbara — vi behöver bara presentera dem i rätt struktur.

Slutsatsen: SEO och GEO är inte två projekt här. Samma data, rätt strukturerad, vinner båda. Det som återstår är att bygga strukturen medvetet från dag ett i stället för att retrofit:a senare.

---

## 1. De två publikerna, och varför de överlappar men skiljer sig

Sajten optimeras för två sorters läsare samtidigt:

**Sökcrawlers** (Googlebot, Bingbot) indexerar sidor för klassiska resultat. Här gäller programmatisk SEO: unika sidor, arkitektur, teknisk hygien.

**AI-svarsmotorer** hämtar innehåll på två sätt, och skillnaden styr taktiken:
- *Retrieval/RAG i realtid* (Perplexity, Google AI Overviews, ChatGPT Search): söker webben vid frågetillfället och citerar det de hämtar. Detta liknar SEO — indexering, relevans, auktoritet avgör. Snabbast feedback (Perplexity: första citeringar inom 2–4 veckor).
- *Träningsdata* (modellernas "långtidsminne"): innehåll som fanns när modellen tränades. Att publicera högkvalitativt nu bygger citeringssannolikhet i framtida modellversioner.

Nyckelfakta som styr prioritering: ChatGPT:s realtidssökning använder **Bings index** — Bing-indexering är alltså en förutsättning för ChatGPT-synlighet, och de flesta glömmer det. Google AI Overviews lutar sig mot Googles topp-10–20 organiska — rankar vi inte där, citeras vi sällan där. Perplexity väger recens tyngst. Endast ~11 % av domäner citeras av både ChatGPT och Perplexity — plattformslogiken skiljer sig, så vi bygger brett och mäter per plattform.

---

## 2. Programmatisk SEO-lagret (klassisk sökbarhet)

### 2.1 Anti-tunnhet — det enda som kan döda oss

Februari 2026 års Google Core Update gjorde tydligt: en sida som bara finns för att fånga ett nyckelord rankar inte. Branschregeln 2026 är att varje programmatisk URL måste bära **minst 3 "unikhetsblock"** som skiljer sig meningsfullt mellan sidorna — annars är det mallspam. Vår data ger detta naturligt, men det måste byggas in medvetet:

Per kommunsida är unikhetsblocken: (1) den faktiska bidragslistan med kommun-specifika belopp och krav, (2) de faktiska deadlinedatumen, (3) förvaltning + ansökningssystem, (4) verifieringsdatum + källänk. Fyra block, alla genuint olika mellan kommuner. Det klarar tröskeln.

**Bindande regel — inga tomma eller tunna sidor:** en kategori×kommun-sida genereras ENDAST om kommunen har minst ett bidrag i kategorin (redan spec:at i UPPDRAG_POC.md §5.3, upprepas här för att det är avgörande för hela domänens hälsa — tunna sidor drar ner allt). Överväg en golvregel: en kommunsida med bara ett enda "löpande, inga detaljer"-bidrag kanske inte ska genereras som egen indexerbar sida förrän datat är fylligare. Kill-kriteriet från fabriksmaximerna gäller per sida: bär den inte unikt värde ska den inte finnas i indexet.

### 2.2 Arkitektur och intern länkning

- **Hub-och-eker-struktur.** Startsidan → kommunväljare (hub) → kommunsidor → kategori×kommun-sidor. Deadlinekalendern är en tvärgående hub som länkar in i alla kommuner. Inga föräldralösa sidor — varje sida ska nås via minst en hub. AI-motorer använder intern länkning för att förstå ämnesdjup; isolerade sidor citeras sämre.
- **Brödsmulor (BreadcrumbList) genomgående** — hjälper både crawlbudget och visar hierarki. Detta är ett av få schema-typer som fortfarande ger synligt resultat i Google.
- **Korslänkning kommun→kommun** där det är meningsfullt (angränsande kommuner, samma län) ger ekersidorna kontext och håller crawlern rörlig.

### 2.3 Teknisk hygien (obligatorisk)

- **sitemap.xml, uppdelad i mindre delar** (t.ex. per län eller sidtyp) för snabbare upptäckt vid skala. `lastmod` sätts ur `verifierad`-fältet per sida.
- **Kanoniska URL:er** på varje sida (redan förberett i Base.astro — `site` är satt).
- **robots.txt** som tillåter allt relevant (se §5).
- **Sidhastighet under ~2 sek.** Astro statiskt gör detta enkelt; inga onödiga klientberoenden. Prestanda är en rankningsfaktor och påverkar AI-crawlerns förmåga att hämta.
- **IndexNow** — protokollet som direktnotifierar Bing (och därmed indirekt ChatGPT-synlighet) om nya/ändrade sidor. Stöds av Bing; Google stödjer det inte officiellt ännu. Värt att koppla eftersom Bing-vägen matar ChatGPT.
- **Bing Webmaster Tools** — submitta sitemap där, inte bara i Google Search Console. Detta är den enskilt mest förbisedda åtgärden för ChatGPT-synlighet.

---

## 3. GEO/AEO-lagret (bli citerad av LLM:er)

Detta är den nya ytan, och den där vår faktatäthet ger oss oproportionerlig hävstång. Reglerna nedan är on-page och kostar nästan inget att bygga in från början — men är dyra att retrofit:a.

### 3.1 Svar först (BLUF / inverterad pyramid)

Den enskilt högsta hävstången i formatering: **led varje sida med ett direkt svar på 2–4 meningar** på sidans primära fråga, innan detaljerna. AI-motorer skannar toppen av sidan först när de bygger svar. På en kommunsida betyder det: inte en generisk välkomstmening, utan "I [kommun] kan föreningar söka [N] kommunala bidrag. Sista datum varierar mellan [tidigaste] och [senaste]. Ansökan görs via [system]." — konkret, extraherbart, självständigt läsbart.

### 3.2 Svarskapslar under rubriker

Under varje H2 på informationstunga sidor: en **40–60 ords självständig sammanfattning** som besvarar just den sektionens fråga. En LLM ska kunna lyfta den rakt av utan att läsa runtomkring. Detta gäller särskilt metodsidan och eventuella förklarande sidor ("Vad är LOK-stöd?", "Skillnaden mellan kommunalt och statligt aktivitetsstöd").

### 3.3 Frågeformat (Q&A)

Q&A-struktur höjer citeringsfrekvens mätbart (Semrush: +25 % citering; en studie av 50 domäner: +22 % med FAQPage-schema). Varje kommunsida bör ha en kort, äkta FAQ-sektion med de frågor kassörer faktiskt ställer:
- "Vilka föreningsbidrag kan man söka i [kommun]?"
- "När är sista ansökningsdag för [bidrag] i [kommun]?"
- "Vart skickar man ansökan om föreningsbidrag i [kommun]?"

Svaren self-contained, 2–5 meningar, genererade ur datat (Fable skriver mallarna, Code fyller variablerna). **Kritiskt: FAQ-schemat får bara innehålla frågor/svar som syns på sidan** (se §4.3) — annars är det en riktlinjebrott som kan ge manuell åtgärd.

### 3.4 Tabeller och listor

AI-motorer citerar tabeller och listor oftare än löpande text. Deadlineöversikten, bidragsjämförelser och kravlistor ska vara riktiga `<table>`/`<ul>`, inte prosa. Det gör dem både mer läsbara för kassören och mer extraherbara för modellen — samma struktur tjänar båda.

### 3.5 Ingen säljton

Detta är en regel, inte en stilpreferens: promotionston **sänker** AI-citering med ~26 %. Fraser som "absolut bäst", "marknadens ledande", "agera nu" är GEO-gift. Det sammanfaller lyckligt med det redan låsta registret (understatement, ingen säljticka) — men det betyder att regeln nu har en andra, teknisk grund utöver den redaktionella. Håll den järnhårt: sajtens saklighet är inte bara varumärkeston, den är citeringsmekanik.

### 3.6 Faktatäthet och källhänvisning

Behåll och förstärk det datat redan gör: konkreta siffror, datum, procentsatser (Bergs −50 %, Stockholms −25 %, exakta deadlines). Länka alltid till primärkällan (kommunens sida) med synlig inline-referens. Detta är exakt vad GEO-forskningen visade höjer citering upp till 40 %. Vår `kalla_url` per bidrag är redan denna mekanik — se till att den renderas synligt, inte gömd.

### 3.7 E-E-A-T och förtroendesignaler (YMYL-angränsande)

Sajten rör pengar och kvasiofficiell information — den ligger nära YMYL (Your Money or Your Life), där Google och LLM:er kräver högre förtroendebevis. Konkret:
- **Namngiven avsändare med synligt uppdateringsdatum.** GEO-motorer väger "author + date + update-date". Metodsidan bör ha en tydlig avsändare (redaktionen/Föreningsguiden som namngiven entitet, ev. med en verklig ansvarig person) och varje sida ett synligt "senast verifierad"-datum — vilket `verifierad`-fältet redan ger. **Öppen fråga till Jacob:** ska en namngiven fysisk person stå som redaktionellt ansvarig? Det stärker E-E-A-T men har integritets-/exponeringskonsekvenser. Fable har ingen åsikt om vem; flaggar att beslutet finns.
- **Metodsidan är förtroende-ankaret** (redan skriven i content.ts, register låst). Den gör tre saker GEO belönar: erkänner gränser, redovisar metod, länkar källor.
- **Konsistent entitetsinformation** om Föreningsguiden överallt den nämns (namn, beskrivning, vad den täcker) — bygger den "entitetsauktoritet" LLM:er använder för att lita på en källa.

---

## 4. Strukturerad data (schema.org)

Strukturerad data är inte en direkt rankningsfaktor, men den är hävstång för AI-citering och entitetsförståelse. Ett kontrollerat experiment 2025 fann att sidan med välbyggt schema hamnade i en AI Overview medan sidan utan inte ens indexerades. **JSON-LD genomgående** (Google föredrar det). Plan:

### 4.1 Organization (på alla sidor, via Base.astro)
Föreningsguiden som entitet: namn, beskrivning, URL, och `sameAs` som pekar på sajtens profiler där de finns (byggs ut när de finns). `knowsAbout`-deklaration ("kommunala föreningsbidrag", "föreningsstöd", "aktivitetsstöd") hjälper entitetsigenkänning. Detta är fundamentet för att modeller ska "veta" vad Föreningsguiden är.

### 4.2 BreadcrumbList (genomgående)
Ger synligt resultat i Google än idag och hjälper hierarkiförståelse. Billig, hög avkastning.

### 4.3 FAQPage (på kommunsidor med FAQ)
Google slutade visa FAQ-rich-results i maj 2026 — men schemat är fortfarande giltigt och **aktivt läst av ChatGPT, Perplexity, Claude och AI Overviews** (median +22 % citering i en 50-domänstudie). Regler:
- Använd `acceptedAnswer` (inte `suggestedAnswer` — det är QAPage, fel typ).
- Varje fråga/svar i schemat MÅSTE synas på sidan. Dold FAQ-schema = riktlinjebrott, risk för manuell åtgärd på hela sajten.
- Svar 2–5 meningar, self-contained, ingen säljton.

### 4.4 Bidragen som strukturerad data — beslut behövs
Två vägar att märka upp själva bidragen, båda värda utredning av Code:
- **GovernmentService / Service-schema** för varje bidrag (namn, leverantör = kommunen, område, målgrupp). Semantiskt mest korrekt; osäkert hur väl motorerna utnyttjar det.
- **Dataset-schema** på kommunnivå — sajten ÄR i grunden ett dataset av bidrag, och GOV.UK använder Dataset-schema för att synas i Google Dataset Search. Varning: en källa listade Dataset som nedprioriterat januari 2026 — Code får verifiera aktuell status innan implementation. Fable flaggar osäkerheten hellre än att slå fast.
Rekommendation: börja med det säkra (Organization + BreadcrumbList + FAQPage), utvärdera GovernmentService/Dataset som andra våg efter att Code bekräftat aktuell motorstatus.

### 4.5 dateModified — färskhet som signal
Perplexity och andra väger recens tungt; en synlig och schema-deklarerad `dateModified` höjer förtroende. **Mappa `verifierad`-fältet till `dateModified` i JSON-LD.** Detta gör vår verifieringsdisciplin till en direkt GEO-signal — samma fält tjänar redaktionell integritet, inaktualitetsflaggan OCH färskhetssignalen. Tre funktioner, ett fält.

---

## 5. Crawler-åtkomst: robots.txt, llms.txt, Bing

### 5.1 robots.txt — släpp in allt (medvetet val)
De flesta sajter brottas med avvägningen träningsdata-skydd kontra citeringssynlighet. **För oss finns ingen avvägning:** innehållet är ingen vallgrav, hela poängen är maximal synlighet, och vi *vill* att modeller har Föreningsguiden i sitt "långtidsminne" som platsen för kommunala föreningsbidrag. Alltså: tillåt både tränings- och sökcrawlers.

```
# Sökmotorer
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /

# OpenAI (träning + sök + on-demand)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /

# Google AI (påverkar inte vanlig Google-ranking)
User-agent: Google-Extended
Allow: /

# Övriga tillåts som default
User-agent: *
Allow: /

Sitemap: https://foreningsguiden.se/sitemap.xml
```

Enda undantaget att överväga: om Vercel-bandbredden blir ett problem (AI-tränings-crawlers står för ~89 % av AI-crawlertrafiken och kan vara aggressiva) kan en `Crawl-delay` läggas på de tyngsta, eller Bytespider (dokumenterat illa uppförd, ignorerar ofta robots.txt) blockeras. På statisk Astro/Vercel är serveringen billig — börja allow-all, övervaka bandbredd, agera bara vid faktiskt problem. robots.txt är en artig begäran, inte ett lås; verklig blockering sker på CDN/WAF-nivå om det någonsin behövs.

### 5.2 llms.txt — bygg den, förvänta inget (ännu)
Ärlig status juli 2026: ~10 % adoption, de stora crawlerna hämtar den nästan aldrig, inga mätbara SEO-effekter. MEN: Anthropic och Perplexity har publikt bekräftat att de respekterar den i retrieval, den är en halvdags jobb, och den dagen en stor leverantör börjar väga den är vi redan korrekta. Framför allt är den en **B2A-yta** (business-to-agent) — en maskinläsbar karta över sajtens bästa innehåll, curerad. Övningen i sig tvingar fram frågan "vad vill vi att en modell citerar oss för", vilket är nyttigt. Bygg en enkel `/llms.txt`: en stycke som beskriver Föreningsguiden auktoritativt, plus en curerad länklista (kommunindex, kalender, metodsida). Billig försäkring, ingen förväntan på trafik.

### 5.3 Bing Webmaster Tools
Upprepas för att det är underskattat: submitta sitemap i Bing, inte bara Google. ChatGPT Search går via Bings index. Detta är en engångsåtgärd med direkt ChatGPT-konsekvens.

---

## 6. Mätning — tre lager, kopplat till 12-veckorsbeslutet

Det befintliga kill-beslutet (UPPDRAG_POC.md §8) mätte indexering och impressions. Lägg till AI-citering som fjärde signal, för det är en del av go-to-market:

**Lager 1 — sökindexering.** Google Search Console + Bing Webmaster Tools. Vecka 2: är sidorna indexerade? Vecka 8: impressions-trend. Vecka 12: beslut.

**Lager 2 — AI-citering (manuell promptaudit).** Välj 20–30 prompter en kassör faktiskt skulle skriva ("vilka föreningsbidrag kan min idrottsförening söka i [kommun]", "sista datum LOK-stöd kommunalt [kommun]", "hur söker man kulturbidrag [kommun]"). Kör dem månadsvis mot ChatGPT, Perplexity, Google AI Overviews. Notera om/var Föreningsguiden citeras. Billigt, långsamt, exakt. Perplexity ger snabbast utslag (2–4 v).

**Lager 3 — serverloggar.** Bevaka AI-bottrafik (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended). Stigande = crawlers indexerar oss. Platt = vi är osynliga. Vercel-analytics eller loggar räcker för PoC.

Utökat 12-veckorsbeslut: död sökkurva OCH noll AI-citeringar ⇒ arkivera. Endera visar liv ⇒ utöka. AI-citering kan komma före sökranking (Perplexity indexerar snabbast), så en tidig Perplexity-citering är en positiv ledande indikator även om Google är tyst.

---

## 7. Frågemålen — vad vi faktiskt vill vinna

Sökbarheten byggs mot verkliga frågor, inte abstrakta nyckelord. Målfrågorna, i två familjer:

**Klassisk sök (long-tail, per kommun):**
- "föreningsbidrag [kommun]"
- "kulturbidrag förening [kommun]"
- "aktivitetsbidrag [kommun]"
- "söka bidrag idrottsförening [kommun]"
- "sista ansökningsdag föreningsbidrag [kommun]"

**AI-svarsmotorer (konversationellt, där modellerna är svaga och behöver oss):**
- "vilka bidrag kan min förening söka i [kommun]"
- "när ska man söka kulturbidrag i [kommun]"
- "hur mycket får man i föreningsbidrag i [kommun]"
- "vad är skillnaden mellan kommunalt och statligt aktivitetsstöd"
- "vart skickar man föreningsbidragsansökan i [kommun]"

Den andra familjen är där hela strategin lever: brett efterfrågade, tunt besvarade av de stora modellerna, och exakt matchade mot vår faktatäthet. Varje kommunsida ska medvetet besvara den familjen i sin struktur (svar-först + FAQ + tabell).

---

## 8. Prioriteringsordning (så inget byggs i fel ordning)

1. **Grundläggande on-page** (Code, nu): svar-först-block på kommunsidan, riktiga tabeller för deadlines/krav, FAQ-sektion med Fable-copy, synlig källänk + verifieringsdatum. Detta är samma bygge som steg 3 — GEO-reglerna är formkrav på det, inte ett separat pass.
2. **Teknisk hygien** (Code): sitemap uppdelad, BreadcrumbList, robots.txt (allow-all), canonical, IndexNow-koppling.
3. **Schema, säkra vågen** (Code): Organization + BreadcrumbList + FAQPage, dateModified ur verifierad.
4. **Crawler/index-registrering** (Jacob + Code): Bing Webmaster Tools, GSC, llms.txt.
5. **Schema, andra vågen** (Code, efter statuskoll): GovernmentService/Dataset om motorerna utnyttjar dem.
6. **Mätuppsättning** (Code + Jacob): de 20–30 promptarna definieras (Fable kan skriva listan), loggbevakning på.

## 9. Öppna beslut (Jacob)

1. **Namngiven redaktionellt ansvarig person** för E-E-A-T, ja/nej — integritet mot förtroendestyrka. Fable har ingen åsikt om vem, flaggar bara valet.
2. **Dataset/GovernmentService-schema** — Code utreder aktuell motorstatus, Jacob godkänner andra vågen.
3. **Bandbreddspolicy** om AI-crawlertrafik blir dyr på Vercel — börja allow-all, besluta vid faktiskt problem.

## 10. Vad detta INTE innehåller (medvetna avgränsningar)

- **Off-page/länkbygge och Reddit-GEO.** Researchen pekar på att tredjepartsomnämnanden och Reddit-citeringar är halva GEO-arbetet, men det är en separat go-to-market-aktivitet (PR, community) som inte hör till sajtbygget. Noteras för senare fas.
- **Betald AI-placering.** Flera plattformar pilottestar betalda slots i AI-svar. Inte relevant för PoC, men värt att bevaka — organisk citering blir mer konkurrensutsatt när betalda slots rullas ut.
- **Formulär-/GDPR-microcopy.** Väntar fortfarande på steg 3-strukturen (Fable skriver när ytan finns).
