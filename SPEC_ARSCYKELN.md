# SPEC: Årscykeln (H28, H32)

*Skriven av Code, 2026-07-30, på uppdrag av Jacob (SPEC: Det som återstår,
grupp D). "Specas nu, byggs inte nu" — meningsfullt först när Föreningsguiden
har köpare som kommer tillbaka ett andra år. Detta dokument är arbetsordern
för DEN sessionen, inte en implementation.*

---

## 0. Varför det inte byggs nu

Båda funktionerna kräver att något som INTE finns idag existerar först:

- **H28** kräver att en köpare faktiskt har ett köp från en TIDIGARE
  ansökningsomgång att utgå från. Det första köpet såldes 2026-07-26
  (`git log -p src/lib/kop.ts`) — ingen förening har än en "förra året"
  att erbjuda "i år" mot.
- **H32:s återredovisning** kräver ett STRUKTURERAT datafält för
  redovisningskrav. Det finns inte idag — `slutredovisning`/
  `återredovisning` förekommer bara som fri text i `Bidrag.anteckning`
  (bekräftat via grep, 2026-07-30: 9 kommuner nämner det, alla i
  anteckningsfältet, ingen i ett eget fält). Att bygga en
  datumtriggad påminnelse nu vore att gissa fram en deadline som
  källan aldrig strukturerat gett oss — exakt den klassen av fel
  `docs/kunskapsbas`-disciplinen (Bandy Manager-projektets, men
  principen är generell) varnar för: gissa aldrig utifrån ett
  fältnamn, slå upp källan.

Att specificera nu, innan datan/kunderna finns, betyder att arkitekturen
inte behöver ändras när det blir aktuellt — bara fyllas i.

---

## 1. H28 — Förra årets ansökan uppdaterad

### 1.1 Vad det är

En förening som köpte ett registreringsutkast förra året kommer
tillbaka. Bidraget finns kvar, deadline har rullat fram ett år, kraven
kan ha ändrats (H22 upptäcker redan om de gjort det). Hon ska INTE
behöva svara på matchningstrattens fem frågor igen — profilen finns
redan (`Subscriber.foreningsprofil` eller `KopEntry.foreningsprofil`).

### 1.2 Datamodell — additivt, samma mönster som `status`/`senast_verifierad`

`KopEntry` (kop.ts) får ett nytt fält:

```ts
// H28: vilket ANSÖKNINGSÅR köpet gäller — inte samma som betaldDatum.
// En förening kan köpa i december för nästa års ansökningsomgång.
// Sätts av checkout-flödet vid köptillfället utifrån bidragets
// KOMMANDE deadline, inte utifrån dagens datum.
ansokningsar: number;
```

Ingen ny Redis-nyckelrymd behövs — `hamtaKopForEmail(email)` (finns
redan) räcker för att lista föreningens tidigare köp. `ansokningsar`
är bara ett filter/sorteringsfält på befintliga poster.

### 1.3 Flödet i Mina sidor

På `/mina-sidor/kop/[session]/` (byggd i grupp B, samma session som
detta dokument): om föreningen har ett ÄLDRE köp för SAMMA
`kommunSlug` där `ansokningsar < aktuellt ansökningsår`, visa en rad:

> "Ni köpte det här utkastet {förra året}. Skapa {i år}s ansökan
> utifrån samma uppgifter?"

Knappen startar EN NY köpsession (samma Stripe-checkout som idag,
`checkout/registrering.ts`), men förifyller `foreningsprofil` från det
gamla köpet (samma mönster som `addForeningsprofil` redan gör vid
köptillfället — ingen ny kod för själva ifyllningen, bara en ny
ingångspunkt som hoppar över matchningstratten).

**Öppen fråga för Jacob, inte en kodfråga:** ska år 2 vara rabatterat
mot 249 kr? Abonnemanget (495 kr/år) konkurrerar redan med "köp varje
år för fullpris" — priset på förnyelsen är ett affärsbeslut, inte ett
Code-beslut. Specen låser inte ett pris.

### 1.4 Vad som INTE byggs i H28

