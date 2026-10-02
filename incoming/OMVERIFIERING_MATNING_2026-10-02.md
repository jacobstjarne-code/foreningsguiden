# Omverifieringen mätt — 2026-10-02

Mätpasset i `incoming/SYSTEMLARM_ANALYS_2026-09-24.md` avsnitt 3A, med
Jacobs tillägg 2026-10-02. Kört lokalt mot produktions-Redis via
`.env.local`. **Inga produktionsändringar** — skriptet läser, hämtar och
skriver rapport, aldrig en signatur eller en baslinje.

Skript: `scripts/omverifiering-matning.ts`. Hela listan: `OMVERIFIERING_MATNING_2026-10-02.json`.

## Läget i kön

| | |
|---|---|
| I kön totalt | 734 |
| Olästbara (`otillganglig`) | 151 |
| Flaggade som ändrade (`andrad`) | 583 |

## 1. Olästbara källor, cronens UA mot webbläsar-UA

Två GET per källa, 15 sekunders timeout (cronens är 5 s —
den strypningen är en del av det som mäts, så den används inte här).

| Klass | Antal | Andel | Betyder |
|---|---|---|---|
| DÖD | 18 | 11.9 % | 404 eller 410 med båda UA — dokumentet finns inte längre |
| BLOCKERAD | 99 | 65.6 % | svarar med webbläsar-UA men inte med cronens |
| INSTABIL | 17 | 11.3 % | timeout, nätverksfel eller blandat utfall |
| OK NU | 17 | 11.3 % | svarar med båda — felet var tillfälligt |

### DÖDA källor

| URL | cron | webb | Bidrag som använder den |
|---|---|---|---|
| `https://karlskoga.se/uppleva--gora/foreningar-och-foreningsliv/bidrag-och-stod.html` | 404 | 404 | _ingen (URL finns inte i YAML längre)_ |
| `https://vetlanda.se/bygga-bo-och-miljo/planer-och-utveckling/landbygdsutveckling/landsbygdssatsningar` | 404 | 404 | Vetlanda/vetlanda-landsbygdssatsningar |
| `https://www.hoor.se/uppleva-och-gora/foreningar-och-foreningsliv/` | 404 | 404 | _ingen (URL finns inte i YAML längre)_ |
| `https://www.trollhattan.se/globalassets/dokument/uppleva-och-gora/ovrigt/riktlinjer---berakningsgrunder-for-foreningsbidrag-2017-02-06.pdf/` | 404 | 404 | Trollhättan/trollhattan-brukardriven-fritidsgard |
| `https://norberg.se/kultur--fritid/forening/foreningsbidrag.html` | 404 | 404 | _ingen (URL finns inte i YAML längre)_ |
| `https://kiruna.se/naringsliv--arbete/arbeta-hos-oss/feriearbete-for-skolungdom-2026.html` | 404 | 404 | Kiruna/kiruna-ferieloner |
| `https://www.bollebygd.se/download/18.587e3e9718c33e1677021cc/1730464073313/Riktlinjer%20f%C3%B6r%20Bollebygds%20st%C3%B6d%20till%20f%C3%B6reningar%20och%20studief%C3%B6rbund.pdf` | 404 | 404 | Bollebygd/bollebygd-startbidrag, Bollebygd/bollebygd-aktivitetsstod, Bollebygd/bollebygd-verksamhetsbidrag, Bollebygd/bollebygd-driftbidrag, Bollebygd/bollebygd-lokalbidrag, Bollebygd/bollebygd-investeringsbidrag-anlaggning, Bollebygd/bollebygd-investeringsbidrag-redskap, Bollebygd/bollebygd-investeringsbidrag-orienteringskarta, Bollebygd/bollebygd-lovaktivitetsbidrag, Bollebygd/bollebygd-verksamhetsbidrag-pensionarsforeningar, Bollebygd/bollebygd-aktivitetsbidrag-pensionarsforeningar, Bollebygd/bollebygd-verksamhetsbidrag-funktionsnedsattning, Bollebygd/bollebygd-aktivitetsbidrag-funktionsnedsattning, Bollebygd/bollebygd-bygdegards-och-samlingslokalsbidrag, Bollebygd/bollebygd-verksamhetsbidrag-kulturforeningar, Bollebygd/bollebygd-studieforbundsbidrag |
| `https://eservice.lomma.se/Form.ashx?id=36` | 404 | 404 | Lomma/lomma-kommunalt-aktivitetsstod-kulturforeningar |
| `https://www.bracke.se/download/18.29255b8d19afcc9f971a7/1765205191558/Regler%20f%C3%B6r%20uthyrning%20av%20kommunens%20idrottsanl%C3%A4ggningar.pdf` | 404 | 404 | Bräcke/bracke-subventionerade-kommunala-lokaler |
| `https://www.hagfors.se/undersidor/politik-och-kommun/medborgarforslag.html` | 404 | 404 | Hagfors/hagfors-lokalt-aktivitetsstod-65-plus |
| `https://lomma.se/download/18.36b5b5ba17e21f6b7e8e6b2/1641302459764/L%2004%20Regler%20f%C3%B6r%20st%C3%B6d%20till%20f%C3%B6reningar%20i%20Lomma%20kommun.pdf` | 404 | 404 | Lomma/lomma-lokalstod-till-pensionarsforeningar, Lomma/lomma-startbidrag |
| `https://lund.se/uppleva-och-gora/foreningslotsen/forenings--och-projektbidrag/stod-till-idrott` | 404 | 404 | Lund/lund-publika-idrottsarrangemang |
| `https://www.bollebygd.se/upplevaochgora/foreningar/foreningsbidrag.4.3b0817d21907739bee3be671.html` | 404 | 404 | _ingen (URL finns inte i YAML längre)_ |
| `https://www.hagfors.se/download/18.45182d2c1916dfc80a15db55/1724676652764/Riktlinjer%20f%C3%B6r%20f%C3%B6reningsbidrag%20omr%C3%A5de%20pension%C3%A4rsf%C3%B6reningar%20och%20omr%C3%A5de%20funktionshinder%2C%20rev%202023-08-28.pdf` | 404 | 404 | Hagfors/hagfors-pensionars-och-funktionshinderforeningar |
| `https://www.linkoping.se/download/18.17c8f30e197e3166ee93ea0f/1751912797146/F%C3%B6reningsbidrag%20best%C3%A4mmelser%2C%20kriterier%20och%20bidragsregler%20SON.pdf` | 404 | 404 | Linköping/linkoping-son-grundbidrag, Linköping/linkoping-son-aktivitetsbidrag |
| `https://www.herjedalen.se/download/18.786ce91e174afae6cb1694a/1601034881616/Protokoll%20Kf%202018-11-26.pdf` | 404 | 404 | Härjedalen/harjedalen-pensionars-och-funktionsrattsbidrag |
| `https://www.svedala.se/contentassets/c40af4370b014daebe371d7faa561e34/protokoll-2026/protokoll-fran-kommunfullmaktige-18-juni-2026-for-justering-signerat.pdf` | 404 | 404 | Svedala/svedala-aktivitetsbidrag |
| `https://www.svedala.se/contentassets/7e956da75e8748a7a963dd04bf336929/riktlinjer-for-stod-och-bidrag-till-foreningar-i-svedala-kommun.pdf` | 404 | 404 | Svedala/svedala-kulturbidrag, Svedala/svedala-anlaggningsbidrag, Svedala/svedala-utvecklingsbidrag, Svedala/svedala-uppdragsbidrag, Svedala/svedala-arrangemangsbidrag, Svedala/svedala-marknadsforingsbidrag, Svedala/svedala-uppstartsbidrag, Svedala/svedala-subventionerad-lokalhyra |

