# Golden set — facit för bidragsutkastgeneratorn

Schema och grind per `SPEC_GOLDEN_SET.md` (Opus/Fable, 2026-07-27) — läs
det dokumentet först, det här är bara den mekaniska referensen.

En fil per riktigt bidrag, `<bidrag-id>.yaml`. **Facit-innehållet skrivs
av en människa** (Jacob/Fable) — inte av Code. `scripts/verify-generator.ts`
kör `genereraUtkast()` mot varje fil, för VAR OCH EN av de tre fasta
testprofilerna (P1/P2/P3, se nedan), och testar de fyra kriterierna
K1–K4 maskinellt. **Betalning för utkastprodukten aktiveras först när
grinden är grön** — 15 bidrag × 3 profiler = 45 körningar, alla gröna.

**15/15 facit klara** (Opus/Fable, omgång 1–3, 2026-07-27–29): Gislaved×2,
Arjeplog×3 (omgång 1), Askersund×3, Bjuv×2 (omgång 2), Arvika×5 (omgång
3, regel B — verksamhetsmatchning). Ingen `.EXEMPEL.yaml`-demonstration
finns längre — den första facit-filen ersatte den (samma bidrag).

**Grinden är RÖD** (Code, 2026-07-30, `node scripts/verify-generator.ts`):
45/45 (bidrag × profil)-kombinationer täckta, 6/233 tester FAIL. Två
distinkta, dokumenterade rotorsaker — INTE gissade, körda mot verklig
kod — väntar på Jacob/Fables beslut om facit eller generator ska ändras:

1. `arvika-verksamhetsbidrag-idrott` + `arvika-ungdom-kultur`, [p1]/[p2]
   (4 fall): krav formulerade som "Verksamheten ska bedrivas i Arvika
   kommun" facit-förväntas `ifyllt` (samma sakuppgift som en
   säte-formulering), men `fyllKrav()`s `SATE_MONSTER`-mönster
   (`utkastGenerator.ts`) matchar bara "säte"/"hemmahörande" ordagrant
   — inte "bedrivs i {kommun}". Generatorn ger `lucka`.
2. `arvika-sociala-stodforeningar`, [p1]/[p2] (2 fall): facit förväntar
   `bidragsutkast` för en redan registrerad förening (`sokt: 'ja'`),
   men bidraget har `kraver_registrering: true` — och
   `visaBorjaHar()` (`matching.ts:107-109`) triggar på DET villkoret
   ensamt, oavsett `sokt`. Generatorn ger `registrering_forst` för
   alla tre profiler, inte bara P3.

`UTKASTVY_LIVE` förblir `false` tills grinden är grön — se
utkast/[bidragId]/index.astro.

## De tre testprofilerna (fasta, definierade i scriptet — inte per facit)

- **P1 — Komplett.** Alla trattsvar ifyllda, registrerad förening
  (`sokt: 'ja'`). Testar K1/K4 renodlat.
- **P2 — Luckor.** Verksamhet + kommun ifyllda, storlek och
  verksamhetstid saknas. Testar K3.
- **P3 — Oregistrerad.** `sokt: 'nej'`. Testar registreringsgrenen
  (producerar generatorn `registrering_forst` i stället för
  `bidragsutkast`?).

`kommunSlug` sätts alltid till facit-filens egen kommun; övriga fält i
P1–P3 är identiska för alla bidrag (se `TESTPROFILER` i scriptet) — det
är en avsiktlig förenkling: facit-skrivaren beskriver bara UTFALLET för
sitt bidrag mot dessa tre redan fastställda indata, aldrig egna
profilvärden.

## De fyra kriterierna (K1–K4, SPEC_GOLDEN_SET.md §2)

- **K1 — Täckning.** Varje krav i `krav[]` bemöts (en rad per krav,
  ordagrant citat, rätt ordning/antal).
- **K2 — Ingen uppfinning.** `innehall` är ALLTID antingen en av de två
  kända mallarna (säte/verksamhet) eller den fasta luckplatshållaren —
  aldrig fri text.
- **K3 — Ärliga luckor.** `status` per krav matchar facit exakt, per
  profil (en lucka som facit inte förväntat = generatorn gissade; en
  ifylld rad som facit förväntade lucka = generatorn dolde en lucka).
- **K4 — Inget bifallslöfte.** `ansvarsrad` + alla `innehall`-strängar
  fria från ett bannat frasmönster (garanterar/beviljas/ökar chansen/...).

## Schema

```yaml
bidragId: "<Bidrag.id, från data/kommuner/<kommun>.yaml>"
kommunSlug: "<Kommun.kommun_slug>"
kalla_url: "<Bidrag.kalla_url — spårbarhet, inte maskinellt kontrollerad>"
# Valfria extra kontroller, utöver K1-K4:
forvantadDeadlineTyp: "fast" # eller "lopande" — "får ALDRIG hitta på ett datum"/"bli löpande"
forvantadBelopp: "8 kronor per deltagare (4 kronor för skolidrottsföreningar)" # eller null — ordagrant, ingen förenkling av differentiering/undantag (omgång 2)

profiler:
  p1:
    forvantadTyp: "bidragsutkast"   # eller "registrering_forst"
    # En rad per Bidrag.krav[i], SAMMA ORDNING/LÄNGD som den verkliga
    # krav[]-listan. Scriptet failar hårt (drift-larm) om längderna
    # divergerar — facit måste uppdateras av en människa då.
    kravFacit:
      - forvantatStatus: "ifyllt"
      - forvantatStatus: "lucka"
    anteckningar: >
      Fritext, motivering. Läses av människor, används inte av scriptet.
  p2:
    forvantadTyp: "bidragsutkast"
    kravFacit: [...]
    anteckningar: >
      ...
  p3:
    forvantadTyp: "registrering_forst"
    # kravFacit UTELÄMNAS när forvantadTyp är registrering_forst —
    # generatorn producerar då ingen kravRader-lista alls.
    anteckningar: >
      ...
```

Ett facit behöver inte fylla i alla tre profiler samtidigt (de kan
byggas ut successivt), men grinden räknas inte som godkänd
(SPEC_GOLDEN_SET §7) förrän samtliga 10–15 bidrag har alla tre.
Scriptet rapporterar hur många (bidrag × profil)-kombinationer som
faktiskt testades, som en tydlig täckningssiffra.

## Vilka 10–15 bidrag? (SPEC_GOLDEN_SET.md §5)

- Minst 3 med rika, specifika krav (Askersund, Arvika, Bjuv har sådana).
- Minst 2 med `belopp: null`.
- Minst 2 med `kraver_registrering: true`.
- Minst 2 löpande utan fast deadline.
- Minst 1 med tomma eller minimala `krav[]` — det farligaste fallet.
- Minst 1 från en kommun med `forutsattningar: []` (t.ex. Arjeplog).

## Köra grinden

```
node scripts/verify-generator.ts
```

Rött exit-kod = grinden är röd. Ingen CI är kopplad till detta än — det
är en manuell disciplin tills vidare, samma som `scripts/verify-matching.ts`.
