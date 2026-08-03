# KVAR — Fables öppna uppgifter (Föreningsguiden)

*Skriven 2026-07-27. Läses vid sessionsstart enligt Jacobs arbetsordning. Syftet: Fables uppgifter ska överleva kontextfönstret. En uppgift som bara finns i en chatt försvinner när chatten gör det.*

*Detta är bara Fables/Opus copy- och beslutsuppgifter. Code har sina egna. Datagranskning ligger inte längre hos Fable.*

---

## VÄNTAR PÅ GRINDRESULTAT (gör inget förrän det kommit)

**Fem sista golden set-facit (Arvika).** 10 av 15 skrivna: omgång 1 i `GOLDEN_SET_FACIT.md` (Gislaved, Arjeplog — tunn data, testar om generatorn hittar på), omgång 2 i `GOLDEN_SET_FACIT_2.md` (Askersund, Bjuv — publicerade belopp, testar om den ändrar tal som finns).

**Kör grinden med 10 först.** Fälls generatorn på facit 9 (Bjuvs differentierade belopp: "8 kronor per deltagare (4 kronor för skolidrottsföreningar)") är fem fler facit bortkastad tid — då ska generatorn fixas, inte mätas mer.

---

## COPY SOM KAN SKRIVAS NU

**GJORT 27 juli (ligger okommitterat i `src/lib/content.ts` — behöver commit+push för att bli live):**

- ~~Meta-titel/description i tjänsteform~~ — `START.metaTitle` = "Vilka föreningsbidrag kan er förening söka?", description matchar H1:s löfte. `h1`/`hero`/`heroKort` i samma block används INTE längre (index.astro läser DESCRIPTOR + TRATT.start) — markerat i kommentar.
- ~~Verifiera fyra copyfixar~~ — alla fyra finns kvar i filen (`BETA.rad`, `BETA.omStycken` med `{antalKommuner}`, `MEJL.valkomst`, `VANTELISTA`). De överlevde MCP-kraschen. De är okommitterade, därför inte live.
- ~~Avsändartexten (H1/grind 0)~~ — TODO-platshållaren borta, ersatt av `OM.avsandarStycken` med `{foretag}`/`{orgnr}` som konstanter. Partsvalet blockerar inte; Humle och Dumle AB fyller konstanterna i sandbox.

**KVAR:**

**1. Väggens copy.** Designs lösning på earned curiosity: ett **verkligt genererat stycke** (den sektion profilen faktiskt kan fylla) ovanför krav-checklistan, plus länk till ett fullständigt exempelutkast från en annan förening. Sann text + bevisad täckning. Checklistan ensam bevisar täckning men aldrig röst, och det är rösten hon tvekar på. **Kräver att Fable ser vad `genereraUtkast()` faktiskt producerar** — läs `src/lib/generator.ts` först.

**2. Registreringsutkastets copy.** Knapptexten ("Vi kan förbereda er registreringsansökan...") och kvittoraden ("Betalningen gick igenom...") är Code-skrivna platshållare. Produkten är skarp och automatisk — den förtjänar riktig text. Ligger i `registrering.ts` / komponenten, inte i content.ts.

**3. Integritetspolicy + återbetalningspolicy (H13, H23).** `/integritet/` har en `{{FABLE:}}`-slot. Blockeras INTE av partsvalet. Öppen fråga i `DATAINVENTERING_GDPR.md`: `kop:*`-poster rörs inte av raderingsbegäran (bokföringslagen) — formulera det i policyn.

---

## LÖST — TA INTE UPP IGEN

**Partsvalet blockerar ingenting.** Allt byggs i Stripe sandbox med Humle och Dumle AB som platshållare. Parten behövs bara för att ta emot riktiga pengar. Fable har felaktigt behandlat det som blockerare för fem saker i flera pass — det är fel.

**Kassörssamtalen.** Jacob har sagt uttryckligen: ta inte upp dem igen. De blir kanske inte av före lansering och det är ett legitimt val.

**"Vi skriver allt utom det bara ni vet"** är produktlinjen (Designs formulering). Luckor namnges före köpet, aldrig procent. Redan inskriven i `VANTELISTA`.

---

## ARBETSORDNING (varför den här filen finns)

Fable har genomgående sett systemet och missat människan. Designs granskning fann 32 hål mot Fables 8 kategorier, och de skarpaste (bokföringsbart kvitto, leveransformat, föreningens minne vs kassörens) var de kassörsspecifika.

**Design granskar varje betydande yta INNAN den kallas klar, inte efter.** Två gånger har en yta bedömts färdig utan Designs ögon och visat sig vara halv.

**Fable får inga batch-rapporter** (beslut 27 juli). Datagranskning ligger hos en instans med det som enda uppgift. Skälet: batch-rapporter satte agendan varje pass och drog Fable ner i YAML-detaljer medan produkten stod still.
