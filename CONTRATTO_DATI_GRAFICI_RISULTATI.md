# Contratto dati — "Grafici dei risultati" (Report Emotivo TST)

Documento di riferimento per il redesign della sezione grafici del report (radar, ellisse/petalo, classifica famiglie, classifica sottocategorie, vista Galassia). Scritto da Claude Code (ownership: `src/testLogic.js`, `src/utils/buildReportData.js`, `src/utils/reportRecordUtils.js`, `src/content_report.json`, `src/content/`) per l'uso da parte di Antigravity (ownership: `src/components/report/`, `src/pages/ReportPage.jsx`).

**Nessun file di codice è stato modificato per produrre questo documento.** La struttura dati attuale è già sufficiente per il redesign — contiene tutti i valori necessari — ma non è un contratto unico e coerente: convivono più pipeline di calcolo indipendenti per la stessa informazione. Questo documento indica quale valore usare come fonte di verità per ciascun grafico e segnala le ambiguità note da tenere a mente.

---

## 1. Glossario dei tipi di valore

Per ogni corrente/famiglia esistono nel codice **quattro concetti distinti**, con nomi di campo diversi. Non farli mai coincidere nella UI senza etichetta esplicita:

| Concetto | Significato | Somma a un totale fisso? |
|---|---|---|
| **Valore assoluto** | Punteggio grezzo accumulato durante il test (somma dei delta di `computeScoreDeltaForAnswer`) | No, dipende dalle risposte |
| **Percentuale famiglia** (`peso`) | Quota della famiglia sul totale delle 5 famiglie dello stesso profilo | Sì, sommano a 100 — eccetto il caso limite di punteggi tutti a zero, dove tutte le 5 restituiscono 0 (vedi §6) |
| **Percentuale corrente** (`percentuale`) | Quota del punteggio della singola corrente rispetto al **proprio massimo teorico** (non rispetto al totale del profilo) | No, ogni corrente ha il proprio massimo indipendente — le 11 percentuali **non** sommano a 100 |
| **Scala 1–7** | Valore normalizzato per il radar, relativo al massimo tra le 5 famiglie nel profilo corrente | N/A (scala fissa 1–7) |

Il "punto 2" della percentuale-corrente è la fonte più comune di confusione: una sottocorrente al 40% non è "debole in assoluto", è al 40% del massimo teorico raggiungibile per quella specifica corrente (i massimi teorici differiscono tra correnti, vedi `THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY`, `src/testLogic.js:420`).

---

## 2. Fonte di verità per ciascun grafico (stato attuale)

| Grafico | Funzione/prop da usare oggi | Valore | File |
|---|---|---|---|
| **Radar "Grafici dei risultati"** | `buildTotalScoreRadarData(totalScores, correnti, families)` → scala 1–7 | Assoluto → normalizzato 1-7 relativo al max delle 5 famiglie | `src/components/report/SintesiCorrenti.jsx:204` (ricalcolato localmente, **non** da `reportData.sintesi.datiRadar`) |
| **Ellisse/"petalo" affiancato al radar** (`EmotionalShape`) | `ordered[].peso` → scala interna `1 + peso/maxPesoDelSet*6` | Percentuale famiglia, poi ri-scalata relativa al peso massimo *del set corrente* | `src/components/report/EmotionalShape.jsx:52-56` |
| **Classifica famiglie** | `reportData.correnti[]`, ordinata per `peso` decrescente | Percentuale famiglia (0-100, le 5 sommano a 100) | `buildReportData.js:634-660`, sort in `SintesiCorrenti.jsx:379-383` |
| **Classifica sottocategorie/correnti** | `reportData.sottocorrenti[]`, già ordinata (percentuale poi valore) | Percentuale corrente (su proprio massimo teorico) + valore assoluto | `buildReportData.js:233-259` |
| **Vista Galassia (petali/pianeti)** | `correntData[]` da `buildCorrentDataFromRecord(rawRecord)` | Percentuale famiglia/corrente **ricalcolata da zero**, indipendente da `reportData` | `src/utils/galassiaData.js:76`, consumata in `GalassiaView.jsx` |

