# SPEC: Kluster 1 — efter-köp-ytan

*Opus/Fable 2026-07-28.*

## H10 — Bokföringsbart kvitto

Stripe genererar redan invoice_pdf. Det som saknas är två saker: att fakturan bär rätt säljaruppgifter, och att PDF:en mejlas som bilaga — inte bara som länk. En kassör som ska lämna underlaget till revisorn ska inte behöva leta upp en webbsida ett år senare.

Säljaruppgifter läses ur samma konstanter som OM.avsandarStycken ({foretag}, {orgnr}). Momssats som egen konstant MOMSSATS — digitala tjänster till svensk förening är 25 procent, men sätt det som konstant så det kan rättas utan kodändring om revisorn säger annat.

Kvittomejlets text:

Ämne: Kvitto — Föreningsguiden

Tack för ert köp. Kvittot ligger som bilaga (PDF) och går att spara i föreningens bokföring.

Vad ni köpt: {produkt}
Belopp: {belopp} kr inklusive moms
Datum: {datum}

Behöver ni kvittot igen finns det alltid under Mina sidor.

## H20 — Kvittosidan pekar vidare

Ögonblicket efter köp är maximalt förtroende och i dag tomt. Tre fortsättningar, alla ur befintlig data, ingen av dem ett nytt köp:

Medan ni är här

Ni matchade {antal} bidrag till i {kommun}. [Se dem]

Nästa deadline i {kommun} är {datum}. Vi kan säga till fyra veckor innan. [Börja bevaka]

Känner ni en annan förening som borde veta det här? [Dela]

Ingen av raderna visas om underlaget saknas — matchade bidrag hämtas ur profilen, nästa deadline ur kalenderdatan, delningen är alltid tillgänglig.

## H19 — Utfallsslingan

Cron som mejlar fjorton dagar efter en bevakad deadline där föreningen köpt ett utkast. Tre svarsalternativ som länkar till en enkel route, svaret sparas på köpet i Redis.

Ämne: Hur gick det med {bidrag}?

Sista ansökningsdag för {bidrag} i {kommun} var {datum}. Vi är nyfikna på hur det gick — svaret hjälper oss göra utkasten bättre, och vi visar aldrig enskilda föreningars utfall.

[Vi fick bidraget] [Vi fick avslag] [Vet inte än]

Fick ni avslag och vill veta om beslutet går att ompröva, svara på det här mejlet.

Svaren ger tre saker vi inte har: äkta social proof i aggregat ("41 av 52 beviljade"), enda kvalitetsmätningen av generatorn, och en naturlig återkontakt. Sista raden är ingången till H32 (omprövning) utan att sälja något.

Idempotens gäller alla tre — samma köp får aldrig ge dubbla kvitton, samma deadline aldrig dubbla utfallsfrågor. Samma fälla som Upstash-buggen i H22.

---

## Genomförandenoter (Code, 2026-07-28)

**Blockerad förutsättning:** specen antar att `OM.avsandarStycken` med `{foretag}`/`{orgnr}` redan finns. Det gör de inte — `content.ts` har bara `OM.avsandarPlatshallare`, en enda `{{TODO}}`-platshållare, eftersom juridisk part inte är vald än (SPEC: Betalintegration §6 steg 3). H10 byggdes mot en ny, parallell `SALJARE`-konstant (samma öppna fråga, samma platshållarkonvention) plus en live-lägesspärr i `checkout/registrering.ts`: går `STRIPE_SECRET_KEY` mot `sk_live_` medan `SALJARE` fortfarande är TODO, vägrar routen skapa en faktura i stället för att skicka en riktig kund en faktura med platshållartext.

**Momsspecifikation:** löst utan Stripe Tax Rate-objekt (som hade krävt ett permanent konto-sidoeffekt-API-anrop) — i stället en beräknad `custom_fields`-rad ("Varav moms (25%)") direkt på fakturan, härledd ur `MOMSSATS`/`momsAndelOre()` (priser.ts).

**H20 är serverstatisk + klientberäknad:** `kommun/[slug]/registrera/index.astro` är `getStaticPaths()`-byggd, ingen request-tid-server-kod. Föreningsprofilen bor bara i `localStorage`. "Medan ni är här" hämtar `/kommun-data/{slug}.json` (samma endpoint matchningstratten redan använder) och kör `matchKommun`/`earliestDeadlineISO` i webbläsaren — samma mönster som `matcha/index.astro`.

**H19:s "utfall" är per bidrag, inte per köp:** en registrering är kommun-scopad och kan matcha flera bidrag med olika deadlines — `KopEntry.utfall` är en array (`{bidragId, bidragNamn, svar, svaratDatum}[]`), inte ett enda fält.

Verifierat live (Stripe-sandbox, riktigt testköp via Playwright mot Stripe Checkout, `delivered@resend.dev`): fakturans `custom_fields` innehåller Säljare/Org.nr/Momsrad korrekt, kvittomejl med PDF-bilaga skickat felfritt, kvittosidans tre rader (matchade bidrag, nästa deadline + bevaka-widget, dela) renderade och fungerade, cronet (`?today=`-testkrok) hittade och mejlade rätt köp vid rätt datum, kördes två gånger för att bekräfta idempotens (andra körningen: 0 skickat, 2 skippat), och svarslänken sparade rätt utfall på köpet — synligt i adminvyns nya aggregat och per-köp-rad. All testdata Code skapade denna omgång städad ur Redis efteråt.
