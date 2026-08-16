# Belopp avser — slutrapport 2026-08-16

## Underlag och modell

- Bascommit: `4dd8f3b`
- Reviewat underlag: `.fg-belopp-avser-H/PROPOSAL_REVIEWED.json`
- SHA-256 för underlaget: `3d7452d8a1865f81cf561f7e5984d49ee9d3680da456dc2a66323200414fb1e8`
- Reviewade poster: 297 (`accept`: 123, `revise`: 174, `uncertain`: 0)
- Reviewad klassfördelning: `ren_pott`: 102, `blandfall`: 28, `per_forening`: 23, `okand`: 144

`belopp` publiceras endast när `belopp_avser` är `per_forening`. Kommunens totala budget eller pott lagras och renderas i `kommunens_pott`. Poster som reviewats som `okand` lämnas utan gissad klassificering. Blandfall migreras bara när både individuellt belopp och kommunens pott finns uttryckligen i det reviewade underlaget.

## Deterministisk migrering

- Applicerade säkra poster: 137
  - `ren_pott`: 98
  - `blandfall`: 16
  - `per_forening`: 23
- Medvetet ej migrerade: 160
  - `classification_okand`: 144
  - `reviewed_fields_incomplete`: 16
- Ändrade kommunfiler: 72
- Ändrade `okand`-poster: 0
- Ändrade `uncertain`-poster: 0

Maskinläsbar post-för-post-audit finns i `BELOPP_AVSER_MIGRATION_AUDIT.json`.

## Renderings- och produktspärr

Spärren används i kort, registerrad, startsida, kommunförhandsvisning, matchning, summering, detaljsida, utkast/generator, köpflöde, delningsmejl och publik kommun-JSON. Detaljsidan visar `kommunens_pott` på en egen rad.

Kontroll av den byggda sajten:

- Kommuner: 290
- Bidrag: 2 808
- Publicerade individuella belopp: 39
- Dolda osäkra eller icke-individuella belopp: 2 769
- Publicerade separata kommunpotter: 114
- Rent pottfall verifierat: Tranås aktivitetsstöd
- Blandfall verifierat: Norrtälje hållbarhetsbidrag

## Valideringsgrind

Alla kontroller passerade:

- `npm run validera`
- `npm run verify:belopp-avser` — 10/10 golden set
- `npm run verify:matching` — 32 tester
- `npm run verify:generator` — 230 tester, 42/42 kombinationer
- `npm run verify:kalla-cta` — 2 808 bidragskort
- ingen-bidrag-regression
- krav-fullständiga-regression
- mekanisk verifieringsblandning
- datatillstånd-rendering — 290 kommuner, 2 808 bidragskort
- belopp-rendering — 290 kommuner, 2 808 bidrag
- `npm run build`

Icke-fällande befintliga varningar: 366 processpråksmeningar filtreras vid rendering. Lokal Node 25 stöds inte av Vercel Functions; bygget använder Node 24 i Vercel-miljön.

## Avgränsning

Reviewens 144 `okand`-poster och 16 ofullständiga fall har inte fyllts med antaganden. Lokala hjälpkataloger, tidigare batchartefakter, backupfiler och andra orelaterade filer ingår inte i beloppscommitten.
