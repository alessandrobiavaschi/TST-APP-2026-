# Handoff Codex — Coerenza Natura di Base

## Sintesi

La "Lettura del risultato" della lente Natura di Base usa ora la famiglia realmente prevalente nel radar della lente. Se Flemmatica è al livello più alto, il testo parla di famiglia flemmatica e non riutilizza la disposizione globale Volitivo-Collerica.

## File modificati

- `src/utils/buildReportData.js`
- `test/reportGraphDataContract.test.js`

## Decisioni e assunzioni

- La correzione riguarda esclusivamente la lente `natura`.
- Il rapporto con sé continua a riferirsi alla famiglia dominante globale, come previsto dal suo significato.
- I rapporti con l'Altro e con l'Agire mantengono le rispettive famiglie di riferimento.
- Nessun punteggio o livello radar viene ricalcolato.

## Verifiche

- Test contrattuale: prevalenza locale Flemmatica con dominante globale Rosso, superato.
- `npm test`: 49 test superati, 0 falliti.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1227 moduli trasformati.
- `git diff --check`: superato.

## Comportamento atteso

- Radar Natura di Base con Flemmatica al massimo: `correntePrincipale.nome` è `Flemmatica`.
- La lettura contiene `famiglia flemmatica`.
- La lettura non contiene `volitivo` o `collerica`.

## Integrazione

Integrare il commit dedicato senza includere le modifiche concorrenti presenti nel worktree.
