"""
Estrae dal modello Excel di Mussida le regole di punteggio, domanda per domanda,
leggendo le FORMULE del primo foglio utente (non valori scritti a mano).

Uscita: regole_excel.csv con una riga per (domanda, risposta):
  domanda, sezione, risposta, famiglia, portato, punti, conta_nel_totale, fonte

- famiglia: dalla formula del blocco DISPOSIZIONI che somma quella riga/colonna.
- punti: dal foglio "File Audio NUOVA NUMERAZIONE" ("1 risposta = N punt...").
- conta_nel_totale: la colonna del file è inclusa nel SUM della riga (es. O51=SUM(B51:M51)).

Uso: python3 estrai_regole_excel.py <file.xlsx> <foglio_utente> <out.csv>
"""
import csv
import re
import sys

import openpyxl
from openpyxl.utils import column_index_from_string, get_column_letter

FAMIGLIE = {
    'entusiasmo': 'giallo',
    'calma flemmatica': 'verde',
    'volitività': 'rosso',
    'malinconia/nostalgia': 'blu',
    'anaffettività': 'grigio',
    'anaffetività': 'grigio',
    'malin./nost.': 'blu',
}
CELL_RE = re.compile(r'\$?([A-Z]{1,3})\$?(\d+)')
RANGE_RE = re.compile(r'SUM\(([A-Z]+)(\d+):([A-Z]+)(\d+)\)')


def famiglia_da_etichetta(testo):
    t = str(testo or '').strip().lower()
    for chiave, fam in FAMIGLIE.items():
        if t.endswith(chiave) or t == chiave:
            return fam
    return None


def punti_per_file(wb):
    ws = wb['File Audio NUOVA NUMERAZIONE']
    out = {}
    for row in ws.iter_rows():
        vals = [c.value for c in row if c.value is not None]
        if len(vals) >= 3 and isinstance(vals[0], int):
            m = re.search(r'=\s*(\d+)\s*punt', str(vals[-1]))
            if m:
                out[vals[0]] = (int(m.group(1)), f"'File Audio'!{row[0].row}")
    return out


def _num(v):
    """Numero di file anche se nell'Excel è salvato come testo (es. '54')."""
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)) and float(v).is_integer():
        return int(v)
    if isinstance(v, str) and v.strip().lstrip("'").isdigit():
        return int(v.strip().lstrip("'"))
    return None


def espandi_intervalli(formula):
    """Sostituisce ogni intervallo A1:B3 con l'elenco delle sue celle."""
    def esp(m):
        c1, r1 = column_index_from_string(m.group(1)), int(m.group(2))
        c2, r2 = column_index_from_string(m.group(3)), int(m.group(4))
        return ','.join(f'{get_column_letter(c)}{r}' for c in range(c1, c2 + 1) for r in range(r1, r2 + 1))
    return re.sub(r'\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)', esp, formula)


def _e_intestazione(nums):
    """Intestazione = numeri di file consecutivi crescenti (es. 42,43,44,45), non 0/1/2 di risposta."""
    vals = [nums[c] for c in sorted(nums)]
    if len(vals) < 2 or max(vals) < 5:
        return False
    # ogni gruppo contiguo di colonne deve avere numeri consecutivi
    cols = sorted(nums)
    for a, b in zip(cols, cols[1:]):
        if b == a + 1 and nums[b] != nums[a] + 1:
            return False
    return True


def header_files(ws, riga):
    """Numeri di file nella riga di intestazione più vicina sopra `riga`."""
    for r in range(riga - 1, 0, -1):
        nums = {c.column: _num(c.value) for c in ws[r] if c.column < 26 and _num(c.value) is not None}
        if _e_intestazione(nums):
            return nums
    return {}


