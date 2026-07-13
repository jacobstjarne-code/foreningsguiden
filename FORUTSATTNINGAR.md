# FÖRUTSÄTTNINGAR — schemautökning + research + vägledningstext

*Skriven av Opus/Fable 2026-07-13. Underlag för station 3 i progressionen ("Vad måste göras först?"). Designs mock antog data som inte finns i vår YAML — detta dokument stänger den luckan.*

*Till Code: §2 är schemat som ska in i `kommuner.ts`, §4 är vägledningstexten som går i `content.ts`. Till Jacob: §3 är det som gör stationen värd att bygga — och det är abonnemangets starkaste säljargument.*

---

## 1. Bakgrunden

Designs progression (leverans 3) innehåller station 3, "Vad måste göras först?" — förutsättningar med ledtid. Det är den starkaste idén i hela designen: det syns inte alls på sajten idag, och det är ofta viktigare än deadlinen.

Men mocken skrev **"bli bidragsberättigad (~4 v)"**. Den siffran finns inte. Kommunerna publicerar nästan aldrig sin handläggningstid för godkännande. Att uppfinna den vore att bryta grundregeln — vi påstår inget vi inte verifierat, och en sajt vars hela värde är verifierade uppgifter får inte gissa ledtider.

Det kommunerna faktiskt säger är dock viktigare än en siffra. Se §3.

---

## 2. Schemautökning

Nytt toppfält per kommun, vid sidan av `bidrag`:

```yaml
forutsattningar:
  - id: "helsingborg-bidragsberattigad"
    vad: "Bli godkänd som bidragsberättigad förening"
    beskrivning: "Registrera föreningen i föreningsregistret och ansök om att bli bidragsberättigad."
    system: "Rbok"
    ledtid: null                    # heltal dagar ELLER null om kommunen inte anger
    ledtid_text: "Kommunen anger ingen handläggningstid men uppmanar att söka i god tid"
    giltighet: "1 år från beslutsdagen — måste sökas om årligen"   # eller null
    ordning: 1                      # 1 = måste göras först
    kalla_url: "https://helsingborg.se/..."
```

**Regler:**
- `ledtid` är `null` om kommunen inte publicerar en faktisk siffra. **Gissa aldrig.** `ledtid_text` bär då kommunens egen formulering.
- `giltighet` är fällan som gör stationen värdefull (§3.2). `null` om kommunen inte anger.
- `ordning` gör att en kommun med flera steg (Jönköping: kontakta föreningsutvecklare → få inloggning → ansök) renderas i rätt följd.
- Kommuner utan verifierade förutsättningar får `forutsattningar: []` — stationen renderas då inte alls. **Hellre tom än påhittad.**

**Konsekvens för `kommuner.ts`:** validering av nya fältet + villkorlig rendering av stationen.

---

## 3. Det som gör stationen värd att bygga

Två fynd, båda verifierade mot kommunernas egna sidor.

### 3.1 Handläggningstiden finns — men publiceras inte

Kommun efter kommun använder nästan identisk formulering (Helsingborg, Enköping): utöver bidragens sista datum finns en handläggningstid från ansökan till besked, och föreningen uppmanas söka med framförhållning så att ansökan hinner behandlas *innan* deadline passerat.

De varnar alltså — men säger inte hur länge. Vår ärliga formulering blir därför inte "det tar fyra veckor" utan **"det tar tid, kommunen säger inte hur lång tid, och hinner ni inte blir ansökan inte behandlad."** Sannare, och faktiskt mer oroande — alltså mer handlingsdrivande.

### 3.2 Statusen löper ut — och ingen vet om det

**Detta är fyndet.** Godkännandet som bidragsberättigad förening är tidsbegränsat:

- **Helsingborg:** giltigt ett år från beslutsdagen, måste sökas om varje år.
- **Enköping:** ett år från beslutsdagen, **dock som längst en månad efter genomfört årsmöte**.
- **Lund:** görs om **var 13:e månad**.

En förening som fick bidrag förra året **kan ha förlorat sin behörighet utan att veta om det** — statusen dog i tysthet efter årsmötet. Och när kassören upptäcker det, två veckor före deadline, gör handläggningstiden att det redan är för sent.