### BLOCKERADE källor

| URL | cron | webb | Bidrag |
|---|---|---|---|
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/ovriga-bidrag-socialnamnden/` | 403 | 200 | Haninge/haninge-social-verksamhetsbidrag |
| `https://www.haninge.se/4aecaf/contentassets/172843824c51415f8daf4569716b55b3/riktlinje-for-ekonomiskt-stod-ikfn-2025.pdf` | 403 | 200 | Haninge/haninge-trivselvandring |
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/lovmedel/` | 403 | 200 | Haninge/haninge-skollovsaktiviteter |
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/` | 403 | 200 | _ingen_ |
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/kulturbidrag/` | 403 | 200 | Haninge/haninge-kultur-grundbidrag, Haninge/haninge-kultur-arrangemang-projekt, Haninge/haninge-studieforbundsbidrag |
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/Bidrag-for-pensionarsverksamhet/` | 403 | 200 | Haninge/haninge-aldre-verksamhetsbidrag |
| `https://www.haninge.se/uppleva-och-gora/foreningar/foreningsbidrag/idrott-och-ovrigabidrag-kultur-fritid/` | 403 | 200 | Haninge/haninge-lokalt-aktivitetsstod, Haninge/haninge-projekt-arrangemangsstod, Haninge/haninge-oppen-idrott-skoldagens-slut, Haninge/haninge-nattidrott, Haninge/haninge-forstarkt-ridbidrag, Haninge/haninge-forstarkt-scoutbidrag |
| `https://evodokweb2.varnamo.se/api/download/6af62d17-9cc3-4e08-80b3-24d313dd135a/30d45425-1f3f-4e71-89e9-2d751142254e` | 400 | 200 | Värnamo/varnamo-demokratiutveckling-unga |
| `https://evodokweb2.varnamo.se/api/download/8098f8df-5503-4897-9a4f-e5e4d5c854b8/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-grundbidrag-unga, Värnamo/varnamo-aktivitetsbidrag, Värnamo/varnamo-lokalbidrag-unga, Värnamo/varnamo-anlaggningsbidrag-unga, Värnamo/varnamo-ledarutbildningsbidrag-unga, Värnamo/varnamo-extra-bidrag-unga |
| `https://evodokweb2.varnamo.se/api/download/d1ce6628-cf50-40d5-95e6-2f2a3dea9951/30d45425-1f3f-4e71-89e9-2d751142254e` | 400 | 200 | Värnamo/varnamo-energi-klimatbidrag |
| `https://www.kungalv.se/siteassets/dokument/kommun-och-politik/styrdokument/kultur-fritid-foreningar/riktlinje-for-forenings--och-studieforbundsstod.pdf` | 403 | 200 | Kungälv/kungalv-lok-stod |
| `https://www.kungalv.se/kultur--fritid/foreningar/bidrag/` | 403 | 200 | _ingen_ |
| `https://www.kungalv.se/kultur--fritid/kulturbidrag/` | 403 | 200 | Kungälv/kungalv-verksamhetsstod-kultur |
| `https://www.nacka.se/stadsutveckling-trafik/skotsel-av-gator-och-vagar/vem-ansvarar-for-vagen/vag-och-gatubelysningsbidrag/` | 403 | 200 | Nacka/nacka-vagbidrag, Nacka/nacka-gatubelysningsbidrag |
| `https://www.nacka.se/uppleva--gora/foreningar/foreningsbidrag/bidrag-for-frivilligt-socialt-arbete/` | 403 | 200 | Nacka/nacka-verksamhetsbidrag-frivilligt-socialt-arbete |
| `https://www.nacka.se/underwebbar/for-anordnare-inom-kulturomradet/kulturstod-och-stipendier/kulturbidrag/stort-projektstod-och-produktionsstod/` | 403 | 200 | Nacka/nacka-stort-projektstod-produktionsstod |
| `https://www.nacka.se/underwebbar/for-anordnare-inom-kulturomradet/kulturstod-och-stipendier/kulturbidrag/litet-projektstod/` | 403 | 200 | Nacka/nacka-litet-projektstod-kultur |
| `https://www.nacka.se/uppleva--gora/foreningar/foreningsbidrag/ovrigt-finansiellt-stod-till-ideella-foreningar/` | 403 | 200 | Nacka/nacka-ovrigt-finansiellt-stod |
| `https://www.nacka.se/uppleva--gora/foreningar/foreningsbidrag/bidrag-for-fritidsverksamhet/` | 403 | 200 | Nacka/nacka-lovbidrag |
| `https://www.nacka.se/uppleva--gora/foreningar/foreningsbidrag/` | 403 | 200 | _ingen_ |
| `https://www.nacka.se/48e389/globalassets/kommun-politik/dokument/styrdokument/riktlinjer/riktlinjer-for-foreningsbidrag.pdf` | 403 | 200 | Nacka/nacka-aktivitetsbidrag, Nacka/nacka-investeringsbidrag, Nacka/nacka-projektbidrag, Nacka/nacka-sarskilt-verksamhetsbidrag, Nacka/nacka-grundbidrag-funktionsrattsforeningar |
| `https://www.nacka.se/uppleva--gora/foreningar/foreningsbidrag/foreningsbidrag-for-pensionarer/` | 403 | 200 | Nacka/nacka-foreningsbidrag-pensionarer |
| `https://www.nacka.se/underwebbar/for-anordnare-inom-kulturomradet/kulturstod-och-stipendier/kulturbidrag/verksamhetsstod/` | 403 | 200 | Nacka/nacka-verksamhetsstod-kultur |
| `https://www.nykoping.se/trafik--resor/gator-och-torg/vagforeningar-och-enskilda-vagar/` | 403 | 200 | Nyköping/nykoping-gronytebidrag, Nyköping/nykoping-enskilt-vagbidrag |
| `https://www.nykoping.se/uppleva--gora/stipendier-och-priser/idrottsstipendium` | 403 | 200 | Nyköping/nykoping-idrottsstipendium |
| `https://www.nykoping.se/foreningsbidrag` | 403 | 200 | Nyköping/nykoping-aktivitetsbidrag, Nyköping/nykoping-arrangemangsbidrag, Nyköping/nykoping-investeringsbidrag, Nyköping/nykoping-lovbidrag, Nyköping/nykoping-startbidrag, Nyköping/nykoping-utbildningsbidrag, Nyköping/nykoping-verksamhetsbidrag, Nyköping/nykoping-subventionerad-lokalhyra |
| `https://www.nykoping.se/trafik--resor/gator-och-torg/torg-och-allmanna-platser/levande-centrum/evenemangsbidrag/` | 403 | 200 | Nyköping/nykoping-evenemangsbidrag |
| `https://www.nykoping.se/globalassets/nykoping.se/dokument/styrande-dokument/reglerande/riktlinjer-for-kommunala-bidrag-till-tatortsvagsamfalligheter.pdf` | 403 | 200 | Nyköping/nykoping-driftbidrag-vagsamfalligheter |
| `https://www.partille.se/kommun--politik/priser-stipendier-stiftelser/` | 403 | 200 | Partille/partille-breddpriset, Partille/partille-barnkonventionspriset, Partille/partille-hallbarhetspriset, Partille/partille-halsopriset |
| `https://www.partille.se/uppleva--gora/foreningsliv/stod-till-foreningar/` | 403 | 200 | _ingen_ |
| `https://www.partille.se/uppleva--gora/foreningsliv/foreningsbidrag-for-social-verksamhet/` | 403 | 200 | Partille/partille-foreningsbidrag-social-verksamhet |
| `https://www.partille.se/siteassets/uppleva--gora/foreningsliv/bidragsregler-kultur_2024.pdf` | 403 | 200 | Partille/partille-startbidrag-kultur, Partille/partille-verksamhetsbidrag-kultur, Partille/partille-kulturarrangemangsbidrag, Partille/partille-bidrag-seniorforeningar-kultur |
| `https://www.partille.se/siteassets/uppleva--gora/foreningsliv/bidragsregler-for-idrottsforeningar-2026.pdf` | 403 | 200 | Partille/partille-startbidrag-idrott, Partille/partille-lokalt-aktivitetsstod, Partille/partille-aktivitetsstod-senior-65, Partille/partille-ledarutbildningsbidrag, Partille/partille-stimulansbidrag, Partille/partille-sarskilda-foreningsinsatser, Partille/partille-lokalbidrag-hyrda-anlaggningar, Partille/partille-lokalbidrag-egna-anlaggningar, Partille/partille-investeringsbidrag-egen-anlaggning |
| `https://www.skovde.se/globalassets/kommun-och-politik/taxor-avgifter-och-styrande-dokument/forfattningssamling/regler-for-bidrag-till-foreningar-for-personer-med-funktionsnedsattning.pdf` | 403 | 200 | Skövde/skovde-funktionsnedsattning-verksamhetsbidrag, Skövde/skovde-funktionsnedsattning-lokalbidrag, Skövde/skovde-funktionsnedsattning-utvecklingsbidrag |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/subventionerad-lokalhyra-i-bygdegardar/` | 403 | 200 | Skövde/skovde-subventionerad-lokalhyra |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/arrangorsstod/` | 403 | 200 | Skövde/skovde-arrangorsstod |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/bidrag-for-landsbygden/` | 403 | 200 | Skövde/skovde-landsbygdsutveckling |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/verksamhetsbidrag-for-kulturforeningar/` | 403 | 200 | Skövde/skovde-kulturforeningar-verksamhetsbidrag |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/bidrag-till-foreningar-med-ungdomsverksamhet/` | 403 | 200 | Skövde/skovde-ungdom-aktivitetsstod, Skövde/skovde-ungdom-lokalbidrag, Skövde/skovde-ungdom-anlaggningsbidrag, Skövde/skovde-ungdom-investeringsbidrag, Skövde/skovde-ungdom-rantefria-lan, Skövde/skovde-ungdom-sarskilda-insatser, Skövde/skovde-parasportbidrag |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/bidrag-till-bygdegardsforeningar/` | 403 | 200 | Skövde/skovde-bygdegard-lokalbidrag, Skövde/skovde-bygdegard-investeringsbidrag, Skövde/skovde-bygdegard-rantefria-lan |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/` | 403 | 200 | _ingen_ |
| `https://www.skovde.se/naringsliv-foretag-forening/forening/foreningsbidrag/bidrag-till-studieforbund/` | 403 | 200 | Skövde/skovde-studieforbund |
| `https://www.skovde.se/gator-gronomraden/ansvar-for-vagar-och-gator/enskilda-vagar-och-driftbidrag/` | 403 | 200 | Skövde/skovde-enskilda-vagar, Skövde/skovde-enskilda-vagar-statligt-bidrag, Skövde/skovde-enskilda-vagar-sarskilt-driftbidrag, Skövde/skovde-vagforeningar-driftbidrag, Skövde/skovde-vagforeningar-sarskilt-driftbidrag |
| `https://www.sodertalje.se/globalassets/socialkontoret/riktlinjer-for-verksamhetsbidrag.pdf` | 403 | 200 | Södertälje/sodertalje-social-verksamhetsbidrag |
| `https://www.sodertalje.se/kultur-och-fritid/foreningsstod/Representationsbidrag/` | 403 | 200 | Södertälje/sodertalje-representationsanslaget |
| `https://www.sodertalje.se/kultur-och-fritid/foreningsstod/foreningsbidrag/` | 403 | 200 | _ingen_ |
| `https://www.sodertalje.se/contentassets/e8873477707d449f8a7b44cb5ab93ceb/regler-foreningsbidrag-kulturaret-2026.pdf` | 403 | 200 | Södertälje/sodertalje-kulturaret-2026 |
| `https://www.sodertalje.se/kultur-och-fritid/aktuellt_kof/elitidrottsstod--ett-nytt-foreningsbidrag-infors/` | 403 | 200 | Södertälje/sodertalje-elitidrottsstod |
| `https://www.sodertalje.se/globalassets/kof/dokument/kriterier-for-foreningsbidrag-valframjande-insatser-daterad-2026-02-20.pdf` | 403 | 200 | Södertälje/sodertalje-valframjande-insatser-2026 |
| `https://www.sodertalje.se/stad-och-trafik/skotsel-och-underhall/stod-till-enskild-vaghallare/` | 403 | 200 | Södertälje/sodertalje-vagbidrag-enskild-vaghallning |
| `https://www.sodertalje.se/contentassets/5d396db643f94a60af023841f682d951/sk-regler-och-riktlinjer-foreningsbidrag-003.pdf` | 403 | 200 | Södertälje/sodertalje-startbidrag, Södertälje/sodertalje-verksamhetsbidrag, Södertälje/sodertalje-kulturforeningar, Södertälje/sodertalje-aktivitetsbidrag-idrott, Södertälje/sodertalje-lovbidrag, Södertälje/sodertalje-funktionsnedsattning-uppstart, Södertälje/sodertalje-sociala-foreningar, Södertälje/sodertalje-pensionarsforeningar, Södertälje/sodertalje-motesplats-aldre, Södertälje/sodertalje-arrangemangsbidrag, Södertälje/sodertalje-projektbidrag, Södertälje/sodertalje-driftbidrag, Södertälje/sodertalje-anlaggningsbidrag-ridsport, Södertälje/sodertalje-anlaggningsbidrag-samlingslokaler, Södertälje/sodertalje-studieforbund-allmant, Södertälje/sodertalje-studieforbund-funktionsnedsattning |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/bidrag-till-ungdomsorganisationer.pdf` | 403 | 200 | Sollentuna/sollentuna-idrott-aktivitetsstod, Sollentuna/sollentuna-idrott-lokalstod, Sollentuna/sollentuna-idrott-far |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/bidrag-till-foreningsdrift-av-fritidsanlaggningar.pdf` | 403 | 200 | Sollentuna/sollentuna-idrott-fritidsanlaggningar-drift |
| `https://www.sollentuna.se/globalassets/uppleva-och-gora/foreningsliv/bidragsblanketter/blanketter-fritid/bidrag-till-foreningar-som-bedriver-verksamhet-for-personer-med-funktionsnedsattning.pdf` | 403 | 200 | Sollentuna/sollentuna-funktionsratt-aktivitetsbidrag, Sollentuna/sollentuna-funktionsratt-lokalbidrag, Sollentuna/sollentuna-funktionsratt-utbildningsbidrag |
| `https://www.sollentuna.se/uppleva--gora/foreningar-och-foreningsliv/Foreningsbidrag/bidrag-till-kulturforeningar/` | 403 | 200 | Sollentuna/sollentuna-kultur-arrangemangsbidrag |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/riktlinjer-for-ideburet-offentligt-partnerskap-iop-i-sollentuna-kommun.pdf` | 403 | 200 | Sollentuna/sollentuna-tvargaende-iop |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/riktlinjer-for-foreningsbidrag-vard--och-omsorgsnamnden.pdf` | 403 | 200 | Sollentuna/sollentuna-seniorer-foreningsstod |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/bidrag-till-fristaende-enheters-drift-av-fritidsverksamhet.pdf` | 403 | 200 | Sollentuna/sollentuna-ovrig-fristaende-fritidsverksamhet |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/bidrag-till-ideella-kulturforeningar.pdf` | 403 | 200 | Sollentuna/sollentuna-kultur-arsbidrag, Sollentuna/sollentuna-kultur-startbidrag |
| `https://www.sollentuna.se/uppleva--gora/foreningar-och-foreningsliv/Foreningsbidrag/idrotts--och-ungdomsforeningar/` | 403 | 200 | Sollentuna/sollentuna-idrott-utbildningsstod |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/regler-for-kommunalt-bidrag-till-studieforbund.pdf` | 403 | 200 | Sollentuna/sollentuna-studieforbund-bidrag |
| `https://www.sollentuna.se/uppleva--gora/foreningar-och-foreningsliv/Foreningsbidrag/` | 403 | 200 | _ingen_ |
| `https://www.sollentuna.se/globalassets/kommun-och-politik/sa-styrs-sollentuna/sollentuna-forfattningssamling-sfs/bidrag-stiftelser-och-stipendier/regler-for-foreningsbidrag-socialnamnden.pdf` | 403 | 200 | Sollentuna/sollentuna-social-foreningsbidrag |
| `https://evodokweb2.varnamo.se/api/download/fa27ac79-b21c-443e-b556-c50598c273ec/807360f7-9a5a-44b3-b721-301fdaf03508` | 400 | 200 | Värnamo/varnamo-extra-bidrag-kultur |
| `https://www.kristinehamn.se/kultur-och-fritid/foreningar-och-studieforbund/bidrag-for-ideella-foreningar/` | 403 | 200 | Kristinehamn/kristinehamn-anlaggningsstod, Kristinehamn/kristinehamn-arrangemang-idrott, Kristinehamn/kristinehamn-lokalt-aktivitetsstod, Kristinehamn/kristinehamn-verksamhetsbidrag-ungdom, Kristinehamn/kristinehamn-utbildningsbidrag, Kristinehamn/kristinehamn-startbidrag-allmant, Kristinehamn/kristinehamn-anlaggningsbidrag-pensionar, Kristinehamn/kristinehamn-medlemsbidrag-pensionar, Kristinehamn/kristinehamn-projektbidrag-pensionar, Kristinehamn/kristinehamn-startbidrag-pensionar, Kristinehamn/kristinehamn-anlaggningsbidrag-social, Kristinehamn/kristinehamn-startbidrag-social |
| `https://www.sunne.se/kommun/uppleva-och-gora/foreningar-foreningsliv/bidrag-stod-och-stipendier/` | 403 | 200 | Sunne/sunne-lonebidrag |
| `https://www.vastervik.se/Uppleva-och-gora/Foreningar-foreningsliv/stod-bidrag-och-stipendier/` | 403 | 200 | Västervik/vastervik-sarskilt-lokalstod-kultur |
| `https://bibliotek.tingsryd.se/-/kulturnatten-2026` | 403 | 200 | Tingsryd/tingsryd-kulturnatten-2026 |
| `https://www.skovde.se/kommun-och-politik/pengar-du-kan-soka-och-utmarkelser/idrottspriser/` | 403 | 200 | Skövde/skovde-idrottskandidater |
| `https://www.kristinehamn.se/contentassets/3bd94341ec6e4be0874fb8d3e8533d99/riktlinjer-for-kommunalt-bidrag-till-folkbildningsverksamhet.pdf` | 403 | 200 | Kristinehamn/kristinehamn-bidrag-studieforbund |
| `https://www.kristinehamn.se/globalassets/kultur-och-fritid/riktlinjer-for-foreningsbidrag-kulturnamnden.pdf` | 403 | 200 | Kristinehamn/kristinehamn-verksamhetsbidrag-kultur, Kristinehamn/kristinehamn-driftbidrag-kultur, Kristinehamn/kristinehamn-arrangemang-kultur, Kristinehamn/kristinehamn-startbidrag-kultur |
| `https://www.nykoping.se/uppleva--gora/foreningar-och-foreningsliv/sok-bidrag-till-din-forening/` | 403 | 200 | _ingen_ |
| `https://www.nykoping.se/globalassets/nykoping.se/dokument/namnddokument/fordelningsmodell-till-studieforbunden-och-villkor-for-aren-2026---2027.pdf` | 403 | 200 | Nyköping/nykoping-studieforbundsbidrag |
| `https://www.nacka.se/underwebbar/for-anordnare-inom-kulturomradet/kulturstod-och-stipendier/projektstod-till-kulturskoleutveckling-for-funktionsvarierade-barn-och-unga/` | 403 | 200 | Nacka/nacka-projektstod-kulturskola-funktionsnedsattning |
| `https://www.skovde.se/globalassets/kommun-och-politik/taxor-avgifter-och-styrande-dokument/forfattningssamling/riktlinjer-for-foreningsbidrag-fran-socialnamnden.pdf` | 403 | 200 | Skövde/skovde-socialt-startbidrag, Skövde/skovde-socialt-sarskilt-verksamhetsbidrag |
| `https://www.sunne.se/globalassets/dokument/7.-kommun-och-politik/kommunfakta/forfattningssamling/kultur-fritid-turism-och-naringsliv/riktlinjer-for-byapeng-ks-2025-11-05.pdf` | 403 | 200 | Sunne/sunne-byapeng |
| `https://www.sunne.se/kommun/uppleva-och-gora/idrott-motion-och-friluftsliv/hallar-och-idrottsanlaggningar/` | 403 | 200 | Sunne/sunne-kostnadsfri-idrottshall |
| `https://www.sunne.se/globalassets/dokument/7.-kommun-och-politik/kommunfakta/forfattningssamling/kultur-fritid-turism-och-naringsliv/riktlinger-for-sponsring-ks-2025-11-05.pdf` | 403 | 200 | Sunne/sunne-sponsring |
| `https://www.sunne.se/globalassets/dokument/3.-uppleva-och-gora/foreningar-foreningsliv/riktlinjer-for-kommunalt-ekonomiskt-stod-till-foreningar-och-organisationer-2026.pdf` | 403 | 200 | Sunne/sunne-arsbidrag, Sunne/sunne-ledarutbildningsbidrag, Sunne/sunne-startbidrag, Sunne/sunne-aktivitetsbidrag-lok-stod, Sunne/sunne-aktivitetsbidrag-ofrivillig-ensamhet, Sunne/sunne-anlaggningsbidrag, Sunne/sunne-studieforbund-projektbidrag, Sunne/sunne-fast-arsbidrag-sarskilda-organisationer |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-driftstod-till-samlingslokaler-.pdf` | 403 | 200 | Västervik/vastervik-driftstod-samlingslokaler |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-program-och-produktionsstod-i-vasterviks-kommun-.pdf` | 403 | 200 | Västervik/vastervik-pop |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-lokalt-aktivitetsstod-till-foreningar-med-barn--och-ungdomsverksamhet-i-vasterviks-kommun.pdf` | 403 | 200 | Västervik/vastervik-lokalt-aktivitetsstod |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-skotselbidrag-for-underhall-och-rojning-av-skog-och-mark-i-vasterviks-kommun-.pdf` | 403 | 200 | Västervik/vastervik-skotselbidrag-skog-mark |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-extraordinart-bidrag-i-vasterviks-kommun.pdf` | 403 | 200 | Västervik/vastervik-extraordinart-bidrag |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-ersattning-for-antal-medlemmar-i-pensionars--eller-sociala-foreningar-i-vasterviks-kommun.pdf` | 403 | 200 | Västervik/vastervik-medlemsbidrag |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-arligt-bidrag-till-kulturforeningar-i-vasterviks-kommun-.pdf` | 403 | 200 | Västervik/vastervik-arligt-bidrag-kultur |
| `https://www.vastervik.se/globalassets/forfattningssamlingen/foreningar/riktlinje-for-kubik--kommunalt-utvecklingsbidrag-for-idrott-och-kultur--i-vasterviks-kommun-.pdf` | 403 | 200 | Västervik/vastervik-kubik |
| `https://www.vastervik.se/Uppleva-och-gora/Kultur-sevardheter/Stod-bidrag-och-stipendier/Kulturstipendium/` | 403 | 200 | Västervik/vastervik-kulturstipendium |
| `https://www.vastervik.se/Bygga-bo-och-miljo/Samhallsutveckling/Landsbygd/stod-bidrag-och-stipendier/samhallsutvecklare/` | 403 | 200 | Västervik/vastervik-arets-ideella-samhallsutvecklare |
| `https://evodokweb2.varnamo.se/api/download/159d4498-08dd-457a-9df8-4478c114256c/807360f7-9a5a-44b3-b721-301fdaf03508` | 400 | 200 | Värnamo/varnamo-studieforbund |
| `https://evodokweb2.varnamo.se/api/download/13890386-ba96-466f-9dce-8fa1bedf656a/807360f7-9a5a-44b3-b721-301fdaf03508` | 400 | 200 | Värnamo/varnamo-arsbidrag-kultur |
| `https://evodokweb2.varnamo.se/api/download/1bd3e770-5459-4dbb-bbee-b71a45b26a64/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-foreningsvandring |
| `https://evodokweb2.varnamo.se/api/download/31cb1e97-d1a1-4e84-903c-c89217051fd4/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-enskild-vag-istandsattning, Värnamo/varnamo-vagforening-administrativt-stod |
| `https://evodokweb2.varnamo.se/api/download/3709f278-2f65-4056-a23b-ce35c9978e49/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-arrangemangsbidrag |
| `https://evodokweb2.varnamo.se/api/download/376f247d-b194-4b95-8103-9e7bd584ac38/30d45425-1f3f-4e71-89e9-2d751142254e` | 400 | 200 | Värnamo/varnamo-handels-attraktivitetsbidrag |
| `https://evodokweb2.varnamo.se/api/download/4281f4a7-1036-4602-b1a1-b9ebfc9e9f81/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-grundbidrag-ovriga, Värnamo/varnamo-lokalbidrag-ovriga, Värnamo/varnamo-ledarutbildningsbidrag-ovriga, Värnamo/varnamo-extra-bidrag-ovriga |
| `https://evodokweb2.varnamo.se/api/download/54a4d893-2826-4773-a51c-19f4447bb7ad/894dccea-dc2d-4cf8-a03b-023826c87dc7` | 400 | 200 | Värnamo/varnamo-integrationsprojekt |
| `https://evodokweb2.varnamo.se/api/download/5b796921-d83d-4215-bbcb-9d3983c8ba5d/2fc8c2f0-4ae6-40f9-8527-e4bea13068a3` | 400 | 200 | Värnamo/varnamo-enskilt-avlopp |
| `https://evodokweb2.varnamo.se/api/download/682854d1-9a44-433a-ad66-78c7da8ac6df/30d45425-1f3f-4e71-89e9-2d751142254e` | 400 | 200 | Värnamo/varnamo-landsbygdsmiljonen |

