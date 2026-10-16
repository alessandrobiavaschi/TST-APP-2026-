# TST 2026 — Istruzioni per Claude Code

Web app React 19 + Vite 7 per il Test Temperamentale (metodo Franco Mussida): 72 ascolti audio guidati, punteggio su 12 nature × 3 portati, report interattivo e Galassia lessicale.
Lo strumento non è diagnostico: il report descrive ipotesi interne al modello TST, mai diagnosi.

Prima di modificare la UI, segui DESIGN.md e leggi DESIGN-HANDOFF.md.

Root del progetto: `/Users/alessandrobiavaschi/Downloads/TST 2026 cursor`. Ignora percorsi esterni (`Downloads/App v2`, `App v5`, `~/TST_demo`, `~/package.json`).

## Comandi

```bash
npm run dev                          # Vite su localhost:5173 (prima esegue scripts/prepare-audio.mjs)
npm test                             # suite completa: node --test su test/
node --test test/<nome>.test.js      # un solo file di test: usalo durante il lavoro
npm run lint                         # ESLint, tolleranza 0 errori
npm run build                        # build di produzione in dist/
```

Esiste una test suite (`test/`, runner nativo `node --test`). Va eseguita prima e dopo ogni modifica alla logica di calcolo o al report.
Alcuni test avviano un server Vite (`galassiaDataContract`, `galassiaLessicoViewModel`, `reportGraphDataContract`): girano solo dove `node_modules` è installato per la piattaforma corrente.

## Modello TST: fonti di verità

- `src/config/tstSistema.js` è l'unica fonte per famiglie, nature, portati, 72 passi, pesi e regole. Nessun altro modulo riscrive a mano nomi, colori o chiavi.
- Calcolo: `src/utils/cesteTst.js` (ceste natura × portato), `src/utils/testRecordProcessing.js` (prevalenze e normalizzazione).
- Lessico delle nature: `src/content/paroleTst.js`. Regole dei rapporti e copy: `SPECIFICA_REGOLE_RAPPORTI_FRANCO.md`.
- `src/testLogic.js` contiene la mappa storica delle 72 domande; i nuovi calcoli passano dalle ceste.

### Le 12 nature (nomi canonici, `campoDb` → nome)

| Famiglia (colore) | Nature |
|---|---|
| Malinconica (blu) | `BLU_1_Depressiva` Lunare Depressiva · `BLU_2_Lunare` Lunare Introspettiva · `BLU_3_Nostalgia` Nostalgica · `BLU_4_Solare` Solare |
| Marziale (rosso) | `ROSSO_1_Assertivita` Volitiva · `ROSSO_2_Dubbio_Collera` Collerica |
| Flemmatica (verde) | `VERDE_1_CalmaContemplativa` Calma Contemplativa · `VERDE_2_CalmaFisica` Calma Fisica |
| Entusiasta (giallo) | `GIALLO_1_Gioia_Entusiasmo` Gioiosa Solare · `GIALLO_2_Volitivo_Passionale` Sanguigna Operosa |
| Razionale (grigio) | `GRIGIO_1_Anaffettiva` Anaffettiva · `GRIGIO_2_Distaccata` Distaccata |

Portati: `PE_Simpatia`, `PE_Antipatia`, `PE_Indifferenza`.
I `campoDb` sono i nomi storici dei campi su Firestore: non rinominarli mai. I nomi visibili si leggono da `tstSistema.js`.
Terminologia: "famiglia" è il livello colore, "natura" il sotto-livello. "Temperamento" si usa solo a livello di famiglia.

### Versioni del modello e dati storici

- Ogni test salva `versione_modello` (corrente: `VERSIONE_MODELLO` in `tstSistema.js`, oggi `2026_v3`: affinità per suono, vedi `AFFINITA_PER_PASSO`).
- I test senza versione valgono come `2025_v1` (modello a 11 correnti). `normalizzaRecordTst()` li restituisce con i punteggi salvati e non li ricalcola.
- Se cambi nature, pesi o regole: incrementa `VERSIONE_MODELLO` e non ricalcolare i test delle versioni precedenti senza una decisione esplicita dell'utente.
- Il report legge e non scrive su Firestore. Non scrivere script che modificano documenti in `test_results`.

