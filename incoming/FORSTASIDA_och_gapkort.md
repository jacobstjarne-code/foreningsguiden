# FÖRSTASIDAN + GAP-KORTET — runda 3

*Från Design, 3 augusti 2026. Textversion av sektionen "Runda 3" (överst i `foreningsguiden-huvudprocessen.html`). Läses med DATATILLSTAND_och_koprutan.md (runda 2) och MOCKAR_huvudprocessen.md (runda 1).*

Mobil 390 px · brödtext 16–18 px · knappytor ≥ 48 px · WCAG AA.

---

## G1 — Förstasidan, bevis överst

**Ordningen är hela ändringen:** ingress → CTA → **deadlinetabell** → kommunval. Tabellen är sidans bevis att tjänsten lever; 290 kommunnamn är det inte.

```
FÖRENINGSGUIDEN                               ← mono 11 px uppercase
Vet vad din förening kan söka                 ← Archivo 800, 29 px
Kommunala föreningsbidrag, lästa ur
kommunernas egna sidor. Svara på fyra
frågor och se vad som gäller er — eller
bläddra i deadlinerna nedan.                  ← 17 px

┌────────────────────────────────────────┐
│ Se vad ni kan söka                   → │    ← grön, 54 px
└────────────────────────────────────────┘
Gratis. Inget konto, ingen mejladress.        ← 14 px --muted
──────────────────────────────────────────────  ← 2,5 px, sunken band nedan
NÄRMASTE DEADLINES              412 TOTALT    ← mono 11 px + mono 12 px bold
En missad deadline kan betyda uteblivet
bidrag.                                       ← 15 px --muted
──────────────────────────────────────────────
● 4 AUGUSTI · OM 1 DAG                     ›  ← prick --urgent 10 px,
  Miljöpeng                                      mono 13 px i samma färg
  Kalmar                                      ← 17 px bold + 15 px muted
──────────────────────────────────────────────
● 14 AUGUSTI · OM 11 DAGAR                 ›  ← prick --attention
  Hållbarhetsbidrag
  Österåker
──────────────────────────────────────────────
● 31 AUGUSTI                               ›  ← prick --accent, mono i --muted
  Driftbidrag                                    (ingen urgens = ingen färgtext)
  Gislaved
──────────────────────────────────────────────
Se alla 412 deadlines                      →  ← grön länkrad, 50 px
──────────────────────────────────────────────
ELLER VÄLJ KOMMUN                             ← mono 11 px uppercase
┌────────────────────────────────────────┐
│ 🔍  Skriv kommunens namn               │    ← 2,5 px ram, 54 px
└────────────────────────────────────────┘
Jönköpings län                          9 +   ← 17 px bold + mono antal,
Kalmar län                              7 +      rader 48 px
Stockholms län                         21 +
Visa alla 21 län ↓                            ← grön, 15 px
```

### Tre beslut

1. **Läget är en prick, inte en kolumn.** Fyra kolumner (läge, datum, bidrag, kommun) ryms inte på 390 px. Färgad prick + utskriven relativ tid bär samma information på två rader, och datumet står alltid i klartext.
2. **Urgensfärgen sitter i både prick och datumtext** när den finns. Rader utan urgens har grön prick och `--muted` datumtext — ingen färg som påstår brådska.
3. **Länen kollapsade med antal.** Samma komponent som fråga 1 i tratten (runda 1, 1b): sökfält först, listan utfälld på hubben för crawlbarhet, kollapsad i tratten.

---

## G2 — Gap-kortet, två tillstånd

### Kärnbeslutet

**D2 är inte ett tomt D1.**

Ett trasigt resultat saknar innehåll. En ärlig gräns säger vad vi vet, vad vi inte vet, och var hon kontrollerar själv. Därför bär D2 tre säkra rader under hålet — det är hela skillnaden mellan "ofärdig" och "sönder".

---

### D1 — kravdata finns: checklista med tre markörer

Kort: vitt, 2,5 px ram, **7 px `--attention`** topplinje.

```
[Kultur]                              ● Nära   ← neutral tag + attention-pill
Arrangemangsbidrag                            ← Archivo 800, 22 px
Gislaved · sista dag 31 oktober 2026          ← mono 13 px
──────────────────────────────────────────────
SÅ STÅR NI MOT KRAVEN            2 AV 4 KLARA
──────────────────────────────────────────────
● Verksamhet i Gislaveds kommun               ← FYLLD grön 19 px + vit bock
  Ni angav Gislaved.
──────────────────────────────────────────────
● Öppet publikt arrangemang                   ← FYLLD
  Följer av er verksamhetstyp.
──────────────────────────────────────────────
(!) Godkänd som bidragsberättigad             ← RING --attention + "!"
    Detta saknas — och det tar tid.              heldragen 2,5 px,
    Börja här.                                   attention-soft fyllning
──────────────────────────────────────────────
(○) Arrangemanget hålls i kommunen            ← HÅL, streckad --void-line,
    Vet bara ni — vi kan inte avgöra det.        rubrik i --void-ink
──────────────────────────────────────────────
● Uppfyllt   (!) Saknas   (○) Okänt           ← legend, 13 px, SAMMA yta
```

### Markörregeln har fyra former, inte tre

Detta är en utvidgning av regeln från runda 2, och den är dokumenterad i `foreningsguiden-tokens.css`:

| Form | Betyder | Vems lucka |
|---|---|---|
| **Fylld** `--fg-accent` | vi vet, och det är uppfyllt | — |
| **Ring + "!"** `--fg-attention` | vi vet, och det **saknas** | **hennes** — åtgärdbar |
| **Hål**, streckad `--fg-void-line` | vi vet inte | **vår** — kan bara kontrolleras vid källan |
| **Ingen markör** | det finns inget att veta | — |

