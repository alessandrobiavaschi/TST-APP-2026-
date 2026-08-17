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

File modificati: `src/App.css`, `src/pages/ResultsPage.jsx`, `HANDOFF_CODEX.md`.

---
Verifiche desktop:

## Integrazione UX fullscreen a stanze

Integrato in modo selettivo il commit Antigravity `29588cb63b1fc81480cc26a28f7cf92c1e570ad6`, senza includere gli altri lavori concorrenti presenti sulla branch UI.

### Risultato

- `HeroScreen` è la home fullscreen con le CTA "Leggi il tuo report" e "Nuovo test".
- `SintesiCorrenti`, `ProfiloEmotivo` e `QuattroRapporti` sono distribuiti in stanze verticali tramite il contenitore presentazionale `ReportRoom`.
- Dettaglio e Musicians sono layer separati con hash dedicato, ritorno esplicito, chiusura con Escape e ripristino del focus.
- `ApprofondimentoSezioni` è renderizzato una sola volta, dentro Musicians insieme a `SezioneMusica`.
- `/nuovo-test` riusa il flusso esistente e salta soltanto l'intro quando riceve `location.state.startAtProfile`.
- Scoring, `buildReportData`, contenuti del report e condizioni di rendering non sono stati modificati.

### Robustezza e test Codex

- Aggiunto `test/reportRoomExperience.test.js`: contratti per CTA/routing, stanze, reduced motion, accessibilità/ritorno dei layer e unicità di Aree sonore.
- Corretto lo stato vuoto del report su mobile: il titolo non viene più coperto dall'header fisso.
- `npm test`: PASS, 53/53.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Browser locale: PASS a 1440x900 e 390x844, senza overflow orizzontale né warning/errori console; su mobile il titolo dello stato vuoto parte a 80px con header alto 52px.
- Il report popolato non era disponibile nella sessione browser non autenticata; la struttura popolata è coperta da build e contratti automatici, ma resta consigliato uno smoke finale con un record reale prima del merge in produzione.

### File di questa consegna

- `HANDOFF_CODEX.md`
- `src/pages/ReportPage.jsx`
- `src/styles/report-tst.css`
- `test/reportRoomExperience.test.js`

Il file `.firebase/hosting.ZGlzdA.cache`, rigenerato dalla build e già sporco all'avvio, resta escluso dal commit.

## Robustezza zoom e dettaglio Galassia lessicale

### Risultato

- Lo zoom del Lessico non scala più il canvas che contiene i testi: ogni parola viene proiettata in coordinate schermo e ridisegnata alla dimensione corretta, evitando la rasterizzazione/pixelatura.
- Distanza e dimensione delle parole crescono progressivamente con lo zoom; la distanza segue la scala lineare della camera, mentre il font usa una crescita smorzata per restare leggibile senza invadere la mappa.
- Un `ResizeObserver` riallinea la proiezione quando cambia il viewport.
- La parola selezionata non diventa più un badge gigante: resta su una riga, senza blocco, sfondo o a-capo forzato.
- Il dizionario è ora una scheda flottante responsive con titolo leggibile, corpo sans-serif, righe informative e accento limitato. I codici interni `correnteKey` e `familyKey` non sono più mostrati.
- Il dettaglio espone semantica di dialog non modale e porta il focus sul controllo di chiusura; `Escape` continua a chiuderlo.

### File modificati

- `src/components/report/LessicoAtlasView.jsx`
- `src/styles/galassia-view.css`
- `src/utils/lessicoAtlasCamera.js`
- `test/lessicoAtlasCamera.test.js`
- `HANDOFF_CODEX.md`

### Verifica

