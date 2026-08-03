# GRANSKNING 2 — Föreningsguiden som tjänst

*Fable/Design, 30 juli 2026. Samma metod som granskningen 26 juli: hela resan, som skeptisk förstagångsanvändare (kassör, 62, kom från Google, mobil, femminutersfönster) och som driftsansvarig. Inte koden — tjänsten. Jag letar efter vad som **saknas**, inte vad som fungerar.*

*Granskat live: `/`, `/matcha/`, `/deadlines/`, `/om/`, `/kommun/gislaved/`, `/kommun/gislaved/registrera/`. Utkastvyn utesluten enligt instruktion (byggs om). Egen numrering G1–G31 — där ett hål motsvarar ett från förra granskningen anges H-numret.*

---

## Vad som ändrats sedan 26 juli

Fem hål är verkligt stängda: avsändaren delvis namngiven, kontaktväg, integritetspolicy, delbart besked (Mejla/Skriv ut), och "Ändra svar". Tratten är nåbar. Registreringshjälpen är en produkt med pris. Länsdatan är rättad.

**Men tjänstens tyngdpunkt har flyttat, och därför är det här inte samma granskning.** Förra gången var problemet att allt efter betalningen var oritat. Nu finns en köpväg — och den nya bilden är hårdare på ett annat sätt:

> **Sajten har blivit en tjänst som tar betalt, utan att ha blivit en tjänst som levererar.** Och den säger olika saker om sig själv på olika ytor, vilket för en förtroendeposition kostar mer än en saknad funktion.

**31 hål. Nya sedan förra granskningen: 19.**

| Steg | Hål |
|---|---|
| Google → landning | 5 (G1–G5) |
| Tratten | 4 (G6–G9) |
| Beskedet | 3 (G10–G12) |
| Registreringsbeskedet | 4 (G13–G16) |
| Köpet: 249 kr | 6 (G17–G22) |
| Efter köp | 3 (G23–G25) |
| Drift och skala | 4 (G26–G29) |
| Återkomst | 2 (G30–G31) |

Allvarlighet: **BLOCKERANDE** (köp eller förtroende faller) · **ALLVARLIG** (läcker användare) · **KOMMERSIELL** (outnyttjad intäkt).

---

## Steg 1 — Google → landning: "Var hamnade jag, och vad är det här?"

Hon googlar inte "föreningsguiden". Hon googlar **"föreningsbidrag gislaved"**. Alltså landar hon på kommunsidan — inte på den förstasida ni just byggde om.

### G1 · BLOCKERANDE · NY — De 140 kommunsidorna leder inte in i tratten

Kommunsidan har ingen länk till `/matcha/`. Inte i navet (bara Deadlinekalender och Om), inte i hero, inte i brödtexten. Steg 5 har "Skapa ansökan" för **ett** bidrag, men ingenting som säger "svara på några frågor så visar vi vad *ni* kan söka".

Hela SEO-strategin är hub-och-eker: ekrarna är där trafiken landar. Att bygga en tratt-först förstasida och sedan inte länka till tratten från de 140 sidor folk faktiskt kommer till är att bygga entrén på baksidan av huset. **Detta är sannolikt det enskilt största konverteringstappet i hela tjänsten.**

### G2 · BLOCKERANDE · NY — Två olika färskhetsdatum för samma uppgift

Förstasidan: *"Uppgifterna stämdes senast av mot kommunernas egna sidor **27 juli 2026**."*
Gislavedssidan: *"Senast verifierad **10 juli 2026**."*

Sajtnivåns påstående är 17 dagar färskare än den faktiska sidans data. Färskhet **är** förtroendemekaniken — ett samlingsdatum som är nyare än det sämsta enskilda datumet är ett löfte vi inte håller. Ange antingen det äldsta datumet, eller inget alls på sajtnivå.

### G3 · BLOCKERANDE · NY — 140 kommuner tillgängliga, 20 verifierade

Förstasidan säger 140 kommuner. /om/ säger *"bidragsguider för 20 kommuner med verifierade uppgifter"*.

