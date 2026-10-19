"""Confronta il PDF del modello (testo estratto) con le celle A-C e J del foglio TST _ VALORI."""
import re, sys, openpyxl
pdf = open(sys.argv[1], encoding='utf-8').read().splitlines()
ws = openpyxl.load_workbook(sys.argv[2])['TST _ VALORI']
n = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()
foglio = []
for r in range(1, ws.max_row + 1):
    a, b, c, j = (n(ws.cell(r, k).value) for k in (1, 2, 3, 10))
    if a: foglio.append((r, 'A-C', ' '.join(x for x in (a, b, c) if x)))
    if j and ' - ' in j: foglio.append((r, 'J', j))
testo_pdf = [n(re.sub(r'\s{2,}', ' ', l)) for l in pdf]
uniti = ' | '.join(testo_pdf)
mancanti = [(r, col, t) for r, col, t in foglio if n(t) not in uniti]
print(f'righe del foglio controllate: {len(foglio)}; non trovate identiche nel PDF: {len(mancanti)}')
for m in mancanti: print('  ', m)
