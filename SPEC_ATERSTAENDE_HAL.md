# SPEC: Återstående hål, fem kluster

*Opus/Fable 2026-07-27. De 17 orörda hålen ur 32-punktslistan, grupperade efter vad som byggs tillsammans — inte efter granskningsnummer. Plus Designs nya kalenderpunkter (27 juli).*

*Allt byggs i Stripe sandbox. Humle och Dumle AB fyller `{foretag}`/`{orgnr}`. Inget väntar på partsvalet.*

---

## KLUSTER 1 — Efter-köp-ytan (H10, H20, H19)

*Samma ögonblick, samma sida. Idag är ett köp en slutpunkt; detta gör det till en början.*

**H10 — Bokföringsbart kvitto.** PDF i mejl vid varje köp: säljarens namn, org.nr, datum, belopp, momsspecifikation. Hon är kassör — kan hon inte redovisa 249 kr för revisorn betalar hon inte med föreningens pengar. Stripe genererar redan fakturan (`invoice_pdf`); det som saknas är att den innehåller rätt säljaruppgifter och att den mejlas som bilaga, inte bara som länk.

**H20 — Kvittosidan säljer vidare.** Ögonblicket efter lyckat köp är maximalt förtroende och i dag tomt. Tre fortsättningar utan säljtryck: de andra bidragen hon matchade, bevakning av nästa deadline, dela med en annan förening. Ingen av dem är ett nytt köp — de är nästa naturliga steg.

**H19 — Utfallsslingan.** Mejl efter deadline: "Hur gick det?" Beviljat/avslaget/vet inte. Detta är enda äkta social proof ("41 av 52 beviljade"), enda kvalitetsmätningen av generatorn, och naturligaste återkontakten. Att inte fråga är att kasta bort tjänstens viktigaste data.

**Bygg:** kvittomall med säljaruppgifter ur konstanter → PDF-bilaga i köpmejlet. Kvittosidan får tre länkar ur befintlig data. Cron som mejlar utfallsfrågan 14 dagar efter en bevakad deadline, svar sparas på köpet.

---

## KLUSTER 2 — Utkastets leverans (H16, H17)

*Utkastet är ~60 % av jobbet. Detta är resten.*

**H16 — Leveransformat.** Kommunens e-tjänst vill ha klistrbar text eller uppladdad fil, inte löptext på en webbsida. "Kopiera stycke"-knapp per sektion, plus nedladdning som .docx och .pdf. Klipp-och-klistra på mobil i den här åldersgruppen är annars plågsamt.

**H17 — Inlämningsguide och bilagor.** Bilagorna (stadgar, årsmötesprotokoll, budget, verksamhetsberättelse) är den andra halvan av ansökan och den som oftast fäller den. Checklista över vilka bilagor bidraget kräver — hämtas ur `krav[]` — plus länk till rätt e-tjänst ur `ansokningssystem.url`. Detta gör produkten svår att kopiera.

**Bygg:** kopieringsknapp per sektion i utkastvyn, docx/pdf-export, bilagechecklista härledd ur kravtexten, länk till kommunens ansökningssystem.

---

## KLUSTER 3 — En förening blir fler (H7, H31, H9)

*Föreningar i samma ort sitter i samma föreningsråd. Detta är billigare än SEO.*

**H7 — Delbart besked.** Köpbeslutet fattas av styrelsen, inte kassören ensam. Mejla/skriv ut/dela beskedet — delbarhet ÄR köpprocessen i en förening. Varje delning är gratis distribution till exakt rätt målgrupp.

**H31 — Väg till nästa förening.** Efter ett lyckat köp: "Känner ni en annan förening i {kommun} som borde veta det här?" Delningsfunktion, inget värvningsprogram.

**H9 — Paketpris.** Hon matchar fyra bidrag, köpet gäller ett. "Alla fyra utkast" med tydlig prisrad höjer ordervärdet och sänker hennes arbete. Bryggar också till abonnemanget.

