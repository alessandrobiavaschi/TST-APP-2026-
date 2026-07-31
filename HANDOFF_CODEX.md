# HANDOFF CODEX — Galassia Lessicale 2.0

## Aggiornamento workflow

Su richiesta dell'utente, il progetto non dipende più da Claude Code, Antigravity o crediti Google per proseguire. `AGENTS.md` e `AI_TASK.md` assegnano ora a Codex la responsabilità end-to-end di logica, contenuti, UI, test e integrazione, mantenendo branch isolato, protezione delle credenziali, verifiche e commit.

Il deploy è consentito soltanto dopo una richiesta esplicita dell'utente e la verifica preventiva del target e della build. Restano vietate modifiche alle credenziali e cancellazioni di risorse remote.

## Sintesi

Codex ha aggiunto test contrattuali per i dati quantitativi e lessicali consumati dalla Galassia, senza modificare componenti React, stili, contenuti o logica scientifica.

La verifica indipendente di `repo_scout` e `change_reviewer` ha inoltre identificato condizioni d'integrazione che devono essere risolte sulle branch proprietarie prima del merge finale. In particolare, il lessico situazionale deve essere identificato almeno dalla coppia famiglia/parola (non dalla sola parola) e lo stato vuoto non deve mai essere sostituito con dati dimostrativi.

## File modificati

- `test/galassiaDataContract.test.js`
  - conserva sempre le 5 famiglie e le 11 sottocorrenti, incluse quelle a zero;
  - verifica mapping famiglia/sottocorrente e massimi teorici;
  - confronta record numerici e record storici con valori numerici serializzati;
  - protegge pareggi, fallback dei pannelli, relazioni e determinismo;
  - verifica tutti gli elementi di `DIZIONARIO_2`, mantenendo corrente e famiglia scientifica;
  - verifica aggregazione delle ripetizioni e comportamento sicuro di campi vuoti o label legacy sconosciute;
  - verifica che output derivati da record validi, parziali e numeri fuori range restino serializzabili e finiti.
- `HANDOFF_CODEX.md`
  - documenta verifiche, rischi e istruzioni d'integrazione.

## Confini rispettati

- Branch: `ai/codex`.
- Nessuna modifica alla UI o al calcolo TST.
- Nessun lockfile o file di configurazione modificato.
- Nessun deploy eseguito durante il precedente intervento sui test.
- Runner esistente `node:test` e caricamento dei moduli reali tramite Vite SSR; nessuna duplicazione delle formule scientifiche nei test.

## Verifiche eseguite

```text
npm test
npm run lint
npm run build
git diff --check
```

Esito finale:

- test: 21 passati, 0 falliti;
- lint: passato;
- build di produzione: passata;
- typecheck: non disponibile, perché `package.json` non contiene uno script dedicato.

## Findings bloccanti per l'integrazione

