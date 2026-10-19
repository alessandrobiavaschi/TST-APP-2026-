"""
Confronta regole_excel.csv (modello Mussida) con le regole dell'app e,
se si passa un CSV della matrice, calcola un test con le regole Excel.
Uso: python3 confronta.py <regole_app.csv> <out.md> [matrice.csv riga_nome]
Nessun numero è scritto a mano: tutto viene dai CSV.
"""
import csv, re, sys, unicodedata
from collections import defaultdict
from fractions import Fraction

def norm(s):
    s = unicodedata.normalize('NFC', str(s)).lower().strip()
    s = re.sub(r'\s*\([^)]*\)\s*$', '', s)          # toglie "(2MA)", "(1)"
    s = s.replace('–', '-').replace('—', '-')
    s = re.sub(r'\s*/\s*', ' / ', s)
    s = re.sub(r'\s*-\s*', ' - ', s)
    return re.sub(r'\s+', ' ', s)

def carica(path):
    out = defaultdict(dict)
    for r in csv.DictReader(open(path, encoding='utf-8')):
        out[int(r['domanda'])][norm(r['risposta'])] = r
    return out

excel = carica('regole_excel.csv')
app = carica(sys.argv[1])
righe = [f'# Confronto regole: Excel Mussida vs app ({sys.argv[1]})', '',
         'Generato da `confronta.py`. Fonte Excel: `regole_excel.csv` (estratto dalle formule del foglio BOS).', '']
diff_punti, diff_fam, solo_excel, solo_app = [], [], [], []
for d in range(1, 73):
    e, a = excel.get(d, {}), app.get(d, {})
    if '*' in e:
        pa = sorted({r['punti'] for r in a.values()})
        diff_punti.append(f'| {d} | escluso dai totali (0) | {", ".join(pa)} |')
        continue
    pe = sorted({r['punti'] for r in e.values()}); pa = sorted({r['punti'] for k, r in a.items() if k in e})
    if pe != pa:
        diff_punti.append(f'| {d} | {", ".join(pe)} | {", ".join(pa)} |')
    for k, re_ in e.items():
        if k not in a:
            solo_excel.append(f'| {d} | {re_["risposta"]} | {re_["famiglia"]} |'); continue
        if re_['famiglia'] != a[k]['famiglia']:
            diff_fam.append(f'| {d} | {re_["risposta"]} | {re_["famiglia"]} | {a[k]["famiglia"]} |')
    for k, ra in a.items():
        if k not in e:
            solo_app.append(f'| {d} | {ra["risposta"]} | {ra["famiglia"]} | {ra["punti"]} |')

righe += ['## Punti per domanda diversi', '', '| Domanda | Excel | App |', '|---|---|---|'] + (diff_punti or ['| – | nessuna differenza | |']) + ['']
righe += ['## Stessa risposta, famiglia diversa', '', '| Domanda | Risposta | Excel | App |', '|---|---|---|---|'] + (diff_fam or ['| – | nessuna | | |']) + ['']
righe += ['## Risposte presenti solo nell\'Excel', '', '| Domanda | Risposta | Famiglia |', '|---|---|---|'] + (solo_excel or ['| – | nessuna | |']) + ['']
righe += ['## Risposte presenti solo nell\'app', '', '| Domanda | Risposta | Famiglia | Punti |', '|---|---|---|---|'] + (solo_app or ['| – | nessuna | | |']) + ['']

if len(sys.argv) >= 5:
    matrice, nome = sys.argv[3], sys.argv[4]
    rec = next(r for r in csv.DictReader(open(matrice, encoding='utf-8')) if r['Nome'].strip().upper() == nome.upper())
    risp, punti, non_trovate, per_dom = defaultdict(int), defaultdict(int), [], []
    for d in range(1, 73):
        v = rec[f'File_{d:02d}']; k = norm(v)
        if '*' in excel.get(d, {}):
            per_dom.append((d, v, '—', 0, 'domanda esclusa dai totali nell\'Excel')); continue
        r = excel.get(d, {}).get(k)
        if not r:
            non_trovate.append(f'{d}: {v}'); per_dom.append((d, v, '?', 0, 'risposta senza famiglia nell\'Excel')); continue
        risp[r['famiglia']] += 1; punti[r['famiglia']] += int(r['punti'])
        per_dom.append((d, v, r['famiglia'], int(r['punti']), ''))
    tot_r, tot_p = sum(risp.values()), sum(punti.values())
    righe += [f'## Test di {nome} calcolato con le regole Excel', '',
              '| Famiglia | Risposte | Punti | % risposte (÷ ' + str(tot_r) + ') | % punti (÷ ' + str(tot_p) + ') |', '|---|---|---|---|---|']
    for f in ['rosso', 'giallo', 'blu', 'verde', 'grigio']:
        pr = Fraction(risp[f] * 100, tot_r); pp = Fraction(punti[f] * 100, tot_p)
        righe.append(f'| {f} | {risp[f]} | {punti[f]} | {float(pr):.2f}% | {float(pp):.2f}% |')
    righe += [f'| **totale** | {tot_r} | {tot_p} | 100% | 100% |', '',
              f'Risposte senza famiglia: {", ".join(non_trovate) or "nessuna"}', '',
              '### Dettaglio domanda per domanda', '', '| Domanda | Risposta | Famiglia | Punti | Nota |', '|---|---|---|---|---|']
    righe += [f'| {d} | {v} | {f} | {p} | {n} |' for d, v, f, p, n in per_dom]

open(sys.argv[2], 'w', encoding='utf-8').write('\n'.join(righe) + '\n')
print(f'punti diversi: {len(diff_punti)} | famiglia diversa: {len(diff_fam)} | solo excel: {len(solo_excel)} | solo app: {len(solo_app)} -> {sys.argv[2]}')
