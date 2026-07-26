# Datainventering — underlag för integritetspolicy (H23)

*Code, 2026-07-26. Teknisk inventering, inte policytext — se
`src/pages/integritet/index.astro` för sidan där Fable/Jacob skriver
den faktiska rättighets-/policyformuleringen. Detta dokument svarar
bara på "vad lagras var, och vad gör raderingsvägen faktiskt idag".*

---

## 1. Var datan lagras

Upstash Redis (`@upstash/redis`), samma databas för alla nedanstående.
Ingen annan datalagring finns i produkten (inget separat CRM, ingen
analytics-plattform utöver Umami — se nedan).

## 2. Vad som lagras, nyckel för nyckel

| Nyckelmönster | Innehåll | Varifrån | Fil |
|---|---|---|---|
| `prenumerant:<email>` | `Subscriber { email, kommuner[], registrerad, confirmed, giltighetArsmoten?, foreningsprofil? }` | Deadlinebevakningens formulär, bekräftelsemejl, matchningstrattens "Hjälp oss registrera" (mergar in `foreningsprofil`) | `src/lib/subscribers.ts` |
| `prenumeranter:index` | Set av alla e-postadresser | — | samma |
| `bekraftelsetoken:<token>` | E-postadress, TTL **7 dagar** (raderas automatiskt av Redis) | Dubbel opt-in-flödet | samma |
| `vantelista:<email>` | `VantelistaEntry { email, kommunSlug, bidragId, syfte, registrerad }` | Utkasttjänstens väntelista (innan betalning fanns) | `src/lib/vantelista.ts` |
| `vantelista:index` | Set av alla e-postadresser i väntelistan | — | samma |
| `vantelista:klick:<kommunSlug>:<bidragId>` | Räknare (inget personuppgiftsinnehåll — bara ett antal) | Klick på väntelista-knappen | samma |
| `kop:<stripeSessionId>` | `KopEntry { email, kommunSlug, produkt, beloppOre, stripeSessionId, betaldDatum, foreningsprofil? }` | Ett bekräftat Stripe-köp (webhook) | `src/lib/kop.ts` |
| `kop:index` | Set av alla Stripe session-id:n | — | samma |

**Foreningsprofil-fälten** (inom `Subscriber`/`KopEntry`): `kommunSlug`,
`verksamhet[]` (kategori, t.ex. "kultur"), `storlek` (bucket: xs/s/m/l,
INGET exakt medlemsantal), `alder` (bucket: ny/mellan/etablerad, INGEN
exakt grundningsdatum), `sokt` (ja/nej/osäker — har föreningen sökt
bidrag förut). Ingen förenings namn, inget organisationsnummer, inget
kontonummer lagras — det samlar tjänsten inte in alls idag.

## 3. Tredjepartsbehandlare

- **Resend** (transaktionsmejl — bekräftelse, påminnelser, kvitto,
  interna driftnotiser) — mottar e-postadress + mejlinnehåll vid
  utskickstillfället.
- **Stripe** (betalning) — mottar e-post, betalningsuppgifter (aldrig
  synliga för oss, PCI-scope ligger hos Stripe), köpmetadata
  (kommunSlug, en komprimerad version av `foreningsprofil`).
- **Umami Cloud** (besöksstatistik) — cookiefri, ingen personuppgift
  kopplad till namn/e-post, bara aggregerad sidvisningsstatistik.
- **Vercel** (hosting) — serverloggar i den mån Vercels egen
  standarddrift skapar dem.

## 4. Vad raderingsvägen (`/avregistrera/`) faktiskt gör idag

`removeSubscriber(email)` (`src/lib/subscribers.ts:169`) är en **hård
radering**: `redis.del(prenumerant:<email>)` + `redis.srem(...)` ur
indexet. Tar bort HELA `Subscriber`-posten, inklusive en eventuell
`foreningsprofil`.

**Täcker INTE:**
- `vantelista:<email>` — separat nyckel, samma e-post kan ligga kvar
  där även efter en `/avregistrera/`-radering. **Öppen fråga**: bör
  raderingsvägen utökas att även ta bort denna? Sannolikt ja (samma
  syfte, ingen legal anledning att behålla den), men inte gjort — inte
  byggt i den här omgången.
- `kop:<stripeSessionId>` — **medvetet inte rört**. Ett bekräftat köp
  är sannolikt ett bokföringsunderlag (kvitto, belopp, datum), och
  svensk bokföringslag kräver typiskt att sådant sparas i flera år
  oavsett en enskild radering av personuppgifter i övrigt. **Detta är
  en juridisk avvägning Code inte kan göra** — Jacob/revisor behöver
  bekräfta: (a) om `kop:`-poster omfattas av bokföringslagens
  sparkrav, och (b) om e-postadressen i en sådan post ändå ska kunna
  raderas/pseudonymiseras vid en GDPR-begäran medan beloppet/datumet
  behålls. Policyn på `/integritet/` bör spegla vad ni landar i,
  inte vad Code antar.

## 5. Vad som INTE lagras

Inga lösenord (ingen inloggning finns ännu — H29/Mina sidor, senare
grind). Ingen betalkortsdata (Stripe Checkout, utanför vårt PCI-scope
helt). Ingen platsdata utöver självrapporterad kommuntillhörighet.

## 6. Öppna frågor till Jacob/revisor innan `/integritet/` kan skrivas färdig

1. Ska `kop:`-poster kunna nås av en raderingsbegäran (pseudonymisera
   e-post, behåll transaktionsdata), eller är hela posten undantagen
   bokföringsplikten?
2. Hur länge sparas en obekräftad `bekraftelsetoken`-rad i praktiken
   (redan 7 dagars TTL, automatiskt) — är det värt att nämna i policyn?
3. Ska `/avregistrera/` byggas om till att även rensa `vantelista:`-
   poster för samma e-post (litet, oberoende jobb, inte del av denna
   Grind 0-leverans)?
