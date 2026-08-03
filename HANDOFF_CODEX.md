# HANDOFF CODEX — Integrazione Galassia Lessicale 2.0

## Sintesi

La consegna Claude + Antigravity è integrata su `ai/integration` senza modificare `master`. La branch contiene il view model deterministico, le sei sezioni UI, i test contrattuali Codex e un fix di compatibilità finale tra chiavi del view model e identificatori dell'atlante.

Il calcolo scientifico del TST non è stato modificato.

## Storia integrata

- baseline: `master` a `a857bed`;
- Claude: incluso dalla merge ancestry di `ai/antigravity` (`faabfe2`, `bbf4d91`);
- Antigravity: `95c59f2`, integrato con merge commit `f60f528`;
- Codex test contrattuali: `c151dd4`, applicato come `c85b81b`;
- fix finali e questo handoff: commit successivo su `ai/integration`.

I commit successivi presenti su `ai/codex` relativi a deploy, cache e modifica delle istruzioni non sono stati integrati perché estranei a questa missione.

## File della funzionalità integrata

- `src/utils/galassiaLessicoViewModel.js`
- `src/utils/buildReportData.js`
- `src/components/report/GalassiaView.jsx`
- `src/components/report/LessicoAtlasView.jsx`
- `src/components/report/ReportShell.jsx`
- `src/components/report/ParoleStatiAnimo.jsx`
- `src/components/report/SintesiCorrenti.jsx`
- `src/components/report/SintesiCorrenti.css`
- `src/styles/galassia-view.css`
- `src/content/relational/anaffettivo.js`
- `src/content/relational/assertivo.js`
- `test/galassiaLessicoViewModel.test.js`
- `test/galassiaDataContract.test.js`
- `HANDOFF_CLAUDE.md`
- `HANDOFF_ANTIGRAVITY.md`
- `HANDOFF_CODEX.md`

## Correzioni Codex d'integrazione

- introdotta una mappa esplicita tra le chiavi scientifiche `blu/rosso/verde/giallo/grigio`, i nomi `Blu/Rosso/Verde/Giallo/Grigio` e gli ID visuali dell'atlante;
- ripristinati click, selezione, colore e zoom delle pillole situazionali;
- ripristinato il vocabolario stabile per tutte e cinque le famiglie;
- resa non ambigua la tracciabilità tramite `parola + familyKey + correnteKey`;
- resa non ambigua anche l'evidenziazione dei nodi emersi e la selezione delle parole vicine;
- mostrate soltanto le costellazioni con correnti utente attive;
- rimossi dal percorso Tab i nodi esclusi dai filtri;
- applicato il focus visibile dashed blu a pulsanti, input e summary dell'atlante.

## Verifiche eseguite

```text
npm test
npm run lint
npm run build
git diff --check
```

Esito:

- test: 33 passati, 0 falliti;
- lint: 0 errori;
- build: Vite completata con 1224 moduli trasformati;
- diff check: pulito;
- typecheck: non disponibile, perché `package.json` non espone uno script dedicato.

## QA browser reale

La route `/risultati/report` senza record mostra correttamente lo stato "Report non disponibile". Per raggiungere la Galassia popolata senza usare dati Firebase o credenziali è stato montato un harness locale temporaneo con lo stesso componente e un view model realistico; l'harness è stato rimosso prima del commit.

Verifiche desktop:

- le sei sezioni sono renderizzate;
- le cinque famiglie del lessico stabile sono presenti;
- le costellazioni senza correnti attive non vengono mostrate;
- la pillola `Sereno` seleziona il nodo corretto e centra la camera a `scale(2.2)`;
- il dizionario riporta `BLU_4_Solare`, famiglia `blu`, `Traccia 32` e `Traccia 35`;
- il focus su `summary` risulta `2px dashed rgb(59, 130, 246)`.

Verifiche mobile a 390 × 844:

