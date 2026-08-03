# TILLSTÅNDET OLAST — runda 4

*Från Design, 3 augusti 2026. Textversion av sektionen "Runda 4" (överst i `foreningsguiden-huvudprocessen.html`). Läses med FORSTASIDA_och_gapkort.md (runda 3) och DATATILLSTAND_och_koprutan.md (runda 2).*

Mobil 390 px · brödtext 16–18 px · WCAG AA.

---

## Utgångspunkten

Statusfälten har fyra värden: `kontrollast`, `ingen_regel`, `olast`, `okand`. (Datavärdet hette `verifierad` i briefen — se ordvalsbeslutet nedan.) Runda 2 ritade ytterlägena. **Detta är mitten** — och efter migreringen är det ~5 000 fält, alltså sajtens normalläge det närmaste halvåret.

**Det avgör allt: ett normalläge får inte skrika.** Om varje oläst fält ropar blir sajten en varningsskylt, och då slutar hon se skillnaden mot de fält som faktiskt är verifierade. Samtidigt får det inte se ut som en verifierad uppgift — då är stämpeln värdelös.

---

## Kärnbeslutet: streckningen flyttar mellan nivåer

Runda 2 satte streckningen på behållaren. `olast` sätter den på **markören** och lämnar behållaren vanlig.

| Tillstånd | Markör | Behållare | Värdet |
|---|---|---|---|
| **kontrollast** | fylld `--fg-accent` | vanlig | full svärta |
| **olast** | **streckad** `--fg-void-line` | **vanlig** | **full svärta** |
| **ej angivet** | streckad | **streckad** | finns inte |

**Värdet dämpas aldrig i olast.** Det är kommunens siffra, inte en gissning. Att dämpa den skulle påstå att uppgiften är osäker — det är *vår läsning* som är oavklarad, inte kommunens uppgift.

---

## 4a — Tre tillstånd, samma fält

Fältet "Högsta belopp, Anläggningsbidrag" i tre lägen, staplade så skillnaden syns:

```
SAMMA FÄLT · TRE TILLSTÅND
Högsta belopp, Anläggningsbidrag
──────────────────────────────────────────────
KONTROLLÄST · en människa har stämt av         ← mono 11 px, --accent
● 210 kr per medlem                            ← FYLLD 11 px, 19 px bold
  Tak 75 % av kostnaden. Kontrolläst
  10 juli 2026.                                ← 15 px --muted
──────────────────────────────────────────────  bakgrund: --void-surface ↓
OLÄST · uppgiften finns, vi har inte läst den  ← mono 11 px, --void-ink
○ 210 kr per medlem                            ← STRECKAD ring 11 px,
  Hämtad från kommunens sida, inte                värdet i FULL SVÄRTA
  kontrolläst av oss. Stäm av mot källan
  innan ni räknar på den.
──────────────────────────────────────────────
EJ ANGIVET · vi har ingen uppgift
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    ← STRECKAD BEHÅLLARE
│ ○  Ej angivet i källan                │       + streckad markör
│    Vi hittade ingen beloppsuppgift    │
│    när vi läste sidan.                │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

Olast-raden har `--void-surface` som bakgrund — tillräckligt för att raden läses som ett annat läge, inte tillräckligt för att den skriker.

---

## 4b — Hela kortet i olast

Kort: vitt, 2,5 px ram, **7 px `--void-line`** topplinje.

```
[Idrott]                     (○) Ej kontrolläst  ← pill: void-surface fyllning,
Anläggningsbidrag                                   2 px void-line ram,
Gislaved · sista dag 31 augusti 2026                HÅL som markör
──────────────────────────────────────────────
┃ ○ Två av uppgifterna nedan är hämtade ur     ← EN reservation, 4 px
┃   Gislaveds sida men inte kontrollästa          void-line vänsterkant,
┃   av oss. Streckad markör betyder oläst        void-surface fyllning
┃   fält. Stäm av mot kommunen innan ni
┃   ansöker.
──────────────────────────────────────────────
UPPGIFTER
● Sista ansökningsdag                          ← FYLLD — kontrolläst
  31 augusti 2026
──────────────────────────────────────────────
● Högsta belopp                                ← FYLLD — kontrolläst
  210 kr per medlem, tak 75 % av kostnaden
──────────────────────────────────────────────
○ Målgrupp                                     ← streckad
  Föreningar som äger eller hyr egen anläggning
──────────────────────────────────────────────
○ Krav                                         ← streckad
  Fyra villkor, se kommunens sida
