# TST Experiential Psychometrics Kernel

Questo documento comprime la direzione prodotto del TST in una forma riusabile. Serve a evitare prompt lunghi e a mantenere coerenza tra design, contenuto e sviluppo.

## Categoria

Il TST e' un sistema di **psicometria esperienziale**: non mostra semplicemente risultati, ma traduce una matrice strutturata in un percorso guidato di riconoscimento emotivo.

Non e':

- un personality test classico
- una dashboard di metriche
- un report clinico da leggere passivamente
- una visualizzazione artistica autonoma

E':

- uno strumento di esplorazione guidata
- una mappa simbolica della risposta emotiva
- un interprete progressivo tra dati, pattern e significato
- un ambiente in cui l'utente scopre relazioni, non solo punteggi

Promessa utente:

> Dopo il TST, l'utente riesce a riconoscere una dinamica emotiva personale prima invisibile: da dove reagisce, cosa lo avvicina, cosa lo allontana, cosa lo protegge.

## Principio Centrale

Il prodotto deve far emergere insight, non dimostrare complessita'.

La sequenza cognitiva corretta e':

```text
RAW DATA -> PATTERNS -> MEANING -> SELF-UNDERSTANDING
```

Nel prodotto:

```text
matrice -> relazione -> interpretazione -> riconoscimento personale
```

Regola MVI:

> Entro 90 secondi l'utente deve incontrare una prima relazione inattesa ma riconoscibile.

## Journey Cognitivo

### 1. Orientation

Domanda utente: "Cosa sto guardando?"

Mostrare una sola frase di orientamento e una sola promessa. Evitare teoria, tabelle, spiegazioni lunghe e cluster di metriche.

Output ideale:

- una dinamica dominante
- una CTA primaria
- nessun dato tecnico in primo piano

### 2. Exploration

Domanda utente: "Come posso muovermi dentro questa struttura?"

L'utente esplora nodi, relazioni e composizioni. Ogni interazione deve modificare lo stato di comprensione, non solo rivelare testo.

Output ideale:

- selezione di un nodo o relazione
- evidenza visiva del contesto
- interpretazione breve

### 3. Correlation Discovery

Domanda utente: "Quale relazione conta davvero?"

Il sistema mostra una relazione tra dimensioni, correnti, portato esperienziale o semantiche. Il focus e' sulla tensione tra elementi, non sul valore isolato.

Output ideale:

- "quando X aumenta, Y tende a..."
- evidenza opzionale
- possibilita' di cambiare focus sul nodo connesso

### 4. Self-Recognition

Domanda utente: "Questo cosa dice di me?"

L'interfaccia traduce il pattern in linguaggio vissuto, con cautela e senza tono valutativo.

Output ideale:

- una frase riconoscibile
- un collegamento a una parte della composizione
- nessuna diagnosi

### 5. Synthesis

Domanda utente: "Cosa porto via?"

Solo dopo l'esplorazione arrivano profilo finale, fiori, dimensioni derivate e approfondimenti.

Output ideale:

- sintesi narrativa
- pattern principali
- invito a rientrare nella struttura

## Ruolo Dei Moduli

### ReportPage

Funzione cognitiva: ingresso meaning-first.

Deve mostrare prima una dinamica viva, non una panoramica metrica. La prima schermata deve rispondere a una sola domanda: "qual e' il pattern dominante da esplorare?"

Da cambiare:

- prima vista = living pattern statement
- CTA unica: "Esplora come si compone"
- metriche, totali e label tecniche dietro disclosure

### Computerino

Funzione cognitiva: interprete canonico.

Non deve essere dashboard. Deve tradurre il focus corrente in significato.

Struttura consigliata:

1. focus corrente
2. frase interpretativa breve
3. suggerimento di prossima azione
4. toggle "Mostra evidenza"

Da evitare:

- status duplicati
- troppi valori numerici simultanei
- linguaggio tecnico come contenuto primario
- piu' pannelli che interpretano la stessa cosa

### Galaxy

Funzione cognitiva: spazio relazionale.

Deve far scoprire correlazioni tra semantica, disposizione emotiva, portato esperienziale e intensita'. La bellezza e' subordinata alla leggibilita' del rapporto.

