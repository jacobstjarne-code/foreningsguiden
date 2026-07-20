# SLUTSPEC INFÖR LANSERING — Föreningsguiden

*Opus/Fable 2026-07-20. Två syften: (1) en ärlig förteckning över vad som INTE är byggt eller klart, och (2) de ändringar en extern granskning (second opinion) föranleder. Den styrande principen genom hela dokumentet är Jacobs restriktion, som inte fanns med när tidigare specar skrevs:*

> **NOLLARBETSRESTRIKTIONEN: När produkten är färdig ska den sälja sig själv, supporta sig själv och marknadsföra sig själv. Ingen intäktsväg och ingen kanal får kräva Jacobs löpande arbete i drift. Undantag är engångsinsatser (ett förbundsavtal, en researchkörning) — inte återkommande hantering.**

*Detta är inte en begränsning ovanpå affärsmodellen. Det är affärsmodellens ryggrad, och flera tidigare beslut måste omprövas mot den.*

---

## DEL 1 — VAD SOM INTE ÄR KLART

### 1.1 Byggt och live
- 20 kommuner, verifierad data, källänkar, verifieringsdatum
- Femstationsväg med progressive disclosure
- Deadlinekalender, UrgencyChip, giltighetskoll
- Utskicksmotor: dubbel opt-in, 14- och 3-dagarspåminnelser (Resend + Vercel Cron)
- Beta-ram, väntelista med klickmätning, kommunsiffra (Berg)
- Domän, DNS på Cloudflare, AI-crawlers allow-all
- Ansvarssektion på /om/

### 1.2 Blockerat, väntar på måndagens sista steg
- **E-postleverans obevisad i skarp miljö.** DKIM rättad, SPF/DMARC på plats, men hela kedjan måste landa i en färsk inkorg innan formuläret öppnas. Grind hos Code.
- **SITE_URL + avsändarbyte** — väntar på HTTPS-cert och grön Resend-verifiering.

### 1.3 Byggt men osäkert — får INTE publiceras som det är
- **Batch 1: 28 av 30 kommuner researchade enligt v1**, samma blinda fläck som Växjö (7→27 vid omkörning) och Halmstad (16→21). Validerar rent, men täckningen är opålitlig. Måste köras om mot v2.1 före merge till main.
- **Växjö och Halmstad omkörda och godkända** — de två är klara.

### 1.4 Obyggt — den kommersiella kärnan
Detta är produkten som helhet fortfarande saknar. Inget av det får byggas slarvigt för att nå lansering.
- **Utkastgeneratorn** — kärnan. Ospecad bortom KVALITETSSPEC. Se §2.4 om varför nollarbetsrestriktionen gör dess gate hårdare.
- **Föreningsprofilens datamodell** — förutsättning för både generator och föreningsminne.
- **Betalflödet** — ritat av Design (ände till ände), obyggt. Betalning avstängd tills generatorn klarar sin gate.
- **Ungated-formuläret, utkastvyn med väggen, paywall, kvitto** — ritade, obyggda.
- **Exempelutkasten** (~75 sidor) — 404:ar avsiktligt tills de kan vara generatorns output.

### 1.5 Spårade förpliktelser med deadline
- **Giltighetsvarningens cron** — widgeten lovar "vi säger till". Datum samlas in, men det schemalagda utskicket är obyggt. Måste byggas före augusti är slut, annars är löftet tomt.
- **Kommunväljaren skalar inte** — Design ritar om (sökfält + länsvis disclosure, DOM-bevarande filtrering). Blockerar inte lansering av 20, blockerar publicering av 50+.
- **Omverifieringsplan** — 290 kommuner betyder att inaktualitetsflaggan tänds varje vecka. Egen spec, före batch 3.

### 1.6 Kvalitetsluckan vi ännu inte fyllt
- **Ingen kvalitativt bedömd pott ännu analyserad.** Berg fördelar utan att bedöma. Gislaved och Oskarshamn-begäran ute. Tills en sådan är läst vet vi vad som gör en ansökan *formellt komplett*, inte vad som gör den *beviljad*. Löftet måste spegla det (§2.5).
- **Ingen verklig användare har sett produkten.** Fortfarande sant. De första fem kassörssamtalen är viktigare än nästa byggsteg.

