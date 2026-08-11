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

## Hård regel
Inget räknas som klart förrän det hämtats från foreningsguiden.se i en
riktig webbläsare. Grön build räcker inte. Köprutan, tratten och
bevakningsformuläret är klientsidiga och syns inte i en fetch.