**Nota aggiuntiva:** `reportData.correntiByPeso` (`buildReportData.js:668`, le famiglie già ordinate per `peso` decrescente) esiste ed è realmente usato — ma solo per generare il testo narrativo in `src/content/reportRestitution.js` (`buildDistribuzioneParagraph`), non per la UI dei grafici. `SintesiCorrenti.jsx:379-383` non lo riceve e ricalcola da zero lo stesso ordinamento in locale (`ordered`). Non è un campo "morto" come `sintesi.datiRadar`, ma è un esempio dello stesso pattern: un valore già pronto in `reportData` che la UI dei grafici ricalcola comunque per conto proprio.

**Nota importante:** il campo `reportData.sintesi.datiRadar` (`buildReportData.js:1025`, percentuali 0-100) esiste, è documentato nell'header del file, ma **non è consumato da nessun componente** (`SintesiCorrenti.jsx:353` lo destruttura come `_datiRadar` e non lo usa mai). Se il redesign vuole disegnare il radar leggendo direttamente da `reportData` invece di ricalcolare localmente, questo è il campo su cui allinearsi — ma oggi il suo contenuto (percentuale 0-100) non corrisponde alla scala realmente disegnata (1-7 assoluto-normalizzato). **Prima di riusarlo va deciso insieme quale scala deve avere**: è una decisione di design, non l'ho presa unilateralmente.

---

## 3. Famiglia dominante e sottocategorie

- `Disposizione_Prevalente` (famiglia dominante) è **ricalcolata a runtime** da `getDominantColorInfo(colorTotals)` (`reportRecordUtils.js:199`), non letta dal campo persistito su Firestore. Motivo storico: permette a un report di riflettere sempre l'ultima logica di calcolo anche per test salvati in passato — ma vedi rischio in §5.
- Le sotto-qualità (es. "Lunare"/"Solare" dentro la famiglia Blu) sono **dati veri**, non solo copy: sono le 11 correnti stesse. Sono esposte in due strutture con nomi simili ma contenuto diverso — da non confondere:
  - `reportData.sottocorrenti[]` (top-level): dato numerico per utente (`valore`, `percentuale`), ordinabile, questo è quello da usare per radar/classifiche.
  - `reportData.correnti[].sottoCorrenti[]`: contenuto teorico statico (titolo, intervallo musicale, descrizione), **senza punteggio dell'utente** — utile solo per testi/tooltip esplicativi, non per disegnare valori.

---

## 4. Metadati disponibili per tooltip, legende, spiegazioni progressive