Om båda talen är sanna finns **120 publicerade och indexerade kommunsidor med overifierat innehåll**, och ingenting i ytan skiljer dem från de 20. En kassör i en av de 120 kan inte veta att hon läser något vi inte gått igenom. Det är den största skalrisken i produkten och den är osynlig. (Om talet 20 bara är gammal copy är felet mindre — men då säger förtroendesidan att vi är sju gånger mindre än vi är.)

### G4 · ALLVARLIG · NY — Tratten finns inte i navigationen

Navet är "Deadlinekalender · Om". Har hon skrollat förbi hero är vägen in i tratten borta. Produktens huvudfunktion är en knapp som bara finns ovanför mitten på en av 140+ sidor.

### G5 · ALLVARLIG · Delvis kvar (H1) — "Vilka vi är" är en publicerad TODO

`{{TODO: företagsnamn, organisationsnummer och en namngiven person...}}` står live under rubriken "Vilka vi är", på förtroendesidan, samtidigt som en 249 kr-knapp är aktiv på en annan sida. **Fjärde granskningen i rad.** En saknad sektion är neutral; en publicerad TODO är en signal om att ingen läser sin egen sida.

---

## Steg 2 — Tratten: "Fyra frågor, sa de"

### G6 · BLOCKERANDE · NY — Fråga 1 är en vägg med 140 länkar

Steg 1 renderar hela kommunväljaren **inklusive den fullständiga länslistan** innan "Vidare →". På 375 px är första frågan flera skärmhöjder kommunnamn, med räknaren stillastående ovanför.

Sökfält överst + crawlbar lista under var rätt lösning **för hubben**. Inuti tratten är den crawlbar listan fel — där ska det vara ett sökfält och ingenting annat. Samma komponent, två lägen.

### G7 · ALLVARLIG · NY — Fyra frågor, inte fem: gaten är borta

Titel och beskrivning säger *"fyra korta frågor"*. Uppdraget var fem, där fråga 5 — *"Har ni sökt bidrag i kommunen förut?"* — var den viktigaste: proxyn för registreringsgaten som **producerar hela "Börja här"-gruppen**, som i sin tur är den enda grupp som har en produkt att köpa.

Har fråga 5 tagits bort har registreringsprodukten tappat sin tratt. Är copyn fel är det illa på en sida som handlar om exakthet. Behöver bekräftas — det avgör om G13 nedan går att lösa.

### G8 · ALLVARLIG · NY — Föreningens namn och org.nr samlas inte in någonstans

Tratten frågar kommun, verksamhet, storlek, ålder. En **registreringsansökan** kräver föreningens namn, org.nr, styrelse, bankkonto. Ingen yta samlar in det.

Vad utgör då de 249 kr-dokumentet? Antingen finns ett osynligt formulär efter köpet (då är köpet före arbetet, vilket är rätt ordning men oritat), eller så levereras en mall. Skillnaden mellan "utkast till er ansökan" och "en mall" är hela produktvärdet.

### G9 · ALLVARLIG (H5 kvar i praktiken) — Profilen lovar minne men har ingen adress

*"Era svar sparas i er föreningsprofil. Nästa gång känner vi igen er, och ni ser direkt vad som är nytt sedan sist."* Rätt löfte, rätt ton — men inget konto, ingen mejladress efterfrågas, och ingen länk till profilen.

Då är minnet lokalt i webbläsaren. Det dör med rensad cache, ny telefon, annan dator — och **framför allt vid kassörsbytet**, som är det enda tillfälle minnet verkligen betyder något (H29). Löftet och mekanismen går inte ihop.

---

## Steg 3 — Beskedet: "Stämmer det här?"

### G10 · BLOCKERANDE · NY — Gislaved säger emot sig själv om förkravet

Steg 3: *"Innan ni kan söka något bidrag i Gislaved måste föreningen vara godkänd som bidragsberättigad."*
Steg 4, "Vad kan ni söka nu?": listar **"Godkännande som bidragsberättigad förening"** som ett av två sökbara.

Samma sida, tre centimeter isär: godkännandet är både hindret ni måste passera först och något ni kan söka nu. Det är exakt den förvirring steg 3 finns för att lösa. Förkrav hör inte i steg 4.

