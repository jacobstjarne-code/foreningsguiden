# DATATILLSTÅND + KÖPRUTAN — fyra tillstånd, ett system

*Från Design, 3 augusti 2026. Runda 2. Textversion av `foreningsguiden-huvudprocessen.html` (sektion "Runda 2", överst i filen). Läses med MOCKAR_huvudprocessen.md (runda 1) och GRANSKNING_2_foreningsguiden.md.*

Alla ytor: mobil 390 px · brödtext 16–18 px · knappytor ≥ 46 px · WCAG AA verifierat.

---

## Kärnbeslutet

**Tillstånd 1 och 2 är motsatser, inte varianter.**

"Gislaved anger ingen tidsgräns" är **ett svar vi verifierat** — det ska se ut som vilken färdig uppgift som helst.
"Ej angivet i källan" är **ett hål i vår kunskap** — det ska se ofärdigt ut och bära vägen dit hon kan kontrollera själv.

Skillnaden bärs av tre saker samtidigt, så den syns utan att man läser noga:

| | Ingen regel (2a) | Ej verifierat (2b) |
|---|---|---|
| **Ram** | heldragen | streckad inre ram |
| **Markör** | fylld grön punkt | hål (streckad ring) |
| **Utväg** | ingen behövs | källänk + felflagga |
| **Text** | full svärta | dämpad |

---

## Markörregeln — gäller överallt i systemet

```
FYLLD markör (--fg-accent)          = vi vet
HÅL (streckad --fg-void-line)       = vi vet inte
INGEN markör                        = det finns inget att veta
```

Håligheten har **samma form överallt** — ej verifierad uppgift, noll filterträffar, ofyllt utkastavsnitt. Tomrum är igenkännbart oavsett var på sajten hon står.

### Två hårda regler

1. **Oxblod används aldrig i ett tomrumstillstånd.** Den är reserverad för verifieringsstämpeln. Lånas den till "vi vet inte" läses osäkerhet som fara, och stämpeln urholkas.
2. **Ingen urgensfärg utan absolut datum.** Relativa frister och overifierade uppgifter får neutral statuspill, aldrig grön/gul/röd — färgen får inte påstå något datan inte bär.

---

## 2a — Kommunen har ingen regel

Kort: vitt, 2,5 px ram, **7 px grön** topplinje. Alltså identiskt med vilket verifierat bidragskort som helst.

```
[Kultur]                              ● Öppen   ← neutral fyrkantig tag +
Arrangemangsbidrag                                 grön status-pill
Sista ansökningsdag: 31 oktober 2026            ← mono 13 px
──────────────────────────────────────────────  ← 2 px streckad
HUR LÄNGE GÄLLER BESLUTET?                      ← mono 11 px uppercase
●  Gislaved anger ingen tidsgräns               ← FYLLD grön punkt 9 px,
   Vi har läst kommunens sida — där står           18 px bold i full svärta
   ingen gräns. Beslutet gäller tills
   kommunen säger annat.                        ← 15 px --muted
```

**Inget varningstecken.** Att flagga en frånvarande regel som osäkerhet gör det svårare för henne, inte lättare.

**Formuleringen är aktiv** — "anger ingen", inte "saknas". Det läses som kommunens val, inte som vår lucka.

---

## 2b — Vi har inte kunnat verifiera

Kort: vitt, 2,5 px ram, **7 px `--attention`** topplinje.

```
[Idrott]                              ● Öppen
Anläggningsbidrag
Sista ansökningsdag: 31 oktober 2026
──────────────────────────────────────────────
HÖGSTA BELOPP
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ← 2,5 px STRECKAD
│ ○  Ej angivet i källan                  │      --fg-void-line #8A8375,
│    Vi hittade ingen beloppsuppgift när  │      fyllning --fg-void-surface
│    vi läste kommunens sida 10 juli.     │      #FBFAF7
│    Det betyder inte att det saknas —    │
│    bara att vi inte kan stå för         │   ← HÅL 11 px, 2,5 px ring,
│    en siffra.                           │      transparent mitt
│  ┌────────────────────────────────────┐ │
│  │ Läs på gislaved.se              ↗ │ │   ← outline 2,5 px ink, 48 px
│  └────────────────────────────────────┘ │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
🛡 Vet ni beloppet? Säg till oss — vi          ← 14 px, felflaggning (G25)
   kontrollerar och rättar.
```