- la dashboard è la prima scheda espandibile;
- il pannello dizionario è un bottom sheet `position: fixed`;
- la tracciabilità resta visibile;
- nessun overflow orizzontale nella scheda o nel viewport.

## Decisioni e assunzioni

- `ai/integration` è il target finale; `master` resta invariato.
- I mapping tra contratto e atlante sono adattamento UI, non ricalcolo dei dati.
- Il file locale modificato `src/content/famigliaApprofondimento.js` è lavoro concorrente dell'utente: non è stato modificato, staged o incluso nei commit.
- Nessun deploy, push, modifica di credenziali, lockfile o risorsa remota.

## Limiti residui

- Non è stato usato un record Firebase autenticato reale; la verifica popolata è stata eseguita sul componente reale con fixture deterministica locale.
- Il progetto non dispone di un framework di test componenti, quindi le interazioni UI sono protette dalla QA browser e i contratti dati da `node:test`.
- I limiti teorici già dichiarati dal view model restano intenzionalmente visibili: grafo concetto-concetto assente, Rosso/Grigio senza concetto primario e parole dei contrasti non garantite come antonimi diretti.
- Alcuni stili specialistici dell'atlante introdotti dalla branch UI usano ancora valori locali invece della scala globale descritta in `CLAUDE.md`; non sono stati rifattorizzati durante il fix di compatibilità per evitare un ridisegno non richiesto.

## Istruzioni d'integrazione

La branch `ai/integration` è pronta per review. Prima di portarla su `master`, verificare che il worktree non includa la modifica locale estranea a `src/content/famigliaApprofondimento.js`, quindi usare un merge non distruttivo e rieseguire `npm test`, `npm run lint` e `npm run build` sull'albero risultante.

---

## Aggiornamento 2026-08-03 — Tassonomia famiglia/natura

### Sintesi

Il vocabolario esposto dal test e dai report distingue ora esplicitamente la famiglia emotiva dalla sua caratteristica emotiva (natura). La tassonomia canonica adottata è:

| Chiave interna | Famiglia | Caratteristica emotiva (natura) |
|---|---|---|
| Blu | Malinconica | Lunare |
| Rosso | Marziale | Volitivo-collerica |
| Verde | Flemmatica | Contemplativa |
| Giallo | Entusiasta | Solare |
| Grigio | Razionale | Intellettuale-Razionale |

Le chiavi colore, le 11 correnti, il calcolo dei punteggi e i valori storici Firestore (`Malinconia`, `Volitività`, `Calma`, `Entusiasmo`, `Anaffettività`) non sono stati modificati. Nell'archivio i valori storici vengono soltanto tradotti nelle etichette di famiglia al momento della visualizzazione.

### Superfici aggiornate

- tema e contratto dati del report;
- hero, navbar, sintesi, quattro rapporti, legende e diagrammi;
- Galassia e Atlante lessicale;
- dizionario degli stati d'animo e contenuti musicali;
- archivio risultati desktop/mobile;
- glossario, testi narrativi e fallback;
- alias del corpus relazionale;
- test contrattuale per tutte e cinque le coppie famiglia/natura.

### Decisioni e assunzioni

- L'elenco ricevuto dichiarava cinque famiglie ma conteneva anche `Intellettuale-Razionale`; per coerenza con le cinque chiavi scientifiche, `Razionale` è stata trattata come quinta famiglia e `Intellettuale-Razionale` come sua natura.
- L'eccezione alle ownership di `AI_TASK.md` è limitata ai contenuti tassonomici richiesti esplicitamente dall'utente; scoring e logica scientifica non sono stati riscritti.
- Le modifiche locali preesistenti su Quattro Rapporti, relativi CSS/copy e il vocabolo `Svampito` sono state preservate nel worktree ma escluse da questo commit.

### Verifiche

```text
npm test       # 35 passati, 0 falliti
npm run lint   # 0 errori
npm run build  # Vite: 1225 moduli trasformati
git diff --check
```

Nessun deploy, push, modifica a credenziali, lockfile o risorsa remota.

