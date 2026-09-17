# Omverifiering steg 2 — poster som behöver en riktig webbläsare

Skriven av Code under ett forskningspass mot SPEC_OMVERIFIERING.md:s
prioriterade kö (`scripts/omverifiering-ko.ts`). Grenen: `omverifiering-steg2-2026-09-17`.

Varje rad nedan är en källa jag INTE kunnat verifiera med WebFetch eller
`curl -A "Mozilla/5.0"` — antingen för att sidan är JS-renderad (en
e-tjänstportal som bara ger navigeringsskalet), innehållet sitter i en
hopfälld/dynamiskt laddad sektion, eller för att jag hittat ett konkret
tecken på förändring (t.ex. bytt rubrik) men inte kan läsa den nya
brödtexten. Jag har INTE gissat eller uppdaterat YAML för någon av dessa.

Format per rad: kommun, bidrags-id(n), URL, vad som är osäkert, varför
automatiserad hämtning inte räckte.

## Kö

<!-- Codex: bocka av / ta bort rader när de är kollade och YAML uppdaterad eller senast_verifierad bumpad. -->

1. **Ludvika** — `ludvika-verksamhet-anlaggning-drift`
   URL: https://www.ludvika.se/e-tjanster/e-tjanster-och-blanketter/uppleva-och-gora/foreningar/foreningsbidrag---verksamhet-anlaggning-och-drift-for-fritids--och-idrottsforeningar
   Osäkert: allt (deadline 09-25, krav om minst tio medlemmar, belopp).
   Varför: e-tjänstsida, bara navigeringsmeny i både WebFetch och curl — ingen brödtext alls.

2. **Ludvika** — `ludvika-arrangemangs-projektbidrag`
   URL: https://www.ludvika.se/e-tjanster/e-tjanster-och-blanketter/uppleva-och-gora/foreningar/foreningsbidrag----arrangemangs--och-projektbidrag-for--fritids--och-idrottsforeningar
   Osäkert: allt.
   Varför: samma e-tjänstmall som ovan.

3. **Ludvika** — `ludvika-verksamhetsbidrag-kulturforeningar`
   URL: https://www.ludvika.se/e-tjanster/e-tjanster-och-blanketter/uppleva-och-gora/foreningar/foreningsbidrag---verksamhetsbidrag-for-kulturforeningar
   Osäkert: allt.
   Varför: samma e-tjänstmall.

4. **Vaggeryd** — `vaggeryd-verksamhetsbidrag`
   URL: https://www.vaggeryd.se/uppleva-och-gora/foreningar-foreningsliv/foreningsbidrag.html
   Osäkert: om "Verksamhets- och lokalbidrag" bytt namn till "Bidrag för verksamhet och medlemmar" är en ren omdöpning eller en sakändring (nya krav, nytt belopp, ny deadline).
   Varför: sidans `<h3>`-rubrik har bytt text (bekräftat i rå HTML via curl) men brödtexten under den nya rubriken sitter i en sektion (troligen en accordion/hopfällbar del, SiteVision-CMS) som inte finns i den statiska HTML:en — varken WebFetch eller curl når den. Nuvarande YAML: deadline 09-30 ("31 september" i källans text är ett känt kommunfel, normaliserat till 30:e), belopp individuellt prövat.

5. **Sandviken** — `sandviken-stiftelser-fonder`
   URL: https://sandviken.se/kommunochpolitik/stipendierfonderochutmarkelser.10051.html
   Osäkert: Lars Bucans kulturstiftelses fyra ansökningsdatum för 2026. YAML lagrar i dag "2025 års datum" (9 mars, 11 maj, 17 augusti, 30 november), redan ärligt markerat som sådana i krav-texten.
   Varför: sidan nämner inte Lars Bucans-datumen alls just nu (bara Gunvor Göranssons tre 2026-datum, som JAG BEKRÄFTAT: 31 januari, 30 april, 30 september — matchar redan YAML:en). Kan vara att 2026 års Lars Bucans-datum publiceras på en underliggande sida/PDF jag inte hittat, eller att de bara inte satts än. Rör INTE `deadlines.datum`-fältet (delas mellan båda stiftelserna på samma post) förrän Lars Bucans 2026-datum är bekräftade.

