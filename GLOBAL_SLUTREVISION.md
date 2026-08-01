# Global slutrevision – första maskinella körningen

- Kommunfiler: **290**
- Bidragsposter: **2511**
- Schema-/dubblettfel i kontrollerade regler: **0**
- Kommuner med endast en bidragspost: **10**
- Kommuner vars befolkningstal slutar på 00: **184**

## Bedömning

Databasen innehåller 290 unika kommunfiler. De grundläggande schema- och dubblettkontrollerna gav 0 fel. Däremot är befolkningsfältet inte slutligt kvalitetssäkrat: 184 värden ser avrundade ut och måste ersättas med exakta SCB-värden. Kommuner med en enda bidragspost är en prioriterad kö för fortsatt innehållsrevision, men en post är inte automatiskt ett fel.

## Kommuner med en enda bidragspost

atvidaberg, essunga, gislaved, hultsfred, jonkoping, olofstrom, overtornea, storfors, toreboda, ydre

## Maskinella fel

Inga upptäckta fel.

## Nästa obligatoriska steg

1. Kör exakt SCB-uppdatering från projektets `data/scb-kommuner.json`.
2. Kör `npm run build`.
3. Granska en-post-kommunerna och ett stratifierat stickprov av övriga filer.
