# Lanseringschecklista — innan Stripe växlas till live

S1.3 (Jacob 2026-08-18). Skriven ur koden 2026-08-18, inte ur minnet —
varje rad har en filreferens. Bocka av, inte memorera.

## 1. Säljaruppgifter i koden och i kvittot

- [ ] `SALJARE` (src/lib/content.ts:661-664) är fortfarande sandbox-
      värdet: `foretag: 'Humle och Dumle AB'`, `orgnr: '556000-0000'`.
- [ ] `SALJARE_VALD` (src/lib/content.ts:674) är `false`. Så länge den
      är det visar `/integritet/` en flaggad ofullständig-rad i stället
      för `{foretag}`/`{orgnr}` (src/pages/integritet/index.astro:31-35).
- [ ] `checkout/registrering.ts` och `checkout/bidragsutkast.ts` vägrar
      redan skapa en session med `sk_live_`-nyckel om `SALJARE_VALD` är
      false (`saljareArKlar()`, se t.ex.
      src/pages/api/checkout/bidragsutkast.ts:43-61).
- [ ] **GAP hittad:** samma spärr finns INTE i `checkout/abonnemang.ts`
      eller `checkout/abonnemang-faktura.ts` — grep bekräftar
      `saljareArKlar` bara i registrering.ts och bidragsutkast.ts. Om
      Stripe växlas till live innan detta är rättat kan ett abonnemangs-
      köp/fakturaflöde skapa en riktig Stripe-faktura med
      "Humle och Dumle AB" som säljare. Rätta innan live, eller
      bekräfta att abonnemangsflödet är avstängt (`ABONNEMANG_LEVERANS_
      LIVE` styr bara påminnelsemejlet, inte själva köpvägen — kontrollera).

Åtgärd: byt SALJARE till den riktiga juridiska parten, sätt
SALJARE_VALD=true i SAMMA commit (kommentaren i content.ts:666-673 är
uttrycklig om det), och lägg saljareArKlar()-spärren i de två
abonnemangsendpointerna.

## 2. Webhookens saknade händelsetyper

`src/pages/api/stripe-webhook.ts:387-415` hanterar idag fyra typer:
`checkout.session.completed`, `customer.subscription.created`,
`.updated`, `.deleted`. Allt annat faller in i en tyst
`{ok:true, hoppadOver: event.type}` (rad 415) — inget sparas, ingen
loggas som fel.

Ingen spec i repo namnger uttryckligen vilka tre som saknas — detta är
resonerat ur koden, inte citerat:

- [ ] **`payment_intent.payment_failed`** — inget kod-spår alls (grep
      efter "payment_failed" gav noll träffar i src/). En misslyckad
      betalning efter att Checkout-sessionen startats syns ingenstans
      hos oss.
- [ ] **`charge.refunded`** — inget kod-spår, inget fält på `KopEntry`
      för refund-status (src/lib/kop.ts:104-129 saknar helt en
      `refunderad`/`refundStatus`-rad). En refund i Stripe-dashboarden
      uppdaterar aldrig vår egen post — kvittot/adminvyn skulle
      fortsätta visa köpet som betalt.
- [ ] **`checkout.session.expired`** — samma sak, inget spår. En
      övergiven session (kort påbörjat, aldrig fullföljt) lämnar inget
      avtryck alls hos oss idag, vilket är rimligt (ingen betalning
      skedde) — men om Jacob vill kunna se "hur många började men
      fullföljde aldrig" krävs den här händelsen.

Åtgärd: lägg tre grenar i samma if/else-kedja (rad 387-414), samma
idempotens-/felmönster som de fyra befintliga.

## 3. Webhooksecret för live

- [ ] `.env.local`s `STRIPE_WEBHOOK_SECRET` är ett `whsec_`-värde för
      TEST-mode-webhooken (kopplad mot `stripe listen`/test-dashboarden).
      Ett live-webhook-endpoint i Stripes dashboard genererar ett EGET
      `whsec_`-värde — detta måste sättas som en separat miljövariabel i
      Vercels produktionsmiljö, inte återanvända testvärdet.
- [ ] Verifiera att Vercels produktionsmiljö faktiskt pekar mot ett
      registrerat live-webhook-endpoint (`https://foreningsguiden.se/
      api/stripe-webhook`) i Stripes LIVE-dashboard, inte bara test.