6. **Falkenberg** — `falkenberg-stiftelser-fonder`
   URL: https://kommun.falkenberg.se/om-kommunen/ekonomi-kvalitet-och-styrning/kommunens-ekonomi/stiftelser-stipendier-och-fonder
   Osäkert: allt (flera stiftelser på en sida).
   Varför: 896 KB HTML, noll träffar på "stiftelse" ens skiftlägesokänsligt — innehållet laddas dynamiskt, varken WebFetch eller curl ser det.

7. **Köping** — `koping-lovbidrag`, `koping-jubileumsbidrag`
   Gammal URL (404 nu, bekräftat via curl OCH WebFetch): https://koping.se/kultur-fritid--natur/foreningar/stod-och-bidrag-till-foreningar/olika-typer-av-stod/verksamhetsstod.html
   Osäkert: om bidragen är borttagna, sammanslagna med annat, eller bara flyttade till ny URL.
   Varför: sidan "olika-typer-av-stod/verksamhetsstod.html" är borta. Hämtade nav-menyn från föräldrasidan (stod-och-bidrag-till-foreningar.html) via WebFetch — den listar INTE längre "verksamhetsstod" som undersida under "olika-typer-av-stod" (bara "sarskilt-stod-till-foreningar.html", som fortfarande finns och är bekräftad oförändrad denna omgång). Menyn har dock en fristående sida "Anordna lovaktiviteter" (/kultur-fritid--natur/foreningar/anordna-lovaktiviteter.html) som KAN vara lovbidragets nya hem, och en separat "Kultur- och idrottsstipendium"-sida som inte är samma sak som jubileumsbidrag. Websökning gav bara en sammanfattning ("lovbidrag... 200 kr per timme" nämnt i en sökträffssnippet, ej verifierat mot källan) — inte tillräckligt för att skriva om YAML. Rör INTE `status`-fältet till avskaffat förrän någon läst de nya kandidat-URL:erna i en riktig webbläsare.

8. **Borås** — UPPDATERAD 2026-09-17 (omverifiering steg 2, fortsättning): 11 av 15 bidrag
   är nu lösta. Borås har migrerat hela den döda PDF-normen
   ("Bidragsformer för Fritids- och folkhälsonämnden_2025", fortfarande 404) till separata
   HTML-sidor under `/kommunochpolitik/bidragansokompengar/pengarforforeningar/<namn>.html`.
   Fullständig lista över de 11 undersidorna hämtad och crawlad — INGA fler sidor finns i
   den kategorin. Lösta och rättade (kalla_url uppdaterad, innehåll sakligt bekräftat där
   sidan gav exakta siffror):
     - `boras-aktivering-inkludering` → aktiveringsochinkluderingsbidragforforeningar (siffror bekräftade)
     - `boras-idrottsskola` → bidragforidrottsskola (siffror bekräftade)
     - `boras-grundbidrag` → stodforbidragsberattigademedlemmar (siffror bekräftade)
     - `boras-verksamhetsstod-barn-unga` → verksamhetsstodforforeningar (struktur bekräftad, ej 15-nivåtrappan)
     - `boras-socialt-riktat-ungdom` → socialtriktatstodforforeningar (siffror bekräftade)
     - `boras-lokalbidrag` → bidragtilllokalerochanlaggningar (siffror bekräftade; gammal URL hade stavfel: "loker" → "lokaler")
     - `boras-samlingslokaler`, `boras-driftbidrag-egna-lokaler`, `boras-driftbidrag-anlaggningar`,
       `boras-anlaggningsbidrag`, `boras-anlaggningslan` → alla pekar nu på samma
       översiktssida (bidragtilllokalerochanlaggningar) som bekräftar tidsramarna
       (löpande/en månad efter årsmöte/automatiskt/två månader före/31 maj+30 nov) men INTE de
       exakta kronbeloppen/procentsatserna ordagrant — dessa kunde INTE oberoende
       omverifieras, bara flaggade i anteckning per post.
     - `boras-saker-trygg-forening` → hittades på en ANNAN sida (annat URL-mönster:
       `/upplevaochgora/foreningslivochbidrag/sakerochtryggforening...`), bekräftar
       certifieringens syfte/krav/tvåårsintervall men INTE de exakta kronbeloppen
       (5000/10000/2000/6000 kr) eller de fasta datumen (31 aug/30 sep) — dessa kunde
       inte oberoende omverifieras.
   Fortfarande olösta, INGEN sida hittad under `pengarforforeningar/` eller via sökning
   (kan vara nedlagda, sammanslagna med annat stöd, eller bara inte namngivna likadant):
     - `boras-funktionshinder-verksamhetsstod` (16 500–385 000 kr enligt tolv nivåer)
     - `boras-namndens-forfogande` (fritt belopp efter nämndens beslut)
     - `boras-orienteringskartor` (9 000/4 400 kr per km²; en websökning gav en avvikande
       siffra 8 250/4 000 kr/km² från en äldre docplayer.se-cachad PDF, inte tillräckligt
       för att lita på)
     - `boras-ideburen-samverkan` (10 000 kr förstudie + årligt samordningsstöd)
   Dessa fyra rördes INTE (kalla_url pekar fortfarande på den döda PDF:en, senast_verifierad
   ej bumpad) eftersom jag inte kunde hitta någon fungerande ersättningssida. En riktig
   webbläsare mot boras.se:s egen sökfunktion (JS-renderad, kan inte curl:as) eller mot
   Smartbook-portalen (boras.actorsmartbook.se) kan hitta dem snabbare än fortsatt sökning.