## Come lavorare

1. Esplora in modo mirato: parti dai file indicati qui, cerca con grep solo le stringhe del task. Non rileggere tutto il progetto.
2. Se il task tocca più di 2 file, presenta un piano breve e aspetta conferma. Se il piano è già approvato, procedi senza chiedere di nuovo per i passi meccanici.
3. Esegui il test del file coinvolto prima e dopo la modifica. Prima di chiudere: `npm run lint` e `npm test`.
4. Un commit per ogni intervento atomico, dopo lint e test.

### Test rossi

Non modificare le asserzioni di un test per farlo passare. Prima diagnostica: il test è superato da una scelta editoriale o di metodo, oppure il codice ha una regressione? Riporta la diagnosi e aspetta la conferma dell'utente prima di toccare il test. Le decisioni sui contenuti del modello spettano all'utente e a Franco Mussida.

### File grandi

`src/App.css` (~22.000 righe) e `src/components/report/GalassiaView.jsx` (~4.300 righe) non vanno letti interi: cerca le righe che servono. Il CSS di Vite è globale: spostare o caricare CSS in modo lazy cambia la cascata, quindi ogni intervento del genere richiede un controllo visivo delle pagine principali.
I nuovi componenti e le nuove funzioni restano sotto le ~200 righe.

## Sicurezza e repository

- Mai commit o push diretti su `master` / `main`. Lavora su un branch dedicato.
- Mai force push.
- Mai deploy (Firebase, Netlify) senza richiesta esplicita dell'utente e verifica del target.
- Mai esporre `.env`, chiavi o dati personali dei test (sono dati psicologici).
- Gli handoff di workflow multi-agente vanno in `docs/handoff/`, non nella root. Quelli vecchi sono in `docs/archivio/`.
- Solo quando l'utente avvia una consegna multi-agente: leggi `AI_TASK.md` e usa `/parallel-delivery`.

## Regole di testo (copy del report)

- Mai alterare il significato dei contenuti esistenti.
- Evitare elenchi di 3–4 sostantivi in serie ("X, Y, Z e W") se ne esiste già uno nello stesso blocco: spezzare in due frasi.
- Evitare il costrutto "Non è X, ma Y": riformulare in positivo.
- Virgolette caporali «» solo per citazioni vere, mai per enfatizzare singole parole.
- Non mostrare all'utente nomi di file (`.pdf`) o codici interni (es. `INT-MA`).
- Alternare frasi lunghe e corte; unire paragrafi monofrase consecutivi.
- Non aggiungere micro-titoli, kicker, eyebrow label o soprattitoli se non richiesti esplicitamente.

## UI e design

Prima di toccare layout o stile del report leggi `docs/REGOLE_DESIGN_REPORT.md` (spaziature, font, colore accento, contenitori) e `GUIDA_UI_UX.md`. Riusa le classi CSS esistenti, una sola CTA primaria per pagina. Per lavori solo UI c'è la skill `tst-report-ui`.

## Mappa rapida

- Routing in `src/pages/`: `/` Landing, `/home`, `/nuovo-test` (72 passi), `/tutorial`, `/risultati`, `/risultati/report`, `/tst`, `/profilo`, `/info`.
- Report: `ReportPage` → `ReportShell` (sezioni in `reportSectionsConfig.js`); componenti in `src/components/report/`; dati da `src/utils/buildReportData.js`; testi in `src/content_report.json` e `src/content/`.
- Firestore: collection `test_results` (proprietà del campo `userId`), salvataggio in `src/firestore/testResults.js`, schema in `src/dbSchema.js`, regole in `firestore.rules`.
- `src/plugins/BANANA/` è sperimentale, fuori dal flusso principale.

## Report finale di ogni intervento

File modificati, cosa è cambiato, cosa non è stato toccato, esito di lint e test, dubbi aperti.
