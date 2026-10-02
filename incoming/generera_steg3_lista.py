#!/usr/bin/env python3
"""Omverifiering steg 3 — genererar OMVERIFIERING_STEG3_LISTA.md ur LISTA.json.

Kör från repo-roten:  python3 incoming/generera_steg3_lista.py

JSON-filen är enda källan för passlistan (Jacob 2026-10-02). Tidigare gick
beroendet åt andra hållet — omverif_steg3_lista.py läste passfördelningen ur
MD:n och skrev JSON:en — och då kunde de två filerna glida isär utan att något
fällde. Det hade de också gjort: MD:n räknade elva bidrag som redan var
verifierade 2026-09-18, eftersom dess tal kom ur en provmerge som saknade
steg 2:s andra dag.

MD:n är härefter en vy av JSON:en. Rör ett bidrag pass eller faller ur listan:
ändra JSON:en och kör om det här skriptet.
"""
import json, re, pathlib

ROT = pathlib.Path(__file__).resolve().parent
JSON_FIL = ROT / 'OMVERIFIERING_STEG3_LISTA.json'
MD_FIL = ROT / 'OMVERIFIERING_STEG3_LISTA.md'

# Kommuner som ligger först i sitt pass oavsett prio-sortering: Jacobs köordning
# 2026-10-02 (Härjedalen och Österåker flyttade hela från pass C till pass A).
# Övriga sorteras som listan alltid gjort: flest prio 1-bidrag först, därefter
# kommunens bästa prio (en kommun med ett prio 2-bidrag före en med bara prio 3),
# sedan slug. Nyckeln är härledd ur MD:n som fanns och stämmer på alla tre pass.
PINNADE = {'A': ['harjedalen', 'osteraker']}

PRIO_NAMN = {
    1: 'nästa deadline senast 23 nov',
    2: 'aldrig verifierad',
    3: 'aktivitetsbidrag',
    4: 'övriga',
}


def prio1(poster):
    return sum(1 for b in poster if b.get('prio') == 1)


def kommunrad(slug, poster):
    rad = f'- **{slug}** — {len(poster)} bidrag'
    n = prio1(poster)
    if n:
        rad += f', {n} med deadline före 23 nov'
    return rad


def sortnyckel(slug, poster):
    return (-prio1(poster), min((b.get('prio', 9) for b in poster), default=9), slug)


def ordna(pass_bokstav, kommuner):
    pinnade = [s for s in PINNADE.get(pass_bokstav, []) if s in kommuner]
    ovriga = sorted((s for s in kommuner if s not in pinnade), key=lambda s: sortnyckel(s, kommuner[s]))
    return pinnade + ovriga


def main():
    data = json.loads(JSON_FIL.read_text(encoding='utf-8'))
    utanfor = data.get('ej_i_lista') or {}
    if utanfor:
        raise SystemExit(f'ej_i_lista är inte tom ({len(utanfor)} kommuner) — placera dem i ett pass först')

    alla = [b for p in ('A', 'B', 'C') for poster in data[p].values() for b in poster]
    kallor = {b.get('kalla_url') for b in alla if b.get('kalla_url')}
    antal_kommuner = sum(len(data[p]) for p in ('A', 'B', 'C'))
    prioantal = {p: sum(1 for b in alla if b.get('prio') == p) for p in (1, 2, 3, 4)}
    prioprosa = ', '.join(f'{p} = {PRIO_NAMN[p]} ({prioantal[p]} st)' for p in (1, 2, 3, 4))

    rader = [
        'Genererad ur LISTA.json, redigera inte för hand.',
        '',
        '# OMVERIFIERING STEG 3 — arbetslista',
        '',
        'Alla bidrag med `senast_verifierad` före 2026-09-17 eller saknat, exklusive '
        '`status: avskaffat`. Tabellerna och totalsummorna nedan skrivs av '
        '`incoming/generera_steg3_lista.py` ur `OMVERIFIERING_STEG3_LISTA.json`, som är '
        'passlistans enda källa.',
        '',
        f'**{len(alla)} bidrag, {len(kallor)} unika källor, {antal_kommuner} kommuner.** Prioritet: {prioprosa}.',
        '',
        'Kommunerna är sorterade så att de med prio 1-bidrag kommer först, och uppdelade i '
        'tre pass (A, B, C) med ungefär lika många bidrag. Ett pass = en Code-session = en '
        'worktree = en gren. Bidragsdetaljerna per kommun står i JSON-filen.',
    ]

    for p in ('A', 'B', 'C'):
        kommuner = data[p]
        antal_bidrag = sum(len(v) for v in kommuner.values())
        rader += ['', f'## Pass {p} — {len(kommuner)} kommuner, {antal_bidrag} bidrag', '']
        rader += [kommunrad(s, kommuner[s]) for s in ordna(p, kommuner)]

    MD_FIL.write_text('\n'.join(rader) + '\n', encoding='utf-8')
    print(f'Skrev {MD_FIL.name}: {antal_kommuner} kommuner, {len(alla)} bidrag, {len(kallor)} unika källor.')
    for p in ('A', 'B', 'C'):
        print(f'  pass {p}: {len(data[p])} kommuner, {sum(len(v) for v in data[p].values())} bidrag')


if __name__ == '__main__':
    main()