- Automatisk påminnelse "dags att förnya" ett år senare — det är H18:s
  jobb för SAMMA ansökningsomgångs deadline, men en ETT-ÅR-SENARE
  påminnelse är en ny cron-tröskel (365 dagar efter förra köpet,
  eller X dagar före nästa känd deadline om bidraget har fasta
  datum). Läggs till i samma cron-familj som H18
  (`cron/inlamningspaminnelse.ts`) när det blir aktuellt — samma
  `matchKommun`/`hamtaKopAvProdukt('registrering')`-mönster,
  bara en ny tröskel.
- Prissättning av förnyelsen (se 1.3).

---

## 2. H32 — Efterspelet

Tre distinkta situationer, alla nedströms H19:s utfallsfråga
(`sendUtfallsfraga`, svaren `beviljat` / `avslag` / `vet_inte`,
sparade i `KopEntry.utfall[]` via `sparaUtfallssvar`). H19 är redan
ingången — H32 bygger vidare på de tre grenarna, säljer ingenting i
själva grenpunkten.

### 2.1 Komplettering

Kommunen ber om mer underlag INNAN beslut — sker mellan ansökan och
utfall, alltså FÖRE H19:s fråga någonsin skickas. Ingen ny datamodell
identifierad: det här är ett tillstånd Föreningsguiden inte kan
OBSERVERA (vi äger inte kommunens handläggningssystem, vi vet bara
vad föreningen själv rapporterar). Enda rimliga bygget: en fjärde
svarslänk på utfallsfrågan (`api/utfall/[session]/[bidrag]/[svar]`),
`komplettering`, bredvid `beviljat`/`avslag`/`vet_inte` — utökar
`KopUtfallSvar` med ett fjärde literal-värde, samma mönster som H18:s
`'4'`-utökning av `subscribers.ts`:s typ-union tidigare i denna spec-
serie. Svaret loggas, ingen automatisk uppföljning byggs (vi vet inte
VAD kommunen bett om).

### 2.2 Omprövning (svar: avslag)

**"Svaret 'avslag' öppnar omprövningen utan att sälja något."** Det är
den bärande regeln — H19:s svarssida (`api/utfall/.../avslag/`) visar
idag en generisk tacksida. Den grenen ska i stället visa/mejla:

1. Fakta, inte fösäljning: en kort förklaring av att avslag ofta går
   att begära omprövning av, med en länk till KOMMUNENS egen
   överklagande-/omprövningsinformation om `Kommun.forutsattningar[]`
   eller en ny `Kommun`-nivå-fält råkar innehålla en sådan URL (idag:
   inget sådant fält finns — ANOTHER extraktionsluck, samma klass som
   återredovisning nedan).
2. INGEN köpknapp i samma svar. Om Föreningsguiden senare vill
   erbjuda betald hjälp att SKRIVA omprövningen, är det ett separat,
   efterföljande steg (t.ex. en knapp längre ner, eller ett andra
   mejl några dagar senare) — aldrig i samma andetag som "ni fick
   avslag".

**Datamodell:** `Kommun` behöver ett nytt, valfritt fält för att detta
ska bli mer än en generisk sida:

```ts
// H32: kommunens egen information om att begära omprövning/överklaga
// ett avslagsbeslut. null = inte känt/publicerat — visa då bara den
// generiska texten, gissa aldrig fram en process kommunen inte
// beskrivit.
omprövning: { beskrivning: string; url: string | null } | null;
```

Additivt, samma "null om okänt"-disciplin som `giltighet`/
`senast_verifierad`. Fylls av en extraktionssession, inte av Code.

### 2.3 Återredovisning (svar: beviljat) — obligatorisk och återkommande