1. **Identità delle parole emerse.** `LessicoAtlasView` evidenzia attualmente tramite la sola parola normalizzata. Lemmi presenti in famiglie diverse possono quindi essere marcati nella famiglia sbagliata. L'identità minima deve includere `familyKey` e parola normalizzata; quando disponibile deve includere anche `correnteKey`.
2. **Stato vuoto reale.** `GalassiaView` può sostituire un array vuoto con `EXAMPLE_CORRENT_DATA`. I valori demo non devono apparire in un report reale privo di dati; l'eventuale modalità demo deve essere esplicita.
3. **Contratto end-to-end.** Il view model introdotto su `ai/claude` non è ancora collegato nella baseline: `ReportShell` non lo inoltra e la modalità parole passa a `LessicoAtlasView` soltanto `paroleEmerse`. Il merge deve garantire che tutte le viste leggano lo stesso contratto, senza pipeline statiche parallele.
4. **Costellazioni semantiche.** Le relazioni secondarie dichiarate da `semanticConcepts.ts` non devono essere perse: `regolazione-interna` collega Verde e Grigio, mentre `slancio-vitale` collega Giallo e Rosso. Famiglia primaria e famiglie collegate devono restare concetti distinti.
5. **Profilo senza dati.** Con tutte le correnti a zero non devono essere fabbricate polarità dominanti o firme personali. Il contratto dovrebbe esporre esplicitamente `hasData: false` e valori dominanti vuoti.
6. **Tracciabilità incompleta.** Una label legacy sconosciuta viene oggi ignorata senza errore. In un record misto valido/legacy, il nuovo contratto deve riportare i `fileKey` non riconosciuti, senza dichiarare il profilo completo e senza mostrare codici interni direttamente all'utente.
7. **Omonimi e associazioni multiple.** Un lemma può appartenere a più correnti, nella stessa famiglia o in famiglie diverse. Il nodo visuale può essere deduplicato, ma deve conservare un array di associazioni univoche per famiglia e corrente.
8. **Immutabilità.** Gli array del lessico stabile restituiti dal view model non devono essere riferimenti mutabili alle fonti globali; una modifica lato UI non deve alterare le costruzioni successive.
9. **Accessibilità.** I risultati filtrati non visibili non devono restare nel percorso Tab; i filtri devono esporre lo stato (`aria-pressed`); il pannello deve gestire apertura, Escape e ripristino del focus sia desktop sia mobile.
10. **Normalizzazione unica.** Ricerca, deduplica ed evidenziazione devono usare lo stesso normalizzatore per maiuscole, accenti, Unicode composto/decomposto, apostrofi, trattini e spazi.
11. **Input numerici non finiti.** La pipeline converte correttamente stringhe numeriche e limita i valori finiti fuori range nei satelliti, ma `Infinity` può ancora propagarsi nelle percentuali di famiglia. La branch proprietaria della logica deve definire e applicare una policy esplicita prima dell'integrazione.
12. **Limite del test sui massimi.** Il test verifica l'adattamento rispetto alle costanti scientifiche di produzione; non usa una seconda copia dei massimi come oracolo. Il caso storico `GRIGIO_2_Intellettuale_Saggio > 0`, il cui massimo configurato è zero, richiede una semantica UI esplicita di dato non misurabile anziché un ambiguo `0%`.

## Istruzioni d'integrazione

1. Integrare prima il contratto dati di Claude e la UI di Antigravity nella branch di integrazione.
2. Risolvere i finding sopra nelle rispettive aree di ownership; non aggirarli modificando il calcolo scientifico.
3. Integrare il commit Codex e rieseguire `npm test`, `npm run lint` e `npm run build` sull'albero combinato.
4. Aggiungere test diretti del view model combinato per:
   - stato tutto-zero senza dominante o firma;
   - stessa parola in due famiglie, con evidenziazione della sola associazione corretta;
   - record misto con risposta valida e label storica sconosciuta;
   - relazioni semantiche Verde/Grigio e Giallo/Rosso;
   - mutazione di un output che non altera input né invocazioni successive;
   - serializzazione senza `undefined`, `NaN`, riferimenti ciclici o chiavi famiglia sconosciute.
5. Eseguire QA reale nel browser con un record approvato a desktop, tablet e mobile: resize, scroll, tastiera, focus, Escape, filtri, tooltip, contrasto, overflow, console e `prefers-reduced-motion`.

## Comportamento atteso

- Le 5 famiglie restano presenti anche a zero e nessun dato demo viene confuso con un risultato.
- Dopo l'integrazione, ogni parola situazionale deve mantenere famiglia, corrente e provenienza corretti; la baseline Codex protegge famiglia/corrente, mentre `fileKeys`, `fonte` e diagnostica legacy richiedono il view model Claude integrato.
- Lessico stabile e lessico emerso sono distinguibili, ma condividono normalizzazione e identità coerenti.
- Campo di forze, costellazioni, contrasti, firma e tracciabilità leggono un unico view model deterministico.
- Record vuoti, parziali e storici non producono errori, false attribuzioni o indicatori personali inventati.
- Filtri e pannelli sono pienamente utilizzabili da tastiera e non generano overflow su viewport ridotte.
