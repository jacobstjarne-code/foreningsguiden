# SAMLAD STATUSRAPPORT + MÅNDAGSINSTRUKTION

*Fable, söndag 2026-07-19. Läge efter helgsprinten, inför lansering måndag 20 juli.*

---

# DEL 1 — LÄGET

## Klart under helgen

**Infrastruktur (Jacob):** foreningsguiden.se, regelratten.se och regelrätten.se registrerade hos Loopia. DNS flyttad till Cloudflare, namnserverbyte genomfört och propagerat. AI-crawlerpolicy satt mot spec: allow för search, agent OCH training (tvärtemot Cloudflares default — synlighet är affären).

**Spår A (Code):** Dubbel opt-in i drift — `/api/prenumerera` → obekräftad + bekräftelsemejl → `/api/bekrafta/[token]` → confirmed + välkomstmejl. Daglig Vercel Cron 07:00 UTC skickar 14- och 3-dagarspåminnelser, idempotent via Redis-set per (typ, bidrag, datum). Verifierat mot Gislaveds riktiga 07-31-deadline.

Rotorsaksfynd: `SITE_URL` hade en bokstavlig radbrytning insvetsad i värdet sedan dagar tillbaka — varje länk fick en `\n` mitt i sig. Fixat på tre nivåer: värdet rensat i Vercel, `.trim()` som permanent skydd, token flyttad till path-parameter (eliminerar `=` ur länken strukturellt).

**Spår B (Code):** Beta-badge + `/om/`-sektion. Giltighetskollen (årsmötesdatum in, besked ut, `giltighet === null` ger alltid det ärliga icke-svaret och erbjuder ingen påminnelse). Kommunsiffran som valfritt schemafält, fylld för Berg (30 föreningar, 781 117 kr). Väntelistan på station 5 med oberoende klickloggning som intentmätning.

**Batch 1 (research-instans, branch `kommuner-batch-1`):** 30 kommuner, 25 kompletta, 5 delvisa, 0 överhoppade. Produktionsvalideraren körd mot alla 50 — 0 schemafel. Dubbelhämtningen nollställde 10 fält i 7 kommuner och fångade en trolig hallucination i Uddevalla (välformaterad tabell med exakta datum/belopp som bara fanns i ett av två pass).

## Öppna risker

**1. E-postleverans är obevisad.** Gmail tystar mejl med `vercel.app`-länkar — bekräftat med kontrollerat test (samma mejlstruktur mot `example.com` landade på sekunder, `vercel.app` försvann spårlöst i 9+ timmar). Diagnos: länkryktesfiltrering PLUS oautentiserad avsändare (resend.dev, ingen SPF/DKIM/DMARC för foreningsguiden.se). **Måndagens domänbyte åtgärdar bara den första halvan.**

**2. Växjö har en täckningslucka.** Research-agenten uteslöt medvetet publicerade bidragstyper "för att hålla filen hanterbar". Det är ett redaktionellt beslut utan mandat, och till skillnad från ett tomt fält är det osynligt för användaren — sidan påstår sig visa kommunens bidrag men utelämnar tyst. Får inte publiceras som den är.

**3. Kommunväljaren skalar inte.** Fungerar vid 20, blir en vägg vid 50, omöjlig vid 290. Är dessutom hubben i hub-och-eker-strukturen, så den kan inte ersättas av enbart en sökruta utan att SEO-strukturen bryts.

**4. Giltighetsvarningens cron är obyggd** medan widgeten lovar "vi säger till i god tid". Bedömning: acceptabelt att lansera — till skillnad från tidigare fall är detta ett löfte om framtiden vi kan hålla, inte ett falskt påstående om det förflutna. Men det är en **spårad förpliktelse med deadline: byggd före augusti är slut.**

---

# DEL 2 — MÅNDAGSINSTRUKTION TILL CODE

Kör i denna ordning. Stanna och rapportera efter steg 3 innan formuläret öppnas.

## Steg 0 — Två fixar före publicering

**0A. Rendera `OM.ansvarRubrik` och `OM.ansvarStycken` på `/om/`.** De finns i content.ts men renderas ingenstans. Samma mönster som beta-sektionen du just byggde. Detta är E-E-A-T-ankaret (SOKBARHETSSPEC §3.7): namngiven avsändare, ansvarsbegränsningen ("vid skillnad gäller kommunens uppgift") och rättningsvägen för kommuner. Måndag är första crawlen — förtroendesignalerna ska finnas då, och vi publicerar inte 20 kommuners bidragsregler utan förbehåll.

