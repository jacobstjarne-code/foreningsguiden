#!/usr/bin/env python3
"""Applicerar Opus anteckningsrättelse 2026-09-24 (commit c55d2aa i Opus klon).
Kör från repo-roten på release-2026-09-24 (b516b98):
    python3 incoming/applicera_anteckningar.py
    git apply incoming/anteckningar_kod.patch
Flyttar nuvarande anteckning -> qa_anteckning (läggs till om fältet redan har
text), skriver kassörstexten ur anteckningar_kassor_1..4.json, sänker 17 statusfält
och rättar Alingsås ansökningssystem. Rör inget annat fält; kontrolleras per fil.
Testkört av Opus: resultatet är byte-identiskt med c55d2aa."""
import yaml, json, glob, sys
NY = {}
for _i in range(1, 5):
    NY.update(json.load(open(f'incoming/anteckningar_kassor_{_i}.json', encoding='utf-8')))
assert len(NY) == 182, f'väntade 182 anteckningar, fick {len(NY)} — saknas en delfil?'
STATUS = {
 'boras-verksamhetsstod-barn-unga': {'belopp_status': 'olast'},
 'boras-samlingslokaler': {'belopp_status': 'olast'},
 'boras-driftbidrag-egna-lokaler': {'belopp_status': 'olast'},
 'boras-driftbidrag-anlaggningar': {'belopp_status': 'olast'},
 'boras-anlaggningsbidrag': {'belopp_status': 'olast'},
 'boras-anlaggningslan': {'belopp_status': 'olast'},
 'boras-politiska-ungdomsorganisationer': {'belopp_status': 'olast'},
 'boras-saker-trygg-forening': {'belopp_status': 'olast', 'deadline_status': 'olast'},
 'partille-barnkonventionspriset': {'belopp_status': 'olast'},
 'partille-breddpriset': {'deadline_status': 'okand', 'deadlines': '{ typ: okand, datum: [] }'},
 'hoor-driftsbidrag-enskilda-vagar': {'deadline_status': 'olast'},
 'tierp-riktat': {'deadline_status': 'olast'},
 'vastervik-lokalt-aktivitetsstod': {'deadline_status': 'olast'},
 'vastervik-driftstod-samlingslokaler': {'deadline_status': 'olast'},
 'vastervik-extraordinart-bidrag': {'deadline_status': 'olast'},
}
def jd(s): return json.dumps(s, ensure_ascii=False)
gjorda = set(); nstatus = 0
for f in sorted(glob.glob('data/kommuner/*.yaml')):
    src = open(f, encoding='utf-8').read()
    if not f.endswith('alingsas.yaml') and not any(i in src for i in list(NY) + list(STATUS)): continue
    fore = yaml.safe_load(src)
    root = yaml.compose(src)
    bidrag = [v for k, v in root.value if k.value == 'bidrag'][0]
    ed = []
    for b in bidrag.value:
        m = {k.value: v for k, v in b.value}; bid = m['id'].value
        for fld, val in STATUS.get(bid, {}).items():
            n = m[fld]; s, e = n.start_mark.index, n.end_mark.index; o = src[s:e]
            ed.append((s, e, val + o[len(o.rstrip()):])); nstatus += 1
        if bid not in NY: continue
        n = m['anteckning']; s, e = n.start_mark.index, n.end_mark.index; o = src[s:e]
        tail = o[len(o.rstrip()):]; gammal = yaml.safe_load(o)
        ny = 'null' if NY[bid] is None else jd(NY[bid])
        if 'qa_anteckning' in m:
            q = m['qa_anteckning']; qs, qe = q.start_mark.index, q.end_mark.index; qo = src[qs:qe]
            fq = yaml.safe_load(qo); qa = (fq + ' ' + gammal).strip() if fq else gammal
            ed.append((qs, qe, jd(qa) + qo[len(qo.rstrip()):]))
            ed.append((s, e, ny + tail))
        else:
            key = [k for k, v in b.value if k.value == 'anteckning'][0]; ind = ' ' * key.start_mark.column
            if '\n' in tail:
                forst, rest = tail.split('\n', 1)
                ed.append((s, e, ny + forst + '\n' + ind + 'qa_anteckning: ' + jd(gammal) + '\n' + rest))
            else:
                ed.append((s, e, ny + '\n' + ind + 'qa_anteckning: ' + jd(gammal) + tail))
        gjorda.add(bid)
    for s, e, v in sorted(ed, reverse=True): src = src[:s] + v + src[e:]
    if f.endswith('alingsas.yaml'):
        src = src.replace('se respektive bidrags kalla_url.', 'se respektive bidrag.')
    efter = yaml.safe_load(src)
    for b0, b1 in zip(fore['bidrag'], efter['bidrag']):
        rorda = {'anteckning', 'qa_anteckning'} | set(STATUS.get(b0['id'], {}))
        assert {k: v for k, v in b0.items() if k not in rorda} == {k: v for k, v in b1.items() if k not in rorda}, (f, b0['id'])
        if b0['id'] in NY: assert b1['anteckning'] == NY[b0['id']], b0['id']
    open(f, 'w', encoding='utf-8').write(src)
saknas = set(NY) - gjorda
print(f'anteckningar {len(gjorda)}/{len(NY)}, statusfält {nstatus}/17')
if saknas or nstatus != 17: print('SAKNAS:', sorted(saknas)); sys.exit(1)
