# MOCKAR I TEXT — Huvudprocessen, sex ytor

*Från Design, 1 augusti 2026. Textversion av `foreningsguiden-huvudprocessen.html`. Läses med HANDOVER_huvudprocessen.md (motiven per yta) och GRANSKNING_2_foreningsguiden.md (underlaget, G1–G31).*

Alla ytor: mobil 390 px · brödtext 16–18 px · knappytor ≥ 52 px · samma tokens som tidigare leveranser.

**Tokens som används nedan:** `--ink` #17140F · `--muted` #4A463F · `--surface` #FFFFFF · `--sunken` #F4F2EC · `--accent` #256B3B · `--accent-soft` #E6EFE7 · `--attention` #8A5300 · `--attention-soft` #F7EFDD · `--urgent` #A62A22 · sans Atkinson Hyperlegible · display Archivo 800 · mono Space Mono.

---

## 1a — Kommunsidan: ekern in i tratten

**Placering:** varje kommunsida, efter svar-först-stycket, före stationerna.

**Kortstruktur:** vitt kort, 2,5 px `--ink` ram, radie 10. Tre band åtskilda av 2 px streckad linje.

### Band 1 — svar-först (oförändrat mönster, rättad text)

```
Föreningsbidrag i Gislaved                    ← Archivo 800, 25 px
I Gislaved kan föreningar söka ett kommunalt
bidrag. Innan ni kan söka det måste föreningen
vara godkänd som bidragsberättigad. Ansökan
görs via kommunens e-tjänst.                  ← 17 px, radavstånd 1,55
● SENAST VERIFIERAD 10 JULI 2026              ← mono 12 px, grön punkt 8 px
```

### Band 2 — trattinbjudan, bakgrund `--sunken`

Avviker medvetet från sidans vita kort så det inte läses som en station.

```
GÄLLER DET HÄR ER?                            ← mono 11 px, uppercase, --muted
Fyra frågor, och ni ser vad just er
förening kan söka                             ← 19 px bold
Kraven skiljer sig mellan bidrag. Svaren
sparas, så nästa gång ser ni bara det
som är nytt.                                  ← 15 px, --muted

┌────────────────────────────────────────┐
│ Se vad ni kan söka                   → │    ← grön, vit text, 18 px bold,
└────────────────────────────────────────┘      52 px hög, radie 8, mono-pil
Gratis. Inget konto, ingen mejladress.        ← 14 px, --muted
```

### Band 3 — sekundära vägar

```
ELLER LÄS ALLT SJÄLV                          ← mono 11 px, uppercase
Alla bidrag i Gislaved, i detalj ↓            ← grön länk, 16 px
Sista ansökningsdatum ↓                       ← grön länk, 16 px
```

**Tre datarättelser i denna yta:** "ett kommunalt bidrag" inte två (G11) · förkravet nämnt som villkor, inte som sökbart i steg 4 (G10) · ett färskhetsdatum, sidans eget (G2).

---

## 1b — Fråga 1: kommunväljaren i trattläge

**Sticky stegbar** — mörk (`--ink`), vit text, hela bredden:

```
FRÅGA 1 AV 4                              —
Svara för att se vad ni matchar        BIDRAG
```
Vänster: mono 11 px label + 16 px bold rad. Höger: Archivo 800, 30 px, **streck inte noll**, med mono 10 px "BIDRAG" under.

**Progressbar** direkt under: 5 px hög, spår #D8D4CA, fylld 12 % i `--accent`.

**Frågekropp**, vit, 18 px padding:

```
Var finns er förening?                        ← Archivo 800, 24 px
Kommunen där föreningen har sitt säte.        ← 16 px, --muted

┌────────────────────────────────────────┐
│ 🔍  Skriv kommunens namn               │    ← 2,5 px ram, 54 px hög,
└────────────────────────────────────────┘      18 px placeholder #8B8780

NYLIGEN SÖKT                                  ← mono 11 px uppercase
[Södertälje] [Salem] [Botkyrka]               ← 16 px chips, 2 px ram, radie 6,
                                                 aktiv = --accent-soft-fylld
──────────────────────────────────────────    ← 2 px streckad
▸ Bläddra bland alla 140 kommuner          +  ← <details>/<summary>, grön,
                                                 16 px bold, 44 px hög
┌────────────────────────────────────────┐
│               Vidare →                 │    ← grön, 54 px
└────────────────────────────────────────┘
```

**Två lägen, ett attribut:**

| Läge | Länslistan |
|---|---|
| Hubb (`/`) | utfälld — crawlbar, SEO-bärande |
| Tratt (`/matcha/`) | kollapsad i `<details>` |

Samma DOM, samma crawlbarhet. **Räknaren visar `—`:** noll är ett besked, streck är en tom plats som väntar.

---

## 1c — Fråga 4: gaten

**Kommunen i mocken är Södertälje, inte Gislaved.** Räknaren behöver en kommun med flera bidrag för att kunna röra sig; i Gislaved (ett bidrag + ett förkrav) skulle talet stå still på 1. Medvetet val, inte inkonsekvens mot 1a.

