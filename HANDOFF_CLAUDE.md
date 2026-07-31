# HANDOFF — Claude Code

## Round 3 — Galassia Lessicale 2.0 (corrente)

### Task
Nuova missione distribuita in `AI_TASK.md` (commit `a857bed`, dopo l'integrazione completa del ciclo precedente): trasformare la Galassia lessicale in un sistema analitico interattivo — campo di forze lessicale, costellazioni semantiche, lessico stabile e situazionale, contrasti lessicali, firma personale, tracciabilità musica-parola — senza modificare il calcolo scientifico del test. Ruolo Claude: architettura e flusso dati, business logic, calcoli e trasformazioni, contenuti, contratti tra moduli; niente redesign visivo.

Ho chiesto conferma sulla presenza di una specifica dettagliata: l'utente ha confermato che `AI_TASK.md` è il riferimento completo e ha vietato di "proporre liberamente" il significato delle sei funzioni, autorizzando però a segnalare esplicitamente le parti non sostenute dai dati reali invece di inventarle. Ho quindi analizzato tutte le strutture lessicali già esistenti nel codice (non solo il testo di `AI_TASK.md`) e ancorato ogni funzione a dati reali già presenti, senza inventare relazioni.

### Dati reali usati per ciascuna delle 6 funzioni

1. **Lessico stabile** → `FAMIGLIE_LESSICO` (`src/content/statiAnimoLessico.js`): vocabolario teorico per famiglia (`vocabolarioForme`, `vocabolarioAggettivi`), identico per ogni utente. Nessuna modifica: solo consolidato in un unico output con provenienza esplicita (`fonte: 'teoria'`).
2. **Lessico situazionale** → `extractParoleDalTest` (già esistente in `buildReportData.js`): le parole realmente emerse dalle risposte DIZIONARIO_2 (file 29–42) di questo utente. Esteso con `fonte: 'test'`.
3. **Tracciabilità musica-parola** → stessa funzione: `fileKeys` (nuovo campo) conserva l'elenco dei `File_NN` da cui ciascuna parola è realmente emersa — dato già calcolato internamente al loop ma prima scartato prima di restituire il risultato.
4. **Campo di forze lessicale** → nuovo, in `src/utils/galassiaLessicoViewModel.js`: somma vettoriale delle direzioni statiche già definite per famiglia in `config/dispositions.ts` (`directionVector`, `polarity` — costanti di design preesistenti, non toccate), scalate per il peso reale (`reportData.correnti[].peso`, 0-100 → 0-1) di questo profilo. **Esplicitamente documentato come metafora visiva per la Galassia, non un nuovo indicatore scientifico.**
5. **Contrasti lessicali** → riusa `CONTRASTING_PAIRS` e `detectContrastingPresence`, già in produzione per i "Quattro Rapporti" (ora esportati da `buildReportData.js`, additivo), applicati a `correnti[].scala1a7` — un'unica policy di soglia di "contrasto" in tutto il report, non una seconda inventata. Le parole illustrative usano il lessico situazionale se disponibile, altrimenti il lessico stabile (mai una parola inventata) — entrambe le fonti sono etichettate esplicitamente.
6. **Firma personale** → nuovo: codice deterministico (non crittografico) composto da famiglia dominante + sottodisposizione + le 3 famiglie meglio classificate, tutti campi già calcolati in `reportData`. Stesso input produce sempre lo stesso codice (verificato con test).
7. **Costellazioni semantiche** → riusa `SEMANTIC_CONCEPTS`/`getPrimarySemanticConceptIdForColor` (`config/semanticConcepts.ts`, concetti già esistenti, nessuno nuovo inventato), incrociati con le sottocorrenti realmente valorizzate dell'utente (`relatedRawKeys ∩ sottocorrenti con valore > 0`).

### File nuovi/modificati
- **Nuovo:** `src/utils/galassiaLessicoViewModel.js` — modulo puro, singolo punto d'ingresso `buildLessicoAnaliticoViewModel(...)`, nessun effetto collaterale, nessuna chiamata a `testLogic.js` che alteri punteggi. Contratto di output documentato per intero nell'header del file (regole, soglie, ordinamenti, pareggi, fallback, come richiesto).
- **Modificato:** `src/utils/buildReportData.js` — `extractParoleDalTest` arricchita con `fileKeys`/`fonte` (additivo); `CONTRASTING_PAIRS`/`detectContrastingPresence` resi `export` (nessun cambio di comportamento, solo visibilità).
- **Nuovo:** `test/galassiaLessicoViewModel.test.js` — 9 test mirati sulle regole documentate (vedi sotto).

### Regole, soglie, ordinamenti, pareggi e fallback documentati
- **lessicoSituazionale**: ordine per `count` decrescente; a parità, vince la parola incontrata prima nel test (file più basso tra 29-42) — stable sort su ordine di inserimento, testato esplicitamente.
- **campoDiForze**: magnitudine = `peso` (share-of-whole, 0-100 → 0-1); direzione = costante statica per famiglia; risultante = somma vettoriale; a tutti-zero la risultante è `{0,0,0}` deterministico (non `NaN`, non un vettore casuale) — testato.
- **contrastiLessicali**: soglia identica a `detectContrastingPresence` (gap ≤ 1 su scala 1-7, minore comunque ≥ 4); fallback parole: situazionali → stabili → nessuna (mai inventata) — testato in entrambi i rami.
- **firmaPersonale**: composizione deterministica, segmenti vuoti omessi (`.filter(Boolean)`) — testato con chiamata doppia sullo stesso input.
- **costellazioniSemantiche**: una famiglia senza concetto primario assegnato resta fuori dall'elenco invece di essere associata a un concetto non pertinente — testato (Rosso/Grigio assenti).

### Gap segnalati esplicitamente (non inventati, presenti anche in `_gap` a runtime)
1. Il grafo concetto→concetto (`SEMANTIC_CONCEPTS[*].relatedConcepts`) è vuoto per tutti i concetti in `semanticConcepts.ts`: non esiste ancora una vera rete di "costellazioni" tra concetti, solo la relazione concetto→correnti-utente.
2. Rosso e Grigio non hanno un concetto semantico primario assegnato (`PRIMARY_SEMANTIC_CONCEPT_BY_COLOR: null`).
3. Non esiste alcuna struttura di tipo thesaurus/antonimi tra parole: il "contrasto lessicale" è dati reali a livello di coppia di famiglie, non una vera opposizione parola-per-parola.
4. Le direzioni/polarità del campo di forze sono costanti di design già presenti in `dispositions.ts`, non derivate empiricamente: il campo di forze è una metafora visiva, va presentato come tale in UI, non come una nuova metrica scientifica del TST.
5. Il lessico situazionale copre solo le risposte DIZIONARIO_2 (file 29-42, aggettivi complessi), non DIZIONARIO_1 (file 5-28, 43-45, 47-50, 52-57, 59-72, reazioni brevi tipo "Mi dà gioia"): stessa scelta di perimetro già in uso da `paroleEmerse`/`statiAnimo` esistenti, non una nuova limitazione introdotta qui — segnalata per trasparenza, non corretta perché ampliarla è una decisione di prodotto (che tipo di "parola" mostrare) non presa unilateralmente.

### Comandi eseguiti e risultati
- `npm run lint` → pulito.
- `npm test` → 21/21 (12 preesistenti invariati + 9 nuovi).
- `npm run build` → completata con successo, 1221 moduli. Il nuovo modulo non è ancora importato da nessun componente (nessun consumatore ancora), quindi non compare come chunk separato — atteso, verrà collegato da Antigravity.

### Istruzioni per l'integrazione (Antigravity)
`buildLessicoAnaliticoViewModel` non è ancora chiamato da nessun componente — è un contratto pronto, analogo a come `buildCorrentDataFromRecord` (`galassiaData.js`) viene già invocato separatamente da `buildReportData`. Esempio di wiring in `GalassiaView.jsx`/`ReportShell.jsx`:

```js
import { buildLessicoAnaliticoViewModel } from '../../utils/galassiaLessicoViewModel.js'

const lessicoAnalitico = buildLessicoAnaliticoViewModel({
  rawRecord: record.raw,
  correnti: reportData.correnti,
  correntiByPeso: reportData.correntiByPeso,
  sottocorrenti: reportData.sottocorrenti,
  dominantColorName: reportData.profilo.famiglia,
  sottodisposizionePrevalente: reportData.sottodisposizionePrevalente,
})
```

Nessuna modifica a componenti/CSS/layout è stata fatta da questo lato: il redesign visivo (come mostrare campo di forze, costellazioni, contrasti, firma) resta interamente di competenza Antigravity. Consultare sempre `vm._gap` prima di presentare come "certe" le parti segnalate come non sostenute dai dati.

### Comportamento atteso nel browser
Nessuno finché Antigravity non collega il nuovo modulo: nessun file di componente, stile o pagina è stato toccato in questo round.

---

## Round 2 — fix su segnalazione Codex

### Task
Codex, dopo aver eseguito i test, ha segnalato 8 problemi di contratto dati e coerenza tra viste sulla sezione "Grafici dei risultati". Istruzione: verificare e risolvere nella ownership Claude (`src/testLogic.js`, `src/utils/buildReportData.js`, `src/utils/reportRecordUtils.js`, `src/content_report.json`, `src/content/`), senza toccare layout/CSS, poi documentare il contratto dati finale ed eseguire test/build.

### Esito per punto

1. **View model unico per radar/petali/classifica/tooltip/legenda** — Invece di creare una struttura parallela (che avrebbe aggiunto una quarta pipeline alle tre già esistenti), ho arricchito l'array già centrale `reportData.correnti[]` con i campi mancanti (`valoreAssoluto`, `scala1a7`) così che radar, classifica, tooltip e legenda possano leggere tutti dallo stesso array. Additivo, nessun campo esistente rinominato/rimosso.
2. **Distinguere raw points / profile presence / normalized graphic value** — Ora espliciti e nominati distintamente su `reportData.correnti[]`: `valoreAssoluto` (raw), `peso` (presence, share-of-whole), `scala1a7` (valore grafico normalizzato). Su `sottocorrenti[]`: `valore` (raw), `percentuale` (presence su proprio massimo teorico).
3. **Policy unica di tie-break sui pareggi** — `getDominantColorInfo` (`reportRecordUtils.js`) usava un ordine hardcoded (`blu,rosso,verde,giallo,grigio`) diverso da quello che determina l'ordine/tie-break della classifica famiglie (`FAMILY_ORDER` = `Verde,Rosso,Blu,Giallo,Grigio`, usato in `buildReportData.js`). Ora `getDominantColorInfo` usa lo stesso `FAMILY_ORDER` per il tie-break. **Effetto collaterale intenzionale:** il default a punteggi tutti-zero cambia da `'Blu'` a `'Verde'`, ora coerente con la classifica invece di contraddirla.
4. **Aggregazione valori storici salvati come stringa** — `computeColorTotals` sommava con `(record.X || 0) + ...`: se un campo storico fosse stato persistito come stringa (es. `"3"` invece di `3`), l'operatore `+` avrebbe fatto concatenazione invece di somma numerica. Corretto con coercizione esplicita a `Number` su ogni campo prima della somma. Il fix si propaga automaticamente a `src/utils/galassiaData.js` (vista Galassia), che importa la stessa funzione.
5. **Sottodisposizione derivata quando quella salvata è assente** — Verificato: `resolveSottodisposizionePrevalente`/`reportData.sottodisposizionePrevalente` (mio, in `buildReportData.js`) applicano già correttamente il fallback quando il valore salvato è assente o non coerente con la famiglia dominante ricalcolata — nessun bug qui. **Ma** `src/components/report/ReportShell.jsx:473` (ownership Antigravity) legge `rawRecord?.Sottodisposizione_Prevalente` invece di `reportData.sottodisposizionePrevalente`, bypassando il fallback. Non ho potuto correggere questo file (fuori ownership) — segnalato con l'esatta riga e il fix suggerito (vedi "Cross-ownership" sotto).
6. **`GRIGIO_2_Intellettuale_Saggio` con massimo teorico zero** — Verificato nel dettaglio in `testLogic.js`: nessuna risposta possibile del test produce mai un punteggio per questa corrente, quindi il suo massimo teorico è strutturalmente 0 (non un bug di calcolo, una lacuna del disegno del test). Il codice già evitava crash/NaN, ma un "0%" per "non misurato" era indistinguibile da un "0%" per "misurato e nullo". Aggiunto `sottocorrenti[].misurabile` (booleano) e `.maxTeorico`, additivi. **Nessuna modifica alla logica di scoring**: non è stata inventata una via per rendere "misurabile" questa corrente, sarebbe un'alterazione del significato scientifico del test, esplicitamente vietata dal task.
7. **`familyKey` esplicito, mai inferenza da colore** — Verificato che era già presente su `correnti[]`, `sottocorrenti[]` e nella vista Galassia. Mancava su `rapporti[].correntePrincipale` (solo `nome`/`colore`) e su `sintesi.datiRadar[]` (solo `corrente`/`valore`): aggiunto in entrambi.
8. **Documentare il contratto dati finale** — Questo file + `CONTRATTO_DATI_GRAFICI_RISULTATI.md` (aggiornato con una sezione "Aggiornamento — round 2" e con tutti i paragrafi interessati corretti per riflettere lo stato attuale, non più quello pre-fix).

### File modificati
- `src/utils/reportRecordUtils.js`: `computeColorTotals` (coercizione `Number`), `getDominantColorInfo` (tie-break unificato su `FAMILY_ORDER`, nuovo import da `../config/reportFamilyTheme.js`).
- `src/utils/buildReportData.js`: header JSDoc aggiornato al nuovo contratto; `buildSottocorrenti` (`misurabile`, `maxTeorico`); costruzione `correnti[]` (`valoreAssoluto`, `scala1a7`, nuovo import `normalizeLevels`); `rapporti[].correntePrincipale` (`familyKey`); `sintesi.datiRadar` (`familyKey`, valore ora `scala1a7` invece di `peso`).
- `CONTRATTO_DATI_GRAFICI_RISULTATI.md`: aggiornato per riflettere i fix (non più un semplice log di analisi).
- `HANDOFF_CLAUDE.md`: questo file.

Nessun file in `src/components/`, `src/pages/`, `src/styles/` toccato. Nessuna modifica a layout o CSS.

### Decisioni e assunzioni
- Ho scelto di **arricchire** le strutture esistenti (`correnti[]`, `sottocorrenti[]`, `sintesi.datiRadar`) invece di creare un nuovo modulo "view model" separato: evita di aggiungere una quarta pipeline parallela a un problema già causato da troppe pipeline parallele. Tutti i campi nuovi sono additivi.
- Non ho toccato la label `criterio*: 'attivazione'` riusata su formule diverse (già documentata in §5.1 del contratto dati): non era tra gli 8 punti segnalati da Codex questa volta, e correggerla richiederebbe coordinarsi con `reportUiCopy.js` (Antigravity).
- Non ho aggiunto logica di scoring per rendere "misurabile" `GRIGIO_2_Intellettuale_Saggio`: il task vieta esplicitamente di alterare il significato scientifico del test.
- Il cambio di default dominante a punteggi tutti-zero (`'Blu'` → `'Verde'`) è una conseguenza diretta e intenzionale dell'unificazione della policy di tie-break richiesta al punto 3, non una scelta indipendente.

### Comandi eseguiti e risultati
- `npm run lint` → pulito, nessun errore, eseguito dopo tutte le modifiche.
- `npm run build` → completata con successo (`vite build`, 1221 moduli, nessun errore).
- Non eseguito `npm test`: nessuna test suite configurata in questo repo (confermato in `CLAUDE.md`); i test citati da Codex vivono presumibilmente nel worktree/branch `ai/codex`, non eseguibili da qui.
- Verifica manuale (grep + lettura diretta) di ogni punto prima del fix: confermato che `GRIGIO_2_Intellettuale_Saggio` non compare in nessuna tabella di risposta di `testLogic.js`; confermato che `galassiaData.js` importa `computeColorTotals`/`computeRelativePercentages` direttamente da `reportRecordUtils.js` (il fix del punto 4 si propaga automaticamente lì); confermato che `ReportShell.jsx:473` bypassa il fallback derivato.

### Problema d'ambiente rilevato (importante per tutti gli agenti, non solo Claude)
`git status`/`git diff` in questo worktree **non rilevavano modifiche reali** (mostravano "working tree clean" anche con file tracciati modificati sul disco), a causa di `core.fsmonitor`/`core.untrackedCache` con cache evidentemente stale in questo ambiente. Verificato con `diff` esterno che le modifiche erano realmente presenti. Soluzione usata (non distruttiva, non ho toccato la config persistita): eseguire i comandi git con override one-shot `git -c core.fsmonitor=false -c core.untrackedCache=false status/diff/add/commit`. **Raccomando a Codex e Antigravity di verificare lo stesso comportamento nei rispettivi worktree** prima di fidarsi di un "nothing to commit" — un `git status` mentitore in fase di integrazione potrebbe far perdere modifiche reali o far sembrare puliti merge in realtà conflittuali.

### Problemi cross-ownership segnalati (non risolvibili da qui)
- **`src/components/report/ReportShell.jsx:473`** (Antigravity): sostituire `sottodisposizione={rawRecord?.Sottodisposizione_Prevalente || ''}` con `sottodisposizione={sottodisposizionePrevalente}` (campo già disponibile su `reportData`, distrutturabile dove il componente già riceve `reportData`). Fix di una riga, nessun rischio noto.
- **`src/pages/ResultsPage.jsx:158-165`**: quarta implementazione indipendente dello stesso concetto di "sottodisposizione derivata", non verificata in dettaglio (fuori ownership Claude secondo `AI_TASK.md`).

### Problemi noti non risolti (per consapevolezza, documentati in `CONTRATTO_DATI_GRAFICI_RISULTATI.md` §5)
- Etichetta `criterio*: 'attivazione'` riusata su formule diverse (famiglie vs correnti) — richiede coordinamento con `reportUiCopy.js`.
- Almeno 4 costanti `FAMILY_ORDER` diverse in `src/components/report/*` (fuori ownership Claude).
- Radar/petalo a punteggi tutti zero mostrano comunque una forma piena minima invece di uno stato vuoto esplicito — decisione di design non presa.

### Istruzioni per l'integrazione
- Nessuna breaking change: tutti i campi nuovi sono additivi, tutti i campi esistenti mantengono nome e significato invariati.
- Prima di chiudere l'integrazione, applicare il fix di una riga in `ReportShell.jsx:473` (vedi sopra) per rendere effettivo end-to-end il punto 5.
- Verificare in tutti i worktree se `git status`/`git diff` sono affidabili prima di merge/commit (vedi nota fsmonitor sopra).
- Contratto dati completo, aggiornato, in `CONTRATTO_DATI_GRAFICI_RISULTATI.md`.

### Comportamento atteso nel browser
Nessuna modifica visiva: tutti i valori nuovi sono additivi e non consumati da nessun componente esistente. L'unico cambiamento di comportamento osservabile è per il caso limite "tutte le famiglie a zero" (test praticamente vuoto): la famiglia dominante di default passa da "Blu" a "Verde" — scenario che in pratica non dovrebbe verificarsi con un test completato normalmente.

---

## Round 1 — analisi del contratto dati (storico)

Task originale: verificare se la struttura dati/contenuti fosse già adeguata per un redesign estremo della sezione "Grafici dei risultati", senza modificare la UI. Conclusione: struttura sufficiente, nessuna modifica al codice in quel round — solo produzione di `CONTRATTO_DATI_GRAFICI_RISULTATI.md` (poi aggiornato nel round 2 con i fix applicati). Verifiche eseguite: `npm run lint` pulito; revisione critica del documento (6 imprecisioni trovate e corrette). Dettagli completi ormai superseduti dal round 2 sopra; il contratto dati aggiornato è l'unica fonte da consultare.