---

## DEL 2 — ÄNDRINGAR FRÅN SECOND OPINION

En extern granskning gav fyra invändningar. Mot nollarbetsrestriktionen faller de ut så här.

### 2.1 Mänsklig granskning som intäktspelare — STRYKS
Granskningen föreslog en nivå "granskad ansökan / kvalificerad rådgivning" för 1 495–2 995 kr som den tunga intäktsraden.

**Den bryter mot nollarbetsrestriktionen fullständigt** — den är per definition en människa i loopen per köp. Den stryks som pelare. Den kan återkomma i framtiden *om tjänsten bär sig* och Jacob aktivt väljer att sälja sin tid — men den är inte en del av den självgående produkten och ska inte finnas i prislistan vid lansering.

### 2.2 "Låg intäkt per kund finansierar inte datainsamlingen" — DELVIS FEL PREMISS
Granskningens starkaste invändning: 149 kr räcker inte för att finansiera datainsamling, verifiering, täckning av 290 kommuner.

**Detta räknar med en mänsklig kostnadsbas som fabriken konstruerat bort.** Datainsamlingen är research-pipelinen (en Claude Code-instans på en branch). Omverifieringen är samma pipeline på schema. Täckning av 290 kommuner är en engångskörning plus periodisk maskinell omkörning — inte en löpande personalkostnad. Granskaren antar en driftsmodell som inte är vår.

Kvar av invändningen står dock en sann del: **priset var för blygt.** Se 2.3.

### 2.3 Prissättningen revideras uppåt — GENOMFÖRS
149 kr signalerar att det inte är värt något — samma fel jag varnade för kring abonnemanget men inte tillämpade på utkastet. Köpögonblicket är akut (deadline nära), betalningsviljan är då som högst, och priset ska spegla vad arbetet ersätter (timmar av kvällspyssel + avslagsrisk).

**Ny prislista vid lansering:**

| Produkt | Pris | Innehåll | Nollarbete? |
|---|---|---|---|
| Ansökningsutkast | **249 kr** | AI-utkast mot kommunens kriterier | Ja — helt automatiskt |
| Ansökningspaket | **595 kr** | Utkast + kravcheck + budgetstruktur + bilagelista | Ja — varje del genereras ur befintlig data |
| Föreningsabonnemang | **595 kr/år** | Bevakning + föreningsminne + utkast ingår | Ja |
| ~~Granskad ansökan~~ | — | Parkerad (se 2.1) | Nej — därför utesluten nu |

**Ansökningspaketet är den viktigaste nya insikten.** Varje del är automatiserbar ur data vi redan har: kravchecken är `forutsattningar`, bilagelistan är `krav`, budgetstrukturen är en mall. Högre intäkt, noll extra arbete, exakt vad restriktionen belönar. Det ersätter den strukna granskningsnivån som produktens övre prispunkt — utan att bryta mot självgåenderegeln.

Abonnemanget höjs från 495 till 595 för att ligga i linje med paketet och inte underprisa det återkommande värdet (giltighetsfällan, §2.3 i AFFARSMODELL).

### 2.4 Nollarbete gör kvalitetsgaten HÅRDARE, inte mjukare
Detta är den viktigaste konsekvensen och den granskningen inte såg.

Om ingen människa granskar utkastet innan det når kunden — vilket restriktionen kräver — **måste generatorn vara god nog att släppas utan skyddsnät.** Ett automatiskt utkast som ibland är dåligt är farligare än inget utkast, eftersom det inte finns någon som fångar det dåliga fallet innan kunden betalat och lämnat in det.

Därför skärps KVALITETSSPEC §5:
- Betalning aktiveras inte förrän generatorn klarar blindjämförelse mot golden set **utan mänsklig efterhandsgranskning i flödet**
- Golden set är inte längre bara kalibrering — det är förutsättningen för att produkten kan vara självgående
- Om generatorn inte når självgående kvalitet, säljs den inte. Då är produkten bevakning + information tills den gör det. Det är ett acceptabelt läge — inte ett misslyckande.