Ingen aggregator visar detta. Kommunerna begraver det i instruktionssidor. **Och det är den perfekta abonnemangskroken:** *vi säger till innan er status går ut.* Konkret, ekonomiskt, omöjligt att hålla reda på själv — precis vad 495-kronorsabonnemanget ska göra.

### 3.3 Dolda grindar

**Jönköping:** föreningen måste först kontakta KFF:s föreningsutvecklare (med namn, organisationsnummer, kontaktperson) för att få en inloggning — först därefter kan man ansöka om att bli bidragsberättigad. Ett manuellt steg ingen skulle gissa, och som inte går att göra en fredag kväll före deadline.

Sådana grindar är exakt vad station 3 ska avslöja.

---

## 4. Vägledningstexten — de fem stationerna

Går i `content.ts` som `VAGLEDNING`. Mallvariabler i `{}`; Code fyller ur datat. Register: understatement, kassören i centrum, ingen säljton (SOKBARHETSSPEC §3.5 — säljton sänker AI-citering ~26 %). Kort — Design har ritat små behållare.

```ts
export const VAGLEDNING = {
  // Station 1 — Vad gäller er?
  station1: {
    rubrik: 'Vad gäller er?',
    intro: 'Vilken sorts förening ni är avgör vilka bidrag som är möjliga. Välj här, så visar vi bara det som gäller er.',
    sparatText: 'Sparat till ert utkast: föreningstyp — {typ}',
  },

  // Station 2 — Vad är brådskande?
  station2: {
    rubrik: 'Vad är brådskande?',
    introMedDeadline: 'Närmast i tiden: {bidragsnamn}, sista ansökningsdag {datum}. {dagarKvar} dagar kvar.',
    introUtanDeadline: 'Inget av bidragen som gäller er har ett fast sista datum just nu — de söks löpande. Villkoren gäller ändå.',
    sentText: 'En för sen ansökan kostar pengar: {sen_ansokan_text}',
  },

  // Station 3 — Vad måste göras först? (den osynliga fällan)
  station3: {
    rubrik: 'Vad måste göras först?',
    intro: 'Innan ni kan söka något bidrag i {kommun} måste föreningen vara godkänd som bidragsberättigad. Det är ett eget ärende, med egen handläggningstid — och det är här föreningar oftast fastnar.',
    ledtidOkand: '{kommun} anger inte hur lång tid godkännandet tar, men uppmanar föreningar att söka i god tid. Hinner ansökan inte handläggas före bidragets sista datum blir den inte behandlad.',
    ledtidKand: 'Räkna med {ledtid} dagars handläggning innan ni får besked.',
    giltighetVarning: 'Tänk på att godkännandet inte gäller för alltid: {giltighet}. Fick ni bidrag förra året betyder det inte att ni är godkända i år — statusen kan ha gått ut utan besked.',
    extraSteg: 'Ett steg till, som är lätt att missa: {beskrivning}',
    inget: 'Vi har inte hittat några särskilda förkrav för {kommun}. Kontrollera ändå hos kommunen innan ni söker.',
  },

  // Station 4 — Vad kan ni söka nu?
  station4: {
    rubrik: 'Vad kan ni söka nu?',
    intro: '{antal} bidrag i {kommun} passar en {typ}. De ligger ordnade efter vad som är mest angeläget att göra något åt.',
    doldaText: '{antalDolda} bidrag gäller andra sorters föreningar och är dolda.',
    visaAndaLank: 'Visa ändå',
  },

  // Station 5 — Vad ska ni skriva?
  station5: {
    rubrik: 'Vad ska ni skriva?',
    intro: 'Ansökan bedöms mot kommunens egna kriterier. Vi kan skriva ett utkast som utgår från dem och från det ni redan fyllt i här.',
    faltStatus: '{ifyllda} av {totalt} fält är redan ifyllda',
    knapp: 'Skapa ansökan',
    ansvar: 'Vi skriver utkastet. Ansökan lämnar ni in själva, och beslutet fattar kommunen.',
  },
};
```

