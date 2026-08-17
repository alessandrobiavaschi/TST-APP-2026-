# Specifica tecnica — Regole dei 4 rapporti (fonte: documenti Franco)

Estratta esclusivamente da due documenti forniti dal cliente:
- **Doc A** = `REGOLE DI RELAZIONE TRA FAMIGLIE.pdf`
- **Doc B** = `QUADRO DEI RAPPORTI RISCRITTI.pdf` (testo di esempio per un profilo Marziale/Volitivo-collerica dominante, con Flemmatica come famiglia secondaria in tensione)

Nessuna regola qui sotto è stata inventata: dove i documenti non specificano un valore, è segnalato esplicitamente come **[MANCANTE]** o **[AMBIGUO]**. Il codice esistente non è stato usato come fonte — è citato solo a fine documento, a scopo di confronto, perché in due punti diverge dai documenti del cliente.

---

## 1. NATURA DI BASE

### 1.1 Variabile che governa il testo
- Famiglia dominante (quella con più punti)
- Seconda famiglia e famiglie successive, per l'Influenza
- Distanza percentuale ("punti") tra famiglia dominante e le altre
- Presenza di una relazione di "tensione" tra dominante e un'altra famiglia, secondo una "matrice" citata ma non allegata
- Armonia: media tra la distanza dalla 2ª e dalla 3ª famiglia (dichiarato incompleto dallo stesso Doc A, vedi 1.2)
- Eventuale pari merito tra famiglie
- Sottocorrenti

### 1.2 Condizioni che cambiano il testo
- Distanza dominante↔famiglia-X ≤10 → **marcata** influenza; 10–15 → **discreta**; 25–35 → **leggera**; oltre 35 → **blanda**. **[AMBIGUO]** manca la fascia 15–25 in tutte e tre le tabelle (Influenza/Tensione/Armonia); l'ultima riga del Doc A dice letteralmente "sotto i 35" invece di "oltre i 35", in contraddizione con la riga precedente "da 25 a 35".
- SE la coppia (dominante, famiglia-X) è "in tensione" secondo la matrice → si applica ANCHE la scala Tensione, stesse fasce di distanza, etichette diverse (intensa/significativa/leggera/blanda). **[MANCANTE]** la matrice che stabilisce quali coppie di famiglie sono "in tensione" non è allegata. Dal Doc B sappiamo solo che Marziale↔Flemmatica lo è.
- Armonia = media tra 2ª e 3ª famiglia. **[MANCANTE — dichiarato dal cliente stesso con "ALLERT!!!!"]**: non è specificato (a) come si calcola la media, (b) cosa succede se altre famiglie oltre la 3ª hanno punti rilevanti ("almeno la seconda e la terza" implica che potrebbero servire anche 4ª/5ª, ma non è detto quando), (c) quale soglia minima di punti rende una famiglia "rilevante" per il calcolo.
- SE esistono più componenti con "percentuali apprezzabili" → il profilo è descritto come "composto" (Doc B: "la presenza di più componenti con percentuali apprezzabili conferisce... una complessità"). **[AMBIGUO]** "percentuali apprezzabili" non è quantificato.
- SE esiste un pari merito → va segnalato. **[MANCANTE]** nessuna formulazione testuale fornita per questo caso.

### 1.3 Frasi fisse (dal Doc B, presunte invarianti)
- "Il test conferma la tua appartenenza alla famiglia {FAMIGLIA_DOMINANTE}."
- "La lettura delle diverse aree del test converge nel riconoscere come {NATURA_DOMINANTE} la tua natura emotiva di base."
- "La lente rivela una certa prevalenza rispetto ad altre disposizioni temperamentali."
- "Il tuo profilo indica una compresenza di componenti sia in accordo che in tensione {LIVELLO_TENSIONE}."
- "La presenza di più componenti con percentuali apprezzabili conferisce al tuo profilo temperamentale una complessità che unisce profondità con leggerezza, rivelando una {LIVELLO_ARMONIA} armonia tra le diverse componenti."

**[AMBIGUO]** Il Doc B contiene, subito sotto il primo blocco, un secondo paragrafo minuscolo parzialmente tagliato ("...ono nel riconoscere questa natura emotiva di base... nel tuo caso emerge una profonda appartenenza...") che sembra una variante alternativa dello stesso contenuto, con toni diversi ("profonda appartenenza" vs "certa prevalenza"). Non è chiaro se sono due bozze alternative o se vanno concatenate — da chiedere a Franco quale versione è quella corretta.