Core loop:

```text
click relazione -> evidenza coppia -> computerino interpreta -> click nodo connesso -> composizione locale cambia
```

La relazione e' piu' importante del nodo isolato.

### Flowers / Derived Dimensions

Funzione cognitiva: sfumatura cross-section.

Devono apparire dopo almeno un passaggio esplorativo. Non devono competere con galaxy e computerino nel primo momento.

### Final Profile

Funzione cognitiva: sintesi portabile.

Deve raccogliere cio' che l'utente ha gia' scoperto, non sostituire l'esplorazione con una lettura lunga.

### Operator / Advanced Data

Funzione cognitiva: verifica e lavoro tecnico.

Deve essere una corsia separata o tardiva. `ReportDataTablesSection` non appartiene al percorso utente standard iniziale.

## Grammatica Simbolica

Regole comuni a tutti i moduli:

- forma = tipo di elemento
- posizione = ruolo nella struttura
- prossimita' = affinita' o relazione
- distanza = differenza, protezione o tensione
- movimento = dinamica attiva
- intensita' luminosa = forza del pattern
- colore = famiglia emotiva
- variazione di colore = sottodisposizione o sfumatura
- trasformazione = cambio di prospettiva o riconfigurazione del significato

Traduzioni psicologiche:

- stabilita' -> movimento lento, forma coerente, bassa oscillazione
- variabilita' -> pulsazione, cambio ritmico, micro-spostamenti
- apertura -> espansione, maggiore connessione, bordo permeabile
- chiusura -> contrazione, minori connessioni, bordo piu' netto
- intensita' -> luminosita' e peso visivo, non solo grandezza
- neutralita' -> bassa saturazione, movimento minimo
- tensione -> linea piu' vibrante o distanza attiva
- armonia -> connessione stabile e leggibile
- attrazione -> avvicinamento o richiamo visivo
- distanza -> separazione significativa, non assenza di relazione

## Numeri, Simboli, Narrazione

Numerico:

- resta disponibile come evidenza
- non guida la prima comprensione
- appare in "Mostra evidenza", operator lane o tabelle avanzate

Spaziale:

- mostra relazioni, vicinanze, gerarchie, tensioni

Simbolico:

- traduce intensita', stabilita', apertura, distanza, protezione

Narrativo:

- spiega il significato del focus corrente in una frase breve
- evita etichette valutative o diagnostiche

Implicito:

- la matrice resta fondamento autorevole
- il sistema non deve obbligare l'utente a leggerla per capire

## Decisioni Immediate

1. Report meaning-first: prima vista con una sola dinamica dominante e una CTA.
2. Computerino unico: un solo pannello interprete canonico.
3. Evidenza on demand: numeri e valori tecnici dietro disclosure.
4. Una domanda cognitiva per stato: dominante, composizione, relazione o implicazione.
5. Progressione guidata: orientation -> exploration -> correlation -> synthesis.

## Elementi Da Semplificare

1. `ReportDataTablesSection`: fuori dal percorso standard, operator-only o disclosure avanzata.
2. HUD persistenti nella galaxy: sostituire con micro-hint contestuali e temporanei.
3. Blocchi teorici lunghi: comprimere in card progressive con "approfondisci".

## Rule-Set Quotidiano

Una feature appartiene al TST solo se supera questi controlli:

- Cognitive check: risponde a una sola domanda nello stage corrente?
- Exploration check: l'interazione cambia la comprensione, non solo apre altro testo?
- Meaning check: produce linguaggio di pattern, non solo metriche?
- Evidence check: la frase puo' essere ricondotta alla matrice quando richiesto?
- Load check: riduce o mantiene il carico cognitivo?
- Coherence check: usa la grammatica simbolica esistente?
- Hierarchy check: appare nello stage giusto?

Se fallisce un controllo, va ripensata. Se ne fallisce due, non va sviluppata.

## Prompt Breve Da Usare In Futuro

Usa questo documento come riferimento:

> Applica `docs/TST_EXPERIENTIAL_PSYCHOMETRICS_KERNEL.md` e lavora su [modulo/ticket]. Mantieni il TST come sistema di psicometria esperienziale: meaning-first, esplorativo, con evidenza on demand.

