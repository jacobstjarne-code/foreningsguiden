# Instruktion: Kluster 3 — en förening blir fler

*Jacob 2026-07-28. Föreningar i samma ort sitter i samma föreningsråd; det här är billigare än SEO.*

## H7 — delbart besked

Köpbeslutet fattas av styrelsen, inte kassören ensam. Delbarhet är köpprocessen i en förening. Mejlknapp och utskriftsvänlig vy på matchningsbeskedet:

Dela beskedet
Skicka till styrelsen eller skriv ut inför nästa möte.
[Mejla] [Skriv ut]

Mejlversionen ska innehålla de matchade bidragen, beloppen och deadlines — inte en länk till en sida som kräver att svaren fylls i på nytt.

## H31 — väg till nästa förening

På kvittosidan, som redan har delningsraden. Skärp den:

Känner ni en annan förening i {kommun}? De söker sannolikt samma bidrag och missar samma deadlines. [Dela Föreningsguiden]

## H9 — paketpris

När fler än ett bidrag matchar, erbjud alla i ett köp:

Ni matchade {antal} bidrag. Vi kan göra utkast till alla — {paketpris} kr i stället för {styckpris} kr per bidrag.

Sätt PRIS_PAKET_ORE som konstant, inte hårdkodat. Priset testas som allt annat.

---

## Genomförandenoter (Code, 2026-07-28)

**Två blockerare löstes innan detta kluster:**
- `SALJARE` fylld med Humle och Dumle AB / 556000-0000 (sandbox-testvärde, live-lägesspärren i `checkout/registrering.ts` orörd).
- `git log -p src/lib/content.ts` kontrollerad mot alla lokala grenar, `origin/main` och hela reflog-tidsspannet från idag: `avsandarStycken`/`{foretag}`/`{orgnr}`, en ny meta-titel och en ny prisrad till 249 finns INGENSTANS — varken committat eller i någon känd gren. De är sannolikt förlorade okommitterade i en annan session/katalog. Rapporterat, inte återskapat på gissning.

**H7 — säkerhetsval:** `api/dela-besked.ts` tar ALDRIG fri mejltext från klienten. Klienten skickar bara `kommunSlug` + de matchade bidragens `id`, servern slår upp namn/belopp/deadline mot `kommun.bidrag` själv. En endpoint som vidarebefordrar klient-skickad fritext till en godtycklig mottagaradress vore en öppen spam-relä via Resend-kontot — det byggdes inte så. "Skriv ut" är `window.print()` + `@media print`-regler (sidans egna för frågeflödet/stegbaren/dela-blocket, en ny global regel i `global.css` för header/footer) — ingen separat utskriftssida.

**H9 — pris inte givet i beställningen.** Till skillnad från SALJARE och abonnemangets pris (båda fick exakta tal från Jacob) angav specen ingen faktisk summa för `PRIS_PAKET_ORE`. Satte ett tydligt märkt DRAFT-värde (699 kr, flat — tolkat som en engångssumma för "alla bidrag", inte en per-bidrag-rabatt som skalar med antal) så funktionen går att bygga och testa nu. **Byt värdet innan detta visas för en riktig besökare** — det är en gissning för testbarhet, inte en prissättning.

Verifierat live (Playwright mot Ale, 9 matchade bidrag): paketraden visar "Ni matchade 9 bidrag. Vi kan göra utkast till alla — 699 kr i stället för 249 kr per bidrag." korrekt. Mejla-flödet skickade felfritt till `delivered@resend.dev` (verifierat mot dev-loggen och oberoende mot rådata i Python — samma 9 bidrag, samma belopp/deadline-text som servern skulle beräkna). Print-emulering bekräftade: stegbar/frågeflöde/dela-block/header dolda, beskedet synligt.