### G11 · BLOCKERANDE · NY — Förkravet räknas som ett bidrag, och talet matas till AI-motorerna

Svar-först-blocket: *"I Gislaved kan föreningar söka **2** kommunala bidrag."* FAQ:n upprepar det med båda namngivna. Gislaved har **ett** bidrag och **ett** förkrav.

Svar-först-blocket och FAQ:n är precis de två ytor som är byggda för att läsas av AI-motorer och citeras som fakta. Vi matar alltså ett osant tal in i den kanal hela sökbarhetsstrategin vilar på. Och täckningen ser dubbelt så stor ut som den är i varje kommun som har ett förkrav.

### G12 · BLOCKERANDE · NY — "Räkna med 90 dagars handläggning" finns inte i källan

Står på både Gislavedssidan och /registrera/. Vad källan enligt er egen granskningsnot säger: *"Subventionerad föreningstaxa tidigast tre månader efter godkänt beslutsdatum."* Det är när **taxerabatten börjar gälla efter beslut** — inte handläggningstid.

Tredje varianten av samma fel (först "~4 v", borttaget, nu "90 dagar"), och den sitter i den mening som ska bära hela förkravsargumentet — alltså i säljargumentet för en produkt som kostar 249 kr. Kommunerna publicerar inte handläggningstid. Skriv utan siffra: *"Ett eget ärende med egen handläggningstid — börja här, inte med själva ansökan."*

---

## Steg 4 — Registreringsbeskedet: produktens skarpaste ögonblick

### G13 · BLOCKERANDE · NY — "Registreringschecklista" är inte en checklista

Sidan heter checklista och innehåller **ett** numrerat steg, med kraven (styrelse, stadgar, org.nr, bankkonto, riksorganisation) inbäddade i löpande prosa.

Det hon behöver är exakt en checklista: fyra–fem saker att bocka av, var och en med vad den är och var den finns. Det är också den enda delen av produkten som är gratis att ge bort och som bevisar att vi kan det här. Sidans eget namn lovar något den inte levererar.

### G14 · ALLVARLIG · NY — Bilagorna nämns inte (H17 kvar)

Stadgar, årsmötesprotokoll, verksamhetsberättelse, budget, registreringsbevis — det som faktiskt fäller ansökningar. Ingen förteckning, ingen "det här ska ni ha framme".

### G15 · ALLVARLIG · NY — Knapptexten "Hjälp oss registrera" pekar åt fel håll

Läst som svenska säger den att *hon* hjälper *oss* att registrera oss. Det är produktens viktigaste knapp, på tjänstens mest kritiska ögonblick, för en målgrupp som inte gissar. *"Förbered vår registreringsansökan"* eller *"Hjälp oss bli godkända"*.

### G16 · KOMMERSIELL · NY — Giltighetskontrollen är en återvändsgränd

*"I Gislaved förfaller godkännandet... Ange när föreningen senast hade årsmöte, så räknar vi ut var ni står."* Utmärkt mekanik — och tjänstens mest personliga, mest tidsbundna uppgift.

Den kan inte sparas, och den erbjuder ingen påminnelse. *"Ert godkännande förfaller om sju månader — ska vi säga till?"* är den mest självklara bevakningen som finns i hela produkten, på den enda yta där hon just skrivit in ett datum. Nu är det en kalkylator som glömmer.

---

## Steg 5 — Köpet: 249 kr

### G17 · BLOCKERANDE · NY — Vi säljer det som /om/ säger inte har öppnat

/registrera/: levande knapp, 249 kr. /om/, "Det som kommer": *"en tjänst som skriver utkast till er ansökan... öppnar senare i betan — du kan ställa dig på väntelistan redan nu."* Foten på samma sida: *"Allt är gratis medan vi bygger."*

Tre samtidiga besked om samma sak. Läser hon /om/ efter att ha sett priset kan hon inte avgöra om hon blev lurad eller om sajten är trasig. Foten finns dessutom i två varianter — förstasidan och /matcha/ säger *"Att hitta och bevaka bidrag är gratis"*, vilket är **rätt** avgränsat. Använd den överallt.

