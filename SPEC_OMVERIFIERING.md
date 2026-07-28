# SPEC: Omverifiering

*Opus/Fable 2026-07-27. Den sista obyggda systemrisken. 140 kommuner i dag, 290 vid full täckning. Kommunerna ändrar deadlines, belopp och krav — och sajten visar gammal data med auktoritet tills något upptäcker det. Second opinion pekade ut detta som den största risken mot nollarbetsmodellen, och det är fortfarande sant.*

*Detta är inte samma sak som H22. H22 bevakar ändringar för bidrag någon redan köpt. Omverifieringen upptäcker att en kommun ändrat sig över huvud taget.*

---

## Problemet

Ett bidrag med fel deadline är värre än inget bidrag. En förening som söker mot ett datum som flyttats missar pengarna och får veta att guiden hade fel. Det är exakt det förtroende hela distributionsstrategin bygger på.

Och volymen gör manuell kontroll omöjlig: 140 kommuner × ~8 bidrag = över tusen käll-URL:er, växande mot 2 500.

## Tvåstegsmodellen

**Steg 1 — billig detektering, alla källor, ofta.** Hämta varje unik `kalla_url` och jämför mot en sparad signatur. Kör veckovis.

Signaturen är i första hand `ETag` eller `Last-Modified` ur HTTP-huvudet. Saknas de: en hash av sidans textinnehåll efter att skript, stilar och uppenbart dynamiska element strippats. Kommunsidor har ofta besöksräknare, datumstämplar och nyhetspuffar som ändras dagligen utan att bidragen gör det — en naiv hash ger falsklarm varje vecka och blir brus ingen läser.

Utfall: oförändrad, ändrad, eller otillgänglig (404, timeout, ny struktur).

**Steg 2 — dyr verifiering, bara det som flaggats.** För varje källa som steg 1 markerat som ändrad: en extraktionskörning som läser sidan och jämför mot befintlig YAML. Samma metod som ordinarie extraktion, samma spärrar (aldrig rot-URL, sektorsökning, siffer-literal-regeln).

Utfall per bidrag: oförändrat, ändrat (med diff), borttaget.

Det är arkitekturens poäng: bred billig avsökning, smal dyr bedömning. Att köra full extraktion på alla 140 varje vecka vore ohållbart; att köra den bara på de tio som faktiskt ändrats är trivialt.

## Vad som händer vid en ändring

**Ändrad deadline eller belopp:** uppdatera YAML, committa, och trigga H22 för alla som köpt eller bevakar det bidraget. Det är ansvarsförsäkringen — och det är precis det abonnemanget säljer.

**Borttaget bidrag:** sätt `status: avskaffat` (fältet finns sedan H26). Bidraget försvinner ur matchning och kalender men sidan finns kvar, så en gammal länk inte dör tyst.

**Otillgänglig källa:** markera bidraget som osäkert, men **ta inte bort det**. En kommun som byggt om sin webbplats har inte avskaffat sina bidrag. Tre misslyckade omverifieringar i rad flaggar för manuell översyn.

## H27 — driftvarningen

Sajten säger i dag "Uppgifterna stämdes senast av mot kommunernas egna sidor {datum}". Det är sant men blir en lögn med tiden om ingenting kontrollerar det.

Efter **60 dagar** utan lyckad omverifiering av en kommun ska kommunsidan säga det själv, i klartext och utan ursäkter: att uppgifterna inte kontrollerats sedan dess och att kassören bör verifiera mot kommunen innan hon söker.

Färskhet är hela förtroendemekaniken. En tjänst som medger att den inte vet är mer trovärdig än en som visar ett gammalt datum med samma tyngd som ett nytt.

## Prioritering av kön

1. Bidrag med deadline inom 60 dagar.
2. Bidrag som någon köpt eller bevakar.
3. Kommuner med flest besök (Umami-data).
4. Övriga, roterande.

## Vad som byggs

- `omverifiering.ts`: signaturhämtning, jämförelse, flaggning
- Signaturlagring i Redis per `kalla_url`
- Veckovis cron för steg 1
- Kö för steg 2 som extraktionssessionen läser
- `senast_verifierad` per bidrag
- H27-varning på kommunsidan vid 60 dagar
- Adminvy: vad som flaggats, vad som väntar, vad som misslyckats upprepade gånger

## Vad som inte byggs

Ingen automatisk uppdatering av YAML utan att en extraktion läst sidan.

---

## Genomförandenoter (Code, 2026-07-28)

**Forskning innan bygget:** H22 (`andringsbevakning.ts`) och den gratis deadline-bevakningen (`paminnelser.ts`) behövde INGEN ändring — båda läser `loadKommuner()`/genererar sitt underlag live vid varje körning, så de upptäcker redan automatiskt varje YAML-ändring så fort en rättad fil är deployad. Omverifieringens jobb slutar vid "rättad YAML mergad och deployad".

