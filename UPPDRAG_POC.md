# UPPDRAG: Föreningsguiden — Proof of Concept (10 kommuner)

*Skriven av Opus/Fable 2026-07-10. Detta dokument är Codes uppdragsbeskrivning. Frågor som kräver redaktionellt eller strategiskt beslut går tillbaka till Fable/Jacob — gissa inte.*

*Namnbeslut 2026-07-10: arbetsnamnet Bidragskollen ströks (bidragskollen.se upptagen; "bidrag" ensamt drar mot socialbidrag och är för brett för föreningsnischen). Valt namn: **Föreningsguiden** (foreningsguiden.se ledig). Förenings-prefixet nischar och bygger förtroende; "guide" är sant för produkten och lämnar dörren öppen för brand-extension (föreningsjuridik, arbetsgivarregler) längre fram — medvetet val, inte en läcka. Repo-namn: `foreningsguiden`.*

---

## 1. Vad vi bygger och varför

En publik, sökmotorindexerad sajt som samlar Sveriges kommunala föreningsbidrag — regler, belopp, deadlines och ansökningsvägar — organiserat per kommun och föreningstyp. PoC omfattar 10 kommuner.

**Affärshypotesen som PoC:n ska testa:** Efterfrågan är long-tail ("föreningsbidrag Botkyrka", "aktivitetsbidrag kulturförening Jönköping"). Ingen aggregerar den kommunala nivån idag — SERP:en består av 290 separata kommunsidor och generiska wikis. Kassörer och föreningsaktiva missar deadlines med direkta pengaförluster som följd (exempel: Bergs kommun ger 50 % av bidraget vid sen ansökan, avslag efter två månader). Om programmatiska sidor med hög redaktionell kvalitet indexeras och drar trafik, är nästa steg ett betalt bevakningsabonnemang.

**PoC:ns framgångsmått är INTE intäkt.** Det är: (1) indexering, (2) impressions-kurva i Search Console, (3) e-postregistreringar för deadlinebevakning. Kill/skala-beslut fattas vecka 12 efter lansering.

**Förlaga:** Bandy Brain — samma Astro/Vercel-stack, samma dataintegritet (källhänvisning + verifieringsdatum på allt), samma arbetsdelning. Detta är fabrikens andra vertikal; bygg så att pipeline, komponenter och datamodell kan återanvändas för vertikal 2 (stipendier) med minimal ändring.

---

## 2. Arbetsdelning (bindande)

- **Code:** repo, datamodell, sidgenerering, komponenter, deploy, Search Console-koppling, e-postinsamling.
- **Fable (Opus):** ALL svensk brukstext — sidintroduktioner, kategoribeskrivningar, UI-copy, metatexter, FAQ-svar. Code bygger mallar med tydligt markerade content-slots och lämnar placeholder-markörer i formatet `{{FABLE: beskrivning av vad som behövs}}`. Ingen svensk löptext skrivs eller genereras av Code. Datafält (deadlines, belopp, krav) är data, inte löptext — de renderas ur YAML.
- **Jacob:** domänbeslut (se §9), Keyword Planner-siffror, godkännande före publik deploy.

Regel ärvd från Bandy Brain: datafiler och sidor som refererar till dem committas alltid tillsammans.

---

## 3. De tio kommunerna

Vald spridning i storlek, geografi och systemtyp. Flera är redan verifierade som datakällor under research:

| Kommun | Storleksklass | Känt ansökningssystem/notering |
|---|---|---|
| Stockholm | Storstad | Flera förvaltningar, separata bidragsspår (t.ex. socialförvaltningens föreningsstöd) |
| Umeå | Större stad | — |
| Jönköping | Större stad | E-tjänstportal "Mina sidor" (KFF), detaljerade kulturbidragsregler |
| Norrköping | Större stad | Fyra bidragsområden, regler i PDF, nya regler april 2025 |
| Lund | Större stad | — |
| Botkyrka | Storstadsnära | InterbookGo, bidrag även via socialnämnden |
| Upplands-Bro | Storstadsnära | Deadlines 31/3 (lokal/drift) och 31/7 (kultur), startbidrag löpande |
| Gislaved | Mindre | Kvartalsdeadlines: 31/1, 30/4, 31/7, 31/10 |
| Oskarshamn | Mindre | Deadline 1/3, kulturkontoret handlägger |
| Berg | Liten/glesbygd | Löpande ansökan via e-tjänst; sena ansökningar −50 %, avslag efter 2 mån |