**Bygg:** delningsknapp på beskedet (mejl + utskriftsvänlig vy), delningsuppmaning på kvittosidan, paketalternativ i checkout när fler än ett bidrag matchar.

---

## KLUSTER 4 — Ärlig om datans gränser (H24, H25, H26, H4)

*Skyddar förtroendet, som är hela distributionsstrategin.*

**H24 — Täckningsmarkering per kommun.** "Kommunen publicerar inga belopp" där datan är tunn. Flyttar skulden till kommunen där den hör hemma i stället för till tjänsten. Design: en kassör i en tunt beskriven kommun drar annars slutsatsen att tjänsten är dålig.

**H25 — Felrapportering vid uppgiften.** "Det här stämmer inte"-länk vid varje bidrag, inte i prosa på /om/. Hon har ofta ringt handläggaren och vet bättre. Gratis kvalitetskontroll och en delaktighetssignal.

**H26 — Tillstånd för stängt eller borttaget bidrag.** Vad visas när en deadline passerat, ett bidrag pausats eller avskaffats? Och ett redan köpt utkast för det? Inträffar varje år per kommun.

**H4 — Fel kommun är en återvändsgränd.** "Vi täcker inte {kommun} än — vill ni bli meddelade?" Lead plus prioriteringsdata för nästa extraktionsbatch, i stället för en tom sida. 151 kommuner saknas, så detta gäller ungefär varannan besökare.

**Bygg:** täckningsbadge ur datatäthet, felrapporteringslänk per bidrag som mejlar redaktionen, tillståndshantering för passerade/borttagna bidrag, efterfrågeformulär på otäckta kommuner.

---

## KLUSTER 5 — Årscykeln (H28, H32)

*Abonnemangets andra år. Detta är vad som gör tjänsten till infrastruktur.*

**H28 — Förra årets ansökan uppdaterad.** Nästa års ansökan börjar där förra slutade: samma utkast, uppdaterade siffror, ny deadline. En kväll blir tjugo minuter. Detta är abonnemangets starkaste konkreta värde och det syns först år två.

**H32 — Efterspelet.** Kommunen begär komplettering. Avslag kan omprövas. Beviljat bidrag ska återredovisas — obligatoriskt och återkommande. Samma motor, tre nya tillfällen per år, och den enda av dem som är frivillig är omprövningen.

**Bygg:** sparade utkast med årsversionering, "skapa årets ansökan från förra årets" i Mina sidor, mallar för komplettering/omprövning/återredovisning mot samma generator.

---

## DESIGNS KALENDERPUNKTER (27 juli, N2 + N3:3)

*Kalendern har högst köpvilja på sajten och ärvde textproblemet i grövre form.*

- **Månadsgruppering med disclosure** — månad kollapsad, "Snart" öppen. Hundratals rader i en platt tabell är oläsbart.
- **Släpp Läge-kolumnen.** "God tid" upprepas rad efter rad och bär noll information. Urgens ska bara märkas när den avviker.
- **En primär kategori per rad.** Sex värden per rad är samma sak som ingen kategori.
- **Belopp i deadlineraderna.** Finns i datan, visas aldrig. "Upp till 40 000 kr, sista dag om 5 dagar" är inte säljtryck — det är sakuppgiften.

---

## ORDNING

1. **Kluster 4** (ärlig om datans gränser) — billigast, skyddar förtroendet, och H4 gäller varannan besökare eftersom halva Sverige saknas.
2. **Designs kalenderpunkter** — högst köpvilja, och bevakningsknappen finns nu där.
3. **Kluster 1** (efter-köp) — gör köpet till en början i stället för en slutpunkt.
4. **Kluster 2** (leverans) — blockeras av att generatorn är golden set-godkänd.
5. **Kluster 3** (spridning) — bygger på att kluster 1 finns.
6. **Kluster 5** (årscykeln) — meningsfull först när första årets ansökningar finns.