- `npm test`: PASS, 55/55 (inclusi i 2 nuovi test della camera lessicale).
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Browser desktop: PASS; dopo due step la parola campione cresce da 23 px a 31,7 px e la distanza tra punti cresce con la scala. Il pannello misura circa 397 px, resta interno al viewport e la parola selezionata mantiene `white-space: nowrap` senza sfondo.
- Browser mobile 390x844: PASS; dettaglio a bottom sheet a piena larghezza, titolo e metadati integri, nessun taglio visivo osservato.
- L'anteprima DEV con dati di esempio è stata rimossa dal codice finale.

### Assunzioni e integrazione

La modifica riguarda solo la presentazione e l'interazione di `LessicoAtlasView`; scoring, contenuti scientifici e contratti dati non sono stati modificati. Integrare il commit Codex dopo i contributi logica/UI oppure risolvere soltanto eventuali conflitti nel blocco `.lessico-*` del foglio `galassia-view.css`. Il file `.firebase/hosting.ZGlzdA.cache` resta escluso dal commit.

## Cieli di sfondo lenti e morbidi

### Risultato

- Collegati i sette nuovi MP4 alle combinazioni coerenti di mattino, pomeriggio, tramonto e crepuscolo.
- Velocità di riproduzione impostata a `0.5x` sia come valore predefinito sia come valore corrente. Rispetto al precedente `0.25x`, il movimento resta lento ma conserva una cadenza percepita più regolare sui sorgenti a 25/30 fps.
- Crossfade portato a 2,4 secondi nelle pagine interne e 1,6 secondi sulla landing, con curva `cubic-bezier(0.4, 0, 0.2, 1)`.
- Aggiunti contratti automatici che verificano presenza e uso di tutti i nuovi asset, velocità del player e parametri della dissolvenza.

### File modificati

- `src/components/SkyBackground.jsx`
- `src/skyVideosConfig.js`
- `test/skyBackgroundPlayback.test.js`
- sette nuovi MP4 in `public/Video Background/`
- `HANDOFF_CODEX.md`

### Verifica

- `node --test test/skyBackgroundPlayback.test.js`: PASS, 2/2.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Browser sulla build di produzione, route `/info`: PASS. Due layer pronti e in play a `0.5x`, canvas attivo a opacità 0,9, transizione di 2,4 secondi e console pulita.
- Il comando globale filtrato `npm test -- --test-name-pattern=...` ha eseguito comunque l'intera suite; è stato interrotto dopo 40 secondi per processi pendenti già presenti in tre file Galassia/report. I due test nuovi erano già passati e sono poi stati confermati isolatamente.

### Assunzioni e integrazione

I nuovi video sono stati assegnati in base al contenuto visivo dei frame: cumuliformi chiari nelle fasce diurne, toni dorati e rossi verso tramonto/crepuscolo, nube calda per `caldissimo`. Neve, notte e temporale mantengono gli asset esistenti. Gli MP4 non sono stati ricodificati: `ffmpeg` non è disponibile nell'ambiente, quindi gli originali aggiunti dall'utente sono conservati senza perdita di qualità.

La branch `ai/integration` è pronta per review. Prima di portarla su `master`, verificare che il worktree non includa la modifica locale estranea a `src/content/famigliaApprofondimento.js`, quindi usare un merge non distruttivo e rieseguire `npm test`, `npm run lint` e `npm run build` sull'albero risultante.

---

## Correzione crash apertura report — 2026-08-11

### Sintesi

Corretto il crash immediato di `/risultati/report`. La revisione UI già presente in `HeroScreen.jsx` aveva rimosso le utility colore, testo e texture ancora invocate durante il primo render. `darken` generava quindi un `ReferenceError`, intercettato dall'`AppErrorBoundary` come schermata generica "Si è verificato un errore".

### File modificati

- `src/components/report/HeroScreen.jsx`
- `HANDOFF_CODEX.md`

### Correzioni

- ripristinate le utility `parseHex`, `mixToward`, `lighten`, `darken`, `rgba` e `toTitleCase`, con le costanti colore necessarie;
- ripristinata la texture `NOISE_SVG` usata dall'hero;
- corretta la prop `onOpenGlossary`, che era stata aliasata ma veniva ancora chiamata con il nome originale;
- preservato il ridisegno dell'hero già presente nel worktree; scoring, Firestore e contenuti scientifici non sono stati modificati.

