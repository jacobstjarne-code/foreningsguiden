# Pass A — först i kön, lagd 2026-10-02

Jacobs order 2026-10-02. Utgångspunkten var de fyra poster som stod kvar utan
stämpel efter att stämpelnivåerna togs bort, och som inte har
`kalla_borttagen` — de enda i hela corpuset där inget av bidragets tre egna
fält är `kontrollast` eller `ingen_regel` medan vi ändå påstår att stödet
finns. Härjedalen och Österåker tas som HELA kommuner, inte bara de
enskilda bidragen, och är flyttade från pass C till pass A i både
`OMVERIFIERING_STEG3_LISTA.md` och `OMVERIFIERING_STEG3_LISTA.json`.

## Ordning

1. **Halmstad** — bara `halmstad-konstnarlig-utveckling`. Kommunen ligger inte
   i någon passlista; `senast_verifierad` är efter listans gränsdatum, så den
   föll ur kön. Det här är ett tillägg utanför listan.
2. **Härjedalen** — hela kommunen, 15 bidrag.
3. **Österåker** — hela kommunen, 5 bidrag.
4. **Bollebygd** — som planerat. Riktlinjen från 2024-10-02 är redan läst och
   `kalla_url` bytt (commit `b9a3dc1`); kvar är fält för fält.

## De fyra poster som utlöste ordern

| Kommun | Bidrag | Status (belopp/deadline/krav) | senast_verifierad |
|---|---|---|---|
| Halmstad | `halmstad-konstnarlig-utveckling` — Stöd till konstnärlig utveckling | olast/olast/olast | 2026-09-17 |
| Härjedalen | `harjedalen-pensionars-och-funktionsrattsbidrag` — Medlemsbidrag och lokalförmån | olast/okand/olast | 2026-08-19 |
| Österåker | `osteraker-bygdegardsbidrag` — Bidrag till bygdegårdar och andra samlingslokaler | okand/olast/olast | 2026-08-03 |
| Österåker | `osteraker-ungas-egen-organisering` — Ungas egen organisering | okand/olast/okand | 2026-09-17 |

## Att veta per post

**Halmstad, konstnärlig utveckling.** Löpande ansökan, källan är kommunens
kultursida. Alla tre fält olast — inget är oberoende kontrolläst.

**Härjedalen, pensionärs- och funktionsrättsbidraget.** `kalla_url` byttes
2026-10-02 från ett borttaget fullmäktigeprotokoll till kommunens nuvarande
Riktlinjer för föreningsstöd. Riktlinjen nämner "Stimulansbidrag till
pensionärsföreningar" i uppräkningen men har inget eget avsnitt — beloppet
25 kr per medlem och lokalförmånen kommer från ett beslut 2018-11-26 som inte
längre finns publicerat. Avgör om stödformen lever. Finns den inte:
`status: avskaffat`, inte radering.

**Österåker, bygdegårdsbidraget.** Källan är en riktlinje-PDF från 2017 på
`www2.osteraker.se` — en gammal domän. Kontrollera om den finns på
`osteraker.se` i nyare form.

**Österåker, ungas egen organisering.** Källan är en ungdomssida utan
regeldokument. Två av tre fält är `okand`, alltså äkta hål, inte extraherade
värden.

## Passfördelningen efter flytten

| Pass | Kommuner | Bidrag |
|---|---|---|
| A | 74 | 728 |
| B | 78 | 707 |
| C | 74 | 689 |

Pass C rör inte längre Härjedalen eller Österåker alls. Ingen kommun delas
mellan två pass, vilket är hela grunden för att passen kan köra parallellt —
varje kommun är en egen YAML-fil.
