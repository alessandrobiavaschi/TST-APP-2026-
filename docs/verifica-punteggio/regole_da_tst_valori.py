"""
Regole di punteggio lette SOLO dal foglio "TST _ VALORI" (testi delle celle, colonne A-C e J),
più i nomi dei suoni dal foglio "File Audio NUOVA NUMERAZIONE" per numerare le opzioni di 46/51/58.
Poi calcola un test della matrice con quelle regole. Nessun numero è scritto a mano.

Uso: python3 regole_da_tst_valori.py <excel.xlsx> <matrice.csv> <nome> <out_dir>
"""
import csv, re, sys, unicodedata
from collections import defaultdict
from fractions import Fraction
import openpyxl

FAM = {'entusiasmo': 'giallo', 'calma flemmatica': 'verde', 'volitività': 'rosso',
       'malinconia/nostalgia': 'blu', 'malin./nost.': 'blu', 'anaffettività': 'grigio', 'anaffetività': 'grigio'}


def fam(t):
    t = str(t or '').strip().lower()
    for k, v in FAM.items():
        if t == k or t.endswith(k):
            return v
    return ''


def norm(s):
    s = unicodedata.normalize('NFC', str(s)).lower().strip()
    s = re.sub(r'\s*\([^)]*\)\s*$', '', s).replace('–', '-')
    s = re.sub(r'\s*/\s*', '/', s)
    s = re.sub(r'\s*-\s*', ' - ', s)
    return re.sub(r'\s+', ' ', s)


