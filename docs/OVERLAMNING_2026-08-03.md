# ÖVERLÄMNING — Föreningsguiden, 3 augusti 2026

*Skriven av Opus/Fable vid överlämning. Läs den här före något annat. Den är skriven för att nästa instans inte ska upprepa mina fel, och den skiljer strikt på vad som är verifierat och vad som är påstått.*

---

## 0. Den viktigaste regeln

**Ingenting räknas som klart förrän det hämtats från foreningsguiden.se.**

Inte dev-server. Inte grön build. Inte "committat och pushat". Under de senaste veckorna har följande rapporterats som klart och visat sig inte finnas live: steg 5-dubbleringen (två gånger), navlabeln (landade på en sida av två), fem separata `content.ts`-ändringar (låg okommitterade i primärkatalogen på fel gren), matchningsfälten för Arvika (samma sak).

Och kontrollera **kommunsidan**, inte förstasidan. Trafiken landar på kommunsidor. Förstasidan har fått alla fixar; kommunsidorna har inte fått någon av dem.

Jag verifierade genom att läsa rapporter i stället för att öppna sidan. Det är det enskilt största felet i den här processen och det är mitt.

---

## 1. Vad tjänsten är

En sajt som samlar kommunala föreningsbidrag per kommun. Målgruppen är föreningskassören — ofta äldre, ofta ideell, arbetar i femminutersfönster på kvällen.

**Gratis:** katalogen, matchningstratten (fyra frågor → vad just er förening kan söka), deadlinekalendern, e-postbevakning före deadlines.

**Betalt (testläge):** registreringsutkast 249 kr, bidragsutkast 249 kr, abonnemang 495 kr/år.

Kärnlöftet, belagt av Oskarshamn-data: kommunala avslag är **formella**, inte kvalitativa. Ingen faller på dålig prosa — de faller på att de inte var registrerade, hade fel säte, missade datumet. Därför lovar tjänsten "inget formellt krav saknas", **aldrig** "ökar er chans till bifall".

---

## 2. Verifierat live (hämtat 3 augusti)

- 290 kommuner i kommunväljaren, alla länkade
- Förstasidan: tratt-först, H1 "Vet vad din förening kan söka", nav "Vad kan ni söka?"
- `/matcha/` fungerar, fyra frågor, stegflöde
- `/integritet/`, `/kontakt/`, `/pris/`, `/om/` finns
- Kommunsidan: fem stationer, giltighetskontroll, FAQ, källänkar

## 3. Verifierat trasigt live (samma hämtning)

**Passerad deadline visas som brådskande.** Gislaved: "31 juli 2026 · om 0 dagar · Bråttom". Datumet gick ut tre dagar tidigare. Nästa tillfälle (31 oktober) står i detaljvyn men inte där hon tittar. Detta drabbar varje kommun varje år och är det enda felet som direkt kostar en förening pengar.

**Gislaved visar ett bidrag; kommunen har flera.** Kommunens egen sida listar grundbidrag (15 mars) och lokalt aktivitetsbidrag (25 feb / 25 aug) utöver arrangemangsbidraget. FAQ:n påstår "1 kommunala bidrag" med auktoritet. Gislaved är pilotkommunen — all golden set och alla demos bygger på den.

**Steg 5 renderas två gånger** och visar väntelistecopy ("Reservera plats nu. Ni betalar först när utkastet ligger klart") trots att utkastet går att köpa. Rapporterat fixat två gånger.

**Steg 2 upprepar deadline-raden.**

**Navet säger "Hitta bidrag" på kommunsidan**, "Vad kan ni söka?" på förstasidan.

**"Hjälp oss registrera"** står kvar i steg 3 — läses på svenska som att hon hjälper oss. Ska vara "Förbered vår ansökan".

**Förstasidans deadlinetabell** visar fem identiska Pajala-rader, alla länkade till kommunsidan i stället för bidraget.

**Gemensam nämnare:** kommunsidorna kör gammal kod. Ta reda på om `index.astro` och `KommunSidaFull.astro` drivit isär eller om kommunsidorna inte byggs om. Det förklarar fem av sju.

---

## 4. Datan

**ChatGPT har extraherat om alla 290 kommuner** (2 774 bidrag, 944 unika käll-URL:er) på två dagar. Min egen extraktionsprocess tog tio dagar, landade på 140 kommuner varav 38 flaggades som misstänkta. Utnyttja den kompetensen; kör inte om det arbetet i Claude.

Restlista enligt deras slutkontroll:
- 4 statiska fel, alla i Pajala (text i `kalla_url`, URL i `belopp`)
- 110 länkar som inte kunde verifieras automatiskt — sortera på HTTP-status, bara 404 kräver åtgärd
- 8 högriskkommuner med ovanligt få bidrag: Älvkarleby, Aneby, Gullspång, Hultsfred, Olofström, Övertorneå, Töreboda, Trosa

**Lägg en spärr i valideraren:** `kalla_url` måste börja med `http`, `belopp` får inte innehålla `http`. Pajala-felet har uppstått två gånger.

**Matchningsfälten är i stort sett tomma.** Bara Arvika har `foreningstyp`, `min_medlemmar` m.fl. ifyllda. Det betyder att tratten frågar fyra frågor och filtrerar ingenting för 289 kommuner — kärnvärdet fungerar för en kommun. Struktureringen är regelbaserad (läs `krav[]`, fyll fälten) och kräver ingen webbhämtning.

