# SPEC: Abonnemanget

*Opus/Fable 2026-07-27. Besvarar H30 — den obesvarade produktfrågan. Grind 2 har infrastruktur (H29 magic-link + Mina sidor, H22 ändringsbevakning) men ingen produkt. Detta definierar produkten så Code kan bygga mekaniken mot rätt löfte.*

*Byggs helt i Stripe sandbox. Humle och Dumle AB fyller `{foretag}`/`{orgnr}`. Partsvalet blockerar inget.*

---

## 1. VAD ABONNEMANGET ÄR

**Fyra saker, i den ordning kassören upplever värdet:**

**Bevakningen** — mejl fyra veckor och tre dagar före varje deadline föreningen faktiskt kan söka. Inte alla kommunens deadlines: bara de bidrag matchningen säger att de matchar. Det är skillnaden mot en gratis kalender.

**Ändringsbevakningen** (H22, redan byggd) — kommunen ändrar krav, belopp eller datum efter att föreningen läst eller köpt. Vi säger till. Detta är ansvarsförsäkringen för hela affärsidén, och den enda funktionen ingen förening kan sköta själv.

**Minnet** — sparade utkast, förra årets ansökan, föreningsprofilen. Nästa års ansökan börjar där förra slutade. Och det ägs av **föreningen**, inte kassören: byts kassören vid årsmötet följer minnet med adressen, inte personen.

**Årscykeln** (H32) — komplettering när kommunen begär det, omprövning vid avslag, återredovisning av beviljat bidrag. Samma motor, återkommande behov, en gång per år varje år.

## 2. VAD DET INTE ÄR

Inte en rabatt på utkast. Utkasten kostar 249 kr styck oavsett abonnemang — annars blir abonnemanget en förköpspott och värdet blir svårt att förklara.

Inte en gratis-kalender med lås. Deadlinekalendern och matchningen förblir gratis. Abonnemanget är det **utgående** — det som söker upp henne, inte det hon söker upp.

## 3. PRIS

**495 kr/år, visat som 41 kr/mån bredvid.** Månadsankringen är redan beslutad och räknad från 495 (41 × 12 = 492). Talet **595** har förekommit i tidigare underlag — det är fel och ska bort överallt, annars uppstår samma motsägelse som 149/249.

Priset testas via väntelistknappen som allt annat. Men det ska vara **samma tal överallt** tills testet svarat.

## 4. VAD SOM SKA BYGGAS

**Stripe (sandbox):**
- Produkt + återkommande pris (495 kr/år) i Stripe Billing
- Checkout mot prenumerationsläge, inte engångsköp
- Webhook: `customer.subscription.created`, `.updated`, `.deleted`. Idempotent — samma prenumeration får aldrig ge dubbel post eller dubbelt mejl.
- Kundportal (Stripe Customer Portal) för uppsägning och kortbyte. Hostat = inget eget bygge, inget underhåll.

**Mina sidor (finns, ska utökas):**
- Abonnemangsstatus med giltighetsdatum: "Gäller till 12 juni 2027"
- Sparade utkast och köphistorik (köphistorik finns)
- Uppsägningslänk till Stripe-portalen

**Bevakningsmotorn (delvis byggd):**
- Dagens bevakning mejlar per kommun. Abonnemangsbevakningen ska mejla per **matchat bidrag** — kräver att föreningsprofilen är ifylld och att `matchKommun()` körs i cronen.
- Fyra veckor + tre dagar före. Nuvarande utskick är två veckor + tre dagar; fyra veckor ger tid att hinna registrera sig om det behövs.

**Adminvy:**
- Läsbar Redis-vy: prenumeranter, abonnemangsstatus, köp. Minimal, inte polerad.

**H11 faktura:**
- Faktura som betalalternativ för abonnemanget. Många föreningar får bara betala mot faktura, och de har mest pengar och längst livslängd. Inte en gate — ett alternativ.

## 5. VAD SOM BLOCKERAR VAD

Ingenting blockerar bygget. Sandbox räcker.

Vid live-växling behövs parten — men det är en konfigurationsändring, inte ett byggberoende.

## 6. YTAN FINNS INTE — DESIGN-UPPDRAG

Det finns i dag ingen sida där abonnemanget presenteras eller köps. Inget ställe där en kassör förstår vad hon får för 495 kr. Det är en yta som ska ritas, inte en text som ska skrivas.

Designfrågan: **var i flödet uppstår behovet av abonnemanget?** Sannolikt inte på en prissida hon söker upp, utan i ett ögonblick där bevakningens värde blir konkret — efter ett köp, efter ett besked med flera framtida deadlines, eller när ändringsbevakningen fångat något. Ytan ska sitta där, inte i en meny.