### INSTABILA källor

| URL | cron | webb | Bidrag |
|---|---|---|---|
| `https://hogsby.se/uppleva-och-goera/kultur-och-fritid/foereningsliv/bidragsregler/` | TypeError | TypeError | _ingen_ |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=1&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-lokalt-aktivitetsstod |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=12&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-studieforbundsstod |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=14&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-utvecklingsstod |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=15&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-kommunagda-lokaler |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=13&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-arrangemangs-och-evenemangsstod |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=16&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-foreningsagda-anlaggningar |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=17&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-hyresstod |
| `https://friweb.tomelilla.se/bidrag/ansokaninfo.aspx?type=18&year=2026&AspxAutoDetectCookieSupport=1` | TypeError | TypeError | Tomelilla/tomelilla-stod-kulturellt-vardefulla-byggnader |
| `https://cms.staffanstorp.se/wp-content/uploads/2023/03/bidragsregler-for-vaghallning.pdf` | TypeError | TypeError | Staffanstorp/staffanstorp-vagbidrag |
| `https://cms.staffanstorp.se/wp-content/uploads/2025/01/policy-foreningsbidrag-omsorgsnamnden.pdf` | TypeError | TypeError | Staffanstorp/staffanstorp-foreningsbidrag-till-sociala-foreningar-och-organisationer |
| `https://cms.staffanstorp.se/wp-content/uploads/2023/03/regler-for-kommunstyrelsens-foreningsbidrag.pdf` | TypeError | TypeError | Staffanstorp/staffanstorp-kommunstyrelsens-foreningsbidrag |
| `https://hogsby.se/wp-content/uploads/bidragsregler-2025-2029.pdf` | TypeError | TypeError | Högsby/hogsby-lokalt-aktivitetsstod, Högsby/hogsby-upprustningsbidrag, Högsby/hogsby-hyra-extern-lokal, Högsby/hogsby-verksamhetsbidrag-barn-ungdom, Högsby/hogsby-fasta-kostnader-egen-anlaggning, Högsby/hogsby-byapeng, Högsby/hogsby-hembygdsforeningsbidrag, Högsby/hogsby-pensionarsforeningsbidrag, Högsby/hogsby-intresseorganisationer, Högsby/hogsby-kulturforeningsbidrag, Högsby/hogsby-skotselbidrag, Högsby/hogsby-sarskilt-skotselbidrag, Högsby/hogsby-studieforbund-rf-sisu, Högsby/hogsby-ovriga-bidrag-sponsring |
| `https://www.svedala.se/contentassets/b22ad4186e5e40ea8bf3a1c0950cb2f0/ffs3-10-riktlinjer-for-bidrag-till-foreningar-for-funktionshindrade.pdf` | 404 | 429 | Svedala/svedala-funktionsrattsforeningar-verksamhetsbidrag |
| `https://www.svedala.se/contentassets/b22ad4186e5e40ea8bf3a1c0950cb2f0/ffs-3-02-bidragsregler-for-pensionars--och-handikappforeningar-galler-fran-2021-04-08-ta.pdf` | 404 | 429 | Svedala/svedala-pensionars-handikapp-anhorigforeningar |
| `https://hogsby.se/wp-content/uploads/riktlinjer-for-bidrag-till-enskilda-vagar-i-hogsby-kommun.pdf` | TypeError | TypeError | Högsby/hogsby-vag-driftbidrag-statsbidrag, Högsby/hogsby-vag-underhall-investering |
| `https://www.svedala.se/uppleva/kultur-och-fritid/studieforbund/` | 429 | 429 | Svedala/svedala-studieforbundsbidrag |

