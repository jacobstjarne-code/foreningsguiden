# Systemlarmen 26 aug – 23 sep: extraktion och analys

**Ordning (Jacob 2026-09-24):** release → omverifiering steg 3 på alla 2 124
bidrag steg 2 inte rörde (`ORDER_CODE_2026-09-24_OMVERIFIERING_STEG3.md`) →
browserkön → först därefter mätningen och larmvillkoren i avsnitt 3 nedan.
Larmet ändras inte för att slippa granska; det ändras när granskningen är ikapp.

Opus, 24 september 2026. Underlag: 29 mejl "Systemlarm — …" från
bevakning@foreningsguiden.se i Jacobs inkorg (26 aug 07:38 till 23 sep 14:17,
ett per dag från cron/systemlarm 14:00 UTC, 28 av 29 olästa), koden i
src/lib/larm.ts, src/lib/omverifiering.ts, src/lib/omverifieringLogik.ts och
cron/omverifiering.ts, samt git-historiken på omverifiering-steg2-2026-09-17.
Redis har inte lästs: det kräver KV-token, och den ska inte gå genom chatten.

## 1. Vad mejlen innehåller

Två av larmets fem villkor har slagit till. De tre andra (webhook, cron,
mejlfel) har inte larmat en enda gång på 29 dagar, vilket betyder att
betalflödet, alla sju cron och Resend har fungerat.

**Källor olästbara 3+ gånger i rad**, tidsserie ur mejlen:

| Datum | Källor |
|---|---|
| 26 aug 07:38 | 81 |
| 26 aug 14:17 | 103 |
| 27 aug | 150 |
| 29 aug | 151 |
| 1 sep | 164 |
| 5 sep | 167 |
| 8 sep | 172 |
| 10 sep | 176 |
| 14 sep | 182 |
| 17 sep | 183 |
| 23 sep | 183 |

Planar ut på 183 av 2 042 källor (9 %). Mejlet visar bara fem exempel per
dag (EXEMPEL_TAK), så hela listan finns bara i Redis.

**Granskningskön**, när den vuxit:

| Datum | Kö |
|---|---|
| 26 aug | 570 → 599 |
| 1 sep | 823 → 830 |
| 10 sep | 977 → 994 |
| 17 sep | 989 → 1 026 |
| 20 sep | 1 012 → 1 032 |
| 21 sep | 1 032 → 1 044 |
| 22 sep | 1 044 → 1 063 |

Äldsta öppna post 31 juli, alltså 53 dagar. Kön växer med 10–35 poster per
dag. Mellan 17 och 20 sep sjönk den från 1 026 till 1 012, trolig orsak
avfärdanden i adminvyn under omverifieringspasset.

Övriga mejl i perioden är testtrafik: bekräftelser till +test-adresser,
två deadlinepåminnelser för Gislaved (22 och 28 aug), ett ändringsmejl
"Uppdaterade registreringskrav — gislaved" 19 aug till Jacobs testköp, samt
fem felrapporter från ett rate limit-test 17 aug.

## 2. Vad siffrorna betyder

**Kön mäter inte ändringar.** 1 063 flaggade av 2 042 källor betyder att
halva Sverige skulle ha ändrat sina bidragssidor sedan 31 juli. Omverifieringspasset
17–18 sep säger något annat: commit-rubrikerna redovisar 736 granskade
flaggor och 76 rättelser, alltså runt 10 % verkliga ändringar och 90 %
falsklarm. Kön är i praktiken en lista över kommuner vars webbplats rört sig.

Orsaken sitter i hamtaResultat/berakUtfall. Signalen väljs i ordningen
ETag → Last-Modified → hash, och all tre gäller hela sidan. SiteVision och
liknande CMS ger ny ETag eller Last-Modified vid varje publicering på
webbplatsen, även när ingenting i bidragstexten ändrats. Hashfallbacken
rensar datum och skript men hashar fortfarande meny, sidfot och puffar, så
en ändrad meny flaggar varje sida i kommunen. Till det kommer att ett
mekanismbyte (källan slutar skicka ETag) räknas som ändring.

