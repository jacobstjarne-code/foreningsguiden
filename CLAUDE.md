# Föreningsguiden

## Var du står
Arbetskatalogen ska vara ~/Desktop/code_projects/fg-production-batch-01
och grenen ska vara main.

Kör detta först i varje session, före allt annat:
  pwd && git rev-parse --show-toplevel && git branch --show-current
  git worktree list

Stämmer inte katalogen: stanna och säg till. Starta inte en
Föreningsguiden-uppgift från ett annat projekts session — behörigheter
och scratchpad-worktrees hamnar då i fel repo. Det har hänt fyra gånger.

code_projects/foreningsguiden är en gammal worktree på batch-4-fantom.
Det är dit Design lägger sina leveranser i incoming/. Bygg aldrig
därifrån, och checka aldrig ut main där.

## Läs innan du rör något
incoming/KANON.md — avgör tvister mot specar, mockar och ordrar.
docs/ + senaste HANDOVER.

## Arbetsregler
Använd aldrig `git checkout -- <fil>`, `git restore` eller
`git reset --hard` på `data/` i en delad worktree. Gör provändringar i en
kopia under /tmp, eller backa dem med en ny redigering.

Varför: 2026-10-02 städade jag ett avsiktligt provfel i lomma.yaml med
`git checkout HEAD -- data/kommuner/lomma.yaml` och tappade samtidigt tre
`kalla_borttagen`-rader som fanns i arbetsträdet men inte i HEAD. Det
upptäcktes vid nästa kontroll, men i en worktree som delas med andra
sessioner kan samma kommando radera arbete som inte är mitt.

## Hård regel
Inget räknas som klart förrän det hämtats från foreningsguiden.se i en
riktig webbläsare. Grön build räcker inte. Köprutan, tratten och
bevakningsformuläret är klientsidiga och syns inte i en fetch.
