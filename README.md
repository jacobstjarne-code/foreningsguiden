# Föreningsguiden

PoC för en publik, sökmotorindexerad sajt som samlar svenska kommuners
föreningsbidrag. Arbetsnamnet var Bidragskollen — namnet beslutades till
Föreningsguiden 2026-07-10 (se namnbesluts-noten i UPPDRAG_POC.md §9.1).
Se [`UPPDRAG_POC.md`](./UPPDRAG_POC.md) för uppdrag, affärshypotes,
arbetsdelning och leveransordning — det dokumentet är sanningskällan,
inte denna README.

## Status

Leveransordning steg 1 (repo-skelett, datamodell + schemavalidering, en
kommun end-to-end) är klart. Väntar på Fables granskning av struktur och
placeholder-slots innan steg 2 (brukstext + YAML-data för resterande nio
kommuner).

## Köra lokalt

```bash
npm install
npm run dev      # http://localhost:4321
npm run build     # bygger till dist/, faller på trasig kommun-YAML
```

## Datamodell

En YAML-fil per kommun i `data/kommuner/`, schema + validering i
`src/lib/kommuner.ts`. Valideringen körs vid modul-load (alltså varje
`build`/`dev`) och kastar ett fel med alla hittade problem om en fil bryter
mot schemat — bygget ska aldrig lyckas på trasig data.

Kommuner med `verifierad`-datum äldre än 180 dagar (`STALE_THRESHOLD_DAYS` i
`kommuner.ts`) får automatiskt en varningsflagga på sin sida.

## Placeholder-slots (Fable-copy)

Ingen svensk löptext skrivs av Code (§2 UPPDRAG_POC.md). Textslots som
väntar på Fable är markerade `{{FABLE: beskrivning}}` i templates — sök på
`{{FABLE:` för att hitta alla öppna slots.

## Struktur

- `data/kommuner/*.yaml` — en fil per kommun
- `src/lib/kommuner.ts` — schema, validering, loader
- `src/layouts/Base.astro` — sidlayout
- `src/components/` — `BidragCard` (datakort) och `StaleWarning`,
  byggda för återbruk i vertikal 2 (stipendier)
- `src/pages/kommun/[slug]/index.astro` — kommunsida
- `src/pages/index.astro` — minimal startsida (full version är steg 3)
