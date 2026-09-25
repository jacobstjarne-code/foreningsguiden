# Besked till pass A, B och C — 25 september 2026

Gäller alla tre passen i omverifiering steg 3. Läs innan nästa commit.

## `anteckning` är kassörens text

Fältet renderas publikt på bidragssidan. Skriv bara det hon behöver för att
söka: villkor, belopp, utbetalning, undantag, avgränsning mot andra bidrag.

Aldrig vår egen process. Alltså inte "bekräftat", "verifierat oförändrat",
"omkörning", "lagrad källa pekade tidigare", "tidigare angav", "rättat",
"kontrollerad på nytt", "kunde inte omverifieras", "404", "curl", "WebFetch",
"kalla_url", eller fältnamn som `sen_ansokan` och `belopp_status`.

Vad som ändrats och varför hör hemma i commit-meddelandet. Revisionsspåret
hör hemma i `qa_anteckning` (finns på bidragsnivå, renderas aldrig och ligger
inte i publik JSON). Att ett värde inte kunde beläggas uttrycks med
statusfältet — `olast` eller `okand` — aldrig i prosa.

Bär meningen både process och ett faktum: behåll faktumet som ett rent
påstående om källan, flytta resten ordagrant till `qa_anteckning`.
"Beloppet bekräftat oförändrat, 5 000 kr" blir "5 000 kr".
"Kommunens sida anger nu att X" blir "Kommunens sida anger att X".

## `npm run validera` fäller nu på processpråk

Grinden fanns men fällde aldrig — mönstren matchade inte de formuleringar
steg 2 faktiskt skrev, och bara `b.anteckning` granskades. Sedan `b1d5e84`
granskas `anteckning`, `ansokningssystem` och `beskrivning` på både kommun-
och bidragsnivå, och en träff avbryter med exit 1.

**Kör `npm run validera` före varje push.** Faller den på processpråk:
flytta texten, uppfinn ingenting nytt. Ändra aldrig grinden eller mönstren
för att få grönt.

`FG_PROCESSSPRAK_VARNA=1 npm run validera` återgår till att bara varna. Det
är till för att se hela listan på en gång, inte för att kringgå grinden.

## Redan rättat

De 42 anteckningar som fanns när grinden gjordes fällande är rättade i
`b1d5e84` (16 kommuner). Facit över vad som flyttades står i
`incoming/PROCESSSPRAK_TRAFFAR_2026-09-25.md`. Rebasa eller merga in main
innan du fortsätter i en kommun som står i den listan.
