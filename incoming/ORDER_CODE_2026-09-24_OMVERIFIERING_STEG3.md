# ORDER TILL CODE — omverifiering steg 3, 24 september 2026

Skriven av Opus. Samma arbete som steg 2 (17–18 sep), nu på allt steg 2
inte rörde: 2 124 bidrag, 930 källor, 226 kommuner. Listan och
prioriteringen står i `incoming/OMVERIFIERING_STEG3_LISTA.md`, uppdelad i
tre pass (A, B, C). Tre sessioner kan köra samtidigt, en per pass, eftersom
varje kommun är en egen YAML-fil och passen inte delar kommuner.

## Förutsättning

`release-2026-09-24` måste finnas på origin (punkt 3 i
`ORDER_CODE_2026-09-24_SAMMANFOGNING.md`). Finns den inte: stanna.

## 0. Var du står — varje session, före allt annat

    cd ~/Desktop/code_projects/fg-production-batch-01
    git fetch origin
    git worktree add ~/Desktop/code_projects/fg-omverif-steg3-<pass> -b omverifiering-steg3-<pass> origin/release-2026-09-24
    cd ~/Desktop/code_projects/fg-omverif-steg3-<pass>
    pwd && git branch --show-current && git worktree list
    npm ci
    python3 incoming/omverif_steg3_lista.py

`<pass>` är `a`, `b` eller `c`. Worktreen ska ligga under code_projects,
aldrig under /private/tmp. Står sessionen i bandy-manager: stanna.

## 1. Arbetsgång per kommun

Ta kommunerna i den ordning de står i ditt pass. Inom en kommun: bidragen i
den ordning `OMVERIFIERING_STEG3_LISTA.json` ger (prio 1 först).

1. **Läs kommunens egen bidragsmeny i sin helhet**, inte bara `kalla_url` för
   varje bidrag. Steg 2 hittade 27 saknade bidrag i Uppsala och 3 i Åmål på
   det sättet. Ett publicerat föreningsbidrag som inte finns i YAML läggs
   till, med samma urvalsregel som tidigare: stöd som bara enskilda personer
   kan söka tas inte med.
2. **Per bidrag, jämför källan mot YAML** för deadline, belopp och
   belopp_avser, krav, giltighet, status, ansokningsvag och kalla_url.
   Hämta med WebFetch eller `curl -A "Mozilla/5.0"`.
3. **Ändra bara det källan belägger.** Aldrig ett gissat datum, belopp eller
   avskaffande. Årsspecifika datum som MM-DD-modellen inte kan bära får
   `deadlines.typ: okand` och datumet i anteckningen, samma lösning som 18 sep.
4. **Sätt `senast_verifierad` till dagens datum bara på bidrag du faktiskt
   läst källan för.** Statusfälten (`*_status`) får `kontrollast` bara efter
   läsning, aldrig mekaniskt. Kan ett värde inte beläggas i källan men inte
   heller motsägs (PDF:en saknar uppgiften, sidan ger 404): sätt det fältets
   status till `olast`. Värdet står kvar och visas utan anspråk. Saknar
   bidraget `senast_verifierad` och filen bara har kommunens `verifierad`:
   lägg till `senast_verifierad` på bidraget.
5. **`anteckning` är kassörens text, inte en revisionslogg.** Den renderas
   publikt på bidragssidan. Skriv bara det hon behöver för att söka: villkor,
   utbetalning, undantag. Aldrig "Rättat <datum>", "omverifiering",
   "kalla_url", "404", "tidigare URL", "curl", "WebFetch", "lagrad",
   "var fel", "bekräftar ordagrant", "kunde inte omverifieras". Vad som ändrats
   och varför skrivs i commit-meddelandet. Att ett belopp eller datum inte
   kunde läsas uttrycks med statusfältet (`olast`/`okand`), aldrig i prosa.
   Steg 2 skrev 155 sådana anteckningar; de rättas separat.
6. **Går källan inte att läsa** (JS-renderad e-tjänst, hopfälld sektion,
   BankID, död länk utan ersättare): lägg en rad i
   `OMVERIFIERING_BEHOVER_BROWSER.md` i samma format som steg 2, rör inte
   YAML för det bidraget och gå vidare.
7. **Commit per kommun:** `omverifiering steg 3: <Kommun> (<n> bidrag, <x> rättade, <y> tillagda, <z> till browser)`.
   Kör `npm run validera && npm run verify:kommun-klar` före varje commit;
   pre-commit-kroken kör resten.
8. **Push efter var femte kommun**, till din egen gren. Aldrig till main,
   aldrig till release-grenen.

## 2. Om något känns fel

Stanna vid någon av följande och skriv det i passrapporten innan du går vidare:

* en kommun där mer än hälften av bidragen har ändrats;
* en kommun som verkar ha lagt om hela sitt bidragssystem;
* ett regressionsskydd som fäller.

Fixa inte ett fällt skydd genom att ändra skyddet.

## 3. Passrapport

När passet är klart, eller när sessionen närmar sig sin gräns, skriv
`incoming/OMVERIFIERING_STEG3_RAPPORT_<pass>.md` med följande:

* kommuner klara och kvar;
* antal bidrag lästa, rättade, tillagda och skickade till browser;
* varje rättelse på en rad (kommun, bidrag, fält, före → efter, källa);
* allt i punkt 2.

Committa och pusha rapporten. Opus mergar passen och kör browserkontroll
innan något går till main.

## STÄNGT

- Merge av passen till release eller main. Öppnas av Opus efter att rapporterna lästs och previewn kontrollerats.
- Browserkön (JS-sidor, BankID). Öppnas av ett separat pass med Claude in Chrome när steg 3 är klart och kön är samlad.
- Detektorn och larmvillkoren. Öppnas av mätningen i SYSTEMLARM_ANALYS_2026-09-24.md, efter steg 3.
