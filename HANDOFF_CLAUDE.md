# HANDOFF — Claude Code

## Task
Verificare, in vista del redesign estremo della sezione "Grafici dei risultati" (radar, ellisse/petalo, classifica famiglie, classifica sottocategorie), se la struttura dati/contenuti attuale è già adeguata a supportare una UI molto più evoluta, senza toccare la UI stessa. Se sufficiente, documentare il contratto invece di modificare codice.

## Sintesi dell'implementazione
Nessuna modifica al codice sorgente. Ho mappato l'intero flusso dati (con un agente di sola lettura sostitutivo di `repo-scout`, vedi nota sotto), verificato a mano ogni citazione file/riga rilevante, e prodotto `CONTRATTO_DATI_GRAFICI_RISULTATI.md` come documento di riferimento per Antigravity.

**Conclusione: la struttura dati è già sufficiente.** Tutti i valori richiesti (assoluto, percentuale famiglia, percentuale corrente su proprio massimo teorico, scala 1-7) esistono già, distinti e accessibili in `reportData.correnti[]` e `reportData.sottocorrenti[]`. Non ho quindi modificato file di codice: un fix mirato delle ambiguità trovate avrebbe richiesto toccare file di ownership Antigravity (`src/components/report/*`) o prendere decisioni di design non mie da prendere unilateralmente (vedi sotto).

## File modificati
- `CONTRATTO_DATI_GRAFICI_RISULTATI.md` (nuovo, root del repo) — contratto dati completo: glossario dei tipi di valore, fonte di verità per ciascun grafico, ambiguità note, metadati disponibili per tooltip, edge case, interfacce stabili.
- `HANDOFF_CLAUDE.md` (questo file).

Nessun file in `src/` è stato modificato.

## Decisioni e assunzioni
- **Nessun fix del codice**, come da istruzione esplicita ("se la struttura è già sufficiente, non modificare i file"). Le ambiguità concrete trovate (vedi sotto) toccano tutte file di ownership Antigravity o richiedono una decisione di design condivisa (es. quale ordine di tie-break è quello "corretto", che scala dare a `sintesi.datiRadar` se lo si vuole ricollegare) — le ho documentate con la soluzione più conservativa suggerita, senza deciderle al posto vostro.
- Ho interpretato "grafico a petali" come comprendente sia l'ellisse (`EmotionalShape`, affiancata al radar in `SintesiCorrenti`) sia la vista Galassia (`GalassiaView`), perché il testo del task non specificava quale delle due, ed entrambe usano una logica "a petalo". Il contratto copre entrambe.

## Verifiche eseguite
- `npm run lint` → pulito, nessun errore (nessun file sorgente toccato, verifica di baseline).
- Non eseguito `npm run build`: non pertinente, zero modifiche a `src/`.
- Ogni citazione file:riga nel contratto è stata verificata a mano con grep/read diretti (non solo dall'agente di esplorazione).
- Il documento è stato sottoposto a una revisione critica (agente di sola lettura, ruolo equivalente a `change-reviewer`) che ha trovato 6 imprecisioni — tutte corrette nel documento finale:
  1. "le 5 famiglie sommano sempre a 100" era in contraddizione col caso a punteggi zero (già documentato altrove nello stesso file) → corretto.
  2. `galaxyTheoryContent.ts` non è usato "solo" dalla vista Galassia: è già collegato anche a `ParoleStatiAnimo.jsx` nel report principale → corretto.
  3. "Tre `FAMILY_ORDER` diversi" → in realtà almeno quattro (una quarta variante in `LessicoAtlasView.jsx`, con chiavi `dispositionId`) → corretto.
  4. Non era menzionato `reportData.correntiByPeso`, un secondo caso dello stesso pattern di `sintesi.datiRadar` (valore pronto in `reportData` ma ricalcolato comunque in locale dalla UI) → aggiunto, con precisazione che a differenza di `datiRadar` non è "morto" (è usato per il testo narrativo).
  5. Citazione di riga imprecisa in `reportRecordUtils.js` (203-208 invece di 200-204) → corretta.
  6. Due meccanismi di fallback diversi (un `console.warn` vs un array `_fallbacks` tracciato) erano presentati come equivalenti → distinti chiaramente.

## Nota sui subagenti
`repo-scout` e `change-reviewer` sono definiti in `.claude/agents/` ma non risultano registrati come subagent type invocabili in questa sessione (la registrazione sembra legata alla directory di lancio della sessione, non al `cd`/worktree corrente). Ho usato l'agente `Explore` (stesso perimetro: sola lettura, Read/Grep/Glob) con lo stesso identico brief per entrambi i ruoli. Se altre sessioni Claude Code lanciate direttamente dentro questo worktree risultano invece in grado di invocare `repo-scout`/`change-reviewer` nativamente, è un problema di setup di questa sessione specifica, non del progetto.

## Problemi/ambiguità non risolti (per consapevolezza, non bloccanti)
Dettagliati in `CONTRATTO_DATI_GRAFICI_RISULTATI.md` §5. In sintesi:
1. L'etichetta `criterio*: 'attivazione'` è riusata identica per due formule diverse (percentuale famiglia vs percentuale corrente) — il tooltip generico condiviso (`reportUiCopy.js`, ownership Antigravity) risulta impreciso per le sottocorrenti.
2. Esistono almeno quattro costanti `FAMILY_ORDER` diverse in `src/components/report/*` (tutte fuori ownership Claude), con ordini non coincidenti.
3. Tie-break "famiglia dominante" (`getDominantColorInfo`) e tie-break della classifica visuale usano ordini di dichiarazione diversi: su un pareggio esatto potrebbero indicare famiglie diverse.
4. A punteggi tutti zero, `getDominantColorInfo` restituisce sempre `'blu'` per default (nessuno stato "non determinabile"); il radar in quel caso forza comunque un pentagono minimo pieno invece di uno stato vuoto.
5. `reportData.sintesi.datiRadar` e `reportData.correntiByPeso` sono entrambi calcolati ma non consumati dalla UI dei grafici, che ricalcola le stesse cose in locale.

Nessuno di questi è un bug bloccante oggi; sono tutti segnalati nel contratto con una raccomandazione conservativa, in attesa di una decisione condivisa con chi lavora su `src/components/report/`.

## Istruzioni per l'integrazione
- Antigravity può procedere al redesign usando `reportData.correnti[]` e `reportData.sottocorrenti[]` così come sono oggi — non è necessaria alcuna modifica al contratto dati per iniziare.
- Prima di ricollegare `sintesi.datiRadar` (oggi inutilizzato) a un nuovo componente radar, va concordata la scala da usare: oggi il radar reale è 1-7 assoluto-normalizzato, il campo è invece percentuale 0-100 — sono incompatibili così come sono.
- Per tooltip per-corrente, usare `galaxyTheoryContent.ts` (via `FAMIGLIE_LESSICO`) come sorgente, è già strutturato e già in uso altrove nel report.
- Nessun comportamento di calcolo/percentuali/famiglie/sottocategorie è stato alterato: il redesign può procedere sul solo layer UI senza rischio di regressione sui numeri.

## Comportamento atteso nel browser
Nessuno: zero modifiche a componenti, pagine o stile. Il report continua a funzionare esattamente come prima di questo intervento.