**Ett hål utan utväg är bara en ursäkt.** Källänken leder bort från oss — det är vad som gör tillståndet ärligt istället för undvikande.

**Luckan får en tidpunkt**, inte bara ett tillstånd: "när vi läste kommunens sida 10 juli".

---

## 2c — Fristen är relativ, inte ett datum

Det finns inget datum att visa — **hon bär andra halvan av uppgiften**. Renderas därför inte som datum alls.

```
[Utbildning]                        [Löpande]   ← NEUTRAL pill, 2 px ram,
Ledarutbildningsbidrag                             sunken fyllning.
Ingen gemensam sista dag — fristen                 INGEN urgensfärg.
räknas från er egen kurs.
──────────────────────────────────────────────
SÅ RÄKNAS ER FRIST
┌──────────────────────────────────────────┐
│  [KURSSLUT]   +   [60 DAGAR]             │   ← mono 17 px bold i
│  Ansökan ska vara inne inom 60 dagar        boxar, sunken bakgrund
│  efter att kursen avslutats.             │
└──────────────────────────────────────────┘

När slutade er kurs?                            ← 16 px bold
┌────────────────────────────────────────┐
│ åååå-mm-dd                          📅 │      ← 2,5 px ram, 52 px
└────────────────────────────────────────┘

┌──────────────────────────────────────────┐   ← --accent-soft, 2 px grön ram
│ ER SISTA DAG                             │
│ Måndag 14 september 2026                 │   ← 20 px bold
│ Kursslut 16 juli · om 6 veckor           │
│ ┌────────────────────────┐               │
│ │ 🔔 Påminn oss i augusti│               │   ← outline grön, 46 px
│ └────────────────────────┘               │
└──────────────────────────────────────────┘
```

**Statuspillen är "Löpande", inte en urgensgrad.** Urgens kräver ett datum; finns inget datum får ingen urgens visas — annars ljuger färgen. Först när hon fyllt i kursslut får raden en riktig frist, och då kan den bevakas.

Samma mekanik som giltighetskontrollen i runda 1 (1f), återanvänd.

---

## 2d — Filtret gav noll träffar

Får **aldrig** tyst falla tillbaka på ett orelaterat bidrag — då tror hon att det som visas *är* Funktionsrätt-bidraget.

```
FILTRERAT PÅ                                    ← mono 11 px uppercase
[Funktionsrätt ×]                               ← --ink fylld, vit text,
──────────────────────────────────────────────     15 px bold, radie 4
(0)  Inget bidrag i Gislaved är märkt            ← NOLLMARKÖR: 26 px,
     Funktionsrätt                                  2,5 px streckad ring,
     Kommunen har inga bidrag i den                 siffra --fg-void-ink
     kategorin. Föreningar med funktions-           #6E6859 mono bold
     rättsverksamhet söker oftast Kultur-
     eller Socialbidraget istället.             ← 19 px bold + 16 px

┌────────────────────────────────────────┐
│    Visa alla 5 bidrag i Gislaved       │      ← grön primär, 54 px
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│ 🔔 Säg till om ett tillkommer          │      ← outline, 54 px
└────────────────────────────────────────┘
Vi läser Gislaveds sida var fjortonde dag.      ← 14 px --muted
Dyker ett funktionsrättsbidrag upp mejlar
vi er.
```

**Nollan får samma hålighet som 2b** — streckad ring, så tomrum ser likadant ut i hela systemet.

**Andra knappen är bevakning vid högsta möjliga avsikt:** hon har just letat efter något som inte finns. Ingen betalning inblandad.

---

## 2e — Köprutan, 249 kr

Svaret på "vad ska den visa utan att lova mer än vad som levereras": **en innehållsförteckning med sanningen i sig.**

