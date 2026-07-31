# Contratto dati — "Grafici dei risultati" (Report Emotivo TST)

Documento di riferimento per il redesign della sezione grafici del report (radar, ellisse/petalo, classifica famiglie, classifica sottocategorie, vista Galassia). Scritto da Claude Code (ownership: `src/testLogic.js`, `src/utils/buildReportData.js`, `src/utils/reportRecordUtils.js`, `src/content_report.json`, `src/content/`) per l'uso da parte di Antigravity (ownership: `src/components/report/`, `src/pages/ReportPage.jsx`).

**Nessun file di codice è stato modificato per produrre la prima versione di questo documento.** La struttura dati era già sufficiente per il redesign — conteneva tutti i valori necessari — ma non era un contratto unico e coerente: convivevano più pipeline di calcolo indipendenti per la stessa informazione. Questo documento indica quale valore usare come fonte di verità per ciascun grafico e segnala le ambiguità note da tenere a mente.

## Aggiornamento — round 2 (fix su segnalazione Codex)

Dopo i test di Codex sono stati applicati fix mirati in `reportRecordUtils.js` e `buildReportData.js` (nell'ownership Claude). Riepilogo, dettagli nei paragrafi corrispondenti più sotto:

- **Aggregazione stringhe (bug reale, corretto):** `computeColorTotals` sommava i campi con `(record.X || 0) + ...` senza `Number(...)`: se un valore storico era salvato come stringa, l'operatore `+` faceva concatenazione invece di somma. Corretto con coercizione esplicita — si propaga automaticamente anche alla vista Galassia, che importa la stessa funzione.
- **Tie-break unificato (corretto):** `getDominantColorInfo` ora risolve i pareggi nello stesso ordine (`FAMILY_ORDER`) usato per costruire `reportData.correnti[]`, invece di un ordine hardcoded diverso. **Effetto collaterale intenzionale:** a punteggi tutti zero il default cambia da `'Blu'` a `'Verde'` (primo elemento di `FAMILY_ORDER`), ora coerente con la prima riga della classifica famiglie invece di contraddirla.
- **`familyKey` esplicito:** aggiunto a `rapporti[].correntePrincipale` e a `sintesi.datiRadar[]` (mancava in questi due punti; era già presente altrove).
- **`sintesi.datiRadar` corretto:** conteneva la percentuale 0-100 (`peso`), diversa dalla scala 1-7 realmente disegnata dal radar. Ora contiene `scala1a7` (stessa formula/stessi valori del radar attuale) — se mai verrà collegato da Antigravity, mostrerà esattamente ciò che si vede oggi.
- **`reportData.correnti[]` arricchito** con `valoreAssoluto` (punteggio grezzo) e `scala1a7` (valore radar), additivi: nessun campo esistente è stato rinominato o rimosso.
- **`reportData.sottocorrenti[]` arricchito** con `maxTeorico` e `misurabile` (booleano) per gestire esplicitamente il caso di massimo teorico a zero (`GRIGIO_2_Intellettuale_Saggio`, vedi §5.6/§6).
- **Sottodisposizione derivata:** confermato che `resolveSottodisposizionePrevalente`/`reportData.sottodisposizionePrevalente` già applicano correttamente il fallback quando il valore salvato è assente — ma `ReportShell.jsx:473` (ownership Antigravity) bypassa questo campo leggendo direttamente `rawRecord?.Sottodisposizione_Prevalente`. Fix necessario ma fuori ownership Claude, vedi §5.7.

Dettagli completi, comandi eseguiti e verifiche in `HANDOFF_CLAUDE.md`.

---

## 1. Glossario dei tipi di valore

Per ogni corrente/famiglia esistono nel codice **quattro concetti distinti**, con nomi di campo diversi. Non farli mai coincidere nella UI senza etichetta esplicita:

| Concetto | Significato | Somma a un totale fisso? |
|---|---|---|
| **Valore assoluto** (`correnti[].valoreAssoluto`, `sottocorrenti[].valore`) | Punteggio grezzo accumulato durante il test (somma dei delta di `computeScoreDeltaForAnswer`) | No, dipende dalle risposte |
| **Percentuale famiglia** (`correnti[].peso`) | Quota della famiglia sul totale delle 5 famiglie dello stesso profilo | Sì, sommano a 100 — eccetto il caso limite di punteggi tutti a zero, dove tutte le 5 restituiscono 0 (vedi §6) |
| **Percentuale corrente** (`sottocorrenti[].percentuale`) | Quota del punteggio della singola corrente rispetto al **proprio massimo teorico** (non rispetto al totale del profilo). Se il massimo teorico è 0, vedi `misurabile` in §5.6 | No, ogni corrente ha il proprio massimo indipendente — le 11 percentuali **non** sommano a 100 |
| **Scala 1–7** (`correnti[].scala1a7`) | Valore normalizzato per il radar, relativo al massimo tra le 5 famiglie nel profilo corrente | N/A (scala fissa 1–7) |

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

**Nota importante (aggiornata — round 2):** il campo `reportData.sintesi.datiRadar` (`buildReportData.js`) **non è ancora consumato da nessun componente** (`SintesiCorrenti.jsx:353` lo destruttura come `_datiRadar` e non lo usa mai) — resta un campo pronto ma non collegato. Il suo *contenuto* però è stato corretto: ora espone `scala1a7` (stessa formula/stessi valori del radar realmente disegnato oggi) e `familyKey`, invece della percentuale 0-100 di prima. Se e quando Antigravity vorrà disegnare il radar leggendo direttamente da `reportData` invece di ricalcolare localmente, questo campo è già allineato 1:1 con quanto visualizzato oggi — nessuna decisione di scala ulteriore necessaria.

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
3. ~~**Tie-break "famiglia dominante" vs "prima posizione in classifica" possono differire su un pareggio esatto.**~~ **RISOLTO (round 2).** `getDominantColorInfo` ora usa lo stesso ordine (`FAMILY_ORDER`) della classifica visuale invece di un ordine hardcoded diverso (`reportRecordUtils.js`). Un pareggio esatto tra due famiglie ora produce sempre lo stesso risultato tra "famiglia prevalente" annunciata e prima riga della classifica.
4. ~~**Famiglia dominante a punteggi tutti zero restituisce sempre `'blu'`**~~ **RISOLTO (round 2), con effetto collaterale voluto.** Conseguenza diretta del fix del punto 3: il default a punteggi tutti zero ora è `'Verde'` (primo elemento di `FAMILY_ORDER`) invece di `'Blu'` hardcoded — coerente con la classifica invece di contraddirla. Se questo comportamento a "nessun dato" merita in futuro uno stato esplicito ("famiglia non determinabile") invece di un default silenzioso, resta una decisione di design da prendere insieme: non l'ho introdotta unilateralmente, ho solo reso i due punti coerenti tra loro.
5. **Radar/petalo a punteggi tutti zero non mostrano uno stato vuoto**: `normalizeLevels` e il calcolo radar forzano il minimo visualizzato a 1 (mai 0), quindi il grafico disegna comunque una forma piena minima invece di segnalare assenza di dati. Non corretto: cambiare questo comportamento è una decisione di design (introdurre uno stato "nessun dato" nel radar), non presa unilateralmente.
6. **`GRIGIO_2_Intellettuale_Saggio` ha massimo teorico pari a 0 — VERIFICATO E RISOLTO (round 2).** Nessuna risposta del test (Dizionario 1/2, Affinità Base/Eccezione/Standard) in `testLogic.js` produce mai un delta per questa corrente: `THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY['GRIGIO_2_Intellettuale_Saggio']` è sempre 0, quindi `rawRecord.GRIGIO_2_Intellettuale_Saggio` è sempre 0 per ogni record reale. Il codice esistente già evitava un crash/NaN (`percentuale = max > 0 ? ... : 0`), ma un "0%" per massimo-teorico-assente era indistinguibile da un "0%" per punteggio realmente misurato-e-nullo. Aggiunto `sottocorrenti[].misurabile` (booleano, `maxTeorico > 0`) e `sottocorrenti[].maxTeorico`: la UI può ora escludere/marcare diversamente questa voce invece di mostrarla come un'attivazione reale sempre a zero. **Non è stata aggiunta/alterata alcuna logica di scoring** per "rendere misurabile" questa corrente: sarebbe una modifica al significato scientifico del test, esplicitamente vietata — resta una lacuna nota del test stesso, solo ora esplicita nel contratto dati.
7. **Sottodisposizione derivata non sempre usata quando quella salvata è assente — verificato, parzialmente fuori ownership.** `resolveSottodisposizionePrevalente`/`reportData.sottodisposizionePrevalente` (`buildReportData.js`, ownership Claude) applicano già correttamente il fallback quando `Sottodisposizione_Prevalente` non è salvata o non appartiene alla famiglia dominante ricalcolata — nessun bug qui. Ma **`src/components/report/ReportShell.jsx:473`** (ownership Antigravity) passa `sottodisposizione={rawRecord?.Sottodisposizione_Prevalente || ''}`, cioè legge il campo grezzo persistito invece di `reportData.sottodisposizionePrevalente` già calcolato: se il campo non è salvato, il consumatore riceve una stringa vuota invece del fallback derivato. **Fix necessario: un cambio di una riga in `ReportShell.jsx` (`sottodisposizione={sottodisposizionePrevalente}` invece del campo raw) — fuori dall'ownership Claude, segnalato per Antigravity/Codex.** Nota anche una quarta implementazione indipendente dello stesso concetto in `src/pages/ResultsPage.jsx:158-165` (fuori ownership Claude, non verificata in dettaglio).

Punti 3, 4 e 6 sono stati risolti in questo intervento (codice nell'ownership Claude). Il punto 5 resta una decisione di design non presa. Il punto 7 è verificato e risolto lato Claude, ma richiede un fix di una riga fuori ownership per essere pienamente effettivo end-to-end.

---

## 6. Edge case — comportamento verificato

| Caso | Comportamento attuale |
|---|---|
| Tutte le famiglie a 0 | `computeRelativePercentages` → tutte a 0 (gestito bene). `getDominantColorInfo` → `'Verde'` di default (round 2: era `'Blu'`, ora coerente con `FAMILY_ORDER`, vedi §5.4). Radar → forma piena minima, non stato vuoto (vedi §5.5, non risolto). |
| Pareggio tra famiglie | **Risolto (round 2):** un solo ordine di tie-break (`FAMILY_ORDER`), vedi §5.3. |
| Pareggio tra sottocorrenti | Gestito esplicitamente: sort primario su `percentuale`, secondario su `valore` (`buildReportData.js:255-258`). |
| Una famiglia al 100%, le altre a 0 | Nessun problema: `computeRelativePercentages` distribuisce correttamente i decimali fino a sommare 100 anche in questo caso estremo. |
| Valori storici salvati come stringa (es. `"3"` invece di `3`) | **Risolto (round 2):** `computeColorTotals` ora coercizza esplicitamente a `Number` ogni campo prima di sommarlo — prima, una stringa avrebbe causato concatenazione invece di somma. Il fix si propaga anche a `galassiaData.js`, che importa la stessa funzione. |
| `GRIGIO_2_Intellettuale_Saggio` (massimo teorico 0) | **Risolto (round 2):** vedi §5.6 — `misurabile: false` esposto esplicitamente, nessuna modifica alla logica di scoring. |
| Dati grezzi mancanti/parziali | Gestito con try/catch e fallback a zero in entrambi i punti, ma con due meccanismi di segnalazione diversi: `ReportPage.jsx:115-134` fa solo `console.warn` (nessuna traccia strutturata), mentre `buildReportData.js:1059-1069` registra l'errore nell'array `reportData._fallbacks` (leggibile a runtime, non solo in console). |

---

## 7. Interfacce da considerare stabili (non rompere senza coordinarsi)

- `buildReportData(...)` → forma di `reportData` (`buildReportData.js:620`, contratto documentato nell'header del file).
- `computeColorTotals`, `computeRelativePercentages`, `getDominantColorInfo`, `normalizeLevels`, `DOMINANT_COLOR_NAME_BY_KEY` — esportate da `reportRecordUtils.js`, condivise tra report, PDF e Galassia: una modifica alla formula di arrotondamento o al tie-break si propaga ovunque.
- `THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY` / `THEORETICAL_MAX_COLOR_TOTALS` (`testLogic.js:420,442`) — base di ogni percentuale-corrente.
- Campi Firestore persistiti (`src/dbSchema.js`): `BLU_1_Depressiva…GRIGIO_2_Intellettuale_Saggio`, `Disposizione_Prevalente`, `Sottodisposizione_Prevalente`, `File_01…File_72`.

---

## 8. Cosa serve per il redesign — riepilogo pratico

Per Antigravity, i dati **sufficienti** oggi per costruire la nuova UI sono già tutti disponibili in `reportData.correnti[]` e `reportData.sottocorrenti[]` (valore assoluto + percentuale + scala 1-7 + colore + nome + `familyKey`, per entrambi i livelli). Non serve una modifica del contratto dati per procedere con radar, ellisse e classifiche.

Prima di iniziare, tenere presente:
- Usare `reportData.correnti[].peso` per la classifica famiglie, `.scala1a7` per il radar e `.valoreAssoluto` per il punteggio grezzo; `reportData.sottocorrenti[].percentuale`/`.valore` per la classifica correnti (controllare sempre `.misurabile` prima di trattare una `.percentuale` a 0 come "attivazione reale") — **non** ricalcolare di nuovo da `rawRecord` come fa oggi `galassiaData.js`, per evitare una quarta pipeline parallela.
- `reportData.sintesi.datiRadar` è ora allineato 1:1 al radar realmente disegnato (scala 1-7 + `familyKey`): se si vuole smettere di ricalcolare in locale in `SintesiCorrenti.jsx`, questo campo è già pronto senza ulteriori decisioni di scala.
- **Azione consigliata per Antigravity/Codex:** in `ReportShell.jsx:473`, sostituire `sottodisposizione={rawRecord?.Sottodisposizione_Prevalente || ''}` con `sottodisposizione={sottodisposizionePrevalente}` (già disponibile su `reportData`), per usare sempre il fallback derivato quando il valore salvato è assente (§5.7).
- Per tooltip per-corrente, la fonte pronta all'uso è `galaxyTheoryContent.ts`, non `content_report.json`.
- Le ambiguità residue del §5 (punti 1, 2, 5) non bloccano il lavoro ma vanno tenute a mente se si toccano `SintesiCorrenti.jsx`, `EmotionalShape.jsx`, `GalassiaView.jsx` o `ParoleStatiAnimo.jsx` in autonomia.