### OK NU

| URL | cron | webb | Bidrag |
|---|---|---|---|
| `https://vansbro-sok.ciceron.cloud/download/document?filename=RmFzdHN05GxsZCByaWt0bGluamUgZvZyIGJpZHJhZyB0aWxsIHV0dmVja2xpbmdzZ3J1cHBlci5wdWIucGRm&id=339467` | 200 | 200 | Vansbro/vansbro-driftbidrag-utvecklingsgrupper |
| `https://vansbro-sok.ciceron.cloud/download/document?filename=UkVHTEVNRU5URSBG1lIgS09NTVVOQUxBIEJJRFJBRyBUSUxMIFNUVURJRUbWUkJVTkQgSSBWQU5TQlJPIEtPTU1VTiAyMDEyLnB1Yi5wZGY%3D&id=6404` | 200 | 200 | Vansbro/vansbro-studieforbundsbidrag |
| `https://www.alvesta.se/uppleva-och-gora/foreningar-och-foreningsliv/foreningsbrev/` | 200 | 200 | Alvesta/alvesta-lovaktivitetsstod |
| `https://lidingo.se/kultur-fritid/foreningsliv/foreningsbidrag/` | 200 | 200 | Lidingö/lidingo-aktivitetsbidrag, Lidingö/lidingo-startbidrag, Lidingö/lidingo-utvecklingsbidrag, Lidingö/lidingo-skollovsbidrag, Lidingö/lidingo-lokalbidrag, Lidingö/lidingo-driftbidrag |
| `https://overtornea.se/tekniska/gator-och-vagar/` | 200 | 200 | Övertorneå/overtornea-enskild-vag-statsbidrag, Övertorneå/overtornea-enskild-vag-utan-statsbidrag |
| `https://overtornea.se/tekniska/vatten-och-avlopp/` | 200 | 200 | Övertorneå/overtornea-enskilt-avlopp |
| `https://www.alvesta.se/uppleva-och-gora/foreningar-och-foreningsliv/foreningsstod-och-externa-bidrag/` | 200 | 200 | _ingen_ |
| `https://www.overtornea.se/sv/uppleva-och-gora/foreningar/` | 200 | 200 | _ingen_ |
| `https://cms.landskrona.se/wp-content/uploads/2024/12/sarskilda-regler-for-foreningsbidrag-som-delas-ut-av-individ-och-familjenamnden.pdf` | 200 | 200 | Landskrona/landskrona-verksamhetsstod-individfamilj, Landskrona/landskrona-projektstod-individfamilj-omsorg |
| `https://cms.landskrona.se/wp-content/uploads/2024/12/sarskilda-regler-for-foreningsbidrag-som-delas-ut-av-omsorgsnamnden.pdf` | 200 | 200 | Landskrona/landskrona-verksamhetsstod-omsorg |
| `https://cms.landskrona.se/wp-content/uploads/2024/12/sarskilda-regler-for-foreningsbidrag-som-delas-ut-av-teknik-och-fritidsnamnden.pdf` | 200 | 200 | Landskrona/landskrona-aktivitetsstod-7-25, Landskrona/landskrona-aktivitetsstod-70plus, Landskrona/landskrona-lokal-anlaggningsstod |
| `https://www.landskrona.se/uppleva-och-gora/foreningar-foreningsliv/bidrag-och-stod/` | 200 | 200 | Landskrona/landskrona-projektstod-start-ny-forening, Landskrona/landskrona-utbildningsstod, Landskrona/landskrona-nolltaxa |
| `https://www.landskrona.se/uppleva-och-gora/kultur/bidrag-stod-och-stipendier/kulturprojektstod/` | 200 | 200 | Landskrona/landskrona-kulturprojektstod |
| `https://www.landskrona.se/uppleva-och-gora/kultur/bidrag-stod-och-stipendier/kulturstipendium/` | 200 | 200 | Landskrona/landskrona-kulturstipendium |
| `https://www.landskrona.se/uppleva-och-gora/kultur/bidrag-stod-och-stipendier/verksamhetsbidrag-for-studieforbund/` | 200 | 200 | Landskrona/landskrona-studieforbund-verksamhetsbidrag |
| `https://www.landskrona.se/uppleva-och-gora/kultur/bidrag-stod-och-stipendier/unga-ideer/` | 200 | 200 | Landskrona/landskrona-unga-ideer |
| `https://www.landskrona.se/uppleva-och-gora/kultur/bidrag-stod-och-stipendier/verksamhetsstod-till-kulturforeningar/` | 200 | 200 | Landskrona/landskrona-verksamhetsstod-kultur |