Det tyngsta av de tre grenarna, för att risken är configurerbar: en
förening som glömmer sin återredovisning kan bli DISKVALIFICERAD från
nästa års bidrag (flera kommuners `anteckning`-fält antyder detta,
t.ex. Rättviks "Utbetalning ... efter godkänd slutredovisning av
föregående bidrag"). Det gör återredovisningen till samma klass av
"tyst deadline" som giltighetsfällan (`Forutsattning.giltighet`) redan
är byggd för att bevaka.

**Datamodell — ny, egen struktur på `Bidrag` (inte en sträng i
`anteckning`):**

```ts
export interface Redovisningskrav {
  kravs: boolean;
  // Antal dagar efter GENOMFÖRD verksamhet/projektavslut, om känt.
  // Rättviks exempel: 25% hålls inne "efter godkänd slutredovisning"
  // utan explicit fristdatum — då är detta null och bara
  // deadline_text används.
  dagar_efter_avslut: number | null;
  deadline_text: string | null; // fri text när inget siffersatt fristdatum finns
  kalla_url: string;
}

// Bidrag.redovisning: Redovisningskrav | null — null = inget känt
// redovisningskrav (skiljer sig från kravs: false, som betyder att
// en forskningssession AKTIVT bekräftat att inget krävs).
```

**Varför inte återanvända `Forutsattning`:** `forutsattningar[]` är
KOMMUN-nivå (steg innan man ens kan söka något bidrag).
Redovisningskrav är BIDRAGS-nivå och sker EFTER beviljande — annan
livscykelfas, annan ägare (bidraget, inte kommunen som helhet).

**Cronet — när fältet finns:** ny cron, samma familj som
`cron/inlamningspaminnelse.ts` (H18) och `cron/utfallsfraga.ts` (H19):
läser `KopEntry.utfall[]` där `svar === 'beviljat'`, slår upp
`bidrag.redovisning`, om `kravs === true` och en tröskel (t.ex.
`dagar_efter_avslut - 14`) infaller — mejla en påminnelse. Idempotens
via samma `paminnelseskickad:*`-mönster (subscribers.ts) eller en ny
köp-scopad nyckel (kop.ts-mönstret, som H18/H19 redan använder) —
avgörs när fältet faktiskt fylls i och den riktiga fristlogiken är
känd (vissa kommuner räknar från PROJEKTAVSLUT, inte från
BESLUTSDATUM — `betaldDatum`/`utfall[].svaratDatum` räcker inte
ensamma, ANOTHER öppen fråga för extraktionspasset: ska
"projektavslut"-datum samlas in av föreningen själv, eller
approximeras från bidragets egen deadline-cykel?).

### 2.4 Vad som INTE byggs i H32

- Ingen egen skriv-tjänst för omprövningstext (samma "Code skriver
  ingen svensk marknadsprosa"-princip — om Föreningsguiden en dag
  säljer hjälp att SKRIVA en omprövning är det en ny produkt, egen
  spec, egen Fable-copy).
- Ingen datainsamling av "projektavslut-datum" än — se öppen fråga i
  2.3.

---

## 3. Byggordning när det blir aktuellt

1. **Extraktionspass** fyller `Bidrag.redovisning` och `Kommun.omprövning`
   för de kommuner där källan faktiskt anger det (additivt, som alla
   tidigare schemaändringar denna säsong — `status`, `senast_verifierad`).
   Utan detta har H32 ingenting att trigga på.
2. **H32.1** (omprövning): utöka utfallssidans `avslag`-gren att läsa
   `kommun.omprövning`. Litet, isolerat, ingen cron.
3. **H32.2** (komplettering): fjärde `KopUtfallSvar`-literal + fjärde
   länk på utfallsfrågesidan. Litet.
4. **H28**: `ansokningsar`-fält + Mina sidor-raden + checkout-genvägen.
   Kräver att minst en förening faktiskt har ett förragårsköp att
   testa mot (naturligt uppfyllt runt sommaren 2027, ett år efter
   lanseringen 2026-07-26).
5. **H32.3** (återredovisning-cron): sist, eftersom den kräver att
   BÅDE datafältet finns OCH att fristlogiken (dagar-efter-avslut vs.
   fast datum) är beslutad — den mest osäkra av de fyra.

Ingen av dessa fyra delar blockerar varandra utom i den ordningen
(1 blockerar 2, 3, 5; 4 är fristående).
