# Golden set — facit för bidragsutkastgeneratorn

Schema och grind per `SPEC_GOLDEN_SET.md` (Opus/Fable, 2026-07-27) — läs
det dokumentet först, det här är bara den mekaniska referensen.

En fil per riktigt bidrag, `<bidrag-id>.yaml`. **Facit-innehållet skrivs
av en människa** (Jacob/Fable) — inte av Code. `scripts/verify-generator.ts`
kör `genereraUtkast()` mot varje fil, för VAR OCH EN av de tre fasta
testprofilerna (P1/P2/P3, se nedan), och testar de fyra kriterierna
K1–K4 maskinellt. **Betalning för utkastprodukten aktiveras först när
grinden är grön.**

**14/14 facit klara, grinden är GRÖN** (Code, 2026-07-30/31,
`node scripts/verify-generator.ts`): 42/42 (bidrag × profil)-kombinationer
täckta, 0 FAIL. `UTKASTVY_LIVE` är sedan 2026-07-30 satt till `true`
(utkast/[bidragId]/index.astro) — bidragsutkastet är säljbart
(api/checkout/bidragsutkast.ts).

Historik: Arjeplog×3 + Gislaved×2 (omgång 1), Askersund×3 + Bjuv×2
(omgång 2), Arvika×5 (omgång 3, regel B — verksamhetsmatchning) — 15
facit ursprungligen. `gislaved-godkannande-bidragsberattigad.yaml`
borttagen 2026-07-31 (Jacob): bidraget den testade var en FELAKTIG
dubblett — samma sak fanns redan korrekt som ett `forutsattning` i
`data/kommuner/gislaved.yaml` (ett förkrav, inte ett säljbart bidrag).
14 facit, 42 körningar är alltså den riktiga, avsedda uppsättningen —
inte en reducerad täckning.

Omgång 3:s två rotorsaker (Arvikas "bedrivs i kommun"-formulering och
`kraver_registrering`-bidragets registreringsgren) åtgärdades i
generatorn (`utkastGenerator.ts`/`matching.ts`) 2026-07-30 — se
commit-historiken, inte facit som mjukades upp.

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
