# RESEARCH_SPEC v3: Haiku-modell och explicita beslutsregler

*Opus/Fable 2026-07-24. Bygger på v2.1 (som gäller i sin helhet där inget här ändras). Två nyheter: (1) ett blindtest som avgör om Claude Haiku kan köra passet i stället för Sonnet, och (2) beslutsreglerna som satt i agentens omdöme i batch 1–2 skrivs nu ut explicit — vilket krävs för att testet ska mäta modellen och inte specens luddighet, och som gör specen bättre oavsett modell.*

---

## DEL A — VARFÖR EXPLICITA REGLER FÖRST

I batch 1–2 fungerade metoden för att Sonnet-agenten hade omdöme: den skilde stipendiets form från dess målgrupp (Skellefteå), vägrade skriva ett bidrag vars käll-URL gav 404 (Karlstad), kände igen fel kommuns PDF (Piteå/Tyresö). Inget av det stod i specen — det satt i modellen.

Ska en billigare modell kunna köra passet måste omdömet flyttas från modellen till specen, så långt det går. Det som återstår som genuint omdöme efter det är måttet på om Haiku räcker. Reglerna nedan är alltså inte nya krav — de är det tidigare implicita, gjort explicit.

---

## DEL B — BESLUTSREGLER (gäller alla modeller)

### B1. Splitregeln — när är två bidrag ett, och när är de två?

Två poster på samma sida/URL är **separata bidrag** om minst ETT av följande skiljer dem:
- olika **belopp** eller beloppsmodell (tak, procent, schablon)
- olika **deadline** eller deadlinetyp
- olika **målgrupp** (t.ex. barn/ungdom vs. pensionär, idrott vs. kultur)
- olika **krav** eller förutsättningar

De är **samma bidrag** (skriv som en post) om de bara skiljer sig i:
- exempel på vad pengarna kan användas till
- formuleringsvarianter av samma villkor
- rubriknivå på samma sida utan egen ansökningsväg

*Bevis att regeln behövs: Skellefteå 9→50 och Karlstad 6→27 uppstod för att v1 slog ihop poster som skilde sig i belopp/deadline/målgrupp. Det får inte hända, och sammanslagning utan att ett av kriterierna ovan är uppfyllt får inte heller hända (konstgjord uppdelning för att blåsa upp antal).*

### B2. Uteslutningstabellen — vad får INTE skrivas som bidrag

Uteslut ENDAST med kategoriskt skäl, loggat i `tackning.log` som `MEDVETET_UTESLUTET`:

| Skäl | Exempel | Giltigt? |
|---|---|---|
| Stöd eller pris som enbart kan sökas av eller ges till privatpersoner | Slanten i Tranås, individuellt kulturstipendium | JA, uteslut |
| Riktar sig enbart till företag | näringslivsstöd utan föreningar i målgruppen | JA, uteslut |
| Annan huvudman än kommunen | statligt aktivitetsstöd som betalas av RF, fristående stiftelse | JA, uteslut |
| Stöd som en förening kan söka, även om privatpersoner eller andra också kan söka | evenemangsstöd öppet för föreningar och privatpersoner | NEJ, skriv det och notera den bredare sökandekretsen |
| Stipendium/pris som uttryckligen KAN gå till förening | stipendium med förening som möjlig målgrupp | NEJ, skriv det |
| "För att hålla filen hanterbar" | — | NEJ, förbjudet skäl |
| "Nischat" / "liten målgrupp" | — | NEJ, förbjudet skäl |
| "Liknar ett annat bidrag" | — | NEJ, förbjudet skäl |
| Tidsbrist | — | NEJ, förbjudet skäl |

Nyckelskillnaden är målgruppen: ta bara bort stöd som **uteslutande** gäller privatpersoner eller som betalas av en annan huvudman. Om en förening kan söka ska posten skrivas, även när privatpersoner eller andra också kan söka. Den bredare sökandekretsen ska då framgå av posten eftersom den påverkar konkurrensen om medlen. Skilj också stipendiets form (att det heter stipendium) från dess målgrupp.