Två fällor i den struktureringen, bägge belagda:
- En siffra i kravtexten kan vara fel sorts siffra. Arvikas pensionärsbidrag säger "minst 10 arrangemang" — inte tio medlemmar. `min_medlemmar: 10` där hade dolt bidraget för varje liten förening.
- Pensionär och funktionsrätt är **målgrupper, inte verksamheter**, och finns inte i `VERKSAMHETER`. De ska ha `foreningstyp: null`. Mappas de till `social` får en pensionärsförening som valt "kultur" veta att den saknar något för sitt eget bidrag.

---

## 5. Betalning

Allt i **Stripe sandbox**. Ingen har betalat något.

`SALJARE` är platshållaren "Humle och Dumle AB / 556000-0000". Det blockerar riktiga kvitton och den juridiska avsändaren i integritetspolicyn (som har en `SALJARE_VALD`-flagga och visar en ärlig "ännu inte bestämt"-rad tills parten finns). Partsvalet är Jacobs och tar en enradsändring.

**Otestat i skarpt läge:** Swish/kort-låsningen. Backend-ändringen är gjord men aldrig körd mot riktig Stripe — den sitter i betalningsögonblicket och måste testas med Jacobs `.env.local` innan knapparna öppnas.

Webhook (`checkout.session.completed`, snapshot-payload) är uppsatt och verifierad med riktiga testköp.

---

## 6. Generatorn och golden set

Grinden är **grön: 245 tester, 0 FAIL, 45/45 (bidrag × profil)**. `UTKASTVY_LIVE` är på.

Femton facit skrivna av mig mot verkliga bidrag i Gislaved, Arjeplog, Askersund, Bjuv, Arvika. De testar fyra kriterier: täckning, ingen uppfinning, ärliga luckor, inget bifallslöfte.

**Vad generatorn faktiskt gör:** fyller i två saker (att föreningen finns i kommunen, vilken verksamhet den bedriver) och markerar allt annat som `[Fyll i: ...]`. Den producerar kommunens krav i rätt ordning med deadline, belopp och bilagechecklista. Det är värt 249 kr — men det är **inte** "vi skriver er ansökan", och den formuleringen har jag använt felaktigt i copy under lång tid.

**Beslut som ligger ospecat men fattat:** ett kort formulär efter köpet (föreningens namn, org.nr, kontaktperson, bankgiro) som fylls in i dokumentet. Utan det är "ett ifyllt ansökningsunderlag" osant.

**Golden set-fixturerna är känsliga för samtidiga dataändringar** — den parallella extraktionen skrev om Gislaved mitt i ett bygge och bröt en fixtur tyst. Ingen kod skriven för det.

---

## 7. Vad Design har levererat

Design är den enda part som konsekvent sett produkten ur kassörens ögon. Hennes granskningar har fångat mer än mina. **Låt henne granska varje betydande yta INNAN den kallas klar, inte efter.**

I `incoming/`:
- `GRANSKNING_foreningsguiden.md` — 32 hål, de flesta åtgärdade
- `GRANSKNING_2_foreningsguiden.md` — G1–G31, delvis åtgärdade
- `MOCKAR_huvudprocessen.md` — sex ytor i text, implementerade
- `foreningsguiden-huvudprocessen.html` — canvasversionen (**jag kan inte läsa den; be alltid om markdown vid sidan av**)

**Praktisk regel:** Design och jag kan inte läsa varandras leveranser. Hennes canvas är självuppackande HTML som kräver en webbläsare. Markdown fungerar varje gång. Be om båda.

---

## 8. Öppna beslut som kräver Jacob

- **Juridisk part** — låser upp `SALJARE`, momskvitto, Swish-namn, personuppgiftsansvarig, skarp betalning
- **Abonnemangets köpyta** — backend finns (495 kr/år, Stripe Billing, kundportal), men ingen sida länkar dit. Frågan är var i flödet den erbjuds, inte hur den ser ut. Sannolikt direkt efter att bevakningsknappen använts.
- **Priset** — 249/249/495 är platshållare, ska testas mot klickfrekvens, inte gissas. `PRIS_PAKET_ORE` = 699 kr är märkt DRAFT.

---

## 9. Mina fel, så de inte upprepas

**Jag verifierade genom rapporter, inte genom att öppna sidan.** Varje gång Jacob eller Design tvingade mig att titta fanns något som inte stämde.

**Jag skrev copy mot vad produkten skulle bli, inte vad den gjorde.** "Vi skriver ansökan åt er" när generatorn fyller i två fält.

**Jag hittade på tal.** "90 dagars handläggning" var en felläsning av "subventionerad taxa gäller tidigast tre månader efter beslut". Det dök upp fyra gånger.

**Jag lät batch-rapporter sätta agendan.** Varje inkommande rapport drog mig ner i YAML-detaljer medan produkten stod still. Jacob fick agera projektledare genom att fråga "men det övergripande?".

**Jag lovade saker över turer utan att göra dem.** Golden set-faciten utlovades tre gånger innan de skrevs. Det finns ingen mekanism i mig som bär ett löfte vidare — därför ska öppna uppgifter ligga i `docs/KVAR.md`, inte i en chatt.

---

## 10. Om jag hade en dag kvar

1. **Deadline-logiken.** Passerade datum som visas som brådskande är det enda felet som kostar en förening pengar.
2. **Kommunsidornas gamla kod.** Fem fel med en rotorsak.
3. **Gislaved.** Pilotkommunen är tunn, och om den är tunn vet vi inte vad de andra 289 innehåller.
4. **Struktureringspasset.** Tratten filtrerar ingenting för 289 kommuner. Det är kärnvärdet.

Kosmetiken — navlabeln, knapptexten, Pajala-raderna på förstasidan — är en timme och kan vänta.