**Extraktion (steg 2) är inte ett skript i det här repot** — det är en separat Claude Code-session på egen branch (HAIKU_SPEC.md, SLUTSPEC_LANSERING). Det byggda "kön för steg 2" är alltså `scripts/omverifiering-ko.ts`, ett vanligt Node-verktyg forskningssessionen kör lokalt (samma read-write-filsystemsåtkomst en sådan session redan har) — ingen ny webb-API, ingen automatisk YAML-omskrivning.

**Umami — byggs inte.** Ingen server-integration finns i kodbasen (bara en klientspårningstagg). Prioritetstier 3 är en dokumenterad no-op; allt som skulle hamnat där faller in i tier 4 ("roterande" — äldst flaggad sorteras alltid först, ingen extra bokföring krävs).

**H27 är en klientfetch, ingen SSR-omläggning.** Kommunsidan förblir statiskt byggd; en ny `/api/omverifiering-status`-rutt (samma "live ur Redis, no-store"-mönster som `bevakningsantal.ts`) läses av ett scopat script i den nya `OmverifieringsVarning.astro`-komponenten. `'unknown'` (inte `'stale'`) skyddar mot en falsk varning innan cronet hunnit samla data.

**Auto-clear, den enda riktiga designfällan:** baslinjen rullas ALDRIG fram av en vanlig jämförelse — bara när ett forskningspass redan bekräftat bidraget (`senast_verifierad >= flaggadSedan`) EFTER att ändringen upptäcktes, eller manuellt via adminvyns avfärda-knapp. Annars skulle en genuin ändring flaggas en gång och sen tystas nästa vecka, vilket gör hela mekanismen meningslös.

**Ett genuint tekniskt hål som live-testet löste innan det blev en bugg i produktion:** en första körning mot riktiga kommunsidor (400 källor, 15 samtidiga hämtningar, 8s timeout) tog 151 sekunder — långt över den optimistiska `maxDuration: 60`-gissningen. Löst med rätt mekanism i stället för en gissad konstant: en tidsbudget (48s) i cronet som slutar PLOCKA UPP nya källor när den är nära slut (pågående hämtningar hinner avsluta), kortare timeout per anrop (5s, inte 8s — `hamtaResultat` kan göra upp till två anrop), och ett generöst skift-tal (1000) eftersom tidsbudgeten är den verkliga bromsen. Andra körningen: 636 källor på 52 sekunder, väl inom budgeten. Detta krävde att `import.meta.env` fick en `?? process.env`-fallback i tre delade lib-filer (kop.ts, subscribers.ts, omverifiering.ts) plus `.ts`-suffix på interna imports i kommuner.ts/omverifiering.ts — annars kunde `scripts/omverifiering-ko.ts` (ett vanligt node-skript, utanför Vites resolver) inte köras alls. Astro/Vite-byggets beteende är oförändrat (bekräftat: `allowImportingTsExtensions` är redan satt i Astros tsconfig-preset).

**Ett verkligt, oväntat fynd från livetestet:** 19 källor flaggades som "ändrade" mellan två körningar en timme isär. Spårat till EN specifik kommun (Helsingborg): samma ETag-bas (`1351194-1785234141`) men olika suffix (`;br` mot `;;;`) — bekräftat via upprepade anrop (curl OCH Node) att detta INTE är en kodbugg (samma anrop gav stabilt `;;;` varje gång just då) utan kommunens egen CDN/cache som själv producerar olika ETag-suffix för identiskt innehåll vid olika tillfällen. Detta är exakt den klass av falsklarm tvåstegsarkitekturen är byggd för att tolerera billigt (kostar en steg 2-läsning, inte ett datafel) — ingen etag-suffix-heuristik lades till för att gissa bort det, eftersom det hade riskerat att dölja riktiga ändringar hos andra kommuner med legitimt versionerade ETag-suffix.

**Verifierat live, end-to-end, mot riktig data (inga fabricerade URL:er utom i de två cold-start/stale-testerna som self-cleanade):**
- 756 unika käll-URL:er synkade från de 140 kommunernas YAML.
- Hash-fallbacken bekräftad STABIL över två hämtningar 4 sekunder isär (Gislaved, ingen ETag/Last-Modified alls från källan).
- Auto-clear bekräftat end-to-end: en flaggad Helsingborg-post (via en temporär, ALDRIG committad `senast_verifierad`-bump) rullade korrekt tillbaka till `oforandrad` vid nästa kontroll, baslinjen uppdaterad, flaggan rensad.
- H27-statusar: `'unknown'` för en kommun utan data, `'ok'` för en nyss kontrollerad (Helsingborg, 0 dagar), `'stale'` med rätt dagantal (61) för ett fabricerat 61-dagars-gammalt testfall.
- Adminvyns avfärda-knapp testad via en riktig inloggning: `otillganglig` → `oforandrad`, `konsekutivaFel` nollställd.
- All Redis-data denna omgångs manuella testkörningar skapade (756 signaturposter + kö) städad efteråt — cronet kommer bygga upp riktig data på nytt när det faktiskt schemaläggs.

30/30 i verify-matching.ts (oförändrat), 20/20 i verify-omverifiering.ts (nya). Build grönt genom hela bygget.
