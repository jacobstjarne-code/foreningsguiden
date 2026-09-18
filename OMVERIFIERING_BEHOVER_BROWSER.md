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

9. **Sundbyberg** — `sundbyberg-projektbidrag-toppstugan` — DUBBELKONTROLLERAD 2026-09-17,
   samma slutsats båda gångerna.
   URL: https://www.sundbyberg.se/uppleva-och-gora/konst-och-kultur-i-sundbybergs-stad/bidrag-stod-och-stipendier/bidrag-till-foreningar---idrott-friluftsliv-fritid-och-kultur
   Osäkert: om bidraget är borttaget, flyttat, eller bara inte omnämnt på just den här sidan.
   Varför: sidan nämner INTE "Toppstugan" alls (bekräftat via både curl och WebFetch,
   nu tre oberoende körningar totalt). Sidan är HELT omskriven sedan förra kontrollen —
   "Senast uppdaterad: 17 september 2026" (dvs. samma dag som denna omverifiering) och
   listar nu ett helt annat bidragsschema: Aktivitetsbidrag, Verksamhetsbidrag (med
   Stöd till verksamhet + Stöd till lokal), Evenemangsbidrag, Utvecklingsbidrag,
   Lovbidrag, Bidrag till studieförbund — inget av dem heter eller nämner Toppstugan.
   Evenemangsbidragets regler ("under 30 000 kr: löpande, sex veckor före; 30 000 kr
   eller mer: senast 1 oktober, beslut i december") matchar nästan ordagrant den gamla
   Toppstugan-specifika texten (max 30 000 kr, sex veckor före projektstart) — starkt
   tecken på att Toppstugan-bidraget har SLAGITS SAMMAN med det generella
   Evenemangsbidraget/Utvecklingsbidraget i samband med dagens omskrivning, men jag kan
   inte bekräfta det utan att hitta en sida som säger det explicit. toppstugansundbyberg.se
   (den fristående bokningssidan för lokalen) nämner inga bidrag alls, bara bokningspriser.
   Rör INTE `status`-fältet förrän en riktig webbläsare bekräftat om Toppstugan-bidraget
   fortfarande finns separat, eller om det ska mappas om till sundbyberg-evenemangsbidrag.

10. **Klippan** — `klippan-evenemangssponsring-2026`
    URL: https://www.klippan.se/arkiv/nyheter/2026/2026-01-28-ar-du-arrangor-sok-evenemangssponsring-for-2026
    Osäkert: om schemat fortsätter (t.ex. som "evenemangssponsring 2027"), bytt URL, eller
    upphört helt.
    Varför: nyhetsartikel-URL:en 404:ar ("Felsida", bekräftat via curl). De två andra
    kandidatsidorna jag testade (klippan.se/naringsliv--arbete/aktuellt-for-naringslivet,
    klippan.se/sok?query=evenemangssponsring) nämner inte sponsringen — sökfunktionen är
    troligen JS-renderad och gav bara 404 via curl. Websökning gav bara ett kort
    sammanfattat textutdrag om samma gamla schema (20 feb/15 maj 2026, redan passerade
    deadlines från dagens datum 2026-09-17) utan en ny bekräftad URL. En riktig webbläsare
    mot klippan.se:s egen sökfunktion eller nyhetsarkiv kan hitta om ett 2027-schema
    publicerats. Rör INTE `status`-fältet förrän det är bekräftat.

11. **Trollhättan** — `trollhattan-brukardriven-fritidsgard`
    URL: https://www.trollhattan.se/globalassets/dokument/uppleva-och-gora/ovrigt/riktlinjer---berakningsgrunder-for-foreningsbidrag-2017-02-06.pdf/
    Osäkert: om bidraget fortfarande finns, bara flyttat till en ny PDF/sida, eller
    upphört.
    Varför: kalla_url (PDF) ger 404 (bekräftat via curl). Websökning gav en andra
    kandidat-PDF (.../riktlinjer-berakningsgrunder-for-foreningsbidrag-i-dokumentmall-15.pdf)
    som också 404:ar. Kommunens huvudsida för föreningsbidrag
    (trollhattan.se/startsida/uppleva-och-gora/foreningar-foreningsliv/bidrag-stod-och-elitsponsring/)
    nämner INTE "brukardriven fritidsgård" eller "fritidsgård" alls i sin text, och
    innehåller inga PDF-länkar till bidragsriktlinjer. En riktig webbläsare mot
    kommunens sökfunktion eller dokumentarkiv (t.ex. Kultur- och fritidsnämndens
    budgethandlingar, som tidigare nämnde Velanda och Upphärad som mottagare) kan
    bekräfta om stödet fortfarande existerar. Rör INTE `status`-fältet förrän det är
    bekräftat.

12. **Svalöv** — `svalov-subventionerade-taxor-idrottsanlaggningar`
    URL: https://www.svalov.se/uppleva--gora/foreningsservice
    Osäkert: om de lagrade taxorna (nolltaxa 0-20 år, 100 kr/timme vuxna 20+, 50 kr/timme
    65+/funktionsvariation) fortfarande stämmer.
    Varför: sidan har byggts om — taxorna listas inte längre statiskt på sidan, utan
    hänvisar nu till Rbok ("se priser, villkor och annan bokningsinformation" i
    boknings­systemet). Sidan nämner också att föreningsstöd/bidrag hanteras i "nuvarande
    system" fram till 31 december 2026, därefter i Rbok — en systemövergång pågår. Provade
    även den länkade "Idrott & motion"-sidan utan träff på beloppen. En riktig webbläsare
    mot Rbok (kräver inloggning eller ett öppet prisblad) kan bekräfta aktuella taxor. Rör
    INTE `belopp`-fältet förrän det är bekräftat.

13. **Bjurholm** — `bjurholm-studieforbund`
    URL: https://e-tjanster.bjurholm.se/
    Osäkert: allt (belopp, krav, deadline 31 maj).
    Varför: sidan är en ren e-tjänstportal (sök-/tjänstekatalog) utan statiskt
    bidragsinnehåll — curl gav bara navigering, sökfilter och "mest använda
    tjänster", ingen träff på "studieförbund". En websökning gav en sammanfattning
    som nämnde "31 maj" men utan en citerbar källa — bedömdes för osäker att lita
    på (kan vara en cirkulär återspegling av redan lagrad kontext snarare än ny
    information). En riktig webbläsare som kan söka i portalens tjänstekatalog
    eller logga in kan hitta rätt tjänstebeskrivning. Rör INTE fälten förrän det
    är bekräftat.

14. **Härjedalen** — `harjedalen-pensionars-och-funktionsrattsbidrag`
    URL: https://www.herjedalen.se/download/18.786ce91e174afae6cb1694a/1601034881616/Protokoll%20Kf%202018-11-26.pdf
    Osäkert: beloppet (nuvarande YAML: "25 kr per medlem" för både pensionärs- och
    funktionsrättsorganisationer) samt om bidraget fortfarande existerar i denna form.
    Varför: käll-PDF:en (ett KF-protokoll från 2018-11-26) ger 404. Kommunens sida
    "Föreningsstöd" (styrdokument-och-regler/.../foreningsstod.html, hämtad OK) listar
    uttryckligen "Stimulansbidrag till pensionärsföreningar" som ETT AV DE OMRÅDEN
    styrdokumentet INTE omfattar — dvs bidraget styrs av ett separat dokument som inte
    länkas från den sidan eller kommunens allmänna styrdokumentlista. En websökning gav
    en tidningsartikel (Tidningen Härjedalen, ej kommunens egen källa, daterad omkring
    april 2019) som anger ANDRA belopp: 20 kr/medlem + 7 % stimulansbidrag för
    pensionärsorganisationer, 35 kr/medlem + 12 % för funktionsrättsorganisationer —
    alltså separata och högre belopp än de 25 kr/medlem som står i YAML idag, och
    uppdelat per organisationstyp istället för ett gemensamt belopp. Kan inte avgöra om
    tidningsuppgiften, YAML-uppgiften, eller ingendera är aktuell utan att se det
    faktiska styrdokumentet. En riktig webbläsare som kan söka i kommunens
    diarium/protokollarkiv eller kontakta kommunen kan hitta det aktuella beslutet. Rör
    INTE `belopp`-fältet förrän det är bekräftat.

15. **Vetlanda** — `vetlanda-landsbygdssatsningar`
    URL: https://vetlanda.se/bygga-bo-och-miljo/planer-och-utveckling/landbygdsutveckling/landsbygdssatsningar
    Osäkert: deadline-datumet (YAML: 09-02) samt om sidan flyttat.
    Varför: URL:en (och dess förälder-sida `.../landbygdsutveckling`, och till och med en
    daterad nyhetsartikel om samma satsning) ger alla 404 via curl (med och utan cookie-
    handshake), WebFetch och en omprövning senare samma pass — vetlanda.se verkar ha gjort
    en större URL-omstrukturering. En websökning gav en sammanfattning som bekräftar
    500 000 kr/år (matchar YAML) men anger sista ansökningsdag "12 september" istället för
    YAML:s 2 september — en genuin datumkonflikt jag inte kan lösa utan att se sidan själv,
    eftersom sammanfattningen inte är en primärkälla. En riktig webbläsare mot
    vetlanda.se:s nuvarande sitemap/sök kan hitta rätt sida och bekräfta datumet. Rör INTE
    `deadlines.datum` förrän det är bekräftat.

16. **Bräcke** — `bracke-subventionerade-kommunala-lokaler`
    URL: https://www.bracke.se/download/18.27851b24193defb8cc0d9ad/1737627770788/Bilaga%20till%20Program%20f%C3%B6r%20bidrag%20till%20f%C3%B6reningslivet%20i%20Br%C3%A4cke%20kommun.pdf
    Osäkert: om bidraget (50 % rabatt på kommunala lokaler/anläggningar, avgiftsfritt för
    0–25 år och 65+) fortfarande gäller i denna form.
    Varför: käll-PDF:en (en "Bilaga" till det gamla bidragsprogrammet) ger 404. Hittade och
    läste igenom hela den NUVARANDE styrande huvudhandlingen ("Program för bidrag till
    föreningslivet inom kultur och fritid", KF § 140/2024, 2024-12-11, hämtad OK via
    kommunens föreningsliv-sida) — den nämner INTE denna rabatt-på-uthyrning-bidragsform
    alls, bara ett annat, likvärdigt namngivet "Driftbidrag till samlingslokaler" (som gäller
    FÖRENINGSÄGDA lokaler, inte kommunens egna som föreningar hyr — en annan sak). Provade
    även en sökträff-URL för en nyare "Regler för uthyrning av kommunens idrottsanläggningar"
    (2025-11-12), men den PDF-länken gav också 404. Kan inte avgöra om
    rabatt-på-kommunala-lokaler-bidraget är nedlagt, ersatt, eller bara flyttat till ett
    dokument jag inte hittat. En riktig webbläsare mot kommunens sök eller uthyrningssida kan
    reda ut det. Rör INTE `status`-fältet förrän det är bekräftat.

17. **Hässleholm** — `hassleholm-strand-vattenvard`
    URL: https://www.hassleholm.se/bygga-bo-och-miljo/naturvard/naturvardsprojekt/ovriga-naturvardsprojekt/foreningsbidrag-for-strand--och-vattenvardsatgarder
    Osäkert: om deadline 12 maj fortfarande stämmer för 2026 samt om sidan flyttat.
    Varför: URL:en ger 404. En websökning gav bara en död nyhetsartikel (2025-02-07,
    också 404) med 2025 års specifika ansökningsperiod (deadline 31 mars 2025, inte samma
    datum som YAML:s 12 maj — men det kan vara en annan årsomgång, inte en motsägelse).
    Kommunens allmänna naturvårds-hubb och bidragshubb (båda hämtade OK) nämner inte detta
    bidrag alls längre. Sakinnehållet (100 000 kr total pott, 80 %/25 000 kr per förening,
    vassklippningsreglerna) kunde inte oberoende omverifieras. En riktig webbläsare mot
    kommunens sök eller tekniska förvaltningens sidor kan hitta rätt sida. Rör INTE
    `deadlines.datum` förrän det är bekräftat.

18. **Gällivare** — `gallivare-socialnamnd-aktivitet-projekt-administration`, `gallivare-socialnamnd-hyresbidrag`
    URL: https://gallivare.se/download/18.61e8f8fd19bac5bb2cf3aeba/1768392069960/F%C3%B6reningsbidrag%20ans%C3%B6kningsblankett%202026.pdf
    Osäkert: om beloppen/kraven (80 % av hyra, högst 500 kr/medlem, högst 60 000 kr/år
    för hyresbidraget) och 15 april-deadlinen fortfarande stämmer.
    Varför: käll-PDF:en (en ansökningsblankett) ger 404. En websökning gav bara en död
    nyhetsartikel om ett annat, liknande men inte identiskt namngivet bidrag
    ("Aktivitetsstöd för 2025", deadline 14 april 2025, för funktionshinderorganisationer
    och sociala föreningar) — osäkert om det är samma stödform eller en tredje. Kommunens
    bidragshubb (`/uppleva-och-gora/foreningar-och-foreningsliv/bidrag-stod-och-stipendier`)
    gav också 404 vid nytt försök. En riktig webbläsare mot kommunens sök eller
    socialförvaltningens sidor kan reda ut vilken sida/blankett som gäller nu. Rör INTE
    beloppen eller deadline förrän det är bekräftat.

19. **Täby** — `taby-verksamhetsbidrag-funktionshinderforening`
    URL: https://www.taby.se/uppleva-och-gora/foreningsliv/stod-och-bidrag-till-foreningar
    Osäkert: om bidraget (deadline vecka 2, avser föreningens verksamhet t.ex. en
    arrangerad sammankomst, funktionshindersföreningar) fortfarande finns i denna form.
    Varför: kalla_url gav 200 och hämtades både som WebFetch-stripad text och som rå HTML
    (curl -A "Mozilla/5.0"), men sidans 13 bidragsrubriker (h2/h3, statisk HTML, inget
    JS-accordion) innehåller INTE "Verksamhetsbidrag för funktionshinderförening" — bara
    Lokalbidrag och Verksamhetsbidrag sociala insatser nämner "funktionshindersföreningar"
    (båda med annan deadline, vecka 4). En websökning gav en träff på en ANNAN URL
    (taby.se/fritid-och-kultur/foreningsliv/bidrag-stod-och-foreningsjubileer/, alltså en
    omdöpt sökväg — "fritid-och-kultur" i stället för "uppleva-och-gora") vars snippet
    beskriver exakt detta bidrag (vecka 2, "arranged gatherings" för funktionshinderföreningar)
    — men den URL:en gav också 404 vid hämtning, så det går inte att avgöra om sök-snippeten
    speglar en levande sida jag inte hittat rätt väg till, eller en cachad/borttagen sida.
    Sidan har en "Senast uppdaterad: 2 september 2026"-stämpel, vilket talar för en
    medveten omstrukturering snarare än ett tillfälligt fel. En riktig webbläsare mot
    kommunens sök eller sitemap kan hitta rätt nuvarande sida/URL. Rör INTE fälten för
    detta bidrag förrän det är bekräftat — kan vara nedlagt, flyttat till ny URL, eller
    sammanslaget med Verksamhetsbidrag sociala insatser.

20. **Örnsköldsvik** — hela gruppen om 25 bidrag på
    `.../bidrag-till-ideella-foreningar/foreningsbidrag-som-gar-att-soka`, varav tre
    fortfarande oåtgärdade (se nedan).
    URL: https://www.ornskoldsvik.se/fritid-och-kultur/foreningsliv/bidrag-till-ideella-foreningar/foreningsbidrag-som-gar-att-soka
    Osäkert: samtliga bidragsspecifika belopp, ansökningsdatum och detaljvillkor.
    Varför: kommunen publicerar INGEN bidragsnorm öppet. Landningssidan ger bara en
    menings ändamålsbeskrivning per bidrag, grupperad per föreningstyp, och hänvisar
    genomgående till "Mer information om respektive bidrag samt ansökan hittar du i
    Interbook GO" — ett inloggningsskyddat boknings- och bidragssystem
    (ornskoldsvik.ibgo.se) som är en Vue-SPA utan publika bidragssidor (testade
    `/Default/Bidrag` och `/bidrag`, båda 404).

    Detta är INTE ett "hittade inte dokumentet"-fall utan ett verifierat negativt
    fynd. Jag hämtade och packade upp kommunens fullständiga sitemap
    (`sitemap1.xml.gz`, 991 KB, genererad 2026-09-17). Under
    `bidrag-till-ideella-foreningar/` finns exakt FYRA sidor i hela webbplatsen —
    landningssidan, `allmanna-bestammelser-for-bidrag-till-ideella-foreningar`,
    `serviceatagande-foreningsbidrag` och `redovisa-lovaktiviteter`. Ingen
    bidragsnorm-sida, och ingen bidragsnorm-PDF någonstans på ornskoldsvik.se
    (sitemapens samtliga `/download/`-träffar på "riktlinj"/"norm" gäller helt andra
    områden — oljeavskiljare, VA, trygghetsboende, affischering). Den gamla
    SiteVision-trädstrukturen som hade en egen detaljsida per bidrag
    (`/upplevaochgora/foreningarochforeningsstod/...`) är nedlagd och 404:ar.
    Serviceåtagandet säger att sökanden ska "ta del av kommunens bidragsnormer" —
    men det dokumentet ligger alltså bakom inloggningen i Interbook GO.

    Vad som ÄR gjort utan browser (2026-09-17): 22 av de 25 posterna bumpades, för
    att de inte gör några belopps- eller deadline-påståenden. Deras `deadlines` är
    `okand`/`[]` och deras `belopp` säger uttryckligen "publiceras inte på kommunens
    öppna bidragssida" — och just det påståendet gick att verifiera direkt mot den
    levande sidan. Krav-listorna kontrollerades mot sidan "Allmänna bestämmelser"
    (hämtad OK) plus respektive ändamålsmening. Fem sakfel rättades i samma pass,
    se YAML-anteckningarna för `ornskoldsvik-politiska-ungdomsorganisationer`
    (riksdagsalternativet saknades), `ornskoldsvik-utvecklingsbidrag`
    (studieförbund felaktigt med, barn-/ungdom och socialt utsatta saknades),
    `ornskoldsvik-verksamhetsbidrag-socialt-utsatta` ("samt studieförbund" ströks),
    `ornskoldsvik-skolforeningar` och `ornskoldsvik-transportbidrag`.

    EJ bumpade, kräver browser eller kontakt med föreningsbyrån —
    `ornskoldsvik-medlemsbidrag-barn-unga`,
    `ornskoldsvik-medlemsbidrag-funktionsratt`,
    `ornskoldsvik-medlemsbidrag-pensionar`. Dessa tre bär påståenden som INTE går
    att belägga från någon öppen sida — att beloppet "beslutas årligen av kultur-
    och fritidsnämnden", och för barn-/ungdomsvarianten dessutom en beräkningsregel
    ("antal aktiva medlemmar 6–25 år registrerade i föreningen vid kalenderårets
    slut"). Källan säger ingenting om vare sig beslutsordning eller beräkningsgrund.
    Rör INTE `belopp`, `krav` eller anteckningarna för dessa tre förrän någon läst
    bidragsnormen i Interbook GO eller fått den av kommunen. Kontaktväg om browser
    inte räcker: föreningsbyrån, kontaktcenter@ornskoldsvik.se, 0660–880 00.

21. **Högsby** — `hogsby-vag-underhall-investering` (enbart deadline-fältet)
    URL: https://hogsby.se/wp-content/uploads/riktlinjer-for-bidrag-till-enskilda-vagar-i-hogsby-kommun.pdf
    Osäkert: om ansökningsperioden "1 mars–30 juni" som YAML:en anger i `sen_ansokan`
    fortfarande gäller, och om posten över huvud taget har ett sista ansökningsdatum.
    Varför: riktlinjen hämtades och lästes i sin helhet 2026-09-17 (version 2,
    beslutad av kommunfullmäktige 2026-04-13, ersätter KU.2023.76). Belopp, krav och
    utbetalningsordning för det särskilda underhålls- och investeringsbidraget
    (paragraf 6 till 9) bekräftades ordagrant och posten är omverifierad i övrigt. Men
    riktlinjen anger INGET sista ansökningsdatum för just den stödformen — utbetalning
    styrs av när Trafikverkets godkända besiktningsprotokoll kommer in, och av
    turordning om årsmedlen är slut. Den e-tjänst som nämns (paragraf 17) gäller
    permanentboende längs privata utfartsvägar och är öppen året runt med treårig
    giltighet, inte 1 mars till 30 juni. Kommunens sida för enskilda vägar
    (hogsby.se/samhaellsservice-och-teknik/gator-och-utemiljoe/enskilda-vaegar/,
    hämtad OK) handlar bara om överlämningen av väghållaransvaret och nämner ingen
    ansökningsperiod. Kommunens egen sökfunktion är JS-renderad och gav bara
    navigering via curl. `deadlines.datum` och `deadline_status` är därför ORÖRDA —
    en riktig webbläsare mot e-tjänstportalen (hogsby.se, Mina sidor) kan bekräfta
    eller stryka fönstret 1 mars–30 juni. Driftbidragsposten
    (`hogsby-vag-driftbidrag-statsbidrag`) har däremot ett belagt sistadatum,
    30 juni enligt paragraf 5, och är fullt omverifierad.

22. **Partille** — `partille-breddpriset` (deadline-fältet) och `partille-barnkonventionspriset`
    (belopp-fältet)
    URL: https://www.partille.se/kommun--politik/priser-stipendier-stiftelser/
    Osäkert: Breddprisets sista nomineringsdatum (YAML anger 11-01) och
    Barnkonventionsprisets prisbelopp (YAML anger 10 000 kronor).
    Varför: sidan hämtades komplett med `curl -A "Mozilla/5.0"` 2026-09-17 (stämplad
    "Senast uppdaterad: 6 maj 2026") och resten av båda posterna bekräftades mot den —
    men sidan anger inget datum alls för Breddpriset (nomineringar välkomnas inför en
    prisutdelning, utan sistadatum), och datumet 1 november som står på samma sida
    gäller idrotts- respektive kulturstipendiet, två andra stöd. På samma sätt anger
    sidan prisbelopp för Breddpriset (10 000 kr), Hållbarhetspriset (10 000 kr) och
    Hälsopriset (15 000 kr) men INGET belopp för Barnkonventionspriset. Båda fälten
    kan vara korrekta från en tidigare version av sidan eller från e-tjänsten — det går
    inte att avgöra utan att öppna kommunens e-tjänst för nominering
    ("E-tjänst - Nominera en kandidat till Breddpriset", länkad men inte crawlad,
    ligger på e-tjänsteportalen). Posterna är bumpade i övrigt och bär var sin
    anteckning om luckan. Rör INTE `deadlines.datum` för Breddpriset eller `belopp`
    för Barnkonventionspriset förrän e-tjänsten lästs i en riktig webbläsare.

23. **Västervik** — `vastervik-sarskilt-lokalstod-idrott-fritid`,
    `vastervik-skotselbidrag-egen-fritidsanlaggning`,
    `vastervik-skotselbidrag-kommunal-fritidsanlaggning` och
    `vastervik-studieorganisationer`
    URL: https://vastervik.rbok.se/ansok
    Osäkert: allt substantiellt i de fyra posterna — beloppsreglerna (schablonersättning
    plus 20 procent av godkänd årlig driftkostnad för egen anläggning; ramen 900 000
    kronor för 2026 med fördelningen 70 procent efter föregående års slutliga
    kommunbidrag och 30 procent efter senast redovisad verksamhetsvolym för
    studieorganisationerna), ansökningsdatumen (30 april respektive 28 februari) och
    slutredovisningsdatumet 30 april.
    Varför: alla fyra posterna har Rbok-portalen som `kalla_url`, och den är en
    Blazor-WebAssembly-applikation. `curl -A "Mozilla/5.0"` mot
    https://vastervik.rbok.se/ansok ger bara SPA-skalet (en tom sida med "Var god
    vänta..."), och fem gissade API-vägar (`/api/bidrag`, `/api/ansokan/bidrag`,
    `/Ansok/GetBidrag`, `/api/grants`, `/api/application/types`) returnerade samma
    HTML-skal, inte JSON. Bidragstexterna renderas först efter att klienten startat.
    Kommunens egen översiktssida (vastervik.se/Uppleva-och-gora/Foreningar-foreningsliv/
    stod-bidrag-och-stipendier/, hämtad OK 2026-09-17) bekräftar att alla fyra stöden
    finns och återger målgrupperna ordagrant — "Stödet utbetalas normalt till föreningar
    som inte äger egen lokal och som inte kan hyra subventionerade kommunala lokaler"
    respektive "Anläggningar som kan komma i fråga för ekonomiskt stöd är idrotts- och
    fritidsanläggningar som ägs av kommunen eller av en förening" — men publicerar
    varken belopp eller datum. Två fynd som sparar tid för den som tar över:
    (a) riktlinjen för studieorganisationerna ligger på
    https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-kommunalt-stod-till-studieorganisationer-verksamma-i-vasterviks-kommun.pdf
    (hämtad och läst 2026-09-17, kommunstyrelsen 2023-11-28 § 357) — den bekräftar
    målgruppen men innehåller INGA belopp och INGA datum, den hänvisar uttryckligen till
    att "Rutiner för handläggning av stöd beslutas av kulturchef och kommuniceras via
    Västerviks kommuns hemsida", så den duger inte som ersättande källa för de fälten.
    (b) Översiktssidan listar en "Riktlinje för skötselbidrag för idrotts- och
    fritidsanläggningar i Västerviks kommun" i dokumentlistan, men listan är ren text
    utan länkar och elva gissade filnamn under `/globalassets/forfattningssamlingen/
    foreningar/` gav alla HTTP 500. Den PDF:en är sannolikt nyckeln till de två
    skötselbidragsposterna — den som har webbläsare bör leta upp den via
    författningssamlingen. YAML:en för de fyra posterna är HELT ORÖRD, inklusive
    `senast_verifierad`, som står kvar på 2026-08-18.

24. **Varberg** — `varberg-byapengen` (enbart deadline-fältet)
    URL: https://sjalvservice.varberg.se/oversikt/overview/65
    Osäkert: om ansökningsdatumet 30 juni som YAML:en anger fortfarande gäller, och om
    Byapengen över huvud taget har ett sistadatum.
    Varför: posten är omverifierad i övrigt 2026-09-17 och beloppen är RÄTTADE — stödet
    har höjts från 5 000/10 000/15 000 kronor till 10 000 kronor för upp till 150
    medlemmar, 15 000 kronor för över 150 medlemmar och 20 000 kronor för Varbergs
    Landsbygdsråd. Både e-tjänsten (hämtad OK med `curl -A "Mozilla/5.0"`) och kommunens
    sida Stöd till landsbygdsutveckling (senast ändrad 2026-08-17) säger detta ordagrant.
    Men INGEN av de två sidorna nämner något sista ansökningsdatum. De två bilagorna i
    e-tjänsten går att ladda ner (`/oversikt/getflowform/3527/1127` respektive `/1128`);
    ansökningsblanketten är läsbar och innehåller inget datum, och riktlinjen
    "Information och riktlinje Byapeng" är satt som bild utan textlager — `pdftotext` i
    alla tre lägen ger bara sidfoten, så innehållet går inte att läsa utan OCR eller
    webbläsare. `deadlines` är därför ORÖRD. Kontaktväg om browser inte räcker —
    landsbygdssamordnare Amanda Nord Axelsson, amanda.nord.axelsson@varberg.se,
    076-237 49 44, eller Ulrika Rylin, ulrika.rylin@varberg.se, 0708-72 29 44, som är
    kontakt för e-tjänsten.

25. **Hagfors** — `hagfors-lokalt-aktivitetsstod-65-plus` och `hagfors-pensionars-och-funktionshinderforeningar`
    URL: de två posternas egna källor är döda —
    `.../download/18.6b9461e619afcc95193804a0/1765956606857/Protokoll%20KF%20251215.pdf` (404)
    respektive `.../download/18.45182d2c1916dfc80a15db55/1724676652764/Riktlinjer%20...%20pensionärsföreningar%20och%20...%20funktionshinder...pdf` (404).
    Osäkert: om de två stödformerna finns kvar över huvud taget, samt deras belopp
    (25 kr per sammankomst plus 25 kr för ansvarig ledare i 65+-stödet) och deadlines
    (15 februari/15 augusti respektive 31 oktober).
    Varför: hela hagfors.se är omstrukturerad. Den gamla sökvägen
    `/undersidor/fritid-och-kultur/foreningsbidrag.html` ger 404 och innehållet ligger nu
    på `/uppleva-och-gora/idrott-motion-och-friluftsliv/foreningsbidrag-och-stod`
    (uppdaterad 18 augusti 2026). Den nya sidan har en komplett tabell över kommunens
    bidrag — och där finns varken 65+-stödet eller pensionärs-/funktionshinderstödet med.
    Övriga åtta Hagfors-bidrag kunde bekräftas mot den nya tabellen och är uppdaterade.
    Att dessa två saknas kan betyda att de är avskaffade, att de flyttat till
    socialförvaltningen (den gamla riktlinjen låg under "område pensionärsföreningar och
    område funktionshinder"), eller bara att tabellen inte är heltäckande. Rör INTE
    fälten förrän det är avgjort. Kontakt om webbläsare inte räcker — förenings- och
    evenemangskoordinator Lennart Larsson, lennart.larsson@hagfors.se, 0563-187 27.

26. **Lund** — `lund-publika-idrottsarrangemang` (hela posten)
    URL: https://lund.se/uppleva-och-gora/foreningslotsen/forenings--och-projektbidrag/stod-till-idrott
    Osäkert: om stödet finns kvar över huvud taget, och därmed alla fält — deadline
    30 november, målgruppen, de tre kraven och belopps-/bedömningsformuleringen.
    Varför: den lagrade `kalla_url` ger HTTP 404 utan redirect (kontrollerat med både GET
    och HEAD, `curl -A "Mozilla/5.0"`, 2026-09-17), och sidan finns inte kvar någon
    annanstans på lund.se. Tre oberoende kontroller pekar åt samma håll. (a) Översiktssidan
    Förenings- och projektbidrag listar sju ingångar — Hållbarhetsstöd, Miljöanslag, Stöd
    till folkbildande kulturverksamhet och ideella föreningar, Stöd till kultur, Stöd till
    verksamhet för barn och unga, Unga leder unga, Värdegrund — och ingen av dem rör
    idrottsarrangemang. (b) Stöd till kultur har fyra undersidor (närområdesstöd,
    projektstöd för publika kulturarrangemang, utvecklingsstöd mini/midi/maxi,
    verksamhetsstöd till kulturverksamhet), alla rent kulturella. (c) Kommunens egen
    `sitemap1.xml.gz` (8 550 URL-er, lastmod 2026-09-17) ger noll träffar på
    `stod-till-idrott` och noll på `idrottsarrangemang`. En webbsökning ger fortfarande den
    gamla URL-en som träff, med innehåll som stämmer med YAML-posten (ansökan
    januari–november, svar inom åtta veckor, samma fyra bedömningskriterier) — posten är
    alltså korrekt mot en tidigare version av sidan, och frågan är om stödet avvecklats,
    slagits ihop med kulturstödet eller flyttat till en yta jag inte hittar. Två spår för
    den som tar över med webbläsare — leta i kultur- och fritidsnämndens protokoll efter
    beslut om stödet, och logga in i Rbok (lund.rbok.se) och se om ansökningsformuläret
    finns kvar bland sökbara stöd. Kontaktväg annars, föreningslotsen,
    foreningslots@lund.se, 046-359 50 00 knappval 5. HELA YAML-posten är ORÖRD, inklusive
    `senast_verifierad` som står kvar på 2026-08-17, och `kalla_url` är INTE omskriven
    eftersom ingen ersättande sida gick att hämta och verifiera. Övriga tretton
    Lund-poster är omverifierade 2026-09-17 och uppdaterade.
    Sidonotering utan åtgärdskrav — `lund-lokalkompensationsstod` hade översiktssidan som
    `kalla_url`, men den beskriver inte längre stödet; hela regelverket ligger på Stöd till
    verksamhet för barn och unga, dit `kalla_url` är flyttad efter att den sidan hämtats
    och lästs.

27. **Ängelholm** — `angelholm-subventionerade-taxor`
    URL: https://www.engelholm.se/uppleva-och-gora/bidrag-sponsring-och-priser/foreningsbidrag.html
    Osäkert: om stödformen finns kvar, och i så fall var villkoren står.
    Varför: källsidan svarar 200 och är läsbar, men listar inte längre subventionerade
    taxor bland stödformerna. Sidan räknar upp lokalt aktivitetsstöd, lokalbidrag,
    verksamhetsstöd, stöd till pensionärs- och funktionsnedsättningsföreningar, stöd till
    särskilt viktig verksamhet, landsbygdspotten, projektstöd, inventariestöd och
    skötselbidrag — men ingen taxepost, och orden "taxa", "taxor", "subvention" och
    "nolltaxa" förekommer inte alls i sidans text. Posten beskriver ju inte heller en
    kontant utbetalning utan lägre hyra enligt kommunens fastställda taxor, så villkoren
    kan mycket väl ha flyttat till en taxe- eller bokningssida. Jag sökte på
    boka-lokal-eller-anlaggning, idrott-motion-och-friluftsliv och foreningsliv utan att
    hitta någon taxelänk. Övriga nio flaggade Ängelholm-bidrag kunde bekräftas mot sina
    källor och är uppdaterade. Rör INTE fälten förrän det är avgjort om stödet finns kvar.

28. **Malmö** — `malmo-socialt-bidrag` och `malmo-verksamhetsbidrag-socialt` (enbart
    deadline-fältet, 15 december)
    URL: https://malmo.se/For-foreningar/Bidrag-till-ideburna-organisationer-inom-det-sociala-omradet/Vilka-bidrag-kan-vi-ansoka.html
    och https://malmo.se/For-foreningar/Bidrag-till-ideburna-organisationer-inom-det-sociala-omradet/Ansok-om-bidrag-inom-det-sociala-omradet.html
    Osäkert: den lagrade deadlinen 12-15. Allt annat i båda posterna är bekräftat mot
    källan och uppdaterat.
    Varför: båda sidorna svarar 200 och är fullt läsbara med curl, men ingen av dem
    publicerar något datum. Ansökningssidan säger bara "Ansökan för 2026 och är stängd"
    respektive "Ansökan för 2026 och 2027 är stängd" och att bidragen "utlyses" —
    ettåriga när de utlyses, tvååriga vartannat år. Kravsidan ger belopp (högst en
    miljon kronor för båda bidragen), grundläggande krav och ansökningsvillkoren, men
    inget datum. Det går alltså inte att avgöra om 15 december är rätt, är kvar från en
    tidigare utlysning, eller aldrig varit ett publicerat datum för det här bidraget.
    `deadlines` är därför ORÖRD i båda posterna; `sen_ansokan` (kommunens egen
    formulering "Endast ansökningar som kommer in under ansökningsperioden handläggs"),
    `anteckning` och `senast_verifierad` är uppdaterade, och för
    `malmo-verksamhetsbidrag-socialt` är även `kalla_url` bytt — den pekade på
    fritidsnämndens regelverk Föreningsstöd, som inte nämner bidraget med ett ord.
    Nästa utlysning är det som avgör frågan. Kontakt om webbläsare inte räcker —
    arbetsmarknads- och socialförvaltningens organisationsstöd,
    asf.organisationsstod@malmo.se.

29. **Tibro** — `tibro-kulturaktivitet-och-evenemangsbidrag` (enbart deadline-fältet,
    1 december)
    URL: https://www.tibro.se/Kultur-fritid-och-idrott/forening/Bidrag/bidragfokulturaktivitetochevenemang/
    Osäkert: den lagrade deadlinen 12-01 och formuleringen "senast 1 december för 2026"
    i `sen_ansokan`. Allt annat i posten är bekräftat mot källan och uppdaterat.
    Varför: källsidan svarar 200 och är fullt läsbar med curl, men publicerar ingen
    sista ansökningsdag alls. Den enda tidsregel sidan ger är relativ — "Ansökan
    inlämnas i verksamhetssystem senast två månader före -arrangemanget" — plus
    redovisningskravet "senast en månad efter genomförandet samt inom pågående
    kalenderår". Ordet december förekommer inte någonstans i sidans text. Ett fast
    årsdatum för aktivitetsbidraget kan därför bara stå i Rbok, som är den kända
    Blazor-WASM-SPA:n: `https://tibro.rbok.se/ansok` ger bara skalet till curl
    ("Inget resultat...") och `/api/*` svarar 302 mot inloggning. Sidan är dessutom
    oförändrad sedan förra verifieringen (stämpeln säger "Senast ändrad: 3 juni 2026",
    lagrad verifiering 2026-08-19), så detta är ingen ändring hos kommunen utan en
    lucka som fanns redan vid extraktionen. `deadlines` och `sen_ansokan` är därför
    ORÖRDA; `senast_verifierad` är uppdaterad eftersom belopp (max 5 000 kr per
    aktivitet och förening per år), krav, målgrupp och status alla kunde bekräftas mot
    curl-utdraget. Övriga nio Tibro-poster är omverifierade mot sina källor och
    oförändrade. Kontakt om webbläsare inte räcker — Kultur & Fritid, kfn@tibro.se,
    0504-180 00; bidragsfrågor i Rbok går till rbok@tibro.se.

30. **Gävle** — `gavle-studieorganisationer`
    URL: https://www.gavle.se/kultur-och-fritid/foreningar-och-organisationer/studieorganisationer/
    Osäkert: hela posten utom namn och status — särskilt fördelningsmodellen
    "70 procent studiecirklar, 10 procent annan folkbildningsverksamhet och
    20 procent kulturprogram" i `kommunens_pott`, de tre kraven och
    `sen_ansokan` ("Kommunens publicerade information anger ingen sista
    ansökningsdag").
    Varför: sidan svarar 200 och är fullt läsbar med curl, men innehåller inte
    längre någon bidragsinformation alls. Hela brödtexten är en katalog över
    elva studieorganisationer (ABF, Folkuniversitetet, Ibn Rushd, Kulturens,
    Medborgarskolan, NBV, Sensus, Studiefrämjandet, Bilda, Vuxenskolan, SISU)
    plus en enda mening om stödet: "Vi ger stöd till studieorganisationer som
    fyller en viktig funktion i folkbildningen." Ingen procentsats, inget krav,
    ingen ansökningstid. Gävle.se:s egen sökfunktion (som fungerar via curl —
    `?s=studieorganisationer` ger 2 träffar) hittar inga andra sidor:
    "verksamhetsbidrag studieorganisationer" och "studieorganisationer bidrag"
    ger 0 träffar, "folkbildning" ger bara samma sida plus fyra evenemang,
    "kulturprogram" bara en nyhet. Sidan finns inte heller i sitemapens
    föreningsstöds-gren och den listas inte på översiktssidan
    `/sok-foreningsstod/`. Fördelningsmodellen ligger därför sannolikt bara i
    ett beslut från kultur- och fritidsnämnden (protokoll/diariefört PDF), som
    inte är sökbart via gavle.se:s sidsökning. YAML-posten är ORÖRD —
    `senast_verifierad` står kvar på 2026-08-17. Nästa steg är en människa som
    letar i nämndhandlingarna eller frågar kundtjänst, 026-17 80 00 /
    gavle.kommun@gavle.se. Övriga åtta Gävle-poster i det här passet är
    omverifierade mot sina källor.

31. **Nässjö** — `nassjo-grundstod-pensionarer` (hela posten)
    URL: https://nassjo.se/kultur-och-fritid/forening/foreningsbidrag.html
    Osäkert: allt — målgrupp ("representerad i KPR"), de tre kraven, belopp
    ("beslutas utifrån medlemsunderlag och tillgängliga medel") och att bidraget
    över huvud taget finns kvar som egen stödform.
    Varför: kommunens bidragssida svarar 200 och är fullt läsbar med curl, men
    den har SLIMMATS NER sedan förra verifieringen. Den innehåller inte längre
    någon beskrivning av enskilda bidragsformer — bara en länk till Interbook,
    en länk till de allmänna bestämmelserna (PDF) och en lista med fyra
    fastställda ansökningsdatum (Administrationsbidrag 25 februari,
    Aktivitetsbidrag 25 februari, Driftbidrag 25 februari, Investeringsbidrag
    1 februari alternativt 1 september). Grundstöd till pensionärsföreningar
    nämns inte alls. Sökt vidare utan träff: `friweb.nassjo.se/bidrag/` listar
    bara tre bidrag för 2026 (Driftbidrag, Kommundelspeng, Offentlig
    medfinansiering) och bär dessutom banderollen "Denna sida är inte längre
    aktiv. Alla föreningsärenden hanteras i vårt nya verksamhetssystem
    Interbook"; `sjalvservice.nassjo.se/oversikt` har ingen e-tjänst för
    pensionärsföreningsbidrag; hela sitemapen (5 208 URL:er, via
    `sitemap1.xml.gz`) innehåller ingen sida och ingen PDF om stöd till
    pensionärsföreningar — KPR-sidan handlar bara om rådets sammansättning.
    Detaljerna ligger därför i Interbook (`https://nassjo.interbookfri.se/#/`),
    som är en JS-SPA — curl ger ett 2 kB skal, `/api/v1/grants` och
    `/Templates/Grants` svarar 404. YAML-posten är ORÖRD, `senast_verifierad`
    står kvar på 2026-08-03. Nästa steg är en webbläsarsession i Interbook eller
    en fråga till Fritid- och föreningsservice, 0380-51 80 00 /
    forening@nassjo.se. Notera också att postens `krav` redan före det här passet
    bar två trasiga strängar från extraktionen ("Arrangöd inom Nässjö kommun",
    "Arrangöra ska skapa mervärde") — de låg i `nassjo-arrangemangsbidrag`, som
    nu är omskriven mot KulturBoost-riktlinjen; kontrollera att inga liknande
    stympade strängar finns kvar när pensionärsposten kan läsas mot källa.

32. **Nässjö** — `nassjo-administrationsbidrag` (enbart två krav-trösklar)
    URL: https://nassjo.se/kultur-och-fritid/forening/foreningsbidrag.html
    Osäkert: de två siffersatta kraven "minst 15 sammankomster under
    verksamhetsåret" och "minst 15 medlemmar i åldern 7–25 år". Allt annat i
    posten är bekräftat och `senast_verifierad` är uppdaterad.
    Varför: deadlinen 25 februari står kvar ordagrant på kommunens bidragssida,
    och de generella kraven (medlemsavgift minst 25 kronor, årlig uppdatering av
    föreningsregistret, årshandlingar senast en månad efter årsmötet,
    åldersspannet 7–25 år utan övre gräns vid funktionsnedsättning) är
    verifierade mot "Allmänna bestämmelser och generella regler för Nässjö
    kommuns bidrag till föreningslivet" (KF 2020-03-26 § 58). Men de två
    15-trösklarna står varken i den PDF:en, på den nedbantade bidragssidan eller
    i friweb — de är administrationsbidragets egen norm och den publiceras nu
    bara i Interbook, som kräver webbläsare (se post 31). Samma lucka gäller
    inte `nassjo-aktivitetsbidrag`, vars samtliga krav (sammankomst 3–20
    deltagare, ledarledd, minst 60 minuter, högst två ledare från 13 år) går att
    bekräfta ord för ord i samma PDF.

33. **Torsås** — `torsas-foreningsbidrag` (enbart beloppsfältet)
    URL: https://www.torsas.se/kultur-och-fritid/forenings-och-investeringsbidrag/
    Osäkert: grundbidragets nivåer, lagrade som 1 500 kr för 5–10 aktiva i åldern
    5–25 år, 4 000 kr för fler än 10 aktiva samt 225 kr i tillägg.
    Varför: kommunen publicerar ingen bidragsnorm öppet. Bidragssidan anger bara
    att föreningen ska ha "barn- och ungdomsverksamhet med visst antal aktiva
    deltagare" och att sista ansökningsdag är sista vardagen i januari — det
    senare är verifierat, beloppen är det inte. De fyra ansökningsblanketterna är
    tomma formulär utan villkor, kommunens styrdokumentsida länkar inget
    bidragsreglemente, och e-tjänsten (minasidor.torsas.se/foreningsbidrag)
    kräver inloggning. Posten är därför INTE bumpad.
    Kommunens två andra bidrag, `torsas-kulturbidrag` (1 mars) och
    `torsas-foreningsbidrag-inom-socialnamndens-omrade` (1 februari–31 mars),
    gick att verifiera fullt ut och är omverifierade 2026-09-18.

34. **Heby** — `heby-socialt-foreningsstod` (hela posten)
    URL: https://www.heby.se/arkiv/nyheter/2025/2025-10-27-dags-att-soka-foreningsstod-fran-vard--och-omsorgsnamnden
    Osäkert: sista ansökningsdag 15 december och villkoren för vård- och
    omsorgsnämndens föreningsstöd.
    Varför: nyhetssidan som var postens enda källa är borttagen (404), och
    kommunen har ingen ersättande sida. Sidan Föreningsstöd och annat stöd
    beskriver bara kultur- och fritidsstöden, som från 2026 kräver att
    föreningen först ansökt om att bli bidragsberättigad. Ansökningsblanketten
    finns kvar i sitemapen (ansokan-om-foreningsstod-for-forening-som-bedriver-socialt-arbete.docx,
    uppladdad 2025-10-27) och jag packade upp och läste den — den innehåller
    inget datum och inga villkor, bara formulärfält. Posten är därför INTE
    bumpad. Kontaktväg: Erica Andersta, utvecklingsstrateg vid
    vård- och omsorgsförvaltningen, erica.andersta@heby.se.
    Hebys två övriga flaggade poster, `heby-subventionerad-hallhyra` och
    `heby-nattvandringsbidrag`, gick att verifiera och är omverifierade.

35. **Lomma** — `lomma-startbidrag`, `lomma-lokalstod-till-pensionarsforeningar`
    och `lomma-kommunalt-aktivitetsstod-kulturforeningar` (hela posterna)
    URL: https://lomma.se/download/18.36b5b5ba17e21f6b7e8e6b2/1641302459764/L%2004%20Regler%20f%C3%B6r%20st%C3%B6d%20till%20f%C3%B6reningar%20i%20Lomma%20kommun.pdf
    respektive https://eservice.lomma.se/Form.ashx?id=36
    Osäkert: om de tre stödformerna alls finns kvar, och i så fall med vilka
    belopp och datum.
    Varför: kommunens föreskrift L 04, som var källa för startbidraget
    (högst 5 000 kr) och lokalstödet till pensionärsföreningar (1 december),
    ger nu 404, och e-tjänsten för kulturföreningarnas aktivitetsstöd likaså.
    Sitemapen (1 169 poster) innehåller ingen ersättande PDF och ingen
    styrdokumentsida. Kommunens bidragssida listar sex stöd — kulturplaketten,
    kulturstipendium, ledarstipendier, sociala bidrag, verksamhetsstöd till
    föreningar och verksamhetsstöd till studieförbund — och ingen av dem
    motsvarar de tre posterna. Posternas anteckningar noterade redan före
    detta pass att stödformerna saknade egen post i bidragsmenyn; nu är även
    föreskriften borta. Posterna är därför INTE bumpade. Fråga kultur- och
    fritidsförvaltningen om formerna avskaffats eller bara slutat publiceras.

36. **Orust** — `orust-lovaktivitetsstod` (enbart deadline-fältet)
    URL: https://sjalvservice.orust.se/oversikt/overview/82
    Osäkert: de lagrade datumen 30 januari (anmälan om deltagande) och
    1 april (ersättningsansökan) för sportlovet.
    Varför: e-tjänsten listar Lovaktiviteter och Breddläger bland stödformerna
    men kräver BankID för detaljerna. Kommunens årskalender för föreningsstöd
    på orust.se räknar upp elva stödformer med datum — 1 november,
    25 februari, 1 mars, 15 maj, 25 augusti och 1 oktober — men nämner varken
    lovaktiviteter eller breddläger. Sidan Lov på Orust innehåller inget om
    föreningsersättning, och sitemapen (6 867 poster) har ingen annan
    kandidatsida. Datumen kommer sannolikt ur en enskild utlysning.
    `orust-breddlagerstod` är däremot bumpad: den posten påstår inget om
    belopp eller frist, och e-tjänsten bekräftar att stödformen finns.

## Bidrag som saknas i datan (eget spår — inte browser-fall)

Omverifieringen gräver fram bidrag som kommunen publicerar men som aldrig
kommit in i våra YAML-filer. Det är en annan sorts fynd än posterna ovan:
källan går att läsa, det är extraktionen som är ofullständig. Loggas här så
att inget tappas bort mellan passen.

**Åtgärdade — extraherade och committade:**

- **Habo** (2026-09-18) — tre bidrag ur regeldokumentet av 8 september 2026:
  `habo-jonkoping-evenemangsstod-litet` (högst 5 000 kr per tillfälle,
  20 000 kr per arrangör och kalenderår, söks när som helst),
  `habo-jonkoping-evenemangsstod-stort` (högst 50 procent, 10 000 kr per
  tillfälle) och `habo-jonkoping-verksamhetsbidrag` (1 juli–30 september,
  högst 50 000 kr).
- **Nora** (2026-09-18) — `nora-ungt-initiativ`, kommunens stipendium för
  ungdomar 13–25 år, högst 5 000 kr per ansökan, senast två veckor före
  arrangemanget.
- **Ljungby** (2026-09-18) — `ljungby-ung-arrangor`, för unga 16–30 år som
  ordnar kulturarrangemang. Inget maxbelopp per ansökan; stödformens hela
  pott är 50 000 kr. Senast fyra veckor före arrangemanget.
- **Uppsala** (2026-09-18) — den största luckan, nu stängd. 27 nya poster,
  filen gick från 16 till 43 bidrag. Bland dem verksamhetsbidrag för etnisk
  förening (8 000–39 500 kr), sammankomstbidrag barn och unga 5–25 år (60 kr
  plus aktivitetspoäng), kvalitetsbidrag (3 000 kr), skollovsbidrag (600 kr per
  dag och grupp, tak 50 000 kr per lov), driftbidrag till föreningsdrivna
  anläggningar (60/45/30 procent med tak 700 000/525 000/350 000 kr efter
  nyttjandegrad), investeringsbidrag (max 100 000 kr), jämställdhetsbidraget
  till elitidrotten (30 procent av hyran, tak 350 000 kr) och bidrag för
  bygdens utveckling (pott 300 000 kr).

  Tre undersidor uteslöts: ateljébidraget söks av enskilda konstnärer med
  individuellt ateljékontrakt, Uppskala är kostnadsfri rådgivning utan pengar,
  och råd och stöd i anläggningsfrågor är en hänvisningssida till RF-SISU,
  Boverket och Arvsfonden.

  Kvar att titta på vid tillfälle: tre kategoriposter (skadeförebyggande
  arbete, studieförbundsverksamhet, verksamhet för personer med
  funktionsnedsättning) har var sin undersida med detaljer posten saknar,
  bland annat ansökningsperioden 1–30 september för de två sistnämnda. Att
  lägga till dem hade gett dubbletter — de behöver i stället omverifieras mot
  sin undersida.

- **Åmål** (2026-09-18) — tre av de fyra som loggades tidigare samma dag:
  `amal-folkhalsomedel` (högst 10 000 kr, kräver Trygg start-certifiering och
  publicering på Upptäck Åmål, ingen publicerad sista dag),
  `amal-ledarstipendium` (föreningen nominerar sin ledare, senast 31 oktober,
  belopp publiceras inte) och `amal-kulturpris` (belopp publiceras inte,
  ansökan öppnar 1 mars 2027).

  De två återstående uteslöts som individbidrag, inte föreningsstöd:
  arrangörsbidrag för unga söks av "enskilda personer eller i grupp" 13–26 år
  och nämner inte föreningar; kulturstipendium för unga "kan sökas för egen
  räkning" av personer 16–25 år. Kulturpriset togs däremot med eftersom
  pristagarlistan visar att föreningar återkommande fått det.

**Kvarstående att extrahera:**

Funna 2026-09-18 under svepet. Alla är läsbara med curl — det är extraktion
som återstår, inte verifiering.

- **Ockelbo** — Visionsmedel, 500 tkr i utbildnings- och kulturförvaltningens
  budget för projekt kopplade till Vision 2030, sökbara av föreningar. Nämnden
  beslutade 4 juni att pausa alla utbetalningar under 2025 och 2026, och ingen
  ansökningsperiod är publicerad. Läggs in med `status: pausad` om den ska in.
- **Tranemo** — två bidragsformer står i kommunens gällande regeldokument
  (KS/2020:314) men finns varken i datan eller på kommunens bidragssida:
  kulturarrangörsbidrag (normalt tak 10 000 kr, löpande, senast en månad före
  arrangemanget, inga retroaktiva bidrag) och "Snabba pengar" för aktiviteter
  av unga för unga (max 5 000 kr, sökande 12–20 år boende i kommunen, löpande
  dock senast 1 december). Att de saknas på bidragssidan men står kvar i
  regeldokumentet gör statusen oklar — kontrollera med kommunen innan de
  läggs in.

**Angränsande observationer som inte är saknade bidrag:**

- **Habo** — kommunens sidlista och regeldokumentet är osynkade åt båda håll.
  Sidan nämner ett föreningsanslag som PDF:en inte längre beskriver
  (`habo-jonkoping-foreningsanslag` står därför kvar som `aktiv` men har
  tappat källa för deadline och krav), och PDF:en beskriver ett
  verksamhetsbidrag som sidan inte nämner.
- **Ljungby** — `ljungby-investeringsstod` heter `Investeringsbidrag` i
  fältet `namn`, medan kommunen genomgående skriver **Investeringsstöd**
  (både FRI-sidans rubrik och översiktssidan; postens eget id säger redan
  `investeringsstod`). Ett namnbeslut någon bör ta ställning till.
- **Södertälje** — väghållarsidan anger inte längre någon procentsats, medan
  YAML har "30 procent av Trafikverkets godkända driftkostnad" med
  `belopp_status: kontrollast`. Sidan motsäger inte uppgiften, den nämner den
  bara inte. Bör bekräftas mot tekniska nämndens beslut.
- **Gotland och Markaryd** — produktionsstöd, stipendier och priser som bara
  kan sökas av enskilda professionella kulturskapare eller privatpersoner.
  Utanför föreningsbidragsdefinitionen, ska inte in.
- **Dorotea och Jokkmokk** — bygdemedel finns på kommunernas
  föreningsstödssidor men söks hos Länsstyrelsen, inte hos kommunen. Ska inte
  in som kommunposter.

## Källor med känt utgångsdatum

- **Tranemo** — regeldokumentet KS/2020:314 är märkt "Giltigt tom 2026-10-17".
  Sju av kommunens elva bidrag har just den PDF-adressen som källa, så ett nytt
  regelverk inom en månad slår igenom brett. Bevaka.

## Mönster värt att känna till (för Codex, inte en åtgärdspunkt)

- **WebFetch missar ofta innehåll `curl -A "Mozilla/5.0"` FÅR** (Botkyrka, Ludvika-testet visade blandat). Prova alltid curl som fallback innan en post skrivs som "kräver browser" — flera av raderna ovan kan visa sig vara curl-lösbara vid ett nytt försök, jag har inte hunnit dubbelkolla alla.
- **Cloudflare-fronted PDF:er** (t.ex. sunne.se) svarar ofta 200 på `curl -A "Mozilla/5.0"` men troligen inte på scraperns egen user-agent — det förklarar en del av `otillganglig`-flaggorna i kön som inte alls är trasiga länkar.
- **wps/portal-URL:er** (Göteborgs gamla WebSphere Portal) gav faktiskt läsbar text via WebFetch — inget systematiskt problem där.

### Tillägg efter det stora svepet 2026-09-17 (ca 60 kommuner)

- **`otillganglig`-flaggan är nästan alltid falsk.** Varenda URL som steg 1-cronen markerat som otillgänglig och som vi hunnit testa har svarat 200 på `curl -A "Mozilla/5.0"` — Skövde (tio källor), Kristinehamn, Nyköping, Partille, Västervik (nio riktlinje-PDF:er), Sunne, Södertälje, Hudiksvalls inloggningsskyddade e-tjänstsidor. Det är scraperns egen user-agent som blockeras, inte länkarna som är trasiga. **Börja alltid med curl innan du bokar in en browser-session.** Undantagen nedan är de enda äkta fallen vi sett.
- **Äkta browser-fall hittills:** (a) Rbok-portalen (`*.rbok.se/ansok`) är en Blazor-WebAssembly-app som bara ger SPA-skalet till curl — Västervik; (b) PDF:er som är inskannade bilder utan textlager, där `pdftotext` bara ger sidfoten — Varbergs byapeng-riktlinje; (c) Interbook GO, som kräver inloggning — Örnsköldsvik.
- **Döda länkar är vanligare än ändrat innehåll.** Mönstren, i fallande ordning: hela trädet flyttat (Varberg: `/uppleva-och-gora/foreningar-foreningsliv/bidrag-stod-och-stipendier/` → `/uppleva-och-gora/stod-bidrag-och-stipendier/`, sexton URL:er; Hagfors: `/undersidor/fritid-och-kultur/` → `/uppleva-och-gora/idrott-motion-och-friluftsliv/`), ett segment borttaget ur sökvägen (Oskarshamn tappade `/styrande-dokument/`), filnamnet omdöpt (Åmål, Högsby), stavfel i lagrad URL (Kalmar: `projekstod` utan t), och nyhetsartikel som källa som hunnit rensas (Lerum). **Leta alltid efter ersättaren innan du skriver en post som overifierbar** — i samtliga fall ovan fanns den, och den bekräftade innehållet.
- **Åldersspann är den vanligaste sakliga felkällan, och den går åt båda hållen.** Högsby, Sävsjö och Oskarshamn hade lagrat 7–25 år där källan säger 6–25; Västervik hade tvärtom 6–25 lagrat där riktlinjen säger 7–25 (RF-gränsen). Hudiksvall hade slagit ihop två separata spår (7–25 och 0–6) till ett enda "0–25". Läs källans exakta ordalydelse, gissa inte riktning.
- **Filformatet varierar mellan kommunfilerna.** I de flesta står `- id:` först i varje bidrag, men i bl.a. `nybro.yaml` och `hagfors.yaml` står `id:` sist i posten. Ett skript som läser "fälten efter id-raden" kopplar då fälten till fel bidrag — jag höll själv på att "rätta" korrekt Nybro-data av precis det skälet. Läs blocket mellan två `- namn:`-rader i stället.
- **Två grindar, inte en.** Utöver `scripts/validera-data.ts` finns `scripts/verify-giltighet-regler.ts`, som kräver att kommunens `giltighet_regel.kalla_url` och motsvarande `forutsattningar`-post pekar på samma källa. Byter du den ena vid en URL-migrering måste du byta den andra, annars fäller pre-commit-hooken hela committen.