---

## 4. Datamodell

En YAML-fil per kommun i `data/kommuner/`. Schema (utkast — Code får justera fältnamn, inte semantik):

```yaml
kommun: "Gislaved"
kommun_slug: "gislaved"
lan: "Jönköpings län"
befolkning: 29000            # för sorterings-/kontextbruk
forvaltning: "Samhällsutvecklingsförvaltningen"
ansokningssystem:
  namn: "Kommunens e-tjänst"
  url: "https://..."
kalla_url: "https://www.gislaved.se/..."
verifierad: 2026-07-10        # datum då datat senast kontrollerades mot källan
bidrag:
  - id: "gislaved-arrangemangsbidrag"
    namn: "Arrangemangs- och projektbidrag"
    kategori: ["kultur"]       # idrott | kultur | social | pensionar | funktionsratt | ovrig
    malgrupp: "Kulturföreningar med säte i kommunen"
    deadlines:
      typ: "fasta"             # fasta | lopande (rev. 2026-07-10: "arlig" struken — en årlig deadline ÄR fasta med ett datum; årsspecifika avvikelser bärs av anteckning-fältet)
      datum: ["01-31", "04-30", "07-31", "10-31"]   # MM-DD, återkommande. Renderas ALLTID i klartext ("31 januari"), aldrig numeriskt
    krav:
      - "Säte i Gislaveds kommun"
      - "Öppet arrangemang, allmänheten informerad"
      - "Kommunens stöd ska framgå i marknadsföring"
    belopp: null               # text eller null om ej publikt
    sen_ansokan: "Ej angivet"  # konsekvens av sen ansökan om känd
    kalla_url: "https://..."
    anteckning: null           # datafält, inte redaktionell text
```

**Datainsamling i PoC:n är kuraterad, inte skrapad.** Fable extraherar bidragsdata ur kommunernas publicerade regler till YAML (LLM-assisterat men manuellt granskat, med källänk och verifieringsdatum per post). Code bygger INTE någon skrapningsautomation nu — det är V2 och en separat riskdiskussion. Codes ansvar är att schemat valideras (bygget ska faila på trasig YAML) och att `verifierad`-datum äldre än 180 dagar renderar en synlig "uppgifterna kan vara inaktuella"-flagga.

---

## 5. Sidstruktur

Statiskt genererat ur datamodellen:

1. **Startsida** `/` — värdeproposition, kommunväljare, deadlineöversikt. Copy: Fable.
2. **Kommunsida** `/kommun/[slug]/` — alla bidrag i kommunen, grupperade per kategori, med deadlines, krav, ansökningslänk och källhänvisning. Primär SEO-yta för "föreningsbidrag [kommun]".
3. **Kategori × kommun** `/kommun/[slug]/[kategori]/` — t.ex. `/kommun/jonkoping/kultur/`. Fångar "bidrag kulturförening jönköping". Genereras bara när kommunen har bidrag i kategorin (inga tomma sidor — tunna sidor skadar hela sajten).
4. **Deadlinekalender** `/deadlines/` — samtliga deadlines över alla kommuner, kronologiskt, filtrerbar på kommun/kategori. Detta är sajtens unika funktion; ingen annan har den. Här sitter e-postregistreringen.
5. **Om/metod** `/om/` — vilka vi är, hur datat verifieras, källpolicy. Förtroendesidan; samma funktion som Bandy Brains metodredovisning. Copy: Fable.