---

## 5. Data — vad som är verifierat, vad som saknas

**Verifierat mönster (gäller i princip alla 20):** föreningen måste registreras i kommunens föreningsregister och godkännas som bidragsberättigad innan något bidrag kan sökas. Sker i kommunens system (Rbok / InterbookGo / Smartbook / egen portal — se `ansokningssystem` per YAML). Kräver organisationsnummer hos Skatteverket, antagna stadgar, demokratiskt vald styrelse, BankID.

**Verifierat per kommun — klart att fylla i YAML:**

| Kommun | System | Noterat |
|---|---|---|
| Helsingborg | Rbok | Giltig 1 år från beslutsdagen, sökas om årligen. Förening måste ha varit verksam ≥6 mån för övriga bidrag. |
| Lund | Rbok | Görs om **var 13:e månad**. Kommunen skriver själv att processen kan ta tid. |
| Jönköping | KFF | **Dold grind:** kontakta föreningsutvecklaren först → inloggning → sedan ansökan. |
| Gislaved | egen | Subventionerad taxa gäller **tidigast tre månader efter godkänt beslutsdatum** (sällsynt publicerad ledtid). |
| Västerås | InterbookGo | Godkänd bidragsberättigad + RF-anslutning för idrott. Separat spår: "godkänd för föreningstaxa" utan bidragsrätt. |
| Malmö | egen/Rbok | Registrering enligt fritidsnämndens riktlinjer. |
| Göteborg | bokningochbidrag | "Aktivitetsbidragsgodkänd" krävs för aktivitets- och lokalbidrag. |
| Uppsala | egen | "Godkänd aktör" i boknings- och bidragssystemet. |
| Örebro | InterbookGO | Registrerad/godkänd bidragsberättigad. |
| Linköping | InterbookGo | Registrerad bidragsberättigad; SON kräver separat godkännande. |
| Botkyrka | InterbookGo | Registrerad bidragsberättigad. |
| Borås | Smartbook | Bidragsberättigad, registrerad och godkänd. |
| Umeå | Rbok | Registrerad i föreningsregistret. |
| Eskilstuna | Rbok | Registrerad i portalen (BankID/Freja). |
| Stockholm | Idrottsportalen | Idrottsförvaltningens grundkriterier. |

**Saknas — kräver eget researchpass innan publicering:** exakta giltighets- och handläggningstider för flertalet ovan. Endast Helsingborg, Lund och Gislaved har publicerade siffror. **Normalfallet blir därför `ledtid: null` + `ledtid_text`. Det är sanningen, och den är starkare än en gissad siffra.**

**Berg, Norrköping, Oskarshamn, Upplands-Bro, Gävle:** förutsättningar ej verifierade — sätt `forutsattningar: []` tills de researchats, hellre än att anta att mönstret gäller.

---

## 6. Handoff

- **Code:** schemat (§2), valideringen, villkorlig rendering av station 3, `VAGLEDNING` (§4) in i `content.ts`.
- **Fable:** fyller `forutsattningar` i YAML för de 15 verifierade kommunerna; researchpass för de återstående 5.
- **Design:** mocktexten "~4 v" ska bort — ersätts av `ledtidOkand` + `giltighetVarning`. Behållaren behöver rymma **två stycken**, inte en rad: förkravet OCH giltighetsfällan.
- **Jacob:** giltighetsfällan (§3.2) är abonnemangets starkaste säljargument. Värt att skriva in i AFFARSMODELL nästa gång den rörs.

---

## 7. Två anmärkningar från projektledningen

1. **Källfilen i `incoming/` är den gamla.** `.dc.html` är daterad 11 juli 17:27 (leverans 2, utan progressionen). Bara den fristående `.html` (13 juli) innehåller 5a. Behöver Code den redigerbara källan får de fel version — be Design exportera om `.dc`-filen.

2. **Verifieringsdatumen i YAML (2026-07-10) står kvar oförändrade.** De anger när vi läste kommunernas sidor, inte när filerna skrevs. Det är korrekt och ska inte "uppdateras" till dagens datum.
