# Gislaved – referensrevision för fältstatus och krav

## Genomfört

- Ny statusmodell för `belopp`, `deadline`, `krav` och `giltighet`.
- Standardvärdet för äldre data är `overifierat`; ingen information massklassas som verifierad.
- `krav_fullstandiga` defaultar till `false` och sätts endast aktivt efter normgranskning.
- Startbidragets felvandrade krav om minst 100 deltagaraktiviteter har tagits bort.
- Aktivitetsbidragets och anläggningsbidragets kollapsade krav har ersatts med normernas fulla specialvillkor.
- Relativa tidsfrister för ledarutbildning samt kulturprojekt och arrangemang är uttryckligen dokumenterade.
- Giltighet är endast markerad som angiven där normen faktiskt anger den: Nämndens förfogande ska användas inom ett år.

## Medvetet ofullständiga krav

- Verksamhetsbidrag studieförbund: externa regler från Folkbildningsrådet är inte fullt återgivna, därför `krav_fullstandiga: false`.
- Föreningsbidrag social verksamhet: separat reglemente behöver full dokumentläsning, därför `krav_fullstandiga: false`.

## Nationell kravräkning

Före införandet av statusmodellen innehöll databasen 2 804 bidragsposter. Av dessa hade 1 094 noll krav, 372 ett krav och 1 959 högst två krav. Listan `nationell-kravrakning.csv` följer med som prioriteringsunderlag. Den visar risk, inte automatiskt fel.