### 2.5 Löftet måste vara självbärande
Utan människa i loopen kan ingen mildra ett översålt löfte i efterhand. Ansvarsraden blir därför bindande produktdesign, inte finstilt:
- Får sägas: bemöter varje krav kommunen ställer, skrivet mot rätt kriterier, sparar timmar
- Får INTE sägas: ökar chansen till bifall, "bättre än" föreningens eget (tills en kvalitativt bedömd pott analyserats, §1.6)
- En förening som får avslag på ett utkast vi lovat "bemöter alla krav" fick vad den betalade för. En som fått avslag på ett utkast vi lovat "ökar chansen" blev lurad — och det finns ingen support som räddar den relationen i en självgående produkt.

---

## DEL 3 — MARKNADSFÖRING MOT NOLLARBETE

Restriktionen bekräftar att SEO/GEO inte är en kanal bland flera — det är **den enda skalbara kanalen**, eftersom den är den enda som fungerar utan löpande arbete och utan mediabudget.

**Överlever (självgående eller engångs):**
- Teknisk hittbarhet — byggs nu, sedan passiv
- Offentlighetsmetodens PR-maskin — genererar bakåtlänkar och lokala datastorys; researchdriven, låg löpande insats
- Bandyförbundspiloten — ett engångsavtal ger en stående kanal (VD:n distribuerar), inte löpande arbete
- Innehållslagret (BRA_ATT_VETA, vägledning) — genererat, indexerbart, passivt

**Faller bort eller degraderas till engångsinsats:**
- Facebookgrupper, manuell community-närvaro — kräver löpande tid, bryter restriktionen
- "Ej sökt"-breven — engångskampanj, inte drift; kan köras en gång, inte som modell
- Löpande manuella förbundssamtal — bara det första, som pilotbevis

**Konsekvens:** GTM:ens tyngdpunkt flyttas från de arbetsintensiva spåren till de självgående. Det gör hittbarheten ännu mer avgörande — om den inte bär, finns ingen backup som inte kostar Jacobs tid.

---

## DEL 4 — BYGGORDNING INFÖR OCH EFTER LANSERING

**Nu (måndag):**
1. Codes sista steg: mejlkedjetest → grind → formulär på → publicering → indexering
2. Regelratten.se-koppling om tid finns

**Innan mer byggs (grindar):**
3. Omkörning av batch 1:s 28 kommuner mot v2.1 + Fables stickprov → först då merge till main
4. Batch 2 (30 nya) parallellt

**Den kommersiella kärnan, i ordning, ingen får hoppas över:**
5. En kvalitativt bedömd pott analyserad (Gislaved/Oskarshamn) — innan generatorn byggs
6. Föreningsprofilens datamodell
7. Utkastgeneratorn med golden set som självgående-gate (§2.4)
8. Ansökningspaketets tre extradelar (kravcheck, budgetstruktur, bilagelista) — genereras ur befintlig data
9. Ungated-flöde, utkastvy, paywall, betalning (Stripe + Swish)
10. Betalning aktiveras — endast om 7 klarat sin gate

**Spårade, egen tid:**
11. Giltighetsvarningens cron (före sept)
12. Kommunväljaren för skala (före publicering av 50+)
13. Omverifieringsspec (före batch 3)

**Viktigast av allt, parallellt med allt:** de första fem kassörssamtalen. Produkten har aldrig mött en användare.

---

## DEL 5 — DEN ENDA MENINGEN SOM RÄKNAS

Nollarbetsrestriktionen gör produkten smalare men sundare: bort med mänsklig granskning som pelare, upp med priset på det automatiserbara, och en hårdare gate för när betalning slås på — eftersom självgående betyder att generatorn måste vara rätt utan skyddsnät. Om den inte når dit säljs bevakning och information tills den gör det, och det är ett hederligt läge att lansera i.
