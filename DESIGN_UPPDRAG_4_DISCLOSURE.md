# DESIGN-UPPDRAG 4: Progressive disclosure — säg en sak, göm resten

*Från Fable/Projektledning, 2026-07-13. Kort. Löser en spänning som uppstod när vägledningslagret skrevs: sidan behövde mer *mening* men tål inte mer *text*. Svaret är inte volym — det är hierarki.*

*Läses med VAGLEDNING_GISLAVED_PILOT.md (innehållsexemplet) och ovanpå progressionen ni redan byggt (leverans 3). Ändrar inte systemet (DESIGN_UPPDRAG.md §9 står). Ändrar hur mycket som visas åt gången.*

---

## Problemet, rakt

Vägledningslagret gör sidan till en guide i stället för en wiki — men om varje station renderas som fulla stycken byter vi ett problem (för lite mening) mot ett annat (för mycket text på en sida som redan är texttung). En wiki lägger allt bredvid varandra med samma vikt. Det är just det som tröttar.

**Skillnaden mellan wiki och guide är inte mängd text. Det är hierarki.** En guide säger en sak högt och låter resten vika undan tills läsaren vill ha det.

---

## Principen

**Varje station visar EN slutsats. Djupet fälls ut på begäran.**

Ögat ska träffa en rad per station — den viktigaste slutsatsen, skriven som ett besked — och kunna stanna där. Vill läsaren veta *varför*, eller se detaljerna, fäller hon ut resten. Progressive disclosure: informationen finns, men den ligger vikt tills den efterfrågas.

Detta är motgiftet mot "mycket text på sidor som redan är mycket text". Texten försvinner inte — den slutar skrika allt på en gång.

---

## Tillämpat på de fem stationerna (Gislaved som exempel)

För varje station: **SYNLIGT** = det som alltid renderas. **FÄLLBART** = bakom "visa mer / varför?"-utfällning.

### Station 1 — Vad gäller er?
- **SYNLIGT:** väljaren (föreningstyp) + efter val en rad: *"Ni är en kulturförening. Två saker gäller er — vi visar dem nedan."*
- **FÄLLBART:** inget. Station 1 är redan kort.

### Station 2 — Vad är bråttom?
- **SYNLIGT, en rad, det viktigaste beskedet på hela sidan:**
  > **Er verkliga deadline är inte 31 januari — ansök om godkännandet nu.**
- **FÄLLBART (varför?):** hela resonemanget om att godkännandet tar tre månader, att 31 januari därför är utom räckhåll, att 30 april är målet. Tre meningar, dolda tills man undrar.

### Station 3 — Vad måste göras först?
- **SYNLIGT, två rader:**
  > **Först: bli godkänd som bidragsberättigad förening.** Tar upp till tre månader.
  > ⚠ **Ni kan ha förlorat godkännandet utan att veta det** — det kan förfalla.
- **FÄLLBART:** kraven för godkännande (styrelse, stadgar, org.nr, konto). Och under giltighetsvarningen: hela förklaringen av hur statusen underkänns och måste sökas om.
- *Giltighetsfällan får sin egen synliga rad även kollapsad — den är för viktig för att gömmas. Men förklaringen fälls ut.*

### Station 4 — Vad kan ni söka nu?
- **SYNLIGT:** de relevanta bidragen som en kort lista — namn + en rad var. *Arrangemangsbidrag — öppna publika arrangemang, fyra deadlines/år.*
- **FÄLLBART per bidrag:** kraven, detaljerna, vad det inte ges till. Ett bidrag = en kollapsad rad som fälls ut till sitt djup. **Detta löser också det gamla multikategori-problemet:** ett kort som spänner fem kategorier är en rad, inte fem väggar.

### Station 5 — Vad ska ni skriva?
- **SYNLIGT:** slutsatsen + knappen. *"Ansökan bedöms mot fyra krav. Vi skriver ett utkast som bemöter alla."* → **Skapa utkast — 149 kr** → ansvarsrad → exempellänk.
- **FÄLLBART:** vilka de fyra kraven är. Kassören som litar på oss klickar köp; kassören som vill kontrollera fäller ut kraven först. Båda får sin väg.

---

## Interaktionen — tre krav

1. **Slutsatsen är läsbar utan att fälla ut något.** En kassör ska kunna skumma sidan uppifrån och ner, läsa fem rader, och veta exakt vad hon ska göra. Utan en enda klick.
2. **Utfällning är progressiv, inte modal.** Inget som tar över skärmen, inga popups. Texten glider ut under raden, på plats. (Detaljmönstret `<details>`/`<summary>` semantiskt — det är dessutom gratis tangentbords- och skärmläsartillgängligt, vilket matchar WCAG-golvet.)
3. **Default kollapsat, utom giltighetsfällan.** Sidan öppnas i sitt korta läge. Den enda text som är utfälld från start är giltighetsvarningen i station 3, för den är för viktig för att kräva ett klick.

---

## Vad detta INTE är

- **Inte ackordeon där bara en sektion kan vara öppen åt gången.** Stationerna är en väg — man ska kunna fälla ut flera och jämföra. Oberoende utfällningar, inte ett exklusivt ackordeon.
- **Inte gömd information som konverteringstrick.** Vi gömmer inte det som är viktigt för att tvinga fram klick. Slutsatsen är alltid synlig; det är *djupet* som viks, inte beskedet. (Motsatsen — att gömma priset eller kraven bakom utfällning för att pusha köp — är förbjudet, samma regel som resten av den kommersiella ytan.)
- **Inte en systemändring.** Tokens, komponenter, "civil klarhet med skav" står. Detta är ett renderingsmönster ovanpå progressionen, inte en ny estetik.

---

## Varför detta löser Jacobs oro

"Det blir väldigt mycket text på sidor som redan är mycket text." Rätt — och lösningen är att sidan i sitt viloläge är **kortare** än dagens, inte längre, trots att den bär mer mening. Fem slutsatsrader uppifrån och ner. Allt annat är där, en utfällning bort, för den som vill. Guiden säger en sak högt och viskar resten.

---

## Ordning

1. **Design** ritar disclosure-mönstret: kollapsat viloläge + utfällt läge för en station (station 2 eller 3 räcker som mönster). Kort — det är en interaktionsprincip, inte en omritning.
2. **Fable** skriver vägledningen mot den strukturen: en slutsatsrad + fällbart djup per station, i stället för stycken. Piloten (Gislaved) skrivs om till detta format.
3. **Code** bygger, med `<details>`/`<summary>` som grund.
4. **Golden set** skrivs sedan mot det färdiga mönstret, så röst och struktur kalibreras ihop.

Fable väntar in Designs mönster innan vägledningen skrivs skarpt — annars skriver vi återigen text mot en behållare som inte finns.