## 4. Produkter och priser i live-kontot

- [ ] **Redan strukturellt klart** — verifierat i koden: samtliga fyra
      checkout-flöden skapar sin Stripe-produkt/pris DYNAMISKT vid varje
      anrop (`price_data` inline i bidragsutkast.ts:130-137,
      abonnemang.ts:69, registrering.ts:83; `stripe.prices.create()` i
      abonnemang-faktura.ts:86-95 eftersom `subscriptions.create()` inte
      tar inline price_data). Inget manuellt "skapa produkt i Stripe-
      dashboarden"-steg krävs — koden fungerar identiskt i test och
      live.
- [ ] Vad SOM krävs: bekräfta att örebeloppen i `src/lib/priser.ts`
      (PRIS_BIDRAGSUTKAST_ORE=24900, PRIS_REGISTRERINGSUTKAST_ORE=24900,
      PRIS_ABONNEMANG_ORE=49500) är de faktiska, slutgiltiga priserna —
      det är ett affärsbeslut, inte ett kodgap.

## 5. Refundflöde prövat

- [ ] Ingen kod finns att testa än (se punkt 2 — `charge.refunded`
      ohanterad, inget refund-UI i adminvyn). Detta är alltså både en
      byggd-sak-saknas och en testad-sak-saknas i ett — bygg webhook-
      grenen (punkt 2) FÖRE ett riktigt refundtest, annars testar man
      bara att Stripe själv kan refunda (redan känt), inte att vårt
      system reagerar rätt.

## 6. Misslyckad betalning prövad

- [ ] Testbart redan idag utan kodändring: Stripes testkort
      `4000 0000 0000 0002` (nekas alltid) i Checkout-flödet. Verifierar
      att besökaren hamnar rätt (`cancel_url`, se t.ex.
      checkout/bidragsutkast.ts:157 — pekar tillbaka till utkastvyn) och
      att INGEN `checkout.session.completed` (och därmed inget KopEntry,
      inget mejl) triggas för en nekad betalning. Inte gjort ännu — se
      S1.2.

## 7. Integritetspolicyn mot vad som faktiskt samlas in

- [ ] **Redan verifierat, stämmer.** Läst `INTEGRITET` (content.ts:690-
      735) mot faktisk datainsamling:
  - "Köper ni något sparas vad ni köpt, belopp, datum och e-post-
    adress" — matchar `KopEntry` (kop.ts:104-129: email, kommunSlug,
    produkt, beloppOre, stripeSessionId, betaldDatum, + produkt-
    specifika fält som inte är ny personuppgift, bara dokumentinnehåll).
  - "Kortuppgifter ser vi aldrig" — korrekt, Stripe Checkout hanterar
    kortdata, passerar aldrig våra endpoints.
  - "Fyra leverantörer: Stripe, Resend, Upstash, Vercel" — stämmer mot
    faktisk kod (inga andra externa tjänster hittade i src/).
  - Umami (analytics) är namngivet i `cookiesText` (content.ts:726-727)
    — inte bortglömt.
  - Enda öppna posten är punkt 1 ovan (SALJARE/ansvarig-raden), redan
    hanterad med en ärlig platshållartext.

## 8. Testadresser exkluderade ur köpräknaren

- [ ] **Redan byggt.** `TESTKOP_EPOSTADRESSER` (kop.ts:59) innehåller
      `jacob.stjarne@gmail.com`. `arTestkop()` (kop.ts:62-64) utesluter
      den ur `/api/kopantal.ts`s besökarvända räkning (rad 21-22 i den
      filen: `!arTestkop(k)`), men INTE ur adminvyn/kvitton — exakt det
      beteendet kommentaren efterfrågar. Verifieras live i S1.2 (samma
      e-postadress används där, av samma skäl).

---

**Sammanfattning — vad som faktiskt återstår innan Stripe växlas till
live:** punkt 1 (byt SALJARE + lägg spärren i två till endpoints),
punkt 2 (tre webhook-grenar), punkt 3 (live webhooksecret i Vercel).
Punkt 4, 7, 8 är redan klara. Punkt 5 väntar på punkt 2. Punkt 6 är
testbar direkt (S1.2/S1.3-uppföljning).
