# Granskning produktionsbatch 03

Datum: 2026-07-31

## Omfattning

Paketet innehåller 25 nya kommunfiler. Deadline-typerna är begränsade till `fasta`, `lopande` och `okand`; en maskinell kontroll har gjorts för förbjudna synonymer.

## Källtäckning

Filer med särskilt god offentlig källtäckning i denna omgång: Markaryd, Nybro, Sölvesborg, Staffanstorp, Östra Göinge, Örkelljunga, Svedala, Skurup, Osby och Klippan.

Filer som fortfarande behöver en senare PDF-/portalgranskning för fullständig inventering: Älmhult, Hultsfred, Mönsterås, Olofström, Åstorp och Hylte. De är medvetet konservativa och innehåller inga påhittade datum eller belopp.

## Befolkning

Befolkningsvärdena är avrundade arbetsvärden och bör ersättas av repots SCB-svep innan de betraktas som slutligt verifierade.

## Rekommenderad grind

Kör `npm run build` efter import. Kör därefter SCB-befolkningssvepet och en stickprovskontroll av minst fem kommuner innan merge.