**Stegbar:** `FRÅGA 4 AV 4` / "Ni matchar" · räknaren **7** · progressbar 88 %.

**Frågekropp:**

```
✓ +2 bidrag efter förra svaret                ← pill, --accent-soft bakgrund,
                                                 grön text, 14 px bold, radie 999

Har ni sökt bidrag i Södertälje förut?        ← Archivo 800, 24 px
Har ni fått bidrag tidigare är föreningen
oftast redan godkänd hos kommunen.            ← 16 px, --muted

┌────────────────────────────────────────┐
│ ○  Ja, vi har fått bidrag              │    ← 2,5 px ram, 56 px hög,
├────────────────────────────────────────┤       18 px bold
│ ●  Nej, aldrig                         │    ← valt: --accent-soft fyllning,
├────────────────────────────────────────┤       6 px grön ring
│ ○  Vet inte                            │
└────────────────────────────────────────┘

┃ Då börjar ni inte med ansökan               ← --attention-soft, 5 px
┃ Ni behöver först bli godkända som             --attention vänsterkant
┃ bidragsberättigade. Vi visar vad
┃ det kräver.

[←]  [        Visa beskedet →        ]        ← tillbaka + primär, 54 px
```

**Gaten som fjärde fråga:** ställd som erfarenhet, inte som facktermen — hon slipper veta vad "bidragsberättigad" betyder. Utan den har registreringsprodukten ingen tratt.

**Konsekvensen visas i samma ögonblick som svaret** — attention-rutan är gatens besked, inte något som väntar till slutet. Det är vad "räknaren rör sig" betyder i ord.

---

## 1d — Registreringschecklistan

**Kort:** vitt, 2,5 px ram, **7 px `--attention` topplinje** (skiljer förkravsytan från bidragskort, som har grön topplinje).

### Huvud

```
GISLAVED · INNAN NI KAN SÖKA                  ← mono 11 px uppercase
Bli godkänd som bidrags-
berättigad förening                           ← Archivo 800, 25 px
Ett eget ärende med egen handläggningstid
— och den vanligaste anledningen att en
ansökan inte går igenom. Börja här, inte
med själva ansökan.                           ← 17 px
```

**Ingen siffra.** "Räkna med 90 dagars handläggning" är borta: källan säger *"subventionerad föreningstaxa tidigast tre månader efter godkänt beslutsdatum"* — när rabatten börjar gälla efter beslut, inte handläggningstid. Tredje varianten av samma påhittade tal.

### Checklistan

```
DETTA SKA NI HA                        2 / 5  ← mono 11 px + mono 12 px bold
──────────────────────────────────────────────
☑ Vald styrelse                               ← 24 px kryssruta, radie 5,
  Framgår av årsmötesprotokollet.                grön fylld när bockad.
──────────────────────────────────────────────  17 px bold titel +
☑ Stadgar antagna av årsmötet                   15 px --muted underrad.
  Bifogas i ansökan.                            Rad ≥ 52 px, 1,5 px avdelare
──────────────────────────────────────────────
☐ Organisationsnummer
  Skatteverket, blankett SKV 8400. Gratis.
──────────────────────────────────────────────
☐ Bankkonto i föreningens namn
  Plusgiro eller bankgiro går också.
──────────────────────────────────────────────
☐ Ansluten till riksorganisation
  Bara om det finns en statsbidrags-
  berättigad för er verksamhet.
```

### Bilagorna (fällda)

```
▸ Vad kommunen vill se bifogat             +  ← <details>, grön, 44 px
   · Stadgar, senaste versionen                ← 16 px, radavstånd 1,6
   · Protokoll från senaste årsmötet
   · Verksamhetsberättelse
   · Ekonomisk redovisning eller budget
```

### Säljbandet, bakgrund `--sunken`

```
Vi kan skriva registreringsansökan för er     ← 18 px bold
Mot Gislaveds egna krav, så inget fattas
när ni lämnar in.                             ← 16 px, --muted
┌────────────────────────────────────────┐
│ Förbered vår ansökan            249 kr │    ← grön, 54 px, priset I knappen
└────────────────────────────────────────┘
Vi skriver utkastet. Ansökan lämnar ni in
själva, och beslutet fattar kommunen.         ← 14 px ansvarsrad
```

**"Hjälp oss registrera" → "Förbered vår ansökan"** — den gamla texten säger på svenska att *hon* hjälper *oss*.

---

## 1e — Köpytan

**Kort:** vitt, 2,5 px ram, 7 px **grön** topplinje.

### Vad hon får (fyra punkter, grön bock i `--accent-soft` cirkel)

```
REGISTRERINGSANSÖKAN · GISLAVED               ← mono 11 px uppercase
Det här får ni                                ← Archivo 800, 25 px

✓ Ett ifyllt ansökningsunderlag mot
  Gislaveds fem krav, som Word-fil och PDF.
✓ Ett kopieringsfält per avsnitt för
  kommunens e-tjänst.
✓ Bilagelistan med vad som ska med, och
  var det ska laddas upp.
✓ Mejl med varaktig länk. Dokumentet
  ligger kvar i föreningens profil.           ← 16 px, fetat nyckelord först
```