PoC-volym: ca 10 kommunsidor + 30–50 kategorisidor + kalender + start + om ≈ 45–65 sidor.

**SEO-tekniskt (obligatoriskt):** sitemap.xml, robots.txt som tillåter allt, kanoniska URL:er, schema.org-märkning (FAQPage på kommunsidor där FAQ finns, BreadcrumbList genomgående), OG-taggar, `lastmod` ur `verifierad`-fältet. INGEN Basic Auth — till skillnad från Bandy Brain ska detta indexeras från dag ett.

---

## 6. Deadlinebevakning (MVP av verktyget)

Ingen betalning, ingen inloggning i PoC. En e-postregistrering: "Bevaka deadlines för [kommun] — vi mejlar två veckor och tre dagar innan." 

- Formulär: e-post + kommunval (flerval). Lagring: enklast robusta (Vercel KV, alternativt extern lista — Code föreslår, Fable/Jacob godkänner innan något tredjepartsberoende införs).
- Utskicksmotorn behöver INTE byggas i PoC. Registreringarna ÄR mätvärdet. Bygg insamlingen ärligt (dubbel opt-in eller tydlig integritetstext — texten skrivs av Fable) så att listan är användbar när/om verktyget byggs.
- GDPR-minimum: ändamålsbeskrivning vid registrering, avregistreringsväg, ingen vidare användning. Detta är också en förtroendefråga för varumärket.

---

## 7. Stack och struktur

- **Astro + Vercel**, samma upplägg som Bandy Brain. Statisk generering, inga klientberoenden utöver vad kalenderfiltret kräver.
- Repo: `foreningsguiden` (mappen döps om från `bidragskollen` — Code hanterar i samband med första push). Egen Vercel-deploy, eget GitHub-repo — vertikaler delar mönster, inte infrastruktur (en död vertikal ska kunna begravas isolerat).
- Komponenter som ska designas för återbruk i vertikal 2 (stipendier): datakort med källa+verifiering, deadlinelista, kategorinavigation, e-postregistrering. Håll dem generiska över datamodellen, inte hårdkodade mot "kommun".
- Design: enkel, myndighetsnära seriositet snarare än startup-flash. Ingen visuell audit i PoC — men strukturera CSS så Design-instansen kan ta det senare.

## 8. Mätning och kill-kriterier

- Google Search Console kopplas vid deploy. Plausible eller Vercel Analytics för trafik.
- Kontrollpunkter: **vecka 2** — indexeringsstatus (är sidorna i indexet?). **Vecka 8** — impressions-trend. **Vecka 12** — beslut: död kurva ⇒ arkivera; stigande ⇒ utöka till 50 kommuner och bygg utskicksmotorn.
- E-postregistreringar rapporteras löpande; >25 registreringar under period utan marknadsföring är stark signal oavsett SEO-kurva.

## 9. Öppna beslut (Jacob)

1. **Domän.** ~~Beslutat 2026-07-10:~~ **Föreningsguiden**, foreningsguiden.se (ledig — registreras av Jacob hos svensk registrator; Vercel stödjer inte .se-köp). Bidragskollen/förenings-varianter var upptagna; se namnbesluts-noten överst. `site`-fält i astro.config sätts till https://foreningsguiden.se i steg 3.
2. **Keyword Planner-batteriet.** Körs parallellt; påverkar inte PoC-bygget men avgör vecka 12-tolkningen.
3. **Go för publik deploy** efter Fables innehållsgranskning.

## 10. Leveransordning

1. Code: repo-skelett, datamodell + schemavalidering, en kommun (Gislaved — mest strukturerad data) hela vägen till renderad sida med placeholder-slots. **Stopp — Fable granskar struktur och slots.**
2. Fable: brukstext + YAML-data för samtliga tio kommuner.
3. Code: full generering, kalender, e-postinsamling, SEO-teknik, deploy till preview.
4. Fable: innehållsgranskning mot källor. Jacob: go/no-go.
5. Publik deploy + Search Console. Klockan startar på 12-veckorsfönstret.
