# HANDOFF CODEX — Quattro rapporti interattivi

## Sintesi

- I vertici del radar sono controlli reali, selezionabili con click, Invio e Spazio.
- La famiglia mostrata nel dettaglio non parte più dall'indice tecnico Verde/Flemmatica, ma dal focus della lente e resta memorizzata separatamente per ciascun rapporto.
- Ogni lente espone la graduatoria completa con punti grezzi, quota nella lente e livello 1–7.
- Veri pari punti, più valori arrotondati a 7 e profili composti 7/6/5 sono descritti separatamente.
- Il dettaglio distingue famiglia, natura e sfumature complessive, per esempio Marziale, Volitivo-collerica, Assertività e Dubbio/Collera.
- Assi e classifica mostrano sempre le cinque famiglie canoniche — Flemmatica, Marziale, Malinconica, Entusiasta e Razionale — anche con dati storici che espongono ancora Lunare, Solare o Anaffettiva.
- Lunare, Solare e le altre nature compaiono soltanto nel dettaglio della famiglia selezionata; la didascalia chiarisce che ogni vertice è una famiglia distinta.
- Il copy Natura è stato corretto in `Timbro + Intervalli + Armonia`, coerentemente con il calcolo esistente.
- Il minimo visuale `1/7` usato quando una famiglia ha zero punti è dichiarato esplicitamente e non viene presentato come presenza misurata.
- Il dettaglio segue il colore della famiglia selezionata; i vertici espongono stato premuto e focus da tastiera visibile, senza duplicare i tab stop sulle etichette degli assi.

Il motore scientifico, `computeScoreDeltaForAnswer` e la normalizzazione esistente non sono stati modificati.

## File della correzione

- `src/components/report/QuattroRapporti.jsx`
- `src/components/report/ReportShell.jsx` (solo passaggio delle sottocorrenti)
- `src/components/report/reportUiCopy.js`
- `src/styles/quattro-rapporti.css`
- `src/utils/buildReportData.js`
- `test/reportGraphDataContract.test.js`

## Verifica

- ESLint mirato: superato.
- `npm run lint`: superato.
- `npm run build`: superato, 1225 moduli trasformati.
- `npm test`: 39 test superati, 0 falliti, incluso il nuovo caso 7/6/5 e pari punti.
- `git diff --check`: superato.
- Browser desktop: click del vertice e della graduatoria aggiornano famiglia, stato selezionato e dettaglio; disclosure formula verificata.
- Browser desktop con fixture legacy: assi e graduatoria normalizzati sulle cinque famiglie; natura Volitivo-collerica confinata al dettaglio Marziale.
- Browser mobile 390 × 844: nessun overflow orizzontale e cinque etichette radar nel viewport.

## Integrazione e ownership

Nel worktree sono presenti numerose modifiche concorrenti sulla tassonomia del report e l'audit mobile. Il commit Codex include soltanto gli hunk elencati sopra e questo handoff; non include `MOBILE_REPORT_AUDIT.md`, contenuti, configurazioni tassonomiche o altri componenti modificati da processi concorrenti.