def main(path, foglio, out_path):
    wb = openpyxl.load_workbook(path, data_only=False)
    ws = wb[foglio]
    punti = punti_per_file(wb)
    righe = []

    def etichetta(r):
        return str(ws.cell(r, 1).value or '').strip()

    for row in ws.iter_rows():
        for cella in row:
            # Blocchi DISPOSIZIONI: etichetta famiglia in AD o AI, formule a destra.
            if cella.value is None:
                continue
            lettera_col = get_column_letter(cella.column)
            if lettera_col not in ('AD', 'AI'):
                continue
            fam = famiglia_da_etichetta(cella.value)
            if not fam:
                continue
            ultima = 'AH' if lettera_col == 'AD' else 'AM'
            for col in range(cella.column + 1, column_index_from_string(ultima)):
                f = ws.cell(cella.row, col).value
                if not (isinstance(f, str) and f.startswith('=')):
                    continue
                fonte = f'{get_column_letter(col)}{cella.row}: {f}'
                for lettera, num in CELL_RE.findall(espandi_intervalli(f)):
                    rif_col, rif_row = column_index_from_string(lettera), int(num)
                    if rif_col >= 27:
                        continue  # colonne AA+ = somma di altri totali (es. AE+AF): già contati
                    lab = etichetta(rif_row)
                    m_pre = re.match(r'File (\d+) - .*?(\((\d)\)|Nessuno dei 4)', lab)
                    if m_pre:  # domande preliminari 1-4
                        d = int(m_pre.group(1))
                        risp = f'opzione{m_pre.group(3)}' if m_pre.group(3) else 'nessuna'
                        righe.append([d, risp, fam, '', fonte])
                        continue
                    if lab.lower().startswith('file') and 'preferito' in lab.lower():
                        # riga "preferito": blocchi contigui di celle numeriche nella riga stessa;
                        # posizione nel blocco = opzione (ultima colonna = nessuna).
                        numeriche = [c for c in range(2, 27) if isinstance(ws.cell(rif_row, c).value, (int, float))]
                        blocchi, corrente = [], []
                        for c in numeriche:
                            if corrente and c != corrente[-1] + 1:
                                blocchi.append(corrente)
                                corrente = []
                            corrente.append(c)
                        if corrente:
                            blocchi.append(corrente)
                        b_idx = next(i for i, b in enumerate(blocchi) if rif_col in b)
                        blocco = blocchi[b_idx]
                        pos = blocco.index(rif_col) + 1
                        domande = [int(n) for n in re.findall(r'\d+', lab.split(':')[0])]
                        d = domande[b_idx] if b_idx < len(domande) else domande[0]
                        risp = 'nessuna' if pos == len(blocco) else f'opzione{pos}'
                        righe.append([d, risp, fam, '', fonte])
                        continue
                    # riga-totale di una risposta: espandi il SUM sui file inclusi
                    tot = ws.cell(rif_row, rif_col).value
                    m_sum = RANGE_RE.search(str(tot))
                    if not m_sum:
                        continue
                    c1, c2 = column_index_from_string(m_sum.group(1)), column_index_from_string(m_sum.group(3))
                    hdr = header_files(ws, rif_row)
                    portato = str(ws.cell(rif_row, 28).value or '').strip()  # colonna AB
                    for c in range(c1, c2 + 1):
                        if c in hdr:
                            righe.append([hdr[c], lab, fam, portato, f'{fonte} -> {get_column_letter(rif_col)}{rif_row}: {tot}'])

    # file presenti nelle intestazioni ma esclusi da OGNI SUM della riga (es. 41)
    esclusi = {}
    for r in range(1, ws.max_row + 1):
        coperte, formule = set(), []
        for c in range(1, 27):
            v = ws.cell(r, c).value
            if isinstance(v, str):
                for m in RANGE_RE.finditer(v):
                    coperte.update(range(column_index_from_string(m.group(1)), column_index_from_string(m.group(3)) + 1))
                    formule.append(f'{get_column_letter(c)}{r}: {v}')
        if not formule:
            continue
        for c, n in header_files(ws, r).items():
            if c not in coperte:
                esclusi.setdefault(n, f'riga {r} ({etichetta(r)[:30]}): ' + ' ; '.join(formule))

    viste = set()
    with open(out_path, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh)
        w.writerow(['domanda', 'risposta', 'famiglia', 'portato', 'punti', 'conta_nel_totale', 'fonte_formula', 'fonte_punti'])
        for d, risp, fam, port, fonte in sorted(righe, key=lambda x: (x[0], x[1])):
            k = (d, risp.lower())
            if k in viste:
                continue
            viste.add(k)
            p, fp = punti.get(d, ('', ''))
            w.writerow([d, risp, fam, port, p, 'si', fonte, fp])
        for n, fonte in sorted(esclusi.items()):
            p, fp = punti.get(n, ('', ''))
            w.writerow([n, '*', '', '', p, 'NO', f'file escluso da ogni somma, es. {fonte}', fp])
    print(f'scritte {len(viste)} regole + {len(esclusi)} esclusioni in {out_path}')


if __name__ == '__main__':
    main(*sys.argv[1:4])