```
STEG 5 · VÄGENS SLUT
Utkast till er ansökan                          ← Archivo 800, 24 px
Arrangemangsbidraget bedöms mot fyra krav.
Vi skriver ett underlag som bemöter alla
fyra, med era svar redan inne.                  ← 17 px
──────────────────────────────────────────────
VAD UTKASTET INNEHÅLLER          4 / 6 IFYLLDA  ← mono 12 px bold
──────────────────────────────────────────────
✓ Föreningens verksamhet — från era svar        ← grön bock i --accent-soft
✓ Målgrupp och medlemsunderlag — från era svar     cirkel 20 px
✓ Hur ni möter Gislaveds fyra krav —
  formulerat mot kommunens egna kriterier
✓ Bilagelistan — vad som ska med och var
  det laddas upp
○ Arrangemangets namn, datum och plats —        ← HÅL, streckad ring 20 px,
  tomma fält, det vet bara ni                      rubrik i ink, resten muted
○ Budget för arrangemanget — tomma fält
  med rubriker kommunen vill se
──────────────────────────────────────────────
Ett arrangemangsbidrag kan vi inte fylla        ← sunken ruta, 15 px
helt — datum och budget finns bara hos er.
Vi lämnar de fälten tomma med rätt
rubriker, i stället för att gissa.
──────────────────────────────────────────────
▸ Se ett exempelutkast först                 +  ← <details>, 44 px
──────────────────────────────────────────────
Utkast, inkl. moms                     249 kr   ← sunken band
199,20 kr + 49,80 kr moms. Kvitto med
org.nr mejlas direkt.
┌────────────────────────────────────────┐
│           Skriv vårt utkast            │      ← grön primär, 56 px
└────────────────────────────────────────┘
Mejlas som Word och PDF, ligger kvar i er
profil. Ansökan lämnar ni in själva, och
beslutet fattar kommunen.
──────────────────────────────────────────────
🛡 Går det inte att använda betalar vi
   tillbaka. Säg till inom 30 dagar.
```

### Varför "4 / 6 ifyllda" är säljargumentet, inte en brasklapp

Det löser 90/60-problemet — hon ser färdigheten **före** köpet, inte efter. Talet kommer ur datan:

- **Driftbidrag / verksamhetsbidrag:** 6 / 6 — profilen räcker
- **Arrangemangsbidrag:** 4 / 6 — datum och budget finns bara hos henne

Samma komponent, olika tal. Att säga vad vi *inte* kan fylla är det enda som gör resten trovärdigt.

De streckade ringarna är samma tomrumsmarkör som i 2b och 2d — hon har redan lärt sig vad formen betyder på kommunsidan.

---

## Tokenkontraktet — nytt i `foreningsguiden-tokens.css`

```css
:root {
  --fg-void-line:    #8a8375;   /* streckad ram + hålmarkör — 3,1:1 non-text */
  --fg-void-surface: #fbfaf7;   /* fyllning i ofärdig behållare */
  --fg-void-ink:     #6e6859;   /* siffra/glyf i tomrum — 4,6:1 text */
}
```

Klasser: `.fg-void` (behållare) · `.fg-void-mark` (hålmarkör) · `.fg-void-count` (nollmarkör) · `.fg-formula` (relativ frist).

Komponentnamn registrerade i tokenreferensen: **VoidState · VoidMark · RelativeDeadline · ZeroResult.**

Alla tre färger klarar WCAG AA (kontrollerat i renderad yta, inte uppskattat).

---

## Vad Code behöver veta

1. **Tillstånd 1 och 2 är olika komponenter**, inte en komponent med en flagga. De har motsatt visuell logik.
2. **Håligheten är en delad primitiv** — samma streckade ring i `.fg-void-mark`, `.fg-void-count` och de ofyllda raderna i köprutan.
3. **`4 / 6` beräknas ur datan** — vilka avsnitt profilen kan fylla för just den bidragstypen. Hårdkoda inte.
4. **Relativ frist har två tillstånd:** ofylld (formel + inputfält, ingen urgens) och räknad (absolut datum + bevakningsknapp). Urgensfärg tillåts först i det andra.
5. **Noll träffar renderar aldrig en fallback-lista** som kan misstas för filterresultatet.

---

*Systemet oförändrat i övrigt: "civil klarhet med skav", oxblod reserverad för verifiering, urgens-modellen, WCAG AA-golv, 16 px brödtext.*
