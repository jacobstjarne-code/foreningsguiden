# Golden set — facit för bidragsutkastgeneratorn

En fil per riktigt bidrag, `<bidrag-id>.yaml`. **Facit-innehållet skrivs av
en människa** (Jacob/Fable) — inte av Code. `scripts/verify-generator.ts`
kör `genereraUtkast()` mot varje fil och testar de fyra spärrarna
maskinellt. Betalning aktiveras först när grinden är grön mot ett
tillräckligt golden set — se `SPEC: Utkastgeneratorn` / `SPEC: Betalintegration`.

`gislaved-arrangemangsbidrag.EXEMPEL.yaml` är en demonstration av formatet
(skriven av Code, tydligt märkt, inte verifierad) — inte ett riktigt facit.
Döp om till `<bidrag-id>.yaml` (utan `.EXEMPEL`) när en människa läst
igenom och bekräftat/korrigerat den, som signal att den bytt status.

## Schema

```yaml
bidragId: "<Bidrag.id, från data/kommuner/<kommun>.yaml>"
kommunSlug: "<Kommun.kommun_slug>"
profil:                      # den Foreningsprofil som facit gäller för
  kommunSlug: "<samma som ovan>"
  verksamhet: ["kultur"]      # se VERKSAMHETER i src/lib/kommunTyper.ts
  storlek: "s"                # 'xs' | 's' | 'm' | 'l'
  alder: "etablerad"          # 'ny' | 'mellan' | 'etablerad'
  sokt: "ja"                  # 'ja' | 'nej' | 'osaker'
forvantadTyp: "bidragsutkast" # eller "registrering_forst"
# Bara relevant om forvantadTyp är "bidragsutkast" — en rad per
# Bidrag.krav[i], SAMMA ORDNING och SAMMA LÄNGD som den verkliga krav[]-
# listan. Scriptet failar hårt (inte hoppar över) om längderna divergerar
# — det är ett drift-larm: kommunens data har ändrats sedan facit skrevs.
kravStatus: ["ifyllt", "lucka", "lucka"]
anteckningar: >
  Fritext, motivering. Läses av människor, används inte av scriptet.
```

## Vilka bidrag är bra kandidater?

Sprid facit-filerna över (se Code-rapporten för konkreta förslag per
kategori, skickad separat):

- Minst 2 fall där föreningen ÄR känd som säte-matchande (regel A i
  `fyllKrav` ska ge `ifyllt`).
- Minst 1 fall med ett **sammansatt** krav (en siffra/villkor OCH en
  platsklausul i samma mening) där facit ska säga `lucka` trots att en
  delsträng liknar ett känt mönster.
- Minst 2 fall `forvantadTyp: "registrering_forst"` — ett med `sokt: "nej"`,
  ett med `kraver_registrering: true` på bidraget och `sokt: "ja"` på
  profilen.
- Minst 1 fall med tomt `krav: []`.
- Resten spridda över minst 3–4 olika kommuner och kategorier.

## Köra grinden

```
node scripts/verify-generator.ts
```

Rött exit-kod = grinden är röd. Ingen CI är kopplad till detta än — det är
en manuell disciplin tills vidare, samma som `scripts/verify-matching.ts`.
