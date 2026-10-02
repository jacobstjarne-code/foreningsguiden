# Pass A — först i kön, lagd 2026-10-02

Jacobs order 2026-10-02: de fyra bidrag som stod kvar utan stämpel efter att
nivåerna togs bort, och som INTE har `kalla_borttagen`, ska tas först. De är
de enda poster i hela corpuset där inget av bidragets tre egna fält är
`kontrollast` eller `ingen_regel` och där vi ändå påstår att stödet finns.

| Ordning | Kommun | Bidrag | Status (belopp/deadline/krav) | senast_verifierad | Källa |
|---|---|---|---|---|---|
| 1 | Halmstad | `halmstad-konstnarlig-utveckling` — Stöd till konstnärlig utveckling | olast/olast/olast | 2026-09-17 | kommunens kultursida, löpande ansökan |
| 2 | Härjedalen | `harjedalen-pensionars-och-funktionsrattsbidrag` — Medlemsbidrag och lokalförmån | olast/okand/olast | 2026-08-19 | Riktlinjer för föreningsstöd (PDF) |
| 3 | Österåker | `osteraker-bygdegardsbidrag` — Bidrag till bygdegårdar och andra samlingslokaler | okand/olast/olast | 2026-08-03 | riktlinje-PDF på www2.osteraker.se från 2017 |
| 4 | Österåker | `osteraker-ungas-egen-organisering` — Ungas egen organisering | okand/olast/okand | 2026-09-17 | ungdomssidan, inget regeldokument |

## Att veta per post

**Halmstad.** Ligger inte i någon av de tre passlistorna — `senast_verifierad`
är efter listans gränsdatum, så den föll ur kön. Det är ett äkta tillägg.

**Härjedalen.** `kalla_url` byttes 2026-10-02 från ett borttaget
fullmäktigeprotokoll till kommunens nuvarande Riktlinjer för föreningsstöd.
Riktlinjen nämner "Stimulansbidrag till pensionärsföreningar" i uppräkningen
men har inget eget avsnitt — beloppet 25 kr per medlem och lokalförmånen
kommer från ett beslut 2018-11-26 som inte längre finns publicerat. Avgör om
stödformen lever. Finns den inte: `status: avskaffat`, inte radering.

**Österåker, bygdegårdsbidraget.** Källan är en riktlinje-PDF från 2017 på
`www2.osteraker.se` — en gammal domän. Kontrollera om den finns på
`osteraker.se` i nyare form.

**Österåker, ungas egen organisering.** Källan är en ungdomssida utan
regeldokument. Två av tre fält är `okand`, alltså äkta hål, inte extraherade
värden.

## Krock med passfördelningen — måste hanteras

`OMVERIFIERING_STEG3_LISTA.md` lägger **Härjedalen (15 bidrag) och Österåker
(5 bidrag) i pass C**, inte i pass A. Steg 3-ordern bygger på att passen inte
delar kommuner, eftersom varje kommun är en egen YAML-fil — två pass i samma
fil ger konflikter.

Pass A tar de tre bidragen ovan. **Pass C ska hoppa över exakt
`harjedalen-pensionars-och-funktionsrattsbidrag`,
`osteraker-bygdegardsbidrag` och `osteraker-ungas-egen-organisering`** men
köra resten av Härjedalen och Österåker som planerat. Pass A rör inga andra
poster i de två filerna.

Alternativet, om det blir rörigt: låt pass C ta alla tre när det kommer till
Härjedalen och Österåker, och låt pass A bara ta Halmstad. Jacobs bord.
