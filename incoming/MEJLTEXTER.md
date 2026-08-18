# MEJLTEXTER — bevakning och påminnelser

Skrivna av Opus 12 augusti 2026. Ersätter mallkoden i `MEJL.*`.
Ämnesrad och brödtext ordagrant. Variabler i klammer.

Läses med KANON.md. Vi påstår aldrig något om hennes förening,
och vi lovar inget bifall.

---

## 1. Bekräftelse — när hon anmäler bevakning

**Ämne:** Bevakningen är igång — {kommun}

Ni bevakar nu föreningsbidragen i {kommun}. Vi hör av oss fyra veckor
före varje sista ansökningsdag, och när kommunen ändrar datum, belopp
eller villkor.

Ingen inloggning, inget konto. Vill ni sluta räcker det med länken
längst ned i varje mejl.

Se vad {kommun} har: {lank}

---

## 2. Påminnelsen — fyra veckor före sista dag

**Ämne:** {bidragsnamn} i {kommun} — fyra veckor kvar

Sista ansökningsdag för {bidragsnamn} i {kommun} är {datum}. Det är
fyra veckor bort.

Har ni sökt bidraget förut brukar det gå fort. Är det första gången
behöver föreningen vara godkänd som bidragsberättigad i kommunen innan
ansökan kan behandlas, och det tar tid att ordna. Kontrollera det nu,
inte i sista veckan.

Se vad kommunen kräver: {lank}

Ändrar kommunen datum, belopp eller villkor hör vi av oss.

---

## 3. Ändringsbeskedet — när kommunen ändrat något

**Ämne:** {kommun} har ändrat {bidragsnamn}

Vi läste {kommun}s sida i dag och något har ändrats sedan sist.

{vad_som_andrats}

Läs hos kommunen: {kalla_url}

Vi kontrollerar era bevakade bidrag löpande. Det här är det enda vi
hittade.

---

## 4. Januarimejlet — giltighet, nivå två

Går ut när föreningen angett årsmötesdatum men kommunen saknar
`giltighet_regel`. Aldrig ett beräknat datum, aldrig ett påstående om
att godkännandet förfaller.

**Ämne:** Är er förening fortfarande godkänd i {kommun}?

I många kommuner måste en förening förnya sitt godkännande som
bidragsberättigad, ofta efter årsmötet. Vi vet inte vad som gäller i
{kommun} — kommunen publicerar ingen regel vi kunnat läsa.

Kontrollera hos kommunen innan ansökningarna öppnar: {kalla_url}

Vi hör av oss i januari varje år tills ni säger till att sluta.

---

## 5. Giltighet, nivå ett — när kommunens regel finns

Går ut två månader före beräknat förfallodatum. Kräver
`giltighet_regel` OCH angivet årsmötesdatum.

**Ämne:** Ert godkännande i {kommun} går ut {manad}

Ni angav att föreningens senaste årsmöte var {arsmotesdatum}. I
{kommun} gäller godkännandet som bidragsberättigad förening
{regeltext}, vilket betyder att ert löper ut {forfallodatum}.

Förnya innan dess, annars kan ansökningar avvisas utan prövning.

Så gör ni i {kommun}: {kalla_url}

---

## 6. Sista påminnelsen — tre dagar före

Går ut tre dagar före sista ansökningsdag, till alla som fått mejl 2 för
samma bidrag. Kort, en enda sak.

**Ämne:** {bidragsnamn} i {kommun} — sista dagen är {datum}

På {datum} stänger ansökan för {bidragsnamn} i {kommun}. Det är om tre
dagar.

Har ni redan skickat in behöver ni inte göra något.

Se vad kommunen kräver: {lank}

---

## 7. LOK-stödet, 28 dagar före

Nationellt stöd, inte ett kommunalt bidrag — går till alla som bevakar
LOK-stödet, oavsett kommun. Samma 28/3-rytm som mejl 2/6, men egen mall:
LOK-stödets sanktionstrappa är exakt och nationell, ingen kommun har en
motsvarighet.

**Ämne:** LOK-stödet — fyra veckor kvar till {datum}

Sista ansökningsdag för LOK-stödet är {datum}. Ansökan avser
aktiviteterna under {period}.

Kontrollera att alla aktiviteter är registrerade innan ni skickar in.
Registrerade aktiviteter är inte samma sak som en inskickad ansökan —
det är det vanligaste sättet att förlora stödet.

En sen ansökan kostar direkt: en vecka sen ger 25 procent avdrag, två
veckor 50 procent, en månad 75 procent. Efter {slutdatum} avslås den.

Så här söker ni: {lank}

---

## 8. LOK-stödet, 3 dagar före

**OFULLSTÄNDIG — Jacobs diktat (U2.2, 2026-08-18) avbröts mitt i.**
Bekräftat ordagrant: ämnesraden och de två första styckena nedan. Resten
saknas — inte kompletterad här, se rapporten samma tur denna rad
skrevs. MEJL.nationellPaminnelseSista i content.ts är ORÖRD (Codex
generiska text) tills det här är klart.

**Ämne:** LOK-stödet — sista dagen är {datum}

På {datum} stänger ansökan för LOK-stödet. Det är om tre dagar.

Har ni redan skickat in behöver ni inte göra något. Är ansökan
[TEXTEN AVBRUTEN HÄR — resten saknas]

---

## Rytm

Två mejl per frist: **28 dagar** och **3 dagar** före sista ansökningsdag.

Inte 30/14/3. Skälet är volym: bevakningens förval är hela kommunen, och
Gislaved har fjorton bidrag. Tre mejl per frist blir fyrtiotvå mejl om året
från en kommun, ofta klustrade februari–april. Bevakningen är produktens enda
återkommande kontakt och tål inte den volymen — den som avregistrerar sig
förlorar vi helt.

Tjugoåtta dagar ger tid att ordna godkännandet som bidragsberättigad förening,
vilket är det som faktiskt tar tid. Tre dagar fångar den som lade undan det.

---

## Regeltext — fraser till mejl 5, giltighet nivå ett

{regeltext} böjs in i meningen "I {kommun} gäller godkännandet som
bidragsberättigad förening {regeltext}, vilket betyder att ert löper ut
{forfallodatum}."

En fras per `giltighet_regel.typ`:

| typ | regeltext |
|---|---|
| `manader_efter_arsmote`, antal 1 | i en månad efter årsmötet |
| `manader_efter_arsmote`, antal n | i {n} månader efter årsmötet |
| `manader_efter_beslut`, antal 12 | i ett år från beslutsdagen |
| `manader_efter_beslut`, antal 13 | i tretton månader från beslutsdagen |
| `manader_efter_beslut`, antal n | i {n} månader från beslutsdagen |
| `fast_datum` | till och med {datum} varje år |
| `kalenderar` | kalenderåret ut |

Saknas typen, eller är den `okand`: mejl 5 går inte ut. Då gäller mejl 4.
Ingen fras uppfinns, inget datum räknas.

---

## Sidfot i varje mejl

Ni får det här för att ni bevakar {kommun}. Avsluta: {avregistrera}

---

## Regler

- Ämnesraden bär kommunen eller bidraget, aldrig "Föreningsguiden".
  Hon känner igen sin kommun, inte oss.
- Ingen versalisering, inga utropstecken, ingen brådskefärg i text.
- Avregistreringslänken finns i varje mejl utan undantag.
- Ett mejl gör en sak. Vi buntar aldrig påminnelse och erbjudande.
- Inget mejl säljer. Köpet sker på sajten, efter att hon klickat.