**De 183 olästbara är troligen blockerade, inte döda.** Cronen hämtar
med User-Agent "Föreningsguiden-Omverifiering/1.0" från Vercels IP-rymd
med 5 sekunders timeout, HEAD först. Code läste under omverifieringen
många av samma källor med `curl -A "Mozilla/5.0"`. Mönstret i exemplen
stöder det: hela domäner faller samtidigt (Partilles fem URL:er, alla
20 försök; Haninges fem; Tomelillas friweb), vilket pekar på domännivå
(WAF, bot-regel, geoblock) snarare än enskilda döda länkar. Den här
hypotesen är inte prövad, jag kan inte nå kommunsajterna härifrån.

**Kön kommer att sjunka kraftigt vid release, och det är inte bevis på
något.** Auto-clear rensar en flagga när något bidrag på samma URL har
`senast_verifierad` ≥ flaggans datum. Releasegrenen höjer
`senast_verifierad` till 17 sep eller senare på 881 befintliga URL:er och
lägger till 120 nya. Efter deploy rensas alltså i stort sett alla flaggor
som rör de 881, i takt med att cronen hinner fram till dem (tidsbudgeten
48 s räcker för några hundra källor per dag, så en hel cykel tar gissningsvis
en vecka). De 183 olästbara rensas inte, eftersom auto-clear bara gäller
lyckade hämtningar. Faller kön mot 200–300 efter release är det
omverifieringens förtjänst, inte detektorns.

**Larmet har slutat vara ett larm.** 28 olästa mejl i rad med samma två
rader. Villkoret "kön växte" slår till nästan varje dag eftersom kön
bara kan krympa genom manuellt arbete eller auto-clear. Ett larm som
alltid ringer blir filtrerat, och de tre villkoren som faktiskt betyder
något (webhook, cron, mejlfel) drunknar.

## 3. Vad som behövs

**A. Mät innan detektorn ändras (Code, ett pass, inga produktionsändringar).**
Skript `scripts/omverifiering-matning.ts` som läser alla flaggade och
olästbara signaturer ur Redis (hamtaFlaggade), och för varje URL hämtar
sidan två gånger, med nuvarande UA och med en webbläsar-UA, och
rapporterar:

1. andel av de 183 som svarar med webbläsar-UA men inte med cronens UA, och HTTP-status för båda;
2. för de flaggade som svarar: har huvudinnehållet ändrats (hash på `<main>`, `<article>` eller SiteVision-innehållsregionen, i den ordningen) mot en innehållshash beräknad från samma HTML nu och om 24 timmar;
3. fördelning per kommun (hur många flaggor per domän), för att se om enskilda CMS står för merparten.

Utdata: `incoming/OMVERIFIERING_MATNING_<datum>.md` med tabellerna, plus
JSON med hela listan. Skriptet körs lokalt med .env.local, inte i Vercel.

**B. Beslutsgrind efter mätningen (Jacob).** Stöder mätningen hypoteserna
byter detektorn till innehållshash som enda ändringssignal (ETag/Last-Modified
får bara användas som "oförändrad"-genväg) och cronen till ärligare UA-
strategi. Migreringen måste ta ny baslinje utan att flagga, annars flaggas
alla 2 099 källor på en gång.

**C. Larmet (Code, kan göras direkt, oberoende av A).** Granskningskö-villkoret
ska larma på ålder och trend, inte på dagsökning: larma när äldsta öppna
post passerar 30 dagar första gången, och när kön växt mer än 20 % på sju
dagar. Olästbara källor larmas när antalet ökar, inte varje dag det är
oförändrat. Mejlets ämnesrad ska skilja kritiskt (webhook, cron, mejl) från
underhåll (källor, kö), så att ett kritiskt larm syns i inkorgen.

## STÄNGT

- Full lista över de 183 olästbara källorna. Öppnas av mätskriptet i A, som läser Redis lokalt.
- Direkt ändring av detektorn i releasegrenen. Öppnas av mätningen i A och Jacobs beslut i B; att byta detektor samtidigt som 881 källor auto-rensas gör båda effekterna omätbara.
- Rensning av de 28 olästa larmmejlen. Jacobs inkorg, inte min.
