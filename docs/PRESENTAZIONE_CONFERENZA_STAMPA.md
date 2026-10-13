# PITCH CONFERENZA STAMPA TST (5 MINUTI ESATTI)
## Test Sonoro Temperamentale per la Rilevazione dell'Identità Emotiva
*Specifiche per Claude (CSS & Componenti reali della Landing Nebula) + Copione Speaker calibrato a 300 secondi.*

---

## REGOLE TECNICHE PER CLAUDE (Design 1:1 con la Landing)
Claude non deve inventare alcuno stile. Usa direttamente le classi e i componenti già presenti nel repository:
1. **Sfondo**: `public/Video Background/SFONDO LANDING.mp4` + classi `.tst-nebula-bg-gradient`, `.tst-nebula-bg-stars` da `src/styles/landing-nebula.css`.
2. **Tipografia e Numeri Giganti a Contorno**:
   - Il numero a contorno `.tst-nebula-panel-number` (i grandi numeri `01`, `02`, `03`, `04`, `05`, `06`, `07` a fil di ferro alternati a destra e sinistra come da screenshot).
   - `.tst-nebula-eyebrow` in maiuscoletto colorato (`#7dabfa`, `#c4b5fd`, `#5eead4`, `#fbbf62`, `#f9a8d4`).
   - `.tst-nebula-panel-title` e `.tst-nebula-panel-paragraph`.
3. **Arco Planetario**: Lo sfondo con l'arco del pianeta luminoso della sezione `.tst-nebula-method` e `.tst-nebula-timeline`.
4. **Componenti App reali nei Mockup**:
   - La Hero con `.tst-nebula-card`
   - Il player reale di `src/pages/NewTestPage.jsx` ("Passo N di 72", player circolare, `.answers-grid`)
   - Le 4 relazioni di `src/components/report/QuattroRapporti.jsx`
   - La mappa cosmica di `src/components/report/GalassiaView.jsx` con il "Computerino"

---

## TIMING & STRUTTURA DEL PITCH (5 MINUTI / 300 SECONDI)

| Minuto | Scena | Componente Reale TST | Focus Narrativo |
|---|---|---|---|
| **0:00 - 0:45** | **Scena 1: La Missione & Il Contesto** | Hero Card + Slider Intro | Chi siamo, il TST, la crisi dell'ascolto e la Loudness War |
| **0:45 - 1:30** | **Scena 2: Il Codice & L'Area del Sentire** | Panel 02 & 03 (Numeri 02 e 03) | I 5 elementi oggettivi, Simpatia/Antipatia e le 5 Forze |
| **1:30 - 2:15** | **Scena 3: 40 Anni di Ricerca sul Campo** | Timeline Planetaria (Numero 07) | Da Ippocrate a Mussida: 13 carceri (CO2), Univ. Pavia, Scuole e RSA |
| **2:15 - 3:15** | **Scena 4: L'App in Azione: I 72 Passi** | Mockup reale NewTestPage + For Musicians | L'esperienza in cuffia, niente ansia, la sezione per musicisti |
| **3:15 - 4:15** | **Scena 5: La Mappa Visiva & La Galassia** | Panel 06 + Mockup GalassiaView | I Quattro Rapporti (Natura, Sé, Altro, Agire) e la Galassia |
| **4:15 - 5:00** | **Scena 6: Conclusione & Invito alla Prova** | Outro Landing con QR Code | La citazione di Mussida e l'invito alle postazioni del foyer |

---

### SCENA 1 (0:00 - 0:45 · 45s) · Hero: La Missione e l'Ecologia dell'Ascolto

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `01`
- **Eyebrow**: `TST · TEST TEMPERAMENTALE` (colore `#7dabfa`)
- **Titolo**: TEST SONORO TEMPERAMENTALE PER LA RILEVAZIONE DELL'IDENTITÀ EMOTIVA
- **Testo a schermo**:
  ```text
  • Uno strumento scientifico-artistico musicale a scopi umanistici
  • La Musica come stimolo emozionale oltre la sfera cognitiva
  • Dalla Loudness War e dall'anestesia percettiva al recupero dell'ascolto originario
  ```
- **Visual Mockup**: La reale `.tst-nebula-card` fluttuante su sfondo video cielo, con il pulsante luminoso `AVVIA IL TEST`.

#### Copione dello Speaker (Tempo: 45 secondi · ~95 parole)
> «Buongiorno a tutti.  
> Quello che vedete è il TST: Test Sonoro Temperamentale per la rilevazione dell'identità emotiva.  
> Non è un quiz da social network né un test per giudicare se siete intonati o bravi a suonare. E non è una diagnosi clinica.  
> È una piattaforma scientifico-artistica che usa la Musica a fini umanistici.  
> Perché oggi? Perché viviamo in un'epoca di profonda anestesia percettiva. Tra la guerra del volume — la *loudness war* — e le continue distorsioni sonore delle nuove tendenze, abbiamo de-vitalizzato il suono.  
> Il TST fa l'opposto: usa stimoli sonori puri per riattivare la nostra sensibilità e rivelare chi siamo.»