### B3. Källkonfliktregeln (från v2.1 §2.5, upprepad som beslutsregel)
Två officiella källor, olika värde för samma fält:
- Olika datum → **nyare vinner**, oavsett källtyp (regelverk eller webbsida)
- Samma datum eller datum saknas → **nollställ fältet**, båda värdena i `anteckning`
- Logga alltid i `konflikter.log`

### B4. 404-regeln
Ett bidrag får INTE skrivas om dess `kalla_url` inte svarar 200 vid hämtning, även om andra källor (pressmeddelanden, äldre sidor) bekräftar att det finns. Logga som `EJ_VERIFIERBAR` i `tackning.log`. *(Karlstad-fyndet: IOP:t uteslöts korrekt trots känd existens, för URL:en gav 404.)*

### B5. Fel-kommun-kontrollen
Innan en PDF eller sida används som källa: bekräfta att kommunnamnet i dokumentet matchar kommunen som bearbetas. *(Piteå fick nästan Tyresös dokument, Ystad nästan Östermalms — fångat i batch 2 av agentens omdöme, nu en explicit kontroll.)*

### B6. Deadline-likformighetskontrollen (från v2.1 §2.6)
Om ≥3 bidrag delar exakt samma deadline: kontrollera i källan om det är en genuin delad regel (t.ex. "senast 3 mån efter verksamhetsår") eller en bar-över-bugg. Dokumentera slutsatsen. Bär aldrig över ett datum mellan bidrag utan att det står i källan för vart och ett.

---

## DEL C — HAIKU-BLINDTESTET

### C1. Syfte
Avgöra om Claude Haiku, med de explicita reglerna i Del B, producerar samma täckning och samma uteslutningsbeslut som Sonnet gjorde — mot fem kommuner där vi redan har facit.

### C2. Testuppsättning
Kör Haiku mot RESEARCH_SPEC v3 (denna fil) på **fem redan gjorda kommuner**, valda för att spänna svårighetsgraden:

| Kommun | Prövar | Sonnet-facit (antal bidrag) |
|---|---|---|
| Skellefteå | stor, flera förvaltningar, många splitbeslut | 50 |
| Karlstad | flera bidrag på en URL, 404-beslut | 27 |
| Solna | liten, smalt utbud (golv-test) | 9 |
| Halmstad | JS-renderad portal, källkonvergens | 21 |
| Piteå | fel-kommun-PDF-fälla | (batch 2-tal) |

Haiku kör i egen worktree/branch (`haiku-test`), rör aldrig main eller de befintliga filerna. Output jämförs, skrivs inte över facit.

### C3. Mätning — tre tal per kommun
1. **Täckningsdifferens:** antal bidrag Haiku skrev vs. Sonnets facit. Mål: samma ±1 (en enstaka gränsdragning tillåten).
2. **`I_KALLA_EJ_SKRIVET`:** bidrag i facit som Haiku missade. Mål: **noll**. Detta är det hårda måttet — en missad täckning är felet hela metoden finns för att förhindra.
3. **Falska bidrag:** poster Haiku skrev som Sonnet korrekt uteslöt eller slog ihop (uppblåsning via felaktig split, eller skrivet trots kategoriskt uteslutningsskäl). Mål: noll.

### C4. Grind — Fable granskar
Fable läser Haikus fem filer mot facit och källorna. Godkänt om:
- Täckningsdifferens ≤1 per kommun
- Noll `I_KALLA_EJ_SKRIVET` över alla fem
- Noll falska bidrag
- Konfliktloggen visar att Haiku tillämpade B3/B4 (nollställde vid konflikt, uteslöt vid 404) snarare än att gissa

**Utfall:**
- **Alla tre måtten gröna på alla fem** → Haiku skalar. Kör återstående ~210 kommuner på Haiku.
- **Grönt på de enkla (Solna, Halmstad) men rött på de svåra (Skellefteå-split, Piteå-fälla)** → Haiku klarar enkla kommuner men inte omdömesfallen. Möjlig hybrid: Haiku förstapass, Sonnet-granskning av kommuner med >20 bidrag eller flaggade konflikter.
- **Rött på `I_KALLA_EJ_SKRIVET` någonstans** → Haiku räcker inte. Fortsätt på Sonnet. Testet kostade fem kommuner, inte femtio.

