# Handoff Codex — Narrazione dei Quattro Rapporti

## Sintesi

Le quattro lenti del report espongono ora una lettura data-driven in paragrafi.
Ogni esito dichiara le percentuali della propria lente, la relazione qualitativa
tra le famiglie coinvolte e la regola editoriale che determina l'etichetta.
Lo scoring scientifico e la scala radar 1–7 non sono stati modificati.

## Formule applicate

### Natura di Base

- prevalenza: distanza percentuale tra prima e seconda famiglia;
- tensione: soltanto per coppie classificate come tali nella matrice;
- intensità: quota della componente in tensione, soglie 10/20/30/40;
- armonia editoriale: distanza tra le due componenti principali;
- pari punti e pari livello grafico restano distinti;
- nei pari livello arrotondati, il primato segue i punti grezzi;
- nei veri pari merito, le sfumature di tutte le famiglie co-dominanti vengono raccontate;
- un profilo concentrato al 100% non dichiara componenti secondarie inesistenti;
- famiglia, natura e sottocorrenti sono presentate su livelli separati.

### Rapporto con te stesso

- la famiglia di base è sempre quella risultante dalla formula classica della
  Natura, anche quando differisce dalla prevalenza globale delle 72 risposte;
- osservazione interiore: quota Malinconica in Intervalli + Melodia;
- armonia con la natura: quota della famiglia dominante nella stessa lente;
- le due misure sono raccontate separatamente e non vengono mediate;
- se la famiglia dominante è Malinconica, il testo dichiara che le due letture
  derivano dallo stesso dato.

### Rapporto con l'Altro

- il confronto usa la famiglia risultante dalla Natura classica;
- fattore di apertura: quota Entusiasta in Timbro + Melodia;
- confronto: deficit `max(famiglia dominante - Entusiasta, 0)`;
- quando l'Entusiasmo supera la famiglia dominante, il testo racconta il vantaggio
  reale anziché definirlo una distanza a sfavore;
- meno di 10 punti: ottima integrazione; fino a 20 buona; fino a 30 discreta;
  oltre 30 parziale;
- Entusiasmo sotto il 10% limita comunque l'esito a `parziale`, sotto il 20%
  lo limita a `buono`;
- la matrice spiega se la relazione è affinità, modulazione, attenuazione,
  compensazione o tensione.

### Rapporto con l'Agire

- il contesto qualitativo usa la famiglia risultante dalla Natura classica;
- fattore determinante: quota Marziale in Ritmo + Melodia;
- <10 molto bassa; 10–19 parziale; 20–29 discreta; 30–39 buona;
  40–49 spiccata; >=50 eccezionalmente alta;
- la famiglia dominante modifica il racconto: simbiosi Marziale, compensazione
  Malinconica, tensione Flemmatica/Razionale, affinità Entusiasta.

## File modificati

- `src/utils/buildFourRelationsNarrative.js`
- `src/utils/buildNaturaNarrative.js`
- `src/utils/buildReportData.js`
- `test/buildFourRelationsNarrative.test.js`
- `test/buildNaturaNarrative.test.js`
- `test/reportGraphDataContract.test.js`

## Compatibilità UI

`definizione` resta disponibile come stringa concatenata. Tutte le lenti
espongono inoltre `definizioneParagrafi` e `narrativaRapporto`; il componente
`QuattroRapporti` usa il supporto a paragrafi già esistente.

## Lettura sul front

- ogni rapporto espone soltanto il proprio risultato e due paragrafi rivolti
  alla persona, senza grafico, punti, percentuali, classifica o sfumature;
- il pulsante `?` apre una guida modale a due pagine: la prima riassume le
  formule classiche (Natura = Timbro + Intervalli + Armonia; Sé = Intervalli +
  Melodia; Altro = Timbro + Melodia; Agire = Ritmo + Melodia), la seconda la
  mappa delle relazioni qualitative tra famiglie;
- tutti i dati tecnici restano nel contratto `rapporti` per le altre viste del
  report (per esempio Galassia), ma non sono più renderizzati in questa pagina.

## Informativa dati della sintesi

- la descrizione duplicata della famiglia non appare più nel pannello dei dati;
- risonanza, scala 1-7 e punteggio grezzo sono visibili soltanto in `Come leggere
  dati e punteggi`;
- nel sottomenu `Come si calcolano questi dati?` la formula distingue risonanza
  (quota sul totale) e scala grafica (confronto rispetto al punteggio più alto).

## Verifiche

- test di regressione raw-to-report sulle formule classiche: Natura = Timbro +
  Intervalli + Armonia; Sé = Intervalli + Melodia; Altro = Timbro + Melodia;
  Agire = Ritmo + Melodia;
- test automatici su soglie, famiglie, relazioni, pari merito, stati vuoti e
  contratto UI;
- lint;
- build Vite;
- controllo browser locale su layout compatto e desktop 1440×900;
- fixture temporanea rimossa al termine della verifica.
- dopo la semplificazione del front: 69 test automatici, lint, build Vite e
  `git diff --check` superati.

## Deploy

Non eseguito: `AI_TASK.md` e la skill `parallel-delivery` vietano agli agenti
deploy e pubblicazioni. Il commit è pronto per il normale processo di rilascio
del progetto.