## 2. Granskningskön

### Nya flaggor per dag, senaste 14 dagarna

| Datum | Nya flaggor |
|---|---|
| 2026-09-19 | 4 |
| 2026-09-20 | 9 |
| 2026-09-21 | 9 |
| 2026-09-22 | 1 |
| 2026-09-23 | 8 |
| 2026-09-24 | 8 |
| 2026-09-25 | 9 |
| 2026-09-26 | 10 |
| 2026-09-27 | 31 |
| 2026-09-28 | 66 |
| 2026-09-29 | 126 |
| 2026-09-30 | 95 |
| 2026-10-01 | 54 |
| 2026-10-02 | 0 |

Flaggor utan `flaggadSedan` (källor som aldrig setts ändrade, bara varit
otillgängliga sedan första kontrollen): 142.
Flaggor äldre än 14 dagar: 162.

### Flaggor per domän, topp 20

| Domän | Flaggor | Andel av kön |
|---|---|---|
| boras.se | 22 | 3.0 % |
| halmstad.se | 19 | 2.6 % |
| ludvika.se | 17 | 2.3 % |
| pitea.se | 16 | 2.2 % |
| malmo.se | 15 | 2.0 % |
| evodokweb2.varnamo.se | 14 | 1.9 % |
| kristianstad.se | 14 | 1.9 % |
| karlstad.se | 13 | 1.8 % |
| engelholm.se | 13 | 1.8 % |
| skovde.se | 12 | 1.6 % |
| sollentuna.se | 12 | 1.6 % |
| nacka.se | 11 | 1.5 % |
| ovanaker.se | 11 | 1.5 % |
| vastervik.se | 11 | 1.5 % |
| tranas.se | 10 | 1.4 % |
| gnosjo.se | 10 | 1.4 % |
| habo.se | 9 | 1.2 % |
| vallentuna.se | 9 | 1.2 % |
| tibro.se | 9 | 1.2 % |
| hofors.se | 9 | 1.2 % |