### Verifiche

- `npx eslint src/components/report/HeroScreen.jsx`: superato;
- render SSR reale del componente tramite Vite + React: superato, CTA hero presente;
- `npm run lint`: superato, 0 errori;
- `npm run build`: superato, 1229 moduli trasformati;
- browser locale su `/risultati/report` senza record: fallback corretto e nessun errore console;
- `npm test`: 67 test superati, 11 falliti per aspettative narrative già incoerenti con le modifiche concorrenti a `buildFourRelationsNarrative` e `buildNaturaNarrative`;
- `git diff --check`: segnala esclusivamente righe vuote finali preesistenti in `ReportShell.jsx` e `report-tst.css`.

### Integrazione e limiti

Il commit include soltanto `HeroScreen.jsx` e questo aggiornamento dell'handoff. Le numerose altre modifiche non committate già presenti nel worktree non sono state incluse. Non è stato eseguito alcun deploy, push o intervento su credenziali e risorse remote.

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

## Integrazione redesign report a stanze — 2026-08-17

### Sintesi

Il branch `ai/codex`, fermo ai contributi dell'11/08, incorpora ora il checkpoint
del redesign a stanze `489f8e3`. `ReportShell.jsx` orchestra le stanze inline e i
layer separati tramite `RoomRevealContent.jsx`; i componenti precedenti
`ReportSectionGroup.jsx` e `ReportRoom.jsx` sono stati eliminati e non è stato
reintrodotto `ReportDetailTabs.jsx`.

Le modifiche Codex precedenti sono state adattate al nuovo albero:

- i sette nuovi video cielo e le transizioni lente restano attivi;
- il player conserva il `playbackRate` configurabile per singolo cielo;
- lo zoom e il dettaglio della Galassia lessicale restano integrati;
- le CTA della hero puntano alla stanza overview e al nuovo test, saltando
  l'introduzione quando richiesto;
- i contratti mobile coprono safe area, bottom navigation e grafici responsive.
- gli ID delle stanze corrispondono alle voci di `ReportSectionController`, così
  scroll-spy, click e sblocco della navigazione restano operativi;
- i layer separati trasferiscono il focus all'apertura e lo restituiscono al
  trigger alla chiusura;
- l'armocromia riceve i dati cielo sulla radice del report e colora i nuovi
  selettori `.report-room-section`;
- la Galassia resta esclusa sotto 768 px, coerentemente con navbar e deep-link.

### File principali coinvolti

- `src/components/report/ReportShell.jsx`
- `src/components/report/RoomRevealContent.jsx`
- `src/components/report/HeroScreen.jsx`
- `src/components/report/NavbarTST.jsx`
- `src/components/report/ReportSectionGroup.jsx` (rimosso)
- `src/components/report/ReportRoom.jsx` (rimosso)
- `src/components/SkyBackground.jsx`
- `src/skyVideosConfig.js`
- `src/components/report/LessicoAtlasView.jsx`
- `src/utils/lessicoAtlasCamera.js`
- `src/styles/report-tst.css`
- `test/reportRoomExperience.test.js`
- `test/skyBackgroundPlayback.test.js`
- `test/lessicoAtlasCamera.test.js`
- `test/mobileReportContracts.test.js`

Il merge porta inoltre i file del checkpoint `489f8e3`; il presente handoff non
li elenca singolarmente perché appartengono al redesign integrato.

### Decisioni e assunzioni

- Il commit `489f8e3`, registrato il 17/08, è il checkpoint Git che contiene il
  redesign indicato come lavoro del 12/08.
- Nei conflitti del report ha precedenza la struttura a stanze; le funzioni
  Codex sono state riapplicate solo dove compatibili con quel contratto.
