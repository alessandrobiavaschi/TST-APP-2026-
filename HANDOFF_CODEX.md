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
| Giallo | Entusiasta | Gioioso-Sanguinico |
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
- Su indicazione editoriale successiva, la natura canonica della famiglia `Entusiasta` è `Gioioso-Sanguinico`; `Solare` resta esclusivamente una caratteristica/corrente specifica nei contesti in cui è nominata come tale.
- L'eccezione alle ownership di `AI_TASK.md` è limitata ai contenuti tassonomici richiesti esplicitamente dall'utente; scoring e logica scientifica non sono stati riscritti.
- Le modifiche locali preesistenti su Quattro Rapporti, relativi CSS/copy e il vocabolo `Svampito` sono state preservate nel worktree ma escluse dal commit tassonomico. L'adattamento dei nomi famiglia dentro Quattro Rapporti resta accorpato a quel lavoro concorrente.

### Verifiche

```text
npm test       # 39 passati, 0 falliti
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

## Tooltip sugli spigoli dei Quattro Rapporti — 2026-08-03

### Sintesi

I cinque vertici dei radar dei Quattro Rapporti mostrano ora un tooltip immediato al passaggio del mouse con famiglia, valore in scala 1–7, punti grezzi e percentuale della lente. Click, Invio e barra spaziatrice continuano a selezionare la famiglia e ad aggiornare il dettaglio esteso.

### File modificati

- `src/components/report/QuattroRapporti.jsx`
- `src/styles/quattro-rapporti.css`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- Riutilizzato il sistema `Tooltip` di Recharts, mantenendo le hit-area accessibili già presenti sui vertici.
- Il tooltip non intercetta il puntatore e non altera click o navigazione da tastiera.
- Aggiunta sotto il radar un'istruzione breve per rendere evidente l'interazione.
- Punteggi, scala, graduatoria e calcolo scientifico restano invariati.

### Verifiche

- `npm test`: 51 test superati, 0 falliti.
- `npm run lint -- --quiet`: superato, 0 errori.
- `npm run build`: superato, 1227 moduli trasformati.
- `git diff --check`: superato.

---

## Avanzamento con "Nessuna" nei primi ascolti — 2026-08-05

### Sintesi

La risposta `Nessuna delle 4` nei file 1–4 registra il delta di indifferenza e
porta allo step successivo usando il numero del file appena risposto. Lo stato
di navigazione viene aggiornato soltanto se l'utente si trova ancora su quello
stesso file, evitando che aggiornamenti concorrenti rendano inerte il click.

### File modificati

- `src/pages/NewTestPage.jsx`
- `src/utils/testAnswerNavigation.js`
- `test/testAnswerNavigation.test.js`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- Lo scoring esistente resta invariato: `nessuna` vale `GRIGIO_1 +1` e
  `PE_Indifferenza +1` nei primi quattro ascolti.
- Non sono stati modificati layout, testi, Firebase, credenziali o lockfile.
- Le modifiche locali concorrenti nell'area report sono state preservate ed
  escluse dal commit.

### Verifiche

- test dedicato: 3 superati, 0 falliti, incluso il contratto di wiring del
  bottone verso l'avanzamento atomico;
- QA browser locale: dal Passo 1 il click su `Nessuna delle 4` porta al Passo 2,
  senza errori o warning console;
- `npm run lint`: superato;
- `npm run build`: superato, 1228 moduli trasformati;
- `npm test`: 76 superati e 1 fallito per una modifica concorrente non inclusa
  in `src/components/report/HeroScreen.jsx` (aspettativa terminologica del
  report);
- `git diff --check`: superato per i file della correzione.

### Integrazione

Integrare il commit dedicato senza includere le modifiche report già presenti
nel worktree. Dopo l'integrazione con quel lavoro concorrente, rieseguire la
suite completa per verificare anche il test terminologico del report.
- Browser locale: lo stato vuoto della route report è corretto; l'hover popolato non è riproducibile senza il record di sessione mostrato nello screenshot.

### Integrazione

Integrare il commit dedicato senza includere le altre modifiche non committate già presenti nel worktree.

---

## Contenimento etichette nei grafici — 2026-08-03

### Sintesi

Le etichette laterali del radar e del grafico a petali restano ora contenute nei rispettivi canvas. La correzione evita il taglio iniziale di parole lunghe come `Anaffettività` e `Volitività`/`Marziale` senza modificare punteggi o scale.

### File modificati

- `src/components/report/ReportRadarChart.jsx`
- `src/components/report/EmotionalShape.jsx`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- Nel radar, le etichette laterali vengono ancorate verso l'interno dell'SVG.
- Nel grafico a petali, il clamp considera anche una stima conservativa della larghezza della parola e il padding del viewBox.
- Dati, normalizzazione 1–7, petali, poligono e interazioni restano invariati.
- Le modifiche concorrenti già presenti nel worktree sono state preservate ed escluse dal commit.

### Verifiche

- `npm test`: 51 test superati, 0 falliti.
- `npm run lint -- --quiet`: superato, 0 errori.
- `npm run build`: superato, 1227 moduli trasformati.
- `git diff --check`: superato.
- Browser locale: la route report senza record mostra correttamente lo stato vuoto; il profilo mostrato nello screenshot non è riproducibile senza dati di sessione.

### Aggiornamento indicatore delle ellissi

- Il badge selezionato è stato ridotto e reso neutro: punto colore, nome famiglia, separatore e valore compatto `7/7`.
- Rimossa la ripetizione `(Scala 1-7)`, già spiegata dalla didascalia del grafico.
- I valori decimali restano disponibili quando significativi, per esempio `6.4/7`; gli interi non mostrano più `.0`.
- L'etichetta accessibile di ogni petalo usa ora il punteggio della relativa ellisse anziché il valore della selezione attiva.
- Verifiche successive: 51 test superati, lint e build completati senza errori.

### Integrazione

Integrare il commit dedicato senza includere le altre modifiche non committate già presenti nel worktree.

---

## Sottocategoria Nostalgico — 2026-08-03

### Sintesi

La tassonomia visibile della famiglia Malinconica presenta ora `Nostalgico (Solare o Lunare)` come sottocategoria. Le chiavi scientifiche BLU, i punteggi e i valori storici persistiti restano invariati.

### Compatibilità

- `Nostalgia`, `Nostalgica` e `Nostalgico` vengono normalizzati nella nuova etichetta soltanto in visualizzazione.
- `BLU_3_Nostalgia` non è stato rinominato.
- Malinconia lunare e Malinconia solare restano correnti analitiche distinte; non vengono confuse con la sottocategoria Nostalgico.

### Superfici aggiornate

- report e PDF;
- sintesi delle correnti;
- Galassia e corpus teorico;
- archivio risultati desktop e mobile;
- glossario e approfondimento della famiglia;
- test di regressione tassonomico.

### Integrazione

Integrare il commit dedicato senza includere le altre modifiche concorrenti già presenti nel worktree.

---

## Rimozione etichetta duplicata nei Quattro Rapporti — 2026-08-03

### Sintesi

Rimossa la dicitura della famiglia, per esempio `Flemmatica`, dal pannello di dettaglio sotto il radar dei Quattro Rapporti. L'etichetta sull'asse del grafico resta visibile e continua a identificare la famiglia.

### File modificati

- `src/components/report/QuattroRapporti.jsx`
- `src/styles/quattro-rapporti.css`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- La richiesta è stata interpretata come rimozione del titolo duplicato nel box sotto il radar, non dell'etichetta necessaria sull'asse.
- Punteggi, selezione, dettaglio numerico, grafico e logica scientifica non sono stati modificati.
- Le altre modifiche già presenti nel worktree sono state preservate ed escluse dal commit.

### Verifiche

- `npm test`: 42 test superati, 0 falliti.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1225 moduli trasformati.
- `git diff --check`: superato per i file della modifica.

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

## Titolo sezione 1.3 senza famiglia — 2026-08-03

### Sintesi

Il titolo della sezione 1.3 mostra ora soltanto "La tua natura emotiva di appartenenza", senza aggiungere tra parentesi il nome della famiglia. Il contenuto descrittivo e la tassonomia del report restano invariati.

### File modificati

- `src/components/report/ProfiloEmotivo.jsx`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- La richiesta riguarda esclusivamente il titolo visibile della sezione 1.3 mostrato nello screenshot.
- Le occorrenze di "famiglia Marziale" nel testo descrittivo e nelle altre sezioni non sono state rimosse.

### Verifica e integrazione

- `npm test`: superato, 69 test su 69.
- `npm run lint`: superato.
- `npm run build`: superato.
- Comportamento atteso: l'intestazione 1.3 è "La tua natura emotiva di appartenenza" per ogni profilo, senza suffisso della famiglia.
- Problemi irrisolti: nessuno relativo a questa correzione.

---

## Influenze nella Natura di Base — 2026-08-03

### Sintesi

La Natura di Base distingue ora una sola famiglia prevalente, cioè quella con
il punteggio più alto, dalle famiglie successive che influenzano il risultato.
La scala dell'influenza è inversa rispetto alla distanza dalla prevalente:
0–10 punti `netta`, fino a 20 `marcata`, fino a 30 `lieve`, oltre 30
`residuale`.

Il riepilogo visibile segue la graduatoria e racconta seconda e terza famiglia,
ciascuna con percentuale, distanza, intensità dell'influenza e rapporto teorico
con la natura di base. Le famiglie successive conservano lo stesso dettaglio
nel contratto narrativo e una tensione non può più sostituire impropriamente la
vera seconda o terza componente.

### Caso CSV verificato

- Marziale: 19 punti, 33,9%, famiglia prevalente;
- Malinconica: 15 punti, 26,8%, distanza 7,1, influenza netta,
  compensazione;
- Entusiasta: 12 punti, 21,4%, distanza 12,5, influenza marcata, affinità;
- Flemmatica: 7 punti, 12,5%, distanza 21,4, influenza lieve, tensione;
- Razionale: 3 punti, 5,4%, distanza 28,5, influenza lieve, tensione.

### File modificati

- `src/utils/buildNaturaNarrative.js`
- `src/utils/buildReportData.js`
- `test/buildNaturaNarrative.test.js`
- `test/reportGraphDataContract.test.js`
- `HANDOFF_CODEX.md`

### Decisioni e assunzioni

- Il valore oltre 30 punti non era specificato nella richiesta ed è stato
  chiamato `residuale` per completare la scala senza attribuire una prevalenza
  alle famiglie secondarie.
- La matrice di affinità, modulazione, compensazione, attenuazione e tensione è
  invariata; cambia soltanto il modo in cui viene applicata alla graduatoria e
  raccontata alla persona.
- Scoring, risposte, aggregazioni della lente, normalizzazione 1–7, grafici e
  Firestore non sono stati modificati.
- Le modifiche locali preesistenti nel worktree sono state preservate ed
  escluse dal commit.

### Verifiche

- test mirati Natura e contratto grafico: 29 superati, 0 falliti;
- `npm test`: 75 superati, 0 falliti;
- `npm run lint`: superato, 0 errori;
- `npm run build`: superato, 1227 moduli trasformati;
- `git diff --check`: superato.