---

### SCENA 2 (0:45 - 1:30 · 45s) · Il Codice Musicale e l'Area del Sentire (Panel 02 & 03)

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `02` e `03` alternati
- **Eyebrow**: `MUSICA COME LINGUAGGIO DELL'IDENTITÀ EMOTIVA` (colore `#c4b5fd`)
- **Titolo**: TST illumina l'area del sentire
- **Testo a schermo**:
  ```text
  I 5 ELEMENTI DEL CODICE: Timbro · Ritmo · Intervalli · Armonia · Melodia
  LE REAZIONI ISTINTIVE: Simpatia · Antipatia · Indifferenza
  LE 5 FORZE DELL'IDENTITÀ EMOTIVA:
  • Flemma (Verde) · Malinconia (Blu) · Marzialità (Rosso) · Entusiasmo (Giallo) · Anaffettività (Grigio)
  ```
- **Visual Mockup**: Card stile Panel 03 della landing con i badge cromatici delle 5 forze emotive.

#### Copione dello Speaker (Tempo: 45 secondi · ~100 parole)
> «Perché un test sonoro? Perché le parole mentono, la Musica no.  
> La Musica è il codice non verbale più evoluto della specie umana. Si basa su cinque elementi oggettivi: Timbro, Ritmo, Intervallo, Armonia e Melodia.  
> Nel TST questi elementi sono proposti in forme archetipiche pure. Davanti a loro, il nostro apparato sensibile reagisce prima del pensiero: con l'attrazione della **Simpatia**, l'attrito dell'**Antipatia** o lo schermo dell'**Indifferenza**.  
> Questa risonanza istintiva illumina la nostra "Area del Sentire": una combinazione irripetibile di cinque grandi forze: Flemma, Malinconia, Marzialità, Entusiasmo e la forza protettiva dell'Anaffettività.»

---

### SCENA 3 (1:30 - 2:15 · 45s) · Metodologia e Urgenza Sociale (Timeline & FAQ)

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `07`
- **Eyebrow**: `METODOLOGIA: IL FRUTTO DI ANNI DI RICERCA` (colore `#5eead4`)
- **Titolo**: 40 anni di ricerca sul campo: dalla fragilità all'educazione
- **Testo a schermo**:
  ```text
  • RADICI: Ippocrate, Galeno, Steiner, Thomas & Chess, Cloninger, Franco Mussida
  • VALIDAZIONE: 13 istituti di pena (Progetto CO2) · Università di Pavia · CNR
  • APPLICAZIONI: 
    - Scuole & Adolescenti: alfabetizzazione emotiva contro l'anestesia digitale
    - RSA & Cura: risveglio della memoria affettiva oltre la sfera cognitiva
    - Comunità: consapevolezza per il governo delle pulsioni
  ```
- **Visual Mockup**: L'arco planetario reale della sezione `.tst-nebula-timeline` con i 4 marker storici.

#### Copione dello Speaker (Tempo: 45 secondi · ~105 parole)
> «Questa struttura poggia sulla ricerca millenaria sul temperamento — da Ippocrate a Steiner, fino alle neuroscienze di Cloninger — a cui Franco Mussida ha aggiunto l'osservazione dell'Anaffettività.  
> Ma soprattutto, è stata collaudata in **quarant'anni di lavoro sul campo**: in comunità e in 13 carceri italiane col Progetto CO2, validato dall'Università di Pavia e dal CNR.  
> Se la musica tocca la verità emotiva di un detenuto, tocca quella di chiunque.  
> Ed è ciò che serve oggi nelle scuole: davanti ad adolescenti iper-stimolati dagli schermi ma analfabeti sulle proprie emozioni, il TST offre una mappa neutra per riconoscersi senza sentirsi giudicati.»

---

### SCENA 4 (2:15 - 3:15 · 60s) · L'App in Azione: I 72 Passi (NewTestPage & For Musicians)

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `04`
- **Eyebrow**: `72 PASSI BREVI, NESSUNA RISPOSTA GIUSTA O SBAGLIATA` (colore `#5eead4`)
- **Titolo**: Un percorso di ascolto guidato
- **Testo a schermo**:
  ```text
  • 72 stimoli sonori archetipici ascoltati uno alla volta in cuffia
  • Associazioni istintive e spontanee (30-35 minuti di tempo sospeso)
  • NESSUNA RISPOSTA GIUSTA O SBAGLIATA: conta solo la tua risonanza
  • SEZIONE "FOR MUSICIANS": il vocabolario tecnico del sentire musicale
  ```
- **Visual Mockup**: **Mockup reale di NewTestPage.jsx**:
  - Barra "Passo 28 di 72 · Intervalli"
  - Player audio ad anello con pulsante circolare
  - Griglia reale `.answers-grid` con le sensazioni selezionabili.

