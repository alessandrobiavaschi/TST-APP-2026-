# Verifica punteggio TST: appunti

Tutti i numeri di questa cartella sono prodotti da script, non scritti a mano.
Per rigenerarli:

```bash
python3 estrai_regole_excel.py <TST_MODELLO_EXCEL_2025_rev.11.04.2025.xlsx> "BOS (TST) 2025" regole_excel.csv
node estrai_regole_app.mjs "<root progetto>" regole_app_corrente.csv corrente
node estrai_regole_app.mjs "<root progetto>" regole_app_2025_v1.csv 2025_v1
python3 confronta.py regole_app_corrente.csv confronto_excel_vs_app_corrente.md
python3 confronta.py regole_app_2025_v1.csv confronto_excel_vs_app_2025_v1.md
```

## Fonti

- Excel Mussida rev. 11.04.2025, foglio "File Audio NUOVA NUMERAZIONE": punti per file.
- Stesso Excel, foglio "BOS (TST) 2025": formule dei blocchi DISPOSIZIONI (colonne AD–AL),
  da cui si ricava a quale famiglia va ogni risposta.
- Test cartaceo 2025: domande 29–41 intervalli (aggettivi), 42–45 groove, 46 groove preferito.

## Fatti verificati (16/10/2026)

1. Punti: 42–46 valgono 2 punti per risposta ("File Audio NUOVA NUMERAZIONE" e
   "TST _ VALORI" C69). Tutte le altre domande valgono 1.
2. File 41 (8a giusta): non entra in nessun totale. Le somme degli intervalli sono
   `SUM(B:M)` = file 29–40 (es. `O51 = SUM(B51:M51)`).
3. "ILLUMINATO - amorevole - passionale" è marcato CONFERMA e non entra in nessuna famiglia.
4. Nell'Excel non esiste un +1 per le riconferme. Nell'app sì (`BONUS_RICONFERMA`, passi 41 e 42).
5. Numerazione diversa: nell'app il passo 42 è un aggettivo (riascolto del file 40);
   nel cartaceo e nell'Excel il 42 è il Groove 57 (sensazione, 2 punti).
6. Le famiglie di alcune risposte differiscono tra Excel e app: vedi i due file `confronto_*.md`.
   - App corrente: Inquieto, Sereno e Dinamico in famiglie diverse dall'Excel.
   - App 2025_v1: in più "mi spegne", "mi inquieta", "mi disturba/mi repelle" in famiglie diverse.

## Da decidere (utente e Franco Mussida)

- Quale tabella è la fonte di verità: l'Excel 2025 o le regole dell'app?
- Il ×2 su 42–46 resta?
- Il +1 di riconferma resta?
- La percentuale della torta si calcola sulle risposte o sui punti?