### C5. Behörighetslista (löser 400-klick-problemet)
Innan körning: skriv `.claude/settings.local.json` med allowlist som täcker, med **mönster inte uppräkning**:
- webbhämtning mot godtycklig `.se`-domän (kommuner, portaler, PDF-värdar)
- `curl` och `pdftotext` i bash (flera "oläsbara" PDF:er var läsbara denna väg)
- skrivning till `data/kommuner/**` och de tre loggfilerna
- `git add`/`commit` på testbranchen

Utanför listan (ska fortsatt kräva godkännande): `src/`, push till main, alla raderingar. Visa listan innan körning. Verifiera efter 10 kommuner att inga prompts kommit — kommer de, saknas ett mönster; fixa då, inte efter 40.

---

## DEL C2 — YAML-SCHEMA (OBLIGATORISKT)

Före extraktion: **öppna och läs gislaved.yaml fält för fält**. Matcha detta schema exakt. Ingen extra fält (ingen metadata, noteringar, kontaktperson, telefon).

**Top-level fält (krävs):**
```yaml
kommun: "Kommunnamn"
kommun_slug: "kommunslug"
lan: "Länsnamn"
befolkning: 12345
forvaltning: "Förvaltningens namn"
ansokningssystem:
  namn: "Systemnamn"
  url: "https://..."
kalla_url: "https://primär-källa"
verifierad: 2026-07-25
bidrag: []
forutsattningar: []
```

**Per bidrag i `bidrag[]` (krävs):**
```yaml
- id: "kommun-bidrag-slug"
  namn: "Officiellt namn från källa"
  kategori: ["idrott", "kultur", "ovrig", ...]  # array av strings
  malgrupp: "Målgrupp enligt källa"
  deadlines:
    typ: "fasta" eller "lopande"
    datum: ["MM-DD", "MM-DD"]  # tom array om lopande
  krav: ["krav 1", "krav 2", ...]  # array av strings
  belopp: null eller "beskrivning av belopp"
  sen_ansokan: "Text från källa eller 'Ej angivet i källan'"
  kalla_url: "URL som verifieras (måste svara 200)"
  anteckning: null eller "notering"
  # Matchningsfälten (DEL E) — lägg till där källan faktiskt anger dem,
  # annars null. Fälten SKA finnas i varje bidrag-post (null räknas inte
  # som "extra fält" — se DEL E1).
  min_medlemmar: null eller heltal
  alder_min: null eller heltal       # medlemmarnas ålder, INTE föreningens
  alder_max: null eller heltal
  min_verksamhetstid_manader: null eller heltal
  foreningstyp: null eller lista av Verksamhet-värden (DEL E2)
  kraver_registrering: null, true eller false
  sate_i_kommunen: null, true eller false
```

**Validering (OBLIGATORISK):** Kör `loadKommuner()` (se `src/lib/kommuner.ts`) på varje genererad YAML-fil. En fil som inte validerar är inte klar.

---

## DEL E — MATCHNINGSFÄLTEN (schema klart, extraktion är NÄSTA pass uppgift)

Code har byggt schemat, valideringen och matchningsmotorn (`src/lib/kommuner.ts`,
`src/lib/matching.ts`) som matchningstratten (`/matcha/`) kör mot. Vad som
INTE är gjort: att fylla i dessa sju fält för de 80 redan skrivna
kommunerna. Det är den här sektionens jobb för nästa research-pass.

### E0. Vad det här är
Infrastrukturen är klar. Extraktionen är INTE gjord. Fyll i fälten där
källtexten (`krav`, `malgrupp`) faktiskt anger dem — hitta ALDRIG på ett
värde för att fylla en lucka.

### E1. Nollregeln (upprepning av B-reglernas anda, gjort explicit för fältnivå)
`null` = "fältet är inte undersökt/inte angivet i källan", ALDRIG "kravet
är noll". Skriv `null`, inte `0`, om källan inte nämner ett minimiantal
medlemmar. Ett `null`-fält matchar ALLTID i motorn — filtrerar aldrig
bort ett bidrag. Att gissa ett värde för att "se mer komplett ut" är
värre än att lämna det `null`.

