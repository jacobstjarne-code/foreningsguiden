# ORDER TILL CODE — sammanfogning inför release, 24 september 2026

Skriven av Opus i chatten. Provmergen nedan är redan körd i en ren klon
(omverifiering-steg2-2026-09-17 + af1-profillager + patchen): merge utan
konflikter, `validera`, `verify:matching` (37), `verify:kommun-klar`,
`verify:generator` (42/42), `verify:giltighet-regler`, `verify:saljargate`,
`verify:lok-ansokningsvag`, `verify:nationella-stod`, `lint:design-guard`,
`verify:regression --ci-mot=origin/main` och `build` gröna. Det som inte
ingick i provet är din lokala commit 15fe1c7, eftersom den aldrig pushats.

## 0. Var du står — innan allt annat

    cd ~/Desktop/code_projects/fg-production-batch-01
    pwd && git rev-parse --show-toplevel && git branch --show-current
    git worktree list

Står sessionen i bandy-manager eller någon annan katalog: STANNA och säg till.
Förväntat: main, HEAD 15fe1c7.

## 1. Städa infrastrukturen

    git worktree remove --force /private/tmp/claude-501/-Users-jacobstjarne-Desktop-code-projects-bandy-manager/34b743a4-8f4f-4c5a-9fd3-72a45e905f10/scratchpad/fg-omverif-steg2c
    git worktree prune
    git worktree list

Det är femte gången en Föreningsguiden-worktree hamnar under bandy-managers
scratchpad. Skriv i rapporten vilken katalog sessionen som skapade den stod i,
om det går att utläsa.

## 2. Stashen

    git stash list
    git stash show -p stash@{0} > /tmp/stash-ab19.diff
    git diff 2e04059^ 2e04059 > /tmp/ab19-commit.diff

Jämför. Finns stashens ändringar redan i 2e04059 eller senare på main:
`git stash drop stash@{0}`. Finns något som inte landat: droppa INTE, lägg
diffen i rapporten.

## 3. Releasegren

    git checkout -b release-2026-09-24
    git push -u origin release-2026-09-24        # tar med 15fe1c7
    git merge --no-edit origin/af1-profillager
    git am incoming/dolj-abonnemangsruta.patch

Om `git am` klagar på pre-commit-kroken: kör den som den är, den bygger och
validerar. Om den fäller: rapportera, fixa inte på egen hand.

    npm run validera && npm run verify:matching && npm run verify:kommun-klar \
      && npm run verify:generator && npm run verify:giltighet-regler \
      && npm run verify:saljargate && npm run verify:lok-ansokningsvag \
      && npm run build && npm run verify:belopp-rendering
    git push

Vercel bygger en preview av grenen automatiskt.

## 4. Rapport — och stopp

Rapportera: preview-URL, HEAD-sha, resultat för varje kontroll, utfall av
punkt 1 och 2. Merga INTE till main. Opus kör browserkontrollen mot previewn
(abonnemangsrutan borta på andra aktivitetsbidraget, omverifieringens
datum i Hässleholm/Klippan/Ängelholm/Gällivare, profillagrets inmatning)
och ger klartecken. Först då: `git checkout main && git merge --ff-only
release-2026-09-24 && git push`.

## 5. Nästa order

Efter rapporten: `ORDER_CODE_2026-09-24_OMVERIFIERING_STEG3.md`, pass A i
den här sessionen. Mätningen och larmvillkoren i
`SYSTEMLARM_ANALYS_2026-09-24.md` väntar tills steg 3 är klart.

## STÄNGT

- Deploy till produktion i denna order. Öppnas av Opus klartecken efter browserkontroll av previewn.
- Årsspecifika deadlines (MM-DD-modellen) och delningen av Sandvikens och Vaggeryds poster. Öppnas av en separat dataorder efter release.