### 1.4 Frasi dinamiche
- Nome famiglia dominante + natura corrispondente
- Nome famiglia/e secondaria/e + descrizione qualitativa (solo l'esempio per Flemmatica è documentato: "una forza emotiva che tende a frenare l'azione")
- Livello di tensione (leggera/significativa/intensa/blanda)
- Livello di armonia (eccellente/buona/leggera/poca)
- Eventuale menzione di pari merito

### 1.5 Regola algoritmica ricostruita

```
NATURA DI BASE
testo = "Il test conferma la tua appartenenza alla famiglia {FAMIGLIA_DOMINANTE}."
testo += "La lettura delle diverse aree del test converge nel riconoscere come {NATURA_DOMINANTE} la tua natura emotiva di base."

SE esiste pari merito tra famiglie
    [MANCANTE — nessun testo fornito per questo caso]

PER OGNI famiglia successiva F (2ª, 3ª, 4ª, 5ª in classifica):
    distanza = dominante% - F%
    SE distanza <= 10        → influenza = "marcata"
    ALTRIMENTI SE <= 15      → influenza = "discreta"
    ALTRIMENTI SE tra 15-25  → [FASCIA MANCANTE]
    ALTRIMENTI SE <= 35      → influenza = "leggera"
    ALTRIMENTI               → influenza = "blanda"   [AMBIGUO: testo dice "sotto i 35", va inteso come "oltre"]

    SE (dominante, F) è in tensione secondo la matrice   [MATRICE MANCANTE]
        applica stessa logica di fasce → intensa/significativa/[MANCANTE 15-25]/leggera/blanda

ARMONIA:
    media = media(distanza da 2ª, distanza da 3ª)   [MANCANTE: metodo di calcolo esatto, gestione di 4ª/5ª]
    SE media <= 10       → "eccellente"
    ALTRIMENTI SE <= 15  → "buona"
    ALTRIMENTI SE tra 15-25 → [FASCIA MANCANTE]
    ALTRIMENTI SE <= 35  → "leggera"
    ALTRIMENTI            → "poca"

SE esistono sottocorrenti  [NESSUNA REGOLA FORNITA su quando/come menzionarle]
```

---

## 2. RAPPORTO CON TE STESSO

### 2.1 Variabile che governa il testo
- Componente Malinconica (livello/percentuale)
- Famiglia dominante (per il confronto, quando Malinconica non è dominante)

### 2.2 Condizioni
- SE Malinconia = famiglia dominante → **[MANCANTE]** nessun testo di esempio fornito per questo caso (il Doc B mostra solo il caso Marziale dominante).
- SE Malinconia NON è famiglia dominante (caso del Doc B) → si usa "come fattore di consapevolezza da mettere in relazione con la natura dominante".
- Il livello finale di propensione dipende dalla quota di Malinconia, ma **[MANCANTE]** nessuna soglia percentuale è fornita per questo rapporto in nessuno dei due documenti (a differenza dell'Agire, che ha soglie esplicite).
- **[AMBIGUO — contraddizione interna nel Doc B]**: l'etichetta di sintesi in testa alla sezione dice "Tendenza **parziale** a vivere in armonia con la natura", mentre il corpo del paragrafo, due righe sotto, dice "il test rivela un'**ottima** propensione a vivere consapevolmente in armonia". Sono due giudizi opposti sullo stesso rapporto nello stesso documento — va chiarito con Franco quale dei due è corretto, o se si riferiscono a due dati diversi.

### 2.3 Frasi fisse
- "Questa lente osserva la consapevolezza della tua natura di base."
- "Nel definire il rapporto con te stesso gioca in modo determinante la corrente Malinconica, ovvero la capacità di sentire viva e operante la forza prevalente che opera nella propria interiorità."
- "Più è alto il rapporto con la propria natura Malinconica più è alta la capacità di osservare con più lucidità la propria natura temperamentale prevalente."
- "Il test rivela {LIVELLO} propensione a vivere consapevolmente in armonia con la tua natura {NATURA_DOMINANTE}."

### 2.4 Frasi dinamiche
- Etichetta di sintesi (es. "Tendenza parziale...")
- Livello di propensione nel corpo del testo (es. "ottima")
- Nome della natura dominante finale

### 2.5 Regola algoritmica ricostruita

```
RAPPORTO CON TE STESSO
testo = "Questa lente osserva la consapevolezza della tua natura di base."

SE famiglia_dominante == Malinconica
    [MANCANTE — nessun esempio fornito per questo caso]
ALTRIMENTI
    testo += "...gioca in modo determinante la corrente Malinconica... in relazione con la natura dominante {NATURA_DOMINANTE}."

livello = f(percentuale_Malinconica)   [FUNZIONE MANCANTE — nessuna soglia numerica nei documenti]
testo += "Il test rivela una {livello} propensione a vivere consapevolmente in armonia con la tua natura {NATURA_DOMINANTE}."
```

---

## 3. RAPPORTO CON L'ALTRO

### 3.1 Variabile che governa il testo
- Componente Entusiasmo (livello/percentuale)
- Famiglia dominante (per la frase di apertura e per il confronto, quando Entusiasmo non è dominante)

### 3.2 Condizioni
- Frase di apertura dipende dalla famiglia dominante: nell'esempio (Marziale dominante) è "La tua famiglia emotiva ha come elemento caratteristico una certa competitività nel rapporto con gli altri". **[MANCANTE]** le frasi equivalenti per le altre 4 famiglie (Malinconica, Flemmatica, Entusiasta, Razionale) non sono fornite.
- SE Entusiasmo NON è famiglia dominante (caso del Doc B) → "lo si confronta con altre famiglie dominanti, spiegando vantaggi, distanze e relazione qualitative" (Doc A). **[AMBIGUO]** il testo di esempio nel Doc B non mostra però alcun confronto nominale esplicito con una seconda famiglia — parla solo in astratto di "questo valore". Non è chiaro se il confronto richiesto dal Doc A debba comparire nel testo finale o sia solo un criterio di calcolo interno non visibile.
- SE Entusiasmo = famiglia dominante → **[MANCANTE]** nessun esempio fornito.
- Livello finale (es. "ottima" nel Doc B) dipende dalla quota di Entusiasmo, ma **[MANCANTE]** nessuna soglia percentuale fornita in nessuno dei due documenti.

### 3.3 Frasi fisse
- "[Apertura legata alla famiglia dominante — variante nota solo per Marziale]"
- "Questa lente osserva però quanto la corrente dell'Entusiasmo sia presente in modo forte nel tuo profilo."
- "È un fattore determinante in quanto smussa gli spigoli dell'elemento egoico favorendo atteggiamenti di apertura e comprensione per le diversità altrui." (Doc B scrive "terminante", presumibile refuso di "determinante")
- "Più alto è questo valore, maggiore è la possibilità di instaurare rapporti fiduciosi verso gli altri."
- "Il risultato del test rivela un(a) {LIVELLO} propensione all'ascolto del prossimo e a relazionarsi con esso con fiducia."

### 3.4 Frasi dinamiche
- Frase di apertura (dipende dalla famiglia dominante — 4 varianti su 5 mancanti)
- Livello finale di propensione

### 3.5 Regola algoritmica ricostruita

```
RAPPORTO CON L'ALTRO
apertura = descrizione_caratteristica(famiglia_dominante)
   [MANCANTE per Malinconica, Flemmatica, Entusiasta, Razionale — solo Marziale documentato]

SE famiglia_dominante == Entusiasta
    [MANCANTE — nessun esempio fornito]
ALTRIMENTI
    testo += "...osserva però quanto la corrente dell'Entusiasmo sia presente..."
    [Doc A richiede di "confrontare con altre famiglie dominanti, spiegando vantaggi, distanze e
     relazione qualitative", ma il Doc B non mostra alcun confronto nominale esplicito — AMBIGUO]

livello = f(percentuale_Entusiasmo)   [FUNZIONE MANCANTE — nessuna soglia numerica nei documenti]
testo += "Il risultato del test rivela una {livello} propensione all'ascolto del prossimo..."
```

---

## 4. RAPPORTO CON L'AGIRE

Questa è l'unica sezione con soglie numeriche complete e non ambigue in Doc A.

### 4.1 Variabile che governa il testo
- Componente Marziale (percentuale) — variabile univoca, esplicitamente dichiarata "sempre determinante"

### 4.2 Condizioni (complete)
- <10% → propensione molto bassa
- 10%–19,9% → propensione parziale
- 20%–29,9% → discreta propensione
- 30%–39,9% → buona propensione
- 40%–49,9% → spiccata propensione
- ≥50% → propensione eccezionalmente alta
- Testo introduttivo dipende dalla natura dominante: solo l'esempio per Marziale/Volitivo-collerica è fornito ("rapporto simbiotico con la volontà"). **[MANCANTE]** le versioni per le altre 4 nature non sono fornite.
- SE Marziale NON è famiglia dominante → "la si usa come fattore da porre in relazione con le altre famiglie di base" (Doc A). **[MANCANTE]** nessun esempio testuale per questo caso (il Doc B mostra solo il caso in cui Marziale è già dominante).

### 4.3 Frasi fisse
- "Questa lente osserva il rapporto con l'Agire."
- "[Testo natura-Marziale — variabile per natura, solo Volitivo-collerica documentata]. È l'elemento che la caratterizza in quanto coinvolge direttamente l'azione dell'Io, la forza che opera per realizzare i propri obiettivi."
- "Quanto è più alta la Volitività, tanto più forti e incisive tendono a essere le azioni che si compiono nella vita."
- "Il test rivela una {LIVELLO} propensione all'azione."

### 4.4 Frasi dinamiche
- Relazione natura-dominante ↔ Marziale (solo "rapporto simbiotico" per Volitivo-collerica documentato)
- Livello di propensione finale — nel Doc B è evidenziato con un colore diverso rispetto al resto del testo, a conferma che è l'unica parte variabile del paragrafo

### 4.5 Regola algoritmica ricostruita (completa)

```
RAPPORTO CON L'AGIRE
testo = "Questa lente osserva il rapporto con l'Agire."

SE famiglia_dominante == Marziale
    testo += "La natura Volitivo-collerica ha un rapporto simbiotico con la volontà..."
ALTRIMENTI
    testo += relazione(natura_dominante, Marziale)
    [MANCANTE: testo per le altre 4 nature — solo la regola generale, senza formulazione]

percentuale = valore_Marziale
SE percentuale < 10   → livello = "molto bassa"
ALTRIMENTI SE < 20     → livello = "parziale"
ALTRIMENTI SE < 30     → livello = "discreta"
ALTRIMENTI SE < 40     → livello = "buona"
ALTRIMENTI SE < 50     → livello = "spiccata"
ALTRIMENTI             → livello = "eccezionalmente alta"

testo += "Il test rivela una {livello} propensione all'azione."
```

---

## 5. Punti da chiarire con Franco (elenco consolidato)

1. **Fascia 15–25 mancante** in tutte e tre le tabelle di Doc A (Influenza, Tensione, Armonia) — nessuna etichetta definita in quell'intervallo.
2. **"Sotto i 35" nell'ultima riga** delle stesse tre tabelle è in contraddizione con "da 25 a 35" nella riga precedente — probabile refuso per "oltre i 35".
3. **Matrice delle coppie "in tensione"** citata in Doc A ma mai allegata — sappiamo solo, dall'esempio del Doc B, che Marziale↔Flemmatica lo è.
4. **Metodo di calcolo dell'Armonia** dichiarato incompleto dallo stesso Doc A ("ALLERT!!!!"): non è specificato come si fa la media tra 2ª e 3ª famiglia, né cosa fare se altre famiglie (4ª, 5ª) hanno punti rilevanti.
5. **Nessuna soglia numerica** per il "Rapporto con te stesso" (Malinconica) né per il "Rapporto con l'Altro" (Entusiasmo) — a differenza dell'Agire, che ha soglie precise al punto percentuale.
6. **Contraddizione interna** nel Doc B, sezione "Rapporto con te stesso": l'etichetta dice "parziale", il corpo del testo dice "ottima".
7. **Il confronto esplicito con "altre famiglie dominanti"** richiesto per il Rapporto con l'Altro (Doc A) non compare nel testo di esempio del Doc B — non chiaro se il confronto vada reso visibile nel testo o resti solo un criterio di calcolo interno.
8. **Frasi di apertura per famiglia dominante** (Rapporto con l'Altro e Rapporto con l'Agire) documentate solo per il caso Marziale — mancano le 4 varianti per le altre famiglie.
9. **Casi "famiglia di riferimento = famiglia dominante"** (Malinconica dominante per Sé, Entusiasta dominante per Altro, Marziale già coperto per Agire) — nessun testo di esempio fornito per questi casi.
10. **Doppio paragrafo nel Doc B** (sezione Natura di base): un secondo blocco di testo parzialmente tagliato sembra una variante alternativa del primo — da capire se sono bozze alternative o vanno unite.
11. **Sottocorrenti e "profilo composto"**: menzionati come elementi richiesti nella Natura di base, ma senza alcuna regola di calcolo o soglia fornita.
12. **"Punti" vs "%"**: Doc A usa "punti" per Influenza/Tensione/Armonia e "%" per l'Agire — va confermato che sono la stessa unità di misura (percentuale) e non punteggio grezzo.

---

## 6. Nota di confronto col codice esistente (non è la fonte di questa specifica, solo un controllo incrociato)

Il codice attuale (`src/utils/buildFourRelationsNarrative.js`, introdotto in una sessione precedente — vedi `HANDOFF_CODEX_FOUR_RELATIONS_NARRATIVE.md`) applica soglie numeriche per il Rapporto con te stesso e il Rapporto con l'Altro (es. bande 10/20/30 punti, soglie 10%/20% sulla quota assoluta di Entusiasmo) che **non compaiono in nessuno dei due documenti di Franco**. Per l'Agire, invece, le soglie in codice (10/20/30/40/50%) coincidono esattamente con quelle di Doc A.

Questo significa che, per due rapporti su quattro, il report live sta già mostrando un livello ("ottima"/"buona"/"discreta"/"parziale") calcolato con una formula che non ha una fonte scritta nei documenti che mi hai fornito — o Franco l'ha comunicata altrove e non è stata allegata qui, oppure è stata scelta in una sessione precedente senza una base esplicita. Andrebbe verificato con lui prima di considerarla definitiva.