**0B. Felhanteringsgapet i `/api/prenumerera`.** Samma 502-JSON-mönster som du byggde i `/api/giltighetsbevakning`. Ett Resend-fel får inte propagera till Astros generiska felsida på produktens enda aktiva löfte.

## Steg 1 — Domän och DNS

1. Koppla foreningsguiden.se till Vercel-projektet. **DNS-posterna ska vara "DNS only" (grå molnikon) i Cloudflare, inte proxied** — Vercel hanterar CDN och SSL, dubbel proxy ger certifikatstrul.
2. Byt `SITE_URL` i Vercel till `https://foreningsguiden.se`. Verifiera att värdet inte innehåller radbrytning (samma fälla som fredagens bugg).
3. Kontrollera att Astros `site`-konfig, canonicals, sitemap och robots.txt alla pekar på den riktiga domänen.

## Steg 2 — Resend-domänverifiering (nytt, blockerar formuläret)

Detta står inte i den ursprungliga planen men är en förutsättning för att mejlen ska nå fram.

1. Lägg till foreningsguiden.se som verifierad domän i Resend.
2. Lägg in de DNS-poster Resend anger (SPF, DKIM, DMARC) i Cloudflare — samma pass som steg 1.
3. Byt avsändare från resend.dev till `bevakning@foreningsguiden.se`.

Skäl: Gmail och Yahoo kräver sedan februari 2024 SPF, DKIM och DMARC av bulkavsändare. Utan det är vi formellt icke-kompatibla, oavsett länkdomän. Dessutom: en kassör som får post från resend.dev ser nätfiske, och GTM-planen behöver ändå en riktig avsändaradress för PR-pitchar.

## Steg 3 — Skarpt end-to-end-test

Kör hela kedjan mot en **färsk Gmail-adress** som inte tagit emot de trasiga försöken (reputationsskada kan sitta på avsändare–mottagare-paret och ge falskt negativt).

Anmälan → bekräftelsemejl i inkorg → bekräftelseklick → välkomstmejl i inkorg → påminnelse mot syntetisk deadline. Alla fyra ska landa synligt, inte bara rapporteras "delivered" av Resend.

**GRIND: rapportera resultatet innan formuläret öppnas.**

## Steg 4 — Publicering och indexering

1. Formuläret på (endast om steg 3 gick igenom).
2. Sitemap till Google Search Console och Bing Webmaster Tools.
3. IndexNow-ping.
4. Smoke-test på riktiga domänen: kommunsida, kategorisida, kalender, /om/, giltighetskollen, väntelistan.

## Steg 5 — Regelrätten (om tiden räcker)

Koppla regelratten.se till Regelrätten-projektet. Robots.txt med samma allow-all som Föreningsguiden, sitemap, canonicals, Organization-schema, Cloudflare-analytics. Ingen strategi krävs — syftet är att domänålder och crawl-historik börjar byggas gratis. FIXSPEC2 (motorfynden) körs senare, inte nu.

---

# DEL 3 — TILL DESIGN

**Kommunväljaren måste byggas om för skala.** Vid 50 kommuner (batch 1 landar snart) blir dagens knappar en vägg; vid 290 är mönstret omöjligt.

Kravet är dubbelt, och det är därför en sökruta ensam inte räcker: väljaren är **hubben i sajtens hub-och-eker-struktur** (SOKBARHETSSPEC §2.2). Göms 290 länkar bakom autocomplete förlorar vi den interna länkningen som hela SEO-strategin vilar på.

Föreslagen form — utmana gärna, men lös båda kraven:
- **Sökfält överst** för den som vet sin kommun (de flesta)
- **Fullt crawlbar lista grupperad per län** under, med **disclosure-mönstret ni redan byggt** — län som kollapsade sektioner. Innehållet ligger i DOM:en och är crawlbart, men sidan skriker inte.

Detta är samma komponent i ny användning, inte ett nytt mönster.

---

# DEL 4 — TILL RESEARCH-INSTANSEN (inför batch 2)

Lägg till i RESEARCH_SPEC §2 som bindande regel:

> **Täckning är inte förhandlingsbar.** Alla bidrag som hittas på kommunens sidor skrivs till YAML. Filstorlek, hanterbarhet eller överskådlighet är aldrig skäl att utelämna ett publicerat bidrag. Hittas fler bidrag än väntat är det ett resultat, inte ett problem. Om något ändå utelämnas ska det stå i `konflikter.log` med skäl — aldrig tyst.

Batch 2 startar först efter Fables stickprov av fem kommuner (Växjö, Kristianstad, Uddevalla, en komplett-med-konflikt, en komplett-utan-konflikt).