9. **Sundbyberg** — `sundbyberg-projektbidrag-toppstugan`
   URL: https://www.sundbyberg.se/uppleva-och-gora/konst-och-kultur-i-sundbybergs-stad/bidrag-stod-och-stipendier/bidrag-till-foreningar---idrott-friluftsliv-fritid-och-kultur
   Osäkert: om bidraget är borttaget, flyttat, eller bara inte omnämnt på just den här sidan.
   Varför: sidan nämner INTE "Toppstugan" alls (bekräftat via både curl och WebFetch,
   två oberoende körningar). Övriga fyra bidrag på samma sida (projektbidrag under/över
   30 000 kr, investeringar i lokaler, lovbidrag) bekräftades ord för ord. Websökning gav
   en träff vars textutdrag matchar YAML:ens lagrade beskrivning nästan exakt (samma
   "max 30 000 kr", "sex veckor före projektstart") men ingen ny, bekräftad live-URL —
   kan vara Googles cache av en äldre sidversion. Sökningen visade också att staden
   verkar migrera till kortare URL:er (t.ex. sundbyberg.se/kultur-fritid/... istället för
   www.sundbyberg.se/uppleva-och-gora/...), vilket kan förklara varför innehållet flyttat
   utan att jag hittat den nya sidan. Rör INTE `status`-fältet förrän en riktig webbläsare
   bekräftat om bidraget fortfarande finns, någonstans på sundbyberg.se.

## Mönster värt att känna till (för Codex, inte en åtgärdspunkt)

- **WebFetch missar ofta innehåll `curl -A "Mozilla/5.0"` FÅR** (Botkyrka, Ludvika-testet visade blandat). Prova alltid curl som fallback innan en post skrivs som "kräver browser" — flera av raderna ovan kan visa sig vara curl-lösbara vid ett nytt försök, jag har inte hunnit dubbelkolla alla.
- **Cloudflare-fronted PDF:er** (t.ex. sunne.se) svarar ofta 200 på `curl -A "Mozilla/5.0"` men troligen inte på scraperns egen user-agent — det förklarar en del av `otillganglig`-flaggorna i kön som inte alls är trasiga länkar.
- **wps/portal-URL:er** (Göteborgs gamla WebSphere Portal) gav faktiskt läsbar text via WebFetch — inget systematiskt problem där.
