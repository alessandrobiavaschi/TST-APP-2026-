# Handoff Codex — Famiglia e sottocategorie

## Sintesi

La sezione del profilo distingue ora esplicitamente la famiglia emotiva dalle sue sottocategorie. Per il profilo Rosso, il titolo identifica la `Famiglia Marziale`; il testo descrive separatamente le sottocategorie `Volitiva` e `Collerica`.

## File modificati

- `src/components/report/ProfiloEmotivo.jsx`
- `src/utils/reportTitleUtils.js`
- `src/content_report.json`
- `src/reportProfiloPdf.js`
- `src/utils/profiloDisplayCopy.js`
- `test/reportTitleUtils.test.js`
- `test/reportMarzialeCopy.test.js`

## Decisioni e assunzioni

- Il titolo usa il nome pubblico già disponibile in `profilo.correnteDominante`, con fallback compatibili; non mostra la chiave colore `Rosso` quando è disponibile `Marziale`.
- Le sottocategorie sono esplicitate nel testo narrativo, senza modificare scoring o campi persistiti.
- Report principale, fallback e PDF condividono la stessa formulazione.
- Layout e altre famiglie non sono stati modificati.

## Verifiche

- `npm test`: 41 test superati, 0 falliti.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1225 moduli trasformati.
- `git diff --check`: superato.

## Comportamento atteso

- Titolo: `La tua natura emotiva di appartenenza (Famiglia Marziale)`.
- Testo: `Nella famiglia Marziale emerge il piacere del fare... Le sottocategorie Volitiva e Collerica...`.
- Se la famiglia manca, il titolo non mostra parentesi vuote.

## Integrazione

Integrare il commit dedicato senza includere le modifiche concorrenti presenti nel worktree.