**Skiljelinjen mellan form 2 och 3 är vems lucka det är.** "Saknas" kan hon göra något åt; "okänt" kan hon bara kontrollera hos kommunen. Att rendera dem likadant vore att be henne åtgärda vår okunskap.

Ny klass: `.fg-mark-missing`. **Aldrig oxblod** — ett ouppfyllt krav är en uppgift, inte en fara.

**Legenden ligger på samma yta**, aldrig utanför. Semantisk färg kräver en nyckel där den används.

---

### D2 — kraven inte kartlagda

Kort: vitt, 2,5 px ram, **7 px `--void-line`** topplinje. Topplinjen är det första som skiljer korten: attention = något att göra, void-line = något vi inte vet.

```
[Social]                        (○) Kan gälla er  ← NEUTRAL pill, void-surface
Verksamhetsbidrag social                             fyllning, 2 px void-line
Gislaved · sista dag 31 januari 2027                 ram, HÅL som markör.
──────────────────────────────────────────────       Ingen grön/gul/röd.
SÅ STÅR NI MOT KRAVEN
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ ○  Kraven är inte kartlagda ännu        │   ← 2,5 px streckad void-line,
│    Bidraget finns och er verksamhets-   │      void-surface fyllning
│    typ stämmer — men kommunen
│    publicerar villkoren i en
│    föreskrift vi inte läst in. Vi kan
│    inte säga om ni uppfyller dem.
│  ┌────────────────────────────────────┐ │
│  │ Läs villkoren på gislaved.se    ↗ │ │   ← outline 2,5 px, 48 px
│  └────────────────────────────────────┘ │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

DET VI VET                                    ← detta är hela skillnaden
● Sista ansökningsdag 31 januari 2027,           mellan ofärdig och trasig
  läst 10 juli.                               ← fyllda gröna 9 px prickar
● Riktat till föreningar med social
  verksamhet — det ni angav.
● Ansökan görs via kommunens e-tjänst.
──────────────────────────────────────────────
┌────────────────────────────────────────┐
│ 🔔 Säg till när kraven är inlästa      │    ← outline, 52 px
└────────────────────────────────────────┘
Vi läser in villkoren efter hand. Ett mejl
när det här bidraget är klart.
```

### Fyra beslut i D2

1. **"Det vi vet" är obligatoriskt.** Utan de tre säkra raderna läses kortet som ett fel. Med dem läses det som en tjänst som är ärlig om sin gräns.
2. **Statuspillen är "Kan gälla er" med hål**, inte en urgensfärg. Ingen urgens utan kartlagda krav — samma regel som relativ frist i runda 2 (2c).
3. **Utvägen är källänk + bevakning, aldrig köpknapp.** Vi säljer inte ett utkast mot krav vi inte läst. Bevakningen är dessutom vid hög avsikt: hon har just hittat något som kan gälla henne.
4. **Ingen oxblod i något av tillstånden.** Reserverad för verifieringsstämpeln.

---

## G3 — kvarstår, med anledning

**Köprutans kravtäckningsrad** sitter i 2e (runda 2) och är oförändrad: två axlar, aldrig ett tal.

- *Era uppgifter:* `4 / 6 avsnitt ifyllda` — vad hon själv måste göra
- *Vår kravbild:* `2 / 11 villkor inlästa` — hur mycket vi hunnit läsa

Raden väntar bara på **D1 som definition** av när den får påstå täckning. Komponenten har redan två lägen: `krav_fullstandiga = false` ger tomrumsvokabulär med källänk; `true` vänder samma rad till en styrka ("Alla elva villkor inlästa") med fylld punkt och heldragen ram.

**2b-exemplet står kvar märkt "avvaktar data".** Anläggningsbidraget har belopp i källan sedan 3 augusti, så mocken visar fel fält. Mönstret gäller; fältet byts när 26-postkörningen gett de första verkliga `ingen_regel`-posterna. Jag ritar inte om mot en gissning — tredje gången ett påhittat värde hamnar i en mock är en gång för mycket.

---

## Tokenkontraktet — nytt i runda 3

```css
.fg-mark-missing {   /* ring 19 px, 2.5px solid --fg-attention,
                        --fg-attention-soft fyllning, mono "!" */ }
```

Markörregeln i filen är uppdaterad till fyra former med skiljelinjen utskriven.

Komponentnamn registrerade: **MissingMark · RequirementList · GapCard** (plus VoidState, VoidMark, RelativeDeadline, ZeroResult från runda 2).

---

## Vad Code behöver veta

1. **D1 och D2 är samma komponent med två lägen**, styrt av om kravdata finns — men de har olika topplinje, olika statuspill och olika utväg.
2. **`.fg-mark-missing` är en fjärde markörform**, inte en variant av hålet. Bygg den separat.
3. **D2 renderar aldrig utan "Det vi vet".** Finns inga säkra fält att visa ska bidraget inte renderas som gap-kort alls.
4. **Deadlineraden på förstasidan bär urgensfärg i både prick och datumtext**, eller ingen av dem. Aldrig färgad prick med neutral text.
5. **Legenden hör till checklistan**, inte till sidan. Renderas den utan legend är den semantiska färgen otolkad.

---

*Systemet oförändrat i övrigt: "civil klarhet med skav", oxblod reserverad för verifiering, urgens-modellen, WCAG AA-golv, 16 px brödtext.*
