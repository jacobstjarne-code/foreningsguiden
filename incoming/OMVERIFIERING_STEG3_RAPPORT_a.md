# Passrapport — omverifiering steg 3, pass A

Session 1, 24 september 2026. Gren `omverifiering-steg3-a`, utgången från
`origin/release-2026-09-24`. Worktree `~/Desktop/code_projects/fg-omverif-steg3-a`.

## Läge

| | |
|---|---|
| Kommuner klara | 8 av 72 |
| Bidrag lästa | 122 av 705 |
| Rättade | 9 |
| Tillagda | 0 |
| Till browserkön | 0 |

Alla åtta är committade och pushade. Båda grindarna gröna före varje
commit, pre-commit-kroken grön på samtliga.

## Klara kommuner

| Kommun | Bidrag | Rättade | Not |
|---|---|---|---|
| Hammarö | 12 | 7 | senregeln saknades i sju poster |
| Katrineholm | 13 | 0 | |
| Sjöbo | 12 | 0 | webbplatsen omlagd, portalen lever |
| Mörbylånga | 19 | 0 | |
| Göteborg | 16 | 2 | beloppsnivå och extra höstutlysning |
| Köping | 8 | 0 | |
| Leksand | 14 | 0 | |
| Ulricehamn | 28 | 0 | delat verifierad-fält |

## Rättelser

**Hammarö, sju poster, `sen_ansokan`.** Före: "Ej angivet i källan".
Efter: "För sent inkomna ansökningar för övriga bidragstyper behandlas
inte." Källa: Regler för föreningsbidrag i Hammarö kommun, KF 2025-06-23
§84, punkt 3.2.2. Aktivitetsstödets egen trappa i 3.2.1 (10 procents
avdrag 1–7 dagar, 50 procent 8–14 dagar, därefter ingen beredning) stod
redan rätt.

**Göteborg, `goteborg-kultur-utjamningsbidrag`, `belopp`.** Före:
"Subventionen beräknas per genomfört och godkänt besök och betalas ut i
efterhand mot faktura." Efter: samma, men med de två publicerade nivåerna
100 kronor per besökande barn för produktion på fast plats när biljetten
sålts för minst 40 kronor inklusive moms, och 50 procent av priset vid
uppsökande eller såld produktion. Källa: kulturstödets sida för
utjämningsbidrag.

**Göteborg, `goteborg-lokalt-foreningsbidrag-sydvast`, `anteckning`.**
Tillagt att socialförvaltningen Sydväst hösten 2026 har en extra
utlysning på högst 25 000 kronor för kostnadsfria aktiviteter för
10–20-åringar mellan 27 oktober och 18 december, sista ansökningsdag
1 november. Den ligger på samma sida och inom samma stödform, så den är
noterad i posten i stället för att läggas till som egen.

## Punkt 2 — sådant som avviker

**Sjöbo har lagt om sin webbplats.** `sitemap.xml`, `foreningsliv.html`
och `foreningsstod.html` ger alla 404 och ingen bidragsmeny går att nå
från startsidan. Regelverks-PDF:en från 2018 och portalen
`sjobo.fri-go.se` lever däremot, och alla belopp och datum stämde.
Portalen listar femton stödformer mot filens tretton: skillnaden är att
portalen delar hyres-, investerings-, arrangemangs- och utvecklingsstöd
samt föreningsägd anläggning i var sin kultur- och fritidsvariant. Ingen
stödform saknas. Värt en egen kontroll om Sjöbo ska ha delade poster.

**Ingen kommun hade mer än hälften av bidragen ändrade** och inget
regressionsskydd fällde.

## Två saker om arbetsgången

**Listan och skriptet är ospårade i `fg-production-batch-01`.** Ordern,
`OMVERIFIERING_STEG3_LISTA.md` och `omverif_steg3_lista.py` ligger bara i
arbetsträdet där, inte i någon commit, så en ny worktree från
`origin/release-2026-09-24` får dem inte med sig. Jag kopierade in dem
manuellt. Session 2 och 3 behöver göra detsamma.

**Två schemavarianter för datumfältet, som i steg 2.** De flesta filer
har `senast_verifierad` per bidrag. Ulricehamn har det inte alls utan bär
bara kommunens gemensamma `verifierad`. Ett skript som bara ersätter
befintliga rader bumpar då ingenting och commiten blir tom utan att något
syns. Kiruna, Kumla och Mjölby har samma mönster på delar av sina poster
och ligger kvar i passet.

En detalj till: filerna blandar `- id:` först i posten och `id:` sist.
Ett skript som letar `^\s*id:` missar de förra.

## Kvar i passet

64 kommuner, 583 bidrag. Nästa i ordning: Lilla Edet (10), Östersund
(17), Umeå (9), Ale (13), Falköping (9), Gällivare (16), Hylte (11),
Jönköping (22), Nykvarn (12), Rättvik (10).