---

## Aggiornamento terminologia famiglie — 2026-08-03

### Sintesi

Nel grafico "Ordine delle famiglie per presenza" le etichette visibili adottano la nomenclatura richiesta: `Malinconia`, `Marzialità`, `Entusiasmo`, `Flemmaticità` e `Intellettualità-Razionalità`. Su mobile le etichette lunghe possono andare a capo invece di essere troncate.

### File modificati

- `src/components/report/SintesiCorrenti.jsx`
- `src/components/report/SintesiCorrenti.css`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- Punteggi, ordinamento, colori, sottotipi e logica scientifica sono invariati.
- Il commit include soltanto le etichette richieste e il relativo adattamento mobile; le modifiche concorrenti già presenti nel worktree restano escluse.

### Verifiche

- `npm run build`: superato, 1224 moduli trasformati.
- `npm test`: 25 test superati e 8 falliti per l'errore concorrente preesistente `famiglia is not defined` in `src/utils/buildReportData.js`.
- `npm run lint`: fallito per 21 errori concorrenti preesistenti in `src/content/reportRestitution.js`.

### Integrazione

Integrare il commit di questo aggiornamento senza includere le altre modifiche non committate presenti nel worktree. Dopo la risoluzione degli errori concorrenti indicati sopra, rieseguire test e lint.

---

## Titolo natura con caratteristica — 2026-08-03

### Sintesi

Il titolo della sezione "La tua natura emotiva di appartenenza" mostra ora tra parentesi la caratteristica emotiva del profilo, per esempio `Volitivo-Collerica`. Se il dato non è disponibile, il titolo resta invariato e non mostra parentesi vuote.

### File modificati

- `src/components/report/ProfiloEmotivo.jsx`
- `src/utils/reportTitleUtils.js`
- `test/reportTitleUtils.test.js`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- La dicitura proviene da `profilo.disposizione`, già costruita dal contratto dati del report.
- La normalizzazione è solo presentazionale: il valore scientifico e lo scoring non cambiano.
- Il formatter rimuove l'eventuale prefisso duplicato `NATURA`, applica una grafia leggibile e gestisce valori assenti.
- Layout, navigazione, contenuti dei capitoli e modifiche concorrenti nel worktree non sono stati alterati.

### Verifiche

- `npm test`: 37 test superati, 0 falliti.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1225 moduli trasformati.
- Test dedicati: titolo con disposizione e fallback senza parentesi vuote.

### Comportamento atteso

- Desktop e mobile: il titolo usa gli stili e il wrapping già gestiti da `ReportPassageHeader`.
- Profilo Rosso: `La tua natura emotiva di appartenenza (Volitivo-Collerica)`.
- Dato mancante: `La tua natura emotiva di appartenenza`.

### Integrazione

Integrare il commit dedicato senza includere le altre modifiche non committate già presenti nel worktree.

---

## Copy del piacere Marziale — 2026-08-03

### Sintesi

La descrizione introduttiva della famiglia Marziale usa ora la formulazione richiesta: "Nella famiglia Marziale emerge il piacere Volitivo Collerico del fare...".

### File modificati

- `src/content_report.json`
- `src/reportProfiloPdf.js`
- `src/utils/profiloDisplayCopy.js`
- `test/reportMarzialeCopy.test.js`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- È stata aggiornata soltanto la frase introduttiva direttamente collegata alla richiesta.
- Il seguito su realizzazione, governo di sé, assertività e orientamento al presente è rimasto invariato.
- Report principale, contenuto base, fallback e PDF condividono la stessa apertura.
- Scoring, tassonomia dati, layout e altri testi sul piacere del fare non sono stati modificati.

### Verifiche

- `npm test`: 38 test superati, 0 falliti.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1225 moduli trasformati.
- Test dedicato: parità della formulazione tra report, fallback e PDF.

### Integrazione

Integrare il commit dedicato senza includere le altre modifiche non committate già presenti nel worktree.