### E2. De sju fälten, typ + extraktionskälla

| Fält | Typ | Källa i befintlig text | Exempel |
|---|---|---|---|
| `min_medlemmar` | `number \| null` | `krav` | "Minst 10 medlemmar" → `10` |
| `alder_min` / `alder_max` | `number \| null` | `krav`/`malgrupp` — **medlemmarnas** ålder | "för barn och unga 7–25 år" → `7` / `25` |
| `min_verksamhetstid_manader` | `number \| null` | `krav` — **föreningens egen** ålder, INTE medlemmarnas | "varit verksam minst 6 månader" → `6` |
| `foreningstyp` | `Verksamhet[] \| null` | `malgrupp` i första hand | "Kulturföreningar med säte i kommunen" → `["kultur"]` |
| `kraver_registrering` | `boolean \| null` | `krav`, jämfört mot kommunens `forutsattningar` | se E3 |
| `sate_i_kommunen` | `boolean \| null` | `krav`/`malgrupp` | "Säte i Gislaveds kommun" → `true` |

**`Verksamhet`-taxonomin** (matchningstrattens EGEN, se `src/lib/kommuner.ts`
`VERKSAMHETER`): `idrott`, `kultur`, `hembygd`, `friluft`, `social`,
`ungdom`, `annat`. Detta är INTE samma lista som `kategori`/`KATEGORIER`
(idrott/kultur/social/pensionar/funktionsratt/ovrig) — se E3.

### E3. Skillnaden mot `kategori` och `forutsattningar`
- **`foreningstyp` ≠ `kategori`.** `kategori` styr bidragets NAVIGERING
  (`/kommun/[slug]/[kategori]/`) och är redan obligatorisk. `foreningstyp`
  är ett HÅRDARE behörighetsfilter — vilken typ av förening som får söka
  — i `Verksamhet`-taxonomin ovan, inte `Kategori`-taxonomin. Mappa inte
  mekaniskt 1:1 mellan de två listorna; läs `malgrupp`/`krav` och avgör
  vilka `Verksamhet`-värden som faktiskt stämmer.
- **`kraver_registrering` är per BIDRAG**, skilt från kommunens
  `forutsattningar[]` (kommun-nivå, redan i schemat — steg som krävs
  innan NÅGOT bidrag i kommunen kan sökas). Sätt `true` bara när källan
  uttryckligen kopplar just DETTA bidrag till kommunens
  bidragsberättigad-status (t.ex. "kräver att föreningen är godkänd
  bidragsberättigad förening"). `null` om det inte går att avgöra av
  källtexten — anta inte att det gäller bara för att kommunen har
  `forutsattningar`.

### E4. Före/efter-exempel
Ur `data/kommuner/berg.yaml`, bidraget `berg-drift-underhall`:

```yaml
krav:
  - "Föreningsägd anläggning; kostnader redovisas och styrks med resultatrapport"
  - "Minst tio mantalsskrivna medlemmar i Bergs kommun; säte och huvudsaklig verksamhet i kommunen"
  - "RF-anslutna idrottsföreningar ska ha beviljats statligt och kommunalt aktivitetsstöd"
```

→ extraheras (facit för hur en "grovt matchad" post ska se ut — resten
`null` tills mer går att utläsa med säkerhet):

```yaml
min_medlemmar: 10
sate_i_kommunen: true
foreningstyp: null      # "idrottsföreningar" nämns bara i ETT av tre krav-villkor, inte i malgrupp — inte säkert nog att låsa till ["idrott"]
kraver_registrering: null
alder_min: null
alder_max: null
min_verksamhetstid_manader: null
```

---

## DEL D — OM HAIKU INTE RÄCKER

Då är fallback Sonnet på samma v3-spec — reglerna i Del B gör passet bättre och snabbare även för Sonnet, så arbetet är inte bortkastat. Prioritetsordning oförändrad: bandykommuner först (förbundspiloten), sedan största folkmängd, sedan alfabetiskt. Batchstorlek 50, grind mellan batcher om täckningsavvikelser stiger (v2.1 §6).
