# Användaraudit — 2026-08-08

*Code, på uppdrag av Jacob ("min känsla nu är att bygget fungerar, men att det
blir ganska obegripligt för användaren — sätt dig i användarens skor").*

## Metod och begränsning

Ingen riktig webbläsare fanns tillgänglig i den här sessionen (sökt igenom
alla verktyg två gånger, inga träffar på browser/screenshot/computer-use).
Istället: lokal dev-server + textextraktion av faktiskt renderad HTML för
varje sida i klickordning, läsning av kompilerad/bundlad JS för att
verifiera skriptlogik, och simulering av `sorteraForTratt`/liknande logik
mot riktig produktionsdata där det var relevant. Det fångar innehåll,
copy-konsistens och strukturella/logiska buggar väl. Det fångar INTE
layout, visuell hierarki, CSS-driven förvirring eller interaktionskänsla
(timing, animation, "känns det tryggt att klicka") — det kräver en riktig
genomgång i webbläsare, av Jacob.

**Granskade ytor** (dev-server, textextraktion): `/`, `/kommun/[slug]/`,
`/kommun/[slug]/registrera/`, `/kommun/[slug]/[kategori]/`, `/deadlines/`,
`/pris/`, `/om/`, `/avregistrera/`, `/mina-sidor/`, `/kontakt/`,
`/integritet/`, `/admin/` (endast inloggningsskärmen), felrapport-flödet
(kod), plus ett svep över hela `src/` efter platshållarmönster.

**Ej granskat** — kräver antingen en riktig betalning (Stripe-session) eller
inloggning jag inte har: köp-kvittoskärmen (`mina-sidor/kop/[session]/`),
giltighetskollens fulla interaktiva flöde (formuläret finns, svarslogiken
lästes inte igenom rad för rad), adminytans innehåll efter inloggning
(bara den redan verifierade Omverifiering-sektionen är känd, se separat
rapport i konversationen).

---

## Fynd, prioriterade

### 1. AKUT — `{{FABLE:...}}`-platshållare i en riktig, schemalagd kundmejl

**Var:** `src/lib/content.ts:409` och `:411`, `MEJL.paminnelse28` (abonnemangets
28-dagarspåminnelse per matchat bidrag).

```
amne: '{{FABLE: ämnesrad, fyra veckor kvar — {bidragsnamn} i {kommun}}}',
body: ['{{FABLE: brödtext för abonnemangets fyraveckorspåminnelse, per matchat bidrag}}'],
```

**Varför det är akut, inte bara en bugg:** det här är inte en sida någon
råkar besöka — det är ett utgående mejl. Kedjan är komplett och skarp:
`sendPaminnelse28()` (`src/lib/mejl.ts:138`) anropas från
`src/pages/api/cron/abonnemangsbevakning.ts:92`, som körs **dagligen**
(`vercel.json`, schema `0 9 * * *`). En riktig köpyta för abonnemanget
finns (`src/pages/api/checkout/abonnemang.ts`), trots att `/pris/` (se
fynd 2) påstår att produkten "saknar köpyta helt idag". Om en enda
betalande abonnent har ett matchat bidrag 28 dagar från deadline går ett
mejl ut till dem med den råa mallkoden som ämnesrad.

**Kunde inte verifieras:** om detta redan har skickats till en riktig
kund. Kräver antingen adminåtkomst eller direkt Redis-åtkomst, ingen av
delarna fanns i den här sessionen.

**Åtgärd:** Opus/Fable skriver ämnesrad + brödtext (svensk kundtext, Code
skriver den aldrig enligt stående regel). Kolla parallellt om mejlet
redan gått ut till någon.

---

### 2. HÖG — Samma platshållarmönster, live på `/pris/` just nu

**Var:** `src/lib/content.ts:610`, `:614`, `:619` — `KÖPRUTA.registrering.
beskrivning`, `.bidragsutkast.beskrivning`, `.abonnemang.beskrivning`.

Verifierat direkt mot produktion:
```
$ curl -s https://foreningsguiden.se/pris/ | grep -o "{{FABLE[^}]*}}"
{{FABLE: kort produktbeskrivning, kommun-oberoende}}
{{FABLE: kort produktbeskrivning, kommun-oberoende}}
{{FABLE: produkten saknar köpyta och beskrivning helt idag}}
```

En besökare som vill se vad de betalar 249/495 kr för möter mallkod i
stället för en produktbeskrivning. Sannolikt den enskilt mest skadliga
posten på listan efter #1 — en prissida utan produktbeskrivning ser
trasig ut, inte bara obegriplig.

**Åtgärd:** Opus/Fable-textrunda, samma tre rader.

---

### 3. HÖG — Interna researchanteckningar läcker rakt in i bidragskorten

**Var:** `bidrag.anteckning`-fältet (`src/lib/kommunTyper.ts:117`),
renderas okommenterat i `src/components/BidragCard.astro:266`.

**Omfattning:** 191 av 2 808 enskilda bidragsposter (36 av 290
kommunfiler) innehåller QA/processpråk från extraktionspasset blandat
rakt in i den användarvända texten. Exempel, ordagrant från Norrtälje:

> "SAKNADES I FÖREGÅENDE VERSION, uttryckligen exkluderad med
> motiveringen 'administreras av andra förvaltningar' — inte ett godkänt
> uteslutningsskäl enligt RESEARCH_SPEC_v2.md §2.4."
>
> "KÄLLKONFLIKT (§2.5): vårfönstrets öppningsdatum anges som 31 januari
> på kommunens fonder-och-stiftelser-sida men som 13 februari på
> trygghetsfondens egen självservicesida..."

Det här ligger i SAMMA fritextfält som genuint användbar kontext ("Ansök­
ningsperiod 15 augusti–15 september, driftbidrag täcker löpande
kostnader...") utan någon separation. En besökare läser interna
dokumentreferenser (`RESEARCH_SPEC_v2.md §2.4`) de inte kan tolka — det
ser ut som ett läckt internt dokument, inte en bidragsbeskrivning.

**Detta är innehåll, inte kod.** Kräver antingen en textrunda som stryker
QA-delen ur de 191 `anteckning`-fälten, eller en mekanisk regel (Code) som
filtrerar bort meningar som matchar mönstret (`RESEARCH_SPEC`, `SAKNADES
I FÖREGÅENDE`, `KÄLLKONFLIKT` m.fl.) innan rendering — en snabbare men
trubbigare fix som riskerar att klippa halva meningar om mönstret inte
är konsekvent formulerat.

---

### 4. MEDEL — "Sparat till ert underlag" lovar persistens som inte finns

**Var:** `VAGLEDNING.station1.sparatText` (`src/lib/content.ts:313`),
visas i `KommunProgression.astro` när en besökare klickar en
kategoripill ("Idrott", "Kultur" osv) på kommunsidan.

Texten: *"Sparat till ert underlag: föreningstyp — idrott"*.

Verifierat i `applyFilter()`-funktionen (`KommunProgression.astro:463`):
rent klientminne, ingen `localStorage`, ingen koppling till tratten
(`foreningsprofil.ts`). Ladda om sidan och allt är "Alla" igen. Ordet
"Sparat" påstår mer än vad som faktiskt händer.

**Åtgärd:** antingen (a) döp om till något sant — "Visar idrott" — eller
(b) koppla filtret faktiskt till samma `foreningsprofil.verksamhet` som
tratten skriver till, så valet verkligen bär vidare. (b) är den
arkitektoniskt rimligare lösningen men större ändring; se fynd 5.

---

### 5. MEDEL — Tre parallella, okopplade "vad är ni för förening"-ytor

Tre helt separata mekanismer svarar på samma fråga, utan att dela data
eller hänvisa till varandra:

1. **Tratten** (`/matcha/`) — tre frågor, sparas i `localStorage`
   (`foreningsprofil.ts`), ger besked med grupperna "Passar er
   verksamhet" / "Kan gälla er ändå" (B3/B4, denna session).
2. **Kommunsidans station 1** — kategoripills, filtrerar bara den egna
   sidvyn, sparar ingenting (se fynd 4).
3. **Kommunsidans egen fullständiga lista** längst ner — ogrupperad,
   alla bidrag, ingen relevansmarkering alls.

En besökare som gör tratten och sedan landar på en kommunsida möter en
tredje variant av samma fråga med annat resultat och ingen hänvisning
mellan dem. Det här är sannolikt kärnan i "obegripligt" — inte att någon
enskild yta är dålig var för sig, utan att det finns tre svar på samma
fråga som inte känns av varandra. Det här är ett arkitekturbeslut, inte
en enkel textfix — kräver ett ställningstagande om station 1 ska bort,
kopplas till tratten, eller medvetet vara sitt eget, avgränsade verktyg
(och i så fall varför de två inte stör varandra begreppsmässigt).

---

### 6. LÅG — "Kontrolläst" i legend-texten

`OLAST_MARK.legend` (`content.ts:786`): "streckad ring = hämtad, ej
kontrolläst". Internt processpråk, men verbatim citerad ur en
tidigare Opus/Fable-spec (`TILLSTANDET_OLAST.md`) — sannolikt ett
medvetet ordval, inte en Code-miss. Flaggas för fullständighetens skull,
inte som en akut åtgärd.

---

### Sidoobservation — inte en textbugg

Integritetspolicyn (`/integritet/`) skriver ärligt: *"Personuppgifts­
ansvarig är Föreningsguidens juridiska part. Namn och organisationsnummer
är inte fastställda än."* Transparent formulerat, inte förvirrande — men
en juridisk/affärsmässig lucka att hålla koll på separat från den här
listan.

---

## Rena ytor (kontrollerade, inga fynd)

`/om/` (särskilt bra — tydlig, ärlig, bygger förtroende rätt),
felrapport-flödet ("Det här stämmer inte" → formulär → kvitto),
`/kommun/[slug]/registrera/`, `/kommun/[slug]/[kategori]/`, `/deadlines/`,
`/avregistrera/`, `/mina-sidor/` (inloggningsskärm), `/kontakt/`,
`/integritet/` (innehållet, bortsett från sidoobservationen ovan),
`/admin/` (inloggningsskärm).

Två falska larm som visade sig vara korrekt byggda: `/exempel/`-sidorna
och `KOMMUN_LANDNING` har `{{GENERATOR:}}`/`{{FABLE:}}`-platshållare
kvar i koden, men är medvetet avstängda (`getStaticPaths` returnerar
tomt) — 404 bekräftat, ingen riktig besökare kan nå dem.

---

## Föreslagen ordning

1. Kolla om paminnelse28-mejlet redan skickats till en riktig kund (fynd 1)
2. Opus/Fable-textrunda: paminnelse28 + prissidans tre rader (fynd 1+2)
3. Besluta hur `anteckning`-fältets QA-läckage ska städas — textrunda vs
   mekanisk filtrering (fynd 3)
4. "Sparat till ert underlag" — omformulera eller koppla till profilen (fynd 4)
5. Arkitekturbeslut om de tre parallella förening-ytorna (fynd 5) — störst
   fråga, ingen brådska att besluta idag
6. Legend-text (fynd 6) — låg prioritet, kan vänta