def main(xlsx, matrice, nome, out_dir):
    wb = openpyxl.load_workbook(xlsx, data_only=False)
    ws = wb['TST _ VALORI']
    audio = {}
    for row in wb['File Audio NUOVA NUMERAZIONE'].iter_rows():
        v = [c.value for c in row if c.value is not None]
        if len(v) >= 3 and isinstance(v[0], int):
            m = re.search(r'=\s*(\d+)\s*punt', str(v[-1]))
            audio[v[0]] = (str(v[1]).strip(), int(m.group(1)) if m else None)

    # 1) blocchi di sezione: intestazione "X_NOME | FILE a-b | nota punti"
    regole, note = [], []
    blocchi = []
    for r in range(1, ws.max_row + 1):
        b = str(ws.cell(r, 2).value or '')
        m = re.match(r'FILE (\d+)-(\d+)', b.strip())
        if m:
            nota = ' '.join(str(ws.cell(r, c).value) for c in range(3, 6) if ws.cell(r, c).value)
            blocchi.append((r, int(m.group(1)), int(m.group(2)), str(ws.cell(r, 1).value).strip(), nota))
    for i, (r0, da, a, nome_sez, nota) in enumerate(blocchi):
        r_fine = blocchi[i + 1][0] if i + 1 < len(blocchi) else ws.max_row + 1
        note.append(f'riga {r0}: {nome_sez} FILE {da}-{a} | {nota}')
        for r in range(r0 + 1, r_fine):
            lab = str(ws.cell(r, 1).value or '').strip()
            if not lab:
                continue
            m_pre = re.match(r'File (\d+) - .*?(?:\((\d)\)|Nessuno dei 4)', lab)
            if m_pre:  # domande 1-4
                d = int(m_pre.group(1))
                risp = f'opzione{m_pre.group(2)}' if m_pre.group(2) else 'nessuna'
                regole.append((d, risp, fam(ws.cell(r, 2).value), '', f'A{r}/B{r}'))
                continue
            if lab.lower().startswith('file'):
                note.append(f'riga {r}: nota "{lab}"')
                continue
            f, port = fam(ws.cell(r, 2).value), str(ws.cell(r, 3).value or '').strip()
            for d in range(da, a + 1):
                regole.append((d, lab, f, port, f'A{r}/B{r}/C{r}' + ('' if f else f' (B{r}="{ws.cell(r, 2).value or ""}")')))

    # 2) domande di preferenza (46, 51, 58): etichette in colonna J ("ONDULATO/57 - Malin./Nost.")
    pref_rows = [r for r in range(1, ws.max_row + 1) if re.search(r' - ', str(ws.cell(r, 10).value or '')) and fam(str(ws.cell(r, 10).value).split(' - ')[-1])]
    def opzione_per(domanda, candidati, testo):
        """Numero opzione = posizione del suono (candidati) il cui nome contiene una parola dell'etichetta."""
        parole = [p for p in re.split(r'[^a-z0-9]+', testo.lower()) if p]
        for pos, n in enumerate(candidati, 1):
            nome_suono = audio[n][0].lower()
            if any(p in nome_suono.split() or p in nome_suono for p in parole if len(p) >= 2 and p not in ('dis', 'asc')):
                # per la melodia serve anche la direzione
                if domanda == 58:
                    dir_ok = ('asc' in parole and 'ascendente' in nome_suono) or ('dis' in parole and 'discendente' in nome_suono)
                    if not dir_ok:
                        continue
                return f'opzione{pos}'
        return None
    for r in pref_rows:
        etich = str(ws.cell(r, 10).value).strip()
        f = fam(etich.split(' - ')[-1])
        sinistra = etich.split(' - ')[0]
        if 'nessuno' in sinistra.lower():
            sezione = 'ritmo' if r < 90 else 'melodia'
            for d in ([46, 51] if sezione == 'ritmo' else [58]):
                regole.append((d, 'nessuna', f, 'Simpatia/Empatia', f'J{r}'))
            continue
        if r < 90:  # ritmo: "ANDAMENTO/BPM"
            andamento, bpm = sinistra.split('/')
            o46 = opzione_per(46, [42, 43, 44, 45], bpm)
            o51 = opzione_per(51, [47, 48, 49, 50], andamento)
            regole.append((46, o46 or f'? (nessun groove {bpm} tra 42-45)', f, 'Simpatia/Empatia', f'J{r}'))
            regole.append((51, o51 or f'? ({andamento})', f, 'Simpatia/Empatia', f'J{r}'))
        else:
            o58 = opzione_per(58, [53, 54, 55, 56], sinistra)
            regole.append((58, o58 or f'? ({sinistra})', f, 'Simpatia/Empatia', f'J{r}'))

    # 3) punti: dalla nota della sezione ("42-46: 1 risposta = 2 punti"), altrimenti 1
    def punti(d):
        for (_, da, a, _, nota) in blocchi:
            if da <= d <= a:
                for m in re.finditer(r'(\d+)-(\d+):\s*1 risposta\s*=\s*(\d+)', nota):
                    if int(m.group(1)) <= d <= int(m.group(2)):
                        return int(m.group(3))
                m = re.search(r'1 risposta\s*=\s*(\d+)', nota)
                return int(m.group(1)) if m else None
        return None

    with open(f'{out_dir}/regole_tst_valori.csv', 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['domanda', 'risposta', 'famiglia', 'portato', 'punti', 'cella'])
        for d, risp, f, port, cella in sorted(regole, key=lambda x: (x[0], x[1])):
            w.writerow([d, risp, f, port, punti(d), cella])

    # 4) calcolo del test
    idx = defaultdict(dict)
    for d, risp, f, port, cella in regole:
        idx[d][norm(risp)] = (f, cella)
    rec = next(r for r in csv.DictReader(open(matrice, encoding='utf-8')) if r['Nome'].strip().upper() == nome.upper())
    risp_f, punti_f, dettaglio = defaultdict(int), defaultdict(int), []
    for d in range(1, 73):
        v = rec[f'File_{d:02d}']
        trovato = idx.get(d, {}).get(norm(v))
        f = trovato[0] if trovato else ''
        p = punti(d) if f else 0
        nota = '' if trovato and f else ('risposta non presente nel foglio' if not trovato else f'nessuna famiglia nel foglio ({trovato[1]})')
        if f:
            risp_f[f] += 1
            punti_f[f] += p
        dettaglio.append((d, v, f or '—', p, trovato[1] if trovato else '', nota))
    tr, tp = sum(risp_f.values()), sum(punti_f.values())
    L = [f'# Test di {nome} con le regole del foglio "TST _ VALORI"', '',
         'Generato da `regole_da_tst_valori.py`. Percentuali calcolate con frazioni esatte.', '',
         '## Note lette nel foglio', ''] + [f'- {n}' for n in note] + ['',
         '## Totali', '', f'| Famiglia | Risposte | % su {tr} risposte | % su 72 | Punti | % su {tp} punti |', '|---|---|---|---|---|---|']
    for f in ['rosso', 'giallo', 'blu', 'verde', 'grigio']:
        L.append(f'| {f} | {risp_f[f]} | {float(Fraction(100 * risp_f[f], tr)):.2f}% | {float(Fraction(100 * risp_f[f], 72)):.2f}% | {punti_f[f]} | {float(Fraction(100 * punti_f[f], tp)):.2f}% |')
    L += [f'| **totale** | {tr} | 100% | {float(Fraction(100 * tr, 72)):.2f}% | {tp} | 100% |', '',
          '## Risposte non contate', ''] + [f'- domanda {d}: "{v}" ({n})' for d, v, f, p, c, n in dettaglio if n] + ['',
          '## Dettaglio', '', '| Domanda | Risposta | Famiglia | Punti | Cella |', '|---|---|---|---|---|']
    L += [f'| {d} | {v} | {f} | {p} | {c} |' for d, v, f, p, c, n in dettaglio]
    open(f'{out_dir}/test_{nome.lower()}_tst_valori.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    print('risposte', dict(risp_f), 'tot', tr, '| punti', dict(punti_f), 'tot', tp)
    print('non contate:', [(d, v, n) for d, v, f, p, c, n in dettaglio if n])


if __name__ == '__main__':
    main(*sys.argv[1:5])