- `.firebase/hosting.ZGlzdA.cache` è una modifica locale preesistente: è stata
  preservata ed esclusa dal commit.
- Nessun deploy, modifica credenziali o operazione su risorse remote.

### Verifiche

- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1232 moduli trasformati.
- Test mirati report/sky/Galassia/mobile: 12 superati, 0 falliti.
- Suite completa: 93 superati, 11 falliti. Gli 11 fallimenti provengono dai
  nuovi test narrativi di `489f8e3` (`buildFourRelationsNarrative`,
  `buildNaturaNarrative`, `reportGraphDataContract`) e descrivono divergenze di
  copy/contratto già presenti nel checkpoint; non riguardano la migrazione a
  stanze, il cielo o la Galassia e non sono stati risolti estendendo lo scope.

### Comportamento atteso

Il report apre la hero, prosegue nelle stanze 01–06 (più la stanza opzionale
delle famiglie), applica la rivelazione progressiva con fallback reduced-motion
e mantiene Aree sonore, Famiglie, Galassia e Musicians come layer separati e
reversibili. Nessun import runtime punta ai componenti report rimossi.

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

---

---

## Pad Portato sulla navigazione a stanze — 2026-08-17

### Sintesi

Il lavoro del pad triangolare Sintonia / Distonia / Distanza è stato integrato
sopra il checkpoint del report a stanze (`489f8e3`). `ReportShell` monta ora il
pad nella stanza 04 tramite `RoomRevealContent`; `ReportSectionGroup.jsx` resta
eliminato e `ReportDetailTabs.jsx` non è stato reintrodotto.

La presentazione interattiva del redesign (vertici apribili, popover e ripple)
usa la logica testata di `portatoPadViewData.js`: quote su scala 0–1 o 0–100,
arrotondamento con somma 100, parità/quasi parità, punto baricentrico e stato
vuoto. L'anchor `report-tst-portato` appartiene soltanto al wrapper della stanza,
evitando l'ID duplicato che rendeva ambiguo lo scroll.

### File centrali dell'integrazione

- `src/components/report/ReportShell.jsx`
- `src/components/report/RoomRevealContent.jsx`
- `src/components/report/SezionePortatoEsperienziale.jsx`
- `src/components/report/ReportSectionGroup.jsx` (eliminato)
- `src/styles/report-tst.css`
- `src/utils/buildReportData.js`
- `src/utils/portatoPadViewData.js`
- `test/portatoPadUiContract.test.js`
- `test/reportGraphDataContract.test.js`

Il merge include inoltre i file del checkpoint a stanze necessari a mantenere
coerente la nuova esperienza report; non sono stati eseguiti deploy, modifiche a
credenziali o operazioni su dati remoti.

### Verifiche

- `node --test test/portatoPadUiContract.test.js test/reportGraphDataContract.test.js`:
  25 test superati; 3 failure già interne al checkpoint sulle narrative dei
  Quattro Rapporti, non collegate al Portato. Tutti i 12 test Portato passano.
- `npm run lint`: superato, 0 errori.
- `npm run build`: superato, 1232 moduli trasformati.
- `git diff --check`: superato.
- controllo statico: una sola occorrenza di `id="report-tst-portato"`; nessun
  import/uso runtime di `ReportDetailTabs` o `ReportSectionGroup`.
- smoke browser locale: accesso sviluppo e flusso test avviati correttamente;
  l'automazione delle 72 tracce è scaduta prima della stanza 04, quindi non è
  disponibile una validazione visuale completa desktop/mobile del pad.

### Comportamento atteso

Nel report principale la stanza 04 mostra il testo interpretativo e il triangolo
Sintonia / Distonia / Distanza. Il puck usa le quote non arrotondate; i vertici
mostrano percentuale e dettaglio tramite pulsante accessibile. In assenza di
punteggi PE compare soltanto lo stato vuoto, senza triangolo o punto artificiale.