### Har huvudinnehållet faktiskt rört sig?

Innehållsregionen plockas i ordningen `<main>`, `<article>`,
SiteVisions innehållsregion. Fördelning av vilken som användes:

| Region | Antal |
|---|---|
| `main` | 506 |
| `article` | 9 |
| `sitevision` | 41 |
| ingen region hittad | 26 |
| svarade inte | 1 |

| Mått | Antal | Av | Andel |
|---|---|---|---|
| Helsidehash **oförändrad mot baslinjen** nu | 46 | 531 | 8.7 % |
| Innehållsregion **stabil** mellan två hämtningar i samma pass | 554 | 556 | 99.6 % |
| ETag **ändrad** mellan två hämtningar sekunder isär | 0 | 24 | 0.0 % |
| Helsidehash lika **flaggningsögonblicket**, olik baslinjen — verklig engångsändring | 250 | 531 | 47.1 % |
| Helsidehash olik **både** baslinje och flaggningsögonblick — ändras vid varje hämtning | 235 | 531 | 44.3 % |

Flaggornas drivkraft:

| Drivkraft | Antal |
|---|---|
| hash | 532 |
| header | 51 |
| okand | 0 |

### Vad som är och inte är jämförbart

Baslinjen i Redis är en hash över **hela** den strippade sidan, inte över
innehållsregionen. Det finns alltså ingen lagrad region-baslinje att
jämföra mot, och "oförändrad mot baslinjen" kan bara mätas på helsidenivå.
Därför tre mått i stället för ett: helsidehash mot baslinje (var flaggan en
transient?), regionens stabilitet inom passet (rör sig innehållet av sig
självt?) och ETagens stabilitet inom passet (är headern brus?). Det tredje
måttet är det som direkt besvarar om detektorn bör byta signal.

De två sista raderna i måtttabellen skiljer de fall som avgör 3B. Lika
flaggningsögonblicket men olik baslinjen betyder att sidan ändrades EN gång
och sedan låg still — flaggan var sann och en människa bör titta. Olik båda
betyder att helsidehashen rör sig vid varje hämtning, alltså att signalen
mäter brus i stället för innehåll.

`regionHash` sparas per källa i JSON-filen. Nästa körning har därmed den
region-baslinje som saknas i dag.

För källor flaggade via header (`baslinjeHash` är null) finns ingen
helsidehash att jämföra mot alls — de räknas bara i de två senare måtten.