- **`GLOSSARY`** (`src/content/reportRestitution.js:95`): voci concettuali generiche (es. "corrente emotiva", "sotto-corrente", "configurazione prevalente"), consumabili via `getGlossaryEntry`/`ReportGlossaryDrawer`. **Non copre singole famiglie o correnti per nome.**
- **`galaxyTheoryContent.ts`**: per ciascuna delle 11 correnti ha già un oggetto strutturato (`rawKey`, `title`, `interval`, `color`, `description`, `states`). Non è un asset isolato della sola vista Galassia: è già collegato, tramite `src/content/statiAnimoLessico.js` (`FAMIGLIE_LESSICO`), sia a `reportData.correnti[].sottoCorrenti` (`buildReportData.js:664`) sia direttamente al componente **`ParoleStatiAnimo.jsx`** del report principale (righe 88-116, usa `titolo`/`descrizione`/`stati`). **È comunque la base più solida già pronta** se il redesign vuole un tooltip per-corrente sul radar/classifica: il contenuto esiste già, è strutturato per chiave, e ha già almeno un precedente di riuso nel report — ma verificare con Antigravity se serve un formato aggiuntivo più corto per il tooltip rispetto a quanto già usato in `ParoleStatiAnimo`.
- **`content_report.json`** (famiglie): testo prosa lungo (`restituzione_natura`, `descrizione_estesa`, ecc.), adatto a un pannello di dettaglio esteso, non a un tooltip breve.
- **Non esiste oggi** una mappa breve chiave→testo dedicata "spiegazione da tooltip" per famiglia (es. una frase da mostrare sull'hover del vertice del radar). Se serve, va costruita: consiglio di derivarla da `galaxyTheoryContent.ts` (già strutturata) piuttosto che estrarla dal prosa lungo di `content_report.json`.

---

## 5. Ambiguità note — non corrette in questo intervento, da tenere presenti

Nessuna di queste blocca il redesign, ma vanno considerate perché toccano file/decisioni fuori dall'ownership di questo intervento (Antigravity) o richiedono una decisione di design condivisa, non un fix unilaterale:

1. **Etichetta "attivazione" riusata su due formule diverse.** `criterioPeso: 'attivazione'` (famiglie, share-of-whole) e `criterioPercentuale: 'attivazione'` (correnti, quota-su-massimo-teorico) hanno lo stesso valore-etichetta pur essendo metriche diverse (`buildReportData.js:253,660`). Il tooltip generico in `reportUiCopy.js` (`REPORT_CRITERION.attivazione`) viene mostrato identico per entrambe, ma il testo ("quota rispetto al totale del profilo") è corretto solo per le famiglie, non per le correnti. **Non ho modificato `criterioPercentuale`** perché cambiarlo senza aggiornare `reportUiCopy.js`/`SintesiCorrenti.jsx` (file di Antigravity) romperebbe la lookup del tooltip. Consiglio: quando Antigravity ridisegna i tooltip, distinguere esplicitamente il testo per array di provenienza (`correnti` vs `sottocorrenti`), non fidarsi della sola etichetta `criterio*`.
2. **Almeno tre `FAMILY_ORDER` diversi nel codice basati su nomi colore**, con ordini differenti: `reportFamilyTheme.js:106` (`Verde,Rosso,Blu,Giallo,Grigio` — quello che di fatto determina l'ordine base di `reportData.correnti` e quindi il tie-break della classifica famiglie), `SintesiCorrenti.jsx:28` (`Verde,Blu,Rosso,Giallo,Grigio`, usato solo per fallback colore) e `ParoleStatiAnimo.jsx:24` (`Blu,Rosso,Verde,Giallo,Grigio`). C'è inoltre una quarta variante in `LessicoAtlasView.jsx:97`, che però usa chiavi `dispositionId` (es. `malinconica_nostalgica`) invece dei nomi colore, quindi meno direttamente paragonabile alle altre tre. Non causano bug visibili oggi (usi diversi), ma sono una fonte di errore se qualcuno li tocca pensando siano la stessa costante. Fuori dall'ownership Claude (tutti e quattro sono in `src/components/report/`).
3. **Tie-break "famiglia dominante" vs "prima posizione in classifica" possono differire su un pareggio esatto.** `getDominantColorInfo` risolve i pareggi nell'ordine `blu,rosso,verde,giallo,grigio` (ordine di dichiarazione delle chiavi in `reportRecordUtils.js:200-204`); la classifica visuale eredita l'ordine di `FAMILY_ORDER` di `reportFamilyTheme.js` (`Verde,Rosso,Blu,...`) come base dello stable-sort. Su un pareggio esatto tra due famiglie, il testo "la tua famiglia prevalente è X" e la prima riga della classifica potrebbero indicare famiglie diverse. Rischio basso (richiede un pareggio esatto), ma concreto. Cambiare la formula tocca `reportRecordUtils.js` (mio) **e** `SintesiCorrenti.jsx`/ordinamento (di Antigravity): serve una decisione condivisa su quale ordine è quello "giusto", non l'ho decisa io.
4. **Famiglia dominante a punteggi tutti zero restituisce sempre `'blu'`** (`getDominantColorInfo`, accumulatore iniziale `['blu', 0]` con confronto `>`, mai aggiornato se tutti i totali sono 0). A salvataggio, invece, `Disposizione_Prevalente` non viene proprio scritta in questo caso (`testRecordProcessing.js`, richiede `>0`). Scenario raro in pratica (serve un test con punteggio zero su tutte le 5 famiglie), ma se il redesign vuole gestire esplicitamente uno stato "nessun dato/famiglia non determinabile", questo va deciso insieme: oggi il grafico mostrerebbe comunque "Blu" come prevalente.
5. **Radar/petalo a punteggi tutti zero non mostrano uno stato vuoto**: `normalizeLevels` e il calcolo radar forzano il minimo visualizzato a 1 (mai 0), quindi il grafico disegna comunque una forma piena minima invece di segnalare assenza di dati.

Nessuno di questi punti è stato corretto in questo intervento: sono tutti fuori dall'ownership assegnata a Claude in questo task, oppure richiedono una scelta di design (quale ordine/quale comportamento a zero è quello "corretto") che spetta a una decisione condivisa, non a un fix unilaterale su un file altrui.

---

## 6. Edge case — comportamento verificato

| Caso | Comportamento attuale |
|---|---|
| Tutte le famiglie a 0 | `computeRelativePercentages` → tutte a 0 (gestito bene). `getDominantColorInfo` → `'blu'` di default (vedi §5.4). Radar → forma piena minima, non stato vuoto (vedi §5.5). |
| Pareggio tra famiglie | Gestito, ma con due ordini di tie-break potenzialmente diversi (vedi §5.3). |
| Pareggio tra sottocorrenti | Gestito esplicitamente: sort primario su `percentuale`, secondario su `valore` (`buildReportData.js:255-258`). |
| Una famiglia al 100%, le altre a 0 | Nessun problema: `computeRelativePercentages` distribuisce correttamente i decimali fino a sommare 100 anche in questo caso estremo. |
| Dati grezzi mancanti/parziali | Gestito con try/catch e fallback a zero in entrambi i punti, ma con due meccanismi di segnalazione diversi: `ReportPage.jsx:115-134` fa solo `console.warn` (nessuna traccia strutturata), mentre `buildReportData.js:1059-1069` registra l'errore nell'array `reportData._fallbacks` (leggibile a runtime, non solo in console). |

---

## 7. Interfacce da considerare stabili (non rompere senza coordinarsi)

- `buildReportData(...)` → forma di `reportData` (`buildReportData.js:620`, contratto documentato nell'header del file).
- `computeColorTotals`, `computeRelativePercentages`, `getDominantColorInfo`, `normalizeLevels`, `DOMINANT_COLOR_NAME_BY_KEY` — esportate da `reportRecordUtils.js`, condivise tra report, PDF e Galassia: una modifica alla formula di arrotondamento o al tie-break si propaga ovunque.
- `THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY` / `THEORETICAL_MAX_COLOR_TOTALS` (`testLogic.js:420,442`) — base di ogni percentuale-corrente.
- Campi Firestore persistiti (`src/dbSchema.js`): `BLU_1_Depressiva…GRIGIO_2_Intellettuale_Saggio`, `Disposizione_Prevalente`, `Sottodisposizione_Prevalente`, `File_01…File_72`.

---

## 8. Cosa serve per il redesign — riepilogo pratico

Per Antigravity, i dati **sufficienti** oggi per costruire la nuova UI sono già tutti disponibili in `reportData.correnti[]` e `reportData.sottocorrenti[]` (valore assoluto + percentuale + colore + nome, per entrambi i livelli). Non serve una modifica del contratto dati per procedere con radar, ellisse e classifiche.

Prima di iniziare, tenere presente:
- Usare `reportData.correnti[].peso` per la classifica famiglie e `reportData.sottocorrenti[].percentuale`/`.valore` per la classifica correnti — **non** ricalcolare di nuovo da `rawRecord` come fa oggi `galassiaData.js`, per evitare una quarta pipeline parallela.
- Se si vuole un radar alimentato direttamente da `reportData` invece che ricalcolato in `SintesiCorrenti.jsx`, decidere insieme la scala di `sintesi.datiRadar` prima di ricollegarlo (oggi è percentuale 0-100, il radar attuale è 1-7 assoluto-normalizzato — sono scale diverse).
- Per tooltip per-corrente, la fonte pronta all'uso è `galaxyTheoryContent.ts`, non `content_report.json`.
- Le ambiguità del §5 non bloccano il lavoro ma vanno tenute a mente se si toccano `SintesiCorrenti.jsx`, `EmotionalShape.jsx`, `GalassiaView.jsx` o `ParoleStatiAnimo.jsx` in autonomia.
