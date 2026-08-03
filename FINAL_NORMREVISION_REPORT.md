# Slutrapport efter normrevision

## Omfattning

Föreningsguidens databas omfattar **290 kommuner** och
**2804 bidragsposter**.

Efter den första nationella helrevisionen genomfördes en separat normrevision.
Gislaved användes som pilotkommun och därefter granskades 50 kommuner som
identifierats genom norm-, regel-, riktlinje- eller PDF-underlag. Revisionen
jämförde YAML-posterna med kommunernas mer detaljerade normdokument, inte bara
med kommunernas översiktssidor.

## Genomförda kontroller

- Full build och strukturell validering.
- Exakt 290 kommunfiler.
- Unika bidrags-id:n.
- Deadlineformat och deadline-typer.
- Officiella käll-URL:er.
- Spärr mot URL i `belopp`.
- Spärr mot text i `kalla_url`.
- Kontroll av kommunala totalbudgetar i `belopp`.
- Kontroll av explicita matchningsfält.
- Kontroll av kategori- och filterlogiken.
- Fem normrevisionsblock samt separat Gislavedrevision.

## Resultat

- Statiska fel: **0**
- Bidrag utan explicita matchningsfält: **0**
- Misstänkta totalbudgetar i `belopp`: **0**
- Normreviderade kommuner inklusive Gislaved: **51**
- Kommuner med högst två bidrag: **3**
- Tomma kommun–kategori-par i den matematiska korsningen: **416**

## Kategorifilter

De 416 tomma kommun–kategori-paren innebär inte att användare visas tomma
kategorifilter. Produktkoden skapar endast kategori-piller för kategorier som
faktiskt förekommer bland kommunens bidrag:

`KATEGORIER.filter(k => kommun.bidrag.some(b => b.kategori.includes(k)))`

Den tidigare identifierade felklassen — ett synligt kategori-piller som leder
till ett tomt resultat — finns därför inte i den nuvarande filterlogiken.
Risken kvarstår däremot om ett verkligt bidrag har fel eller saknad kategori,
vilket hanteras genom innehållsrevisionen och inte genom filterkoden.

## Matchningsfält

Samtliga bidragsposter har minst ett explicit fält för krav, målgrupp,
behörighet eller villkor. Detta visar att matchningsunderlaget finns
strukturellt. Det är inte samma sak som att varje formulering kan garanteras
vara fullständig, men normrevisionen har höjt säkerheten särskilt för
kommunerna där detaljerade normdokument identifierades.

## Kvarvarande restlista

- aneby (`aneby`): 2 bidragsposter.
- hultsfred (`hultsfred`): 2 bidragsposter.
- toreboda (`toreboda`): 1 bidragsposter.

De tre kommunerna ovan är kända och tidigare manuellt bedömda. Aneby har en
tvådelad publicerad stödmodell. Hultsfreds detaljer ligger delvis bakom
föreningsinloggning. Töreboda hänvisar till separata riktlinjedokument och är
konservativt modellerad. De är därför dokumenterade innehållsrisker, inte
oupptäckta strukturfel.

Listan med 549 normdokumentkandidater
är en källheuristik, inte en lista över 549
ogranskade bidrag. Samma norm- eller PDF-källa kan förekomma på många poster,
och listan innehåller även de poster som just har normreviderats.

## Kvalitetsbedömning

Databasen passerar den strukturella slutkontrollen efter normrevisionen.
Kända restpunkter är uttryckligen dokumenterade ovan. Normrevisionen ska
betraktas som en innehållsförbättring efter `v1.0.0`, inte som en retroaktiv
flytt av den befintliga taggen.

Nästa versionspunkt bör vara **v1.1.0**, eftersom revisionen innehåller både
nya bidragsformer, rättade deadlines, kompletterade krav och ändrad
fältsemantik för belopp.