──────────────────────────────────────────────
┌────────────────────────────────────────┐
│ Läs på gislaved.se                  ↗ │      ← outline, 50 px
└────────────────────────────────────────┘
🛡 Ser ni något som inte stämmer? Säg till
   — vi rättar.
```

### Fem beslut

1. **Reservationen står en gång per kort.** Per fält blir 5 000 upprepningar — och en varning som upprepas slutar vara en varning.
2. **Blandade kort är normalfallet.** Här: deadline och belopp kontrollästa (210 kr/medlem, tak 75 % — kända ur källan), målgrupp och krav olästa.
3. **Statuspillen säger "Ej kontrolläst"**, inte "Osäker" eller "Kan vara fel" — reservationen gäller *vårt* arbete.
4. **Ingen oxblod, ingen attention.** Oläst är varken fara eller en uppgift åt henne — det är vår kö.
5. **Ingen köpknapp på olast-kort.** Köprutans grind står på kontrolläst + minst tre krav; tills dess bär bevakningsrutan ytan.

---

## 4c — Samma form på sex ytor

Arvika blev motsägelsefull för att **sammanfattningen påstod och kortet förnekade**. Botemedlet är inte mer text — det är att markören följer värdet ut på varje yta.

| Yta | Hur olast bärs |
|---|---|
| **1 · Svar-först på ekern** | inline 9 px hål efter varje osäkert substantiv: "Beloppen○ och kraven○ är hämtade … men inte kontrolläst" |
| **2 · Steg 4-listan** | 11 px hål före bidragsnamnet |
| **3 · Deadlinekalendern** | 11 px hål först i raden, före datumet |
| **4 · Förstasidans närmaste** | 11 px hål **i urgensfärgen** — samma prick som annars, streckad |
| **5 · FAQ** | 11 px hål + reservation i svaret |
| **6 · Kortet** | 11 px hål per fält (som 4b) |

### Form och färg är oberoende axlar

Detta föll ut av rättningen på yta 4, och är nu en systemregel:

| Axel | Bär |
|---|---|
| **Form** — fylld / streckad | har vi läst uppgiften? |
| **Färg** — accent / attention / urgent | hur bråttom är det? |

En oläst brådskande deadline är alltså en **streckad ring i urgensfärgen** — hålet ersätter aldrig urgensprickan, det *är* samma prick. Enda undantaget: oxblod deltar aldrig i markörfärgen.

**Tre regler:**

- **11 px i listor, kort och FAQ; 9 px inline i löptext** så radrytmen håller.
- **Reservationen i ord bara där det finns plats** — svar-först, FAQ, kortet. I kalender- och listrader bär markören hela anspråket, och det fungerar för att formen är densamma hon lärt sig på kortet.
- **Aldrig markör utan legend på samma sida.** Varje yta som visar hål behöver raden *"streckad ring = hämtad, ej kontrolläst"* i foten.

---

## 4d — Stämpeln, tre lägen

**`olast` räknas aldrig som granskat.** Utan den regeln urholkas stämpeln av precis det tillstånd som är vanligast.

```
┌──────────────────┐
│ ✓ GRANSKAD       │   heldragen oxblod (--fg-verify)
└──────────────────┘   Alla fält `kontrollast` eller `ingen_regel`.
                       Oxbloden får bara stå här.

┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ ○ DELVIS GRANSKAD │  STRECKAD --fg-void-line, --fg-void-ink text
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  Minst ett fält granskat. INTE en svagare oxblod —
                       ett halvt anspråk får inte se ut som ett helt.

(ingen stämpel)        Noll granskade fält → inget renderas alls.
                       En tom stämpel är ett anspråk i sig.
```

### D2 måste kunna bära olast

Utan olast-rader skulle D2 nästan aldrig renderas — nästan inget är verifierat ännu. Därför två radtyper i samma block:

```
D2 · "DET VI VET", TVÅ RADTYPER
● Sista ansökningsdag 31 mars 2027.            ← FYLLD
  Kontrolläst 28 juli 2026.                    ← 14 px --muted
○ Riktat till föreningar med kulturverksamhet   ← STRECKAD
  — det ni angav.
  Hämtad, inte kontrolläst.
○ Ansökan görs via kommunens e-tjänst.
  Hämtad, inte kontrolläst.
