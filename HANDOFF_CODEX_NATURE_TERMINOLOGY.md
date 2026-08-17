# Handoff Codex - Terminologia delle nature

## Sintesi

Il copy visibile non presenta piu Volitiva, Collerica o Nostalgica come sottocategorie. Le diciture sono state uniformate a `natura`/`nature` nel report web, nei fallback, nella Galassia, nell'archivio e nel PDF.

## File modificati

- `src/content_report.json`
- `src/reportProfiloPdf.js`
- `src/config/galaxyTheoryContent.ts`
- `src/utils/profiloDisplayCopy.js`
- `src/utils/reportTaxonomy.js`
- `src/content/reportRestitution.js`
- `src/components/report/SintesiCorrenti.jsx`
- `src/content/famigliaApprofondimento.js` (solo etichetta Nostalgica; le altre modifiche locali preesistenti non appartengono a questo task)
- `test/reportMarzialeCopy.test.js`
- `test/reportTaxonomy.test.js`
- `test/reportTitleUtils.test.js`
- `test/galassiaDataContract.test.js`

## Decisioni e assunzioni

- `Le sottocategorie Volitiva e Collerica` diventa `Le nature Volitiva e Collerica`.
- `Nostalgico` diventa `Nostalgica` quando qualifica la natura, mantenendo le forme Solare e Lunare.
- Gli identificatori tecnici esistenti (`sottocategorie`, `formatSubcategoryLabel` e campi persistiti) restano invariati per compatibilita; non sono copy mostrato all'utente.
- Scoring, struttura Firestore, layout e stili non sono stati modificati.

## Verifiche

- `npm test`: 69 test passati, 0 falliti.
- `npm run lint`: completato senza errori.
- `npm run build`: completato con 1227 moduli trasformati.
- `git diff --check`: completato senza errori.

## Problemi irrisolti

Nessuno relativo a questo intervento.

## Integrazione e comportamento atteso

Integrare il commit della branch corrente senza includere le modifiche locali preesistenti. Nella sezione 1.3, nel PDF e nei fallback compare `Le nature Volitiva e Collerica`; nei contenuti Malinconici compare `natura Nostalgica` e l'etichetta `Nostalgica (Solare o Lunare)`.
