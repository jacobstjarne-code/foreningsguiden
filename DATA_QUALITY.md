# Datakvalitet och revisionsprocess

Föreningsguidens nationella bidragsdatabas omfattar Sveriges 290 kommuner.

Databasen har genomgått strukturell validering, manuell helrevision i tolv
block, fördjupad revision av högriskkommuner och global kontroll av deadlines,
belopp och officiella källor.

Version 1.0 definieras av att de tre uppgifter där fel kan orsaka direkt skada
har kontrollerats: ansökningsdatum, officiell källa och belopp eller
beloppsprincip.

## Teknisk slutkontroll

- Kommunfiler: 290
- Bidragsposter med källa: 2790
- Unika käll-URL:er: 947
- Kvarvarande hårda 404/5xx: 0
- Manuellt verifierade falska 404-svar: 41
- Tekniskt blockerade 000/403: 0
- Misstänkta startsidesomdirigeringar: 0

Manuellt verifierade falska 404-svar dokumenteras i
`VERIFIED_LINK_EXCEPTIONS.md` och omprövas vid framtida länkrevisioner.