──────────────────────────────────────────────
Dateringsraden finns bara i D2 och på kortet,
aldrig i listor. Där bär markören hela anspråket.
```

---

## Ordvalet — "kontrolläst", inte "verifierad"

**Beslut: "kontrolläst" gäller på ytan. Döp datavärdet `kontrollast`.**

"Verifierad" är ett myndighetsord som låter som en certifiering — det påstår mer än vad vi gör, och en kassör som läser det tror att någon garanterat uppgiften. "Kontrolläst" säger exakt vad som hänt: **en människa har läst kommunens sida och stämt av.** Det är ett anspråk vi kan stå för, och det är samma verb som stämpelns GRANSKAD.

Statusvärdena blir därmed `kontrollast · ingen_regel · olast · okand`, och ytan säger "Kontrolläst 10 juli" respektive "Ej kontrolläst" — samma ord i båda riktningarna, så hon aldrig behöver lära sig två begrepp för samma sak.

Genomfört i all ytcopy i runda 1–4: källremsan på ekern, legendchipsen i 2f, stämpelraden i 4d.

---

## Rättningar från runda 3, inarbetade

### 1. Ring + "!" bara vid uttryckligt nej

Markörregeln skärpt: `.fg-mark-missing` renderas **endast** på krav hon uttryckligen svarat nej på. **Obesvarat är alltid hål.** Vi påstår aldrig att hon saknar något hon inte fått frågan om.

I D1 (3b) betyder det: "Godkänd som bidragsberättigad" bär ring+"!" med texten *"Ni svarade nej på frågan om ni sökt förut"*; "Arrangemanget hålls i kommunen" bär hål med *"Obesvarat — vi påstår inte att det saknas"*.

### 2. Kravtäckningen är en flagga, inte ett bråk

`2 / 11 villkor inlästa` → **`EJ FULLSTÄNDIG`**.

Nämnaren finns inte i datan och kan inte finnas: vi kan aldrig veta hur många villkor kommunen har, bara om vi läst in hela föreskriften eller inte. **Ett påhittat "av elva" vore samma slags fel som 90-dagarssiffran.**

Köprutan har därmed två axlar där bara en är ett bråk:
- *Era uppgifter:* `4 / 6 avsnitt ifyllda` — äkta bråk om **hennes** data
- *Vår kravbild:* `EJ FULLSTÄNDIG` / `Kommunens fulla kravbild inläst` — flagga om **vår** data

Ny klass: `.fg-coverage-flag`. Hålls skild från avsnittsräknaren; slås de samman blir båda meningslösa.

### 3. D2-exemplet flyttat till Arvika

Gislaved har kartlagda krav och kan **strukturellt aldrig** visa D2. Ett D2-kort märkt Gislaved vore omöjligt i drift.

---

## Tokenkontraktet — nytt i runda 4

```css
.fg-unread        /* olast: vanlig behållare, streckad markör,
                     värdet i full svärta. En reservation per kort. */
.fg-coverage-flag /* kravtäckning: flagga, inte bråk */
```

Markörregeln i `foreningsguiden-tokens.css` är utökad med: nivåregeln för streckningen, att markören följer värdet ut på alla sex ytor, stämpelns tre lägen, och att obesvarat aldrig blir ring+"!".

Komponentnamn registrerade: **UnreadNotice · CoverageFlag · VerifyStamp** (plus VoidState, VoidMark, MissingMark, RequirementList, GapCard, RelativeDeadline, ZeroResult).

---

## Vad Code behöver veta

1. **Behållarens streckning och markörens streckning är två olika signaler.** Streckad markör + vanlig behållare = olast. Båda streckade = ej angivet. Bygg dem inte som en variant av varandra.
2. **Värdet renderas i full svärta i olast.** Ingen opacitet, ingen `--muted` på själva värdet.
3. **En reservation per kort, aldrig per fält.**
4. **Markören renderas på alla sex ytor**, även där ingen reservationstext finns plats. Ytan måste då ha legenden i foten.
5. **Stämpeln: `olast` räknas aldrig som granskat.** GRANSKAD = alla fält `kontrollast` eller `ingen_regel` · DELVIS = minst ett · noll = ingen stämpel renderas.
6. **`.fg-mark-missing` kräver ett uttryckligt nej-svar.** Obesvarat mappas till hålet.
7. **Kravtäckningen har ingen nämnare.** Boolean, inte bråk.
8. **Form och färg sätts oberoende på markören.** En streckad markör kan ha urgensfärg; den får aldrig ha oxblod.
9. **Datavärdet heter `kontrollast`**, och ytan säger "Kontrolläst" / "Ej kontrolläst" — aldrig "verifierad".

---

*Systemet oförändrat i övrigt: "civil klarhet med skav", oxblod reserverad för granskningsstämpelns GRANSKAD-läge, urgens-modellen, WCAG AA-golv, 16 px brödtext.*
