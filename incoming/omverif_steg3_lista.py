#!/usr/bin/env python3
"""Omverifiering steg 3 — arbetslista per pass.
Kör från repo-roten på release-2026-09-24:  python3 incoming/omverif_steg3_lista.py
Skriver incoming/OMVERIFIERING_STEG3_LISTA.json. Passfördelningen (A/B/C) tas
ur OMVERIFIERING_STEG3_LISTA.md — kommunerna där är facit, skriptet ger bara
bidragsdetaljerna. Kräver pyyaml. Testkört av Opus 2026-09-24 mot provmergen:
A 72 kommuner/708 bidrag, B 78/707, C 76/709, 0 utanför listan."""
import yaml, glob, json, datetime, re, os
TODAY = datetime.date.today()
GRANS = '2026-09-17'
md = open('incoming/OMVERIFIERING_STEG3_LISTA.md', encoding='utf-8').read()
pass_av = {}
aktuellt = None
for rad in md.splitlines():
    m = re.match(r'## Pass ([ABC])', rad)
    if m: aktuellt = m.group(1)
    m = re.match(r'- \*\*([a-z0-9-]+)\*\*', rad)
    if m and aktuellt: pass_av[m.group(1)] = aktuellt
def nasta(dl):
    if not dl or dl.get('typ') != 'fasta': return None
    best = None
    for x in dl.get('datum') or []:
        s = str(x.get('datum') if isinstance(x, dict) else x)
        try:
            c = datetime.date(TODAY.year, int(s[-5:-3]), int(s[-2:]))
            if c < TODAY: c = c.replace(year=TODAY.year + 1)
            best = min(best, c) if best else c
        except Exception: pass
    return best
ut = {'A': {}, 'B': {}, 'C': {}, 'ej_i_lista': {}}
for f in sorted(glob.glob('data/kommuner/*.yaml')):
    slug = os.path.basename(f)[:-5]
    d = yaml.safe_load(open(f, encoding='utf-8'))
    for b in d.get('bidrag') or []:
        sv = str(b.get('senast_verifierad') or '')
        if sv >= GRANS or b.get('status') == 'avskaffat': continue
        n = nasta(b.get('deadlines'))
        akt = any(k in (b.get('namn') or '').lower() for k in ('aktivitet', 'lok'))
        prio = 1 if n and (n - TODAY).days <= 60 else 2 if not sv else 3 if akt else 4
        post = {'id': b.get('id'), 'namn': b.get('namn'), 'kalla_url': b.get('kalla_url'),
                'senast_verifierad': sv or None, 'nasta_deadline': str(n) if n else None, 'prio': prio}
        ut[pass_av.get(slug, 'ej_i_lista')].setdefault(slug, []).append(post)
for p in ut.values():
    for lst in p.values(): lst.sort(key=lambda r: (r['prio'], r['nasta_deadline'] or '9'))
json.dump(ut, open('incoming/OMVERIFIERING_STEG3_LISTA.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for k, v in ut.items(): print(k, len(v), 'kommuner', sum(len(x) for x in v.values()), 'bidrag')