Sista punkten är G23 — löftet som tar bort oron för en tappad flik.

### Prisspecifikation

```
──────────────────────────────────────────────
Registreringsansökan            199,20 kr     ← 17 px / mono
Moms 25 %                        49,80 kr     ← --muted
──────────────────────────────────────────────  ← 2 px heldragen
Att betala                        249 kr      ← 20 px bold / mono
Kvitto med org.nr och momsspecifikation
mejlas direkt — bokföringsbart som det är.    ← 14 px, --muted
```

### Betalning

```
┌────────────────────────────────────────┐
│          Betala med Swish              │    ← grön, 56 px
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│          Betala med kort               │    ← outline 2,5 px, 56 px
└────────────────────────────────────────┘
I Swish-appen står Föreningsguiden som
mottagare.                                    ← 15 px, --muted
```

### Garantin

```
┌──────────────────────────────────────────┐  ← --accent-soft, 2 px grön ram
│ 🛡 Går det inte att använda betalar vi   │     radie 8
│    tillbaka                              │  ← 16 px bold
│ Säg till inom 30 dagar. Inga frågor,     │
│ inget villkor — vi vill veta vad som     │
│ blev fel.                                │  ← 15 px
└──────────────────────────────────────────┘
```

Så länge "öppen beta" står i foten **måste** garantin ligga på samma yta som priset. "Kan vara ofärdigt" + "249 kr" utan skydd är exakt det som får en kassör att backa.

---

## 1f — Bevakningen, två ytor

### Yta 1 — deadlineraden, två tillstånd

```
📅 AUGUSTI 2026                               ← mono 12 px, 2 px underlinje
──────────────────────────────────────────────
[SNART]  1 AUGUSTI · OM 2 DAGAR               ← pill --urgent/vit, mono 13 px
Miljöpeng                                     ← 18 px bold
Kalmar · upp till 20 000 kr                   ← 15 px, --muted
┌──────────────────────────┐
│ 🔔 Bevaka den här        │                  ← outline 2,5 px, 46 px
└──────────────────────────┘
──────────────────────────────────────────────
14 AUGUSTI                                    ← mono 13 px, --muted,
Hållbarhetsbidrag                                INGEN urgenspill
Österåker · belopp inte publicerat            ← fallback-formuleringen
┌────────────────────────────────────────┐
│ ✓ Bevakas — vi mejlar 4 veckor före    │    ← --accent-soft fyllning,
└────────────────────────────────────────┘       2,5 px grön ram, grön text
```

**Urgensordet: en tröskel, ett ord.** "Snart" på båda ytor — förstasidan säger i dag "Bråttom" och kalendern "Snart" för samma rader. Rader utan urgens har **ingen** pill: "God tid" på varje rad bär noll information.

### Yta 2 — giltighetskontrollen

Kort med 7 px `--attention` topplinje.

```
Ert godkännande förfaller om
7 månader                                     ← Archivo 800, 21 px
Årsmöte 14 mars 2026. I Gislaved gäller
godkännandet till nästa årsmöte redovisats
— februari 2027 är er gräns.                  ← 16 px, gränsen fetad

┌────────────────────────────────────────┐
│ namn@forening.se                       │    ← 2,5 px ram, 52 px
└────────────────────────────────────────┘
┌────────────────────────────────────────┐
│         Påminn oss i januari           │    ← grön, 54 px
└────────────────────────────────────────┘
Ett mejl, om den här saken. Går att
avsluta i varje utskick.                      ← 14 px, --muted
```

Hon har just räknat ut något oroande om sin egen förening. Där är påminnelsen **hennes idé, inte vår** — knappen heter "Påminn oss i januari", inte "Prenumerera". Enda platsen i tjänsten där en mejladress efterfrågas av hennes skäl.

---

## Ordning, om ni bara gör tre saker

1. **1a på alla kommunsidor.** Störst effekt, minst arbete — trafiken finns redan där.
2. **1e i sin helhet.** Sex hål på en yta, och den enda yta där pengar byter händer.
3. **1f, deadlineraden.** Ingen betalintegration behövs.

## Inte ritat

Leveransvyn efter köp och Mina sidor — hör ihop med utkastvyn som byggs om. De bär G23 (varaktig hemvist) och G9 (profilen lovar minne men har ingen adress); löftena finns i 1e, ytorna finns inte.

**Öppen fråga:** tratten samlar inte in föreningens namn eller org.nr, men en registreringsansökan kräver dem (G8). Antingen finns ett formulär efter köpet — då är det oritat — eller så levereras en mall. Skillnaden är hela produktvärdet, och den avgör vad 1e egentligen lovar.

---

*Systemet oförändrat: tokens, "civil klarhet med skav", oxblod reserverad för verifiering, urgens-modellen, WCAG AA-golv, 16 px brödtext.*