### G18 · BLOCKERANDE · NY — Vi tar betalt i något vi själva märker "beta"

"Beta" i loggan på varje sida, "öppen beta... enstaka saker kan vara ofärdiga" i foten. Beta betyder för en kassör: *kan vara trasigt.* Att ta 249 kr av föreningens pengar i något vi själva kallar ofärdigt kräver en uttalad garanti på samma yta. Den finns inte (H13).

### G19 · BLOCKERANDE · NY — Ingen moms­uppgift

249 kr — inklusive eller exklusive moms? Hon är kassör; det avgör både bokföringen och om beloppet är 249 eller 311. Priser till föreningar ska anges med momsen utskriven.

### G20 · BLOCKERANDE (H10 kvar) — Inget bokföringsbart kvitto utlovas

Ingen text säger att hon får kvitto med säljarens namn, org.nr, datum, belopp och moms. Kan hon inte redovisa kronan betalar hon den inte med föreningens pengar. Fortfarande det mest kassörsspecifika hindret som finns — och nu skarpt, eftersom knappen är live.

### G21 · ALLVARLIG · NY — Leveransen är obeskriven

"Vi skriver utkastet" är hela produktbeskrivningen. Inte vad hon får (dokument? text på skärm? PDF?), inte hur långt, inte hur snabbt, inte hur många ändringar. En skeptisk köpare behöver leveransens **form** innan hon betalar, inte efter.

### G22 · KOMMERSIELL · NY — 249 kr och 149 kr möts aldrig

Registreringshjälpen kostar 249, utkastet var 149. Det finns ingen prissida där de står tillsammans, och ingen förklaring till varför det formella steget kostar mer än ansökan. Två priser utan sammanhang läses som slumpmässiga. Detta är också platsen där paketet (båda, eller abonnemanget) hör hemma.

---

## Steg 6 — Efter köp

*Ej verifierbart utan interaktion. Men det som saknas i ytan innan klicket är i sig ett fynd:*

### G23 · BLOCKERANDE (H15) — Inget löfte om varaktig leverans

Ingenting på köpytan säger att dokumentet mejlas, sparas eller går att hämta igen. Utan konto och utan adress är en tappad flik en tappad betalning. Ett enda löfte på knappen — *"Vi mejlar dokumentet och det ligger kvar i er profil"* — löser hela oron, och avsaknaden skapar den.

### G24 · ALLVARLIG (H16) — Ingen uppgift om format

Kommunens e-tjänst har fält att klistra i, eller vill ha en fil. Vilket format hon får avgör om produkten sparar arbete eller skapar det.

### G25 · ALLVARLIG (H19) — Ingen utfallsslinga

Vi frågar aldrig hur det gick. Det är samtidigt vår enda äkta social proof, vår enda kvalitetsmätning och vår naturligaste anledning att höras av igen.

---

## Steg 7 — Drift och skala

### G26 · BLOCKERANDE · NY — Kalendern har inget färskhetsdatum

Varje kommunsida har en verifieringsstämpel. **Deadlinekalendern har ingen.** Det är den yta där gammal data gör mest skada — ett felaktigt datum får någon att missa pengar — och den enda som inte säger när den lästes.

### G27 · ALLVARLIG · NY — Kalendern har ingen horisont och inget passerat-läge

Alla rader är 2026. Gislaved återkommer 31 jan / 30 apr / 31 juli / 31 okt — men januari 2027 finns inte. En kassör som planerar hösten behöver rullande tolv månader, inte "resten av kalenderåret". Och vad som händer med raden den 1 augusti är oritat (H26).

### G28 · ALLVARLIG (N2 kvar) — Kalendern bär ingen information i sina kolumner

"God tid" upprepas rad efter rad över flera hundra rader — en kolumn med samma värde överallt bär noll information; urgens ska bara märkas när den avviker. Kategoriceller med upp till sex värden är samma sak som ingen kategori. Ingen månadsgruppering. Inga belopp, trots att de finns i datan. Fem kolumner i en bred tabell på 375 px är dessutom målgruppens svåraste yta.