#### Copione dello Speaker (Tempo: 60 secondi · ~130 parole)
> «Guardiamo ora l'applicazione in azione.  
> L'esperienza richiede circa 35 minuti. L'utente indossa le cuffie, entra in uno spazio tranquillo e ascolta **72 brevi stimoli sonori archetipici**.  
> Non serve conoscere la musica o saper leggere uno spartito.  
> La persona ascolta e tocca sullo schermo le parole e le sensazioni che risuonano con ciò che ha appena percepito.  
> Non ci sono risposte giuste o sbagliate: ogni scelta registra una coordinata della propria sensibilità.  
> E per chi lavora con le note — musicisti, allievi e docenti di conservatorio — il TST apre la sezione specialistica **For Musicians**: uno spazio per decodificare il rapporto tra la propria identità emotiva e la voce timbrica del proprio strumento. Perché quando suoniamo, trasmettiamo a chi ascolta esattamente la qualità del nostro sentire.»

---

### SCENA 5 (3:15 - 4:15 · 60s) · La Mappa Visiva e la Galassia (Panel 06 & Report)

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `06`
- **Eyebrow**: `UNA MAPPA VISIVA DELLA STRUTTURA EMOTIVA` (colore `#fbbf62`)
- **Titolo**: Cosa ottieni alla fine: I Quattro Rapporti e la Galassia
- **Testo a schermo**:
  ```text
  I QUATTRO RAPPORTI:
  1. La Natura di Base       → La cifra affettiva primaria
  2. Il Rapporto con Sé      → Il dialogo interiore e la memoria
  3. Il Rapporto con l'Altro → Accoglienza, difesa o empatia sociale
  4. Il Rapporto con l'Agire → Determinazione e volontà nell'azione

  + LA GALASSIA DEL REPORT: Navigazione interattiva del proprio mondo interiore
  ```
- **Visual Mockup**: **Mockup reale del Report TST**:
  - Le 4 card di `QuattroRapporti.jsx`
  - A schermo intero la mappa stellare di `GalassiaView.jsx` con le costellazioni semantiche e il box interprete del "Computerino".

#### Copione dello Speaker (Tempo: 60 secondi · ~130 parole)
> «Cosa si riceve alla fine del percorso?  
> Non un freddo punteggio, ma una mappa viva basata su quelli che Franco Mussida chiama **I Quattro Rapporti**:  
> - La **Natura di Base**: la disposizione primaria da cui scaturisce il nostro sentire;  
> - Il **Rapporto con Se Stesso**: la qualità del dialogo con la propria solitudine;  
> - Il **Rapporto con l'Altro**: come ci poniamo istintivamente nelle relazioni sociali;  
> - Il **Rapporto con l'Agire**: l'energia con cui trasformiamo il sentire in azione nel mondo reale.  
> E come vedete a schermo, il report culmina nella **Galassia Emotiva**: un ambiente cosmico e interattivo dove la persona può navigare tra le parole delle proprie emozioni, comprendere dove sono le proprie risorse, dove si annidano le difese e dare finalmente un nome e una forma a ciò che prova.»

---

### SCENA 6 (4:15 - 5:00 · 45s) · Outro: La Musica per Conoscersi

#### Elementi a Schermo (Stile Landing TST)
- **Numero a contorno**: `TST`
- **Eyebrow**: `LA PROCEDURA, LO STUDIO E LA BIBLIOGRAFIA` (colore `#f9a8d4`)
- **Titolo**: Riconoscere chi siamo attraverso il suono
- **Testo a schermo**:
  ```text
  «La Musica non ha bisogno dell'Uomo per esistere;
  ma l'Uomo ha profondamente bisogno della Musica per conoscersi.»
  — Franco Mussida

  BIBLIOGRAFIA: La Musica Ignorata (2013) · Le Chiavi Nascoste (2016) · Il Pianeta della Musica (Salani, VI ed.)

  PROVA IL TST SUBITO:
  Postazioni nel foyer con cuffie · Accesso da smartphone: app.tstmusic.it
  ```
- **Visual Mockup**: Schermata finale della Landing con il pulsante `.tst-nebula-btn` ("AVVIA IL TEST") e un grande QR Code nitido inquadrabile dai presenti.

#### Copione dello Speaker (Tempo: 45 secondi · ~95 parole)
> «Vogliamo concludere con la frase che riassume l'intera opera di Franco Mussida:  
> *«La Musica nella fisica dell'universo esisterebbe anche senza l'Uomo; ma l'Uomo ha un disperato bisogno della Musica per imparare a conoscere se stesso.»*  
> Nel foyer troverete le postazioni con tablet e cuffie dedicate, oppure potete inquadrare subito il QR code con il vostro telefono.  
> Vi invitiamo a regalarvi trenta minuti, mettervi le cuffie, ascoltare i 72 passi e guardare negli occhi la forma della vostra identità emotiva.  
> Grazie a tutti e buon ascolto.»
