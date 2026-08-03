# Renderingsgranskning – verifieringsstatus

## Fynd

Statusfälten fanns i datamodellen och valideraren men användes inte i gränssnittet.

Följden var att:

- bidrag med `overifierat` fortfarande kunde visas som om kommunen uttryckligen saknade datum eller belopp,
- ofullständiga krav inte markerades,
- giltighetsstatus inte visades,
- samtliga kort fortsatt fick stämpeln `GRANSKAD`.

## Rättning

- `overifierat`, `ingen_regel` och `angivet` renderas nu med olika budskap.
- `krav_fullstandiga: false` ger en uttrycklig varning.
- giltighetsstatus visas på kortet.
- stämpeln visar `GRANSKAD` endast när samtliga fyra fält är avgjorda och kraven är fullständiga.
- övriga bidrag visas som `DELVIS GRANSKAD`.

Detta gör Gislaved till ett verkligt referensexempel och hindrar att äldre, automatiskt defaultade poster framställs som fullt verifierade.