### G29 · ALLVARLIG · NY — Halvårströskeln är för generös för det den skyddar

/om/: uppgifter äldre än ett halvår markeras som möjligen inaktuella. Men bidragsdatum ändras årligen och beslutas ofta i december–januari. En uppgift läst i februari är i praktiken osäker i juli, långt innan tröskeln slår till. Tröskeln skyddar oss, inte henne.

---

## Steg 8 — Återkomst

### G30 · KOMMERSIELL (H30) — "Bevaka den här" finns inte, men /om/ säger att den fungerar

/om/, under **"Det som fungerar i dag"**: *"...och e-postbevakning som påminner innan sista ansökningsdag."* Ingen bevakningsknapp finns på någon av de sex granskade ytorna.

Ett löfte om en funktion som inte går att hitta är sämre än inget löfte. Och det är fortfarande den viktigaste enskilda ändringen i tjänsten: kalendern har högsta köpviljan, bevakning kräver ingen betalintegration, ligger helt inom §5, fångar adressen vid högsta avsikt — och är den enda funktion som gör henne återkommande.

### G31 · KOMMERSIELL (H31) — Ingen väg till nästa förening

Beskedet kan mejlas och skrivas ut, vilket är bra. Men ingenting säger *"känner ni en annan förening i Gislaved?"*. Föreningar i samma ort sitter i samma föreningsråd — den kanal där förtroende faktiskt uppstår för den här målgruppen, och billigare än all SEO.

---

## Om jag bara fick fixa fem

1. **Länka in i tratten från de 140 kommunsidorna** — och lägg den i navet. (G1, G4) Trafiken landar där; entrén sitter någon annanstans.
2. **Städa motsägelserna.** Ett täckningstal, ett prisbesked, ett färskhetsdatum, ett urgensord, ett antal bidrag. (G2, G3, G11, G17) För en förtroendeposition är intern motsägelse den enda felkategori som kostar mer än en saknad funktion.
3. **Gör köpytan köpbar.** Moms, kvitto, leveransform, garanti, och ett löfte om varaktig leverans — allt på samma yta som knappen. (G19, G20, G21, G23, G18)
4. **Bort med 90 dagar, och skilj förkrav från bidrag.** (G12, G10, G11) Två datafel som sitter i de meningar som ska bära förtroendet respektive säljargumentet.
5. **"Bevaka den här" — på deadlineraderna och på giltighetskontrollen.** (G30, G16) Redan utlovad. Kräver ingen betalintegration. Enda funktionen som gör henne återkommande.

---

## Domen

Möter hon en tjänst eller en katalog? **En tjänst — men en som inte litar på sig själv.** Strukturen är rätt: tratt först, väg genom kommunsidan, förkravet lyft till det viktigaste, en produkt med pris i slutet. Det arbetet är gjort och det syns.

Det som återstår är av en annan sort än förra gången. Då saknades ytor. Nu finns ytorna, och de säger olika saker: 140 eller 20 kommuner, gratis eller 249 kr, 27 eller 10 juli, bråttom eller snart, ett eller två bidrag. Varje enskild motsägelse är en timmes arbete. Tillsammans är de skillnaden mellan en tjänst en kassör vågar betala och en sajt hon läser gratis.

Och det största hålet är inte ett fel — det är en frånvaro: **de 140 sidorna där hon faktiskt landar bjuder inte in henne i tratten.** En perfekt tratt som ingen hittar är värd lika lite som en perfekt betalvägg utan korridor.

---

## Ej verifierat i denna omgång

`/integritet/`, `/kontakt/`, köpvägen efter klick (betalsteg, kvitto, leverans), Mina sidor, och utkastvyn (utesluten). Köpvägen behöver en egen genomgång — den bär G19–G24 och därmed hela frågan om tjänsten går att betala.

---

*Systemet oförändrat: tokens, "civil klarhet med skav", oxblod reserverad för verifiering, urgens-modellen, WCAG-golv, 16 px brödtext. Granskningen pekar på saknade ytor, motsägelser och tillstånd — inte på systemet.*
