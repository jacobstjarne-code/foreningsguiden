# Underhåll av bidragsdatabasen

## Vid varje ändring

1. Ändra berörd YAML-fil.
2. Kör full build.
3. Kontrollera diffen.
4. Säkerställ att `kalla_url` börjar med `http://` eller `https://`.
5. Säkerställ att `belopp` inte innehåller URL eller kommunens gemensamma
   totalbudget som om den vore ett tak per sökande.
6. Committa först när valideringen passerar.

## Varje månad

Kör automatisk länkkontroll och dela upp resultatet i verkliga 404/5xx,
403/robotskydd, timeout/DNS och misstänkta startsidesomdirigeringar.
Verifiera automatiska fel i vanlig webbläsare innan data ändras.

## Varje höst

Gör en årlig innehållsrevision inför nästa bidragsår. Prioritera:

- nya och borttagna stödformer,
- ändrade deadlines,
- ändrade belopp och procenttak,
- förändrade målgrupper och behörighetskrav,
- nya normer, riktlinjer och nämndbeslut.

När kommunen har ett normdokument ska normdokumentet vara primär källa för
belopp, deadlines, krav och undantag. Översiktssidan används främst för att
identifiera stödformer och aktuell ingång till ansökan.

## Över- och underextraktion

Varje bidragspost ska kunna knytas till en identifierbar officiell källa.
Det fångar överextraktion och påhittade stöd. Kommuner med ovanligt få
bidrag, generiska samlingsposter eller kategorier som avviker från kommunens
publicerade målgrupper ska prioriteras för kontroll av underextraktion.

## Versionshantering

- Patchversion: länkrättningar och mindre faktakorrigeringar.
- Minorversion: årlig innehållsrevision eller flera nya/rättade stödformer.
- Majorversion: ändrad datamodell eller förändrad tolkning av centrala fält.
