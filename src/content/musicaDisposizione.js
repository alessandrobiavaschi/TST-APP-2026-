/**
 * Sezione Musicisti — sintesi del rapporto tra famiglia emotiva e Musica.
 *
 * Chiavi famiglia: Blu | Verde | Giallo | Rosso | Grigio
 */

export const MUSICISTI_INTRO =
  'Una lettura musicale della famiglia emotiva emersa dal test: ascolto, suono, composizione e interpretazione come modi di organizzare l’esperienza.'

/**
 * Passaggi tecnici spostati dai quattro capitoli del profilo alla lettura
 * For Musicians. Restano separati dal racconto umano ed esperienziale.
 */
export const MUSICISTI_APPROFONDIMENTO = {
  Blu: [
    'Nelle canzoni predilige ritmi non invasivi con testi a carattere poetico o umanistico riflessivo; cerca ascolti che lo riempiano intimamente facendogli vivere con sincerità la dimensione emozionale.',
    'Il musicista malinconico ama interpretare e comporre più che eseguire, leggere o improvvisare. Vive con grande piacere il bel suono, è particolarmente sensibile alla liricità, alle interpretazioni sentite, ricche di dinamiche. La Musica lo coinvolge più emotivamente che intellettualmente.',
    'I piaceri del temperamento malinconico quando ascolta Musica sono quelli di subire il fascino della melodia e degli intervalli, attraverso i quali si gode ogni tipo di stato d’animo e ci si riflette sopra. Cerca una Musica profonda, adatta a mettere in movimento il suo mondo interiore.',
  ],
  Verde: [
    'Adora composizioni con pochi strumenti e ricerca atmosfere e climi armonici in cui potersi rilassare, lasciarsi andare al mondo del sogno. Cerca atmosfere larghe senza concitazione e, nelle canzoni, predilige melodie rarefatte con poche note e molto clima armonico.',
    'Il musicista flemmatico ama molto ascoltare e suonare con gli altri, esegue e legge volentieri con meticolosità le parti che gli assegnano. La sua propensione a contemplare, a vivere l’armonia sognando, lo rende adatto a stare in gruppi.',
    'Quando ascolta Musica preferisce non pensare: proprio per questo è scarsamente interessato al testo. Subisce in modo speciale il fascino dell’armonia, che lo guida alla calma, e cerca la sensazione del riposo anche durante il giorno.',
  ],
  Giallo: [
    'Adora composizioni con melodie chiare e riconoscibili che non inducano a riflettere troppo, ma piuttosto a dare carica, con ritmi accentuati; l’importante è che la melodia non sia sempre uguale, altrimenti si annoierebbe.',
    'Quando ascolta Musica gli risulta difficile non muoversi, e ha quindi un atteggiamento molto coinvolto, proiettato verso l’esterno. È interessato al testo della canzone, soprattutto se trova la storia simpatica, ma è il fascino del ritmo a coinvolgerlo di più. È sempre alla ricerca di novità, di suoni mai sentiti: si potrebbe dire che gli va bene tutto pur di muoversi.',
  ],
  Rosso: [],
  Grigio: [],
}

export const MUSICISTI_SCHEDA_KEYS = [
  { key: 'cosaCerca', label: 'Cosa cerca nella Musica' },
  { key: 'linguaggioMusicale', label: 'Linguaggio musicale' },
  { key: 'fareMusica', label: 'Modi di fare Musica' },
  { key: 'valorizza', label: 'Cosa valorizza' },
  { key: 'difficolta', label: 'Possibili difficoltà' },
  { key: 'paroleChiave', label: 'Parole chiave' },
]

export const MUSICISTI_SCHEDE = {
  Blu: {
    label: 'Malinconica',
    profiloEmotivo:
      'Ciò che contraddistingue il temperamento malinconico è il piacere di stare con sé stessi, dell’introversione, di osservarsi interiormente, di riflettere su ciò che si è vissuto.',
    cosaCerca:
      'La famiglia malinconica tende a cercare profondità, sfumature, memoria emotiva e introspezione. La musica diventa spesso uno spazio in cui osservare ciò che è complesso, fragile o difficile da esprimere a parole.',
    piaceriAscolto:
      'Subisce in modo speciale il fascino della melodia e degli intervalli attraverso i quali si gode ogni tipo di stato d’animo e ci riflette sopra. Cerca una Musica profonda, adatta a mettere in movimento il suo mondo interiore. Si interessa allo sposalizio che il suono celebra con i sentimenti e riflette in modo meno istintivo sugli effetti che provoca.',
    linguaggioMusicale: {
      timbri:
        'Timbri medi e scuri, corposi e pastosi: oboi, clarinetti, violoncelli, contrabbassi, arpa, pianoforte morbido e chitarre dal suono ampio.',
      ritmo:
        'Cadenze fantasiose e non violente, spesso tra Andante e ballad, con ritmi presenti ma non invasivi.',
      melodiaArmonia:
        'Melodie anche complesse, modi minori, accordi larghi, cambi armonici e intervalli che evocano interiorità.',
    },
    intervalli: {
      correnti: [
        {
          nome: 'Corrente emotiva malinconica lunare',
          intervallo: 'Terza minore',
          significato:
            'La Malinconia lunare è vista come una forza emotiva che opera nel chiuso dell’interiorità e agisce su una visione riflessa dell’esperienza emotiva. La paura si trasforma in timore e nella tristezza di non potersi liberare da quel vivere al chiuso, dove la luce delle esperienze di relazione arriva solo di riflesso.',
          stati: ['Pensieroso', 'Triste', 'Timido', 'Pessimista', 'Preoccupato', 'Demotivato', 'Amareggiato', 'Ombroso', 'Sconfortato', 'Scoraggiato', 'Scombussolato', 'Vergognoso', 'Cupo', 'Fosco', 'Turbato', 'Lunatico', 'Lamentoso'],
        },
        {
          nome: 'Corrente emotiva della nostalgia solare e lunare',
          intervallo: 'Settima minore e maggiore',
          significato:
            'Le forze emotive del temperamento nostalgico fanno vivere un’esperienza simile alla malinconia lunare, dalla quale riprendono il senso del dolore interiore. Qui però il dolore nasce da una perdita, da un senso di mancanza, dal sentirsi soli o abbandonati. La nostalgia può diventare rimpianto oppure riconoscenza verso ciò che si è ricevuto.',
          stati: ['Rimpiangente', 'Afflitto', 'Straziato', 'Rammaricato', 'Desolato', 'Disperato', 'Sconsolato', 'Mortificato', 'Abbandonato', 'Nostalgico', 'Compassionevole', 'Accorato', 'Rimembrante', 'Desiderante', 'Riconoscente', 'Grato'],
        },
        {
          nome: 'Corrente emotiva della malinconia solare',
          intervallo: 'Terza maggiore',
          significato:
            'La Malinconia solare opera nello spazio interiore ma, diversamente dalla Malinconia lunare rivolta al passato, cerca di aprire una breccia verso il mondo. Da questa apertura nasce un clima positivo legato alla speranza, alla serenità e alla fiducia nel futuro.',
          stati: ['Ottimista', 'Aperto', 'Sereno', 'Positivista', 'Buono', 'Simpatico', 'Meravigliato', 'Benevolente', 'Lieto', 'Leggero', 'Mite', 'Contento', 'Chiaro', 'Compassionevole', 'Fiducioso', 'Solidale', 'Speranzoso', 'Affettuoso', 'Pietoso'],
        },
      ],
    },
    fareMusica: {
      suonare:
        'Cura il bel suono, appiana le ruvidità e cerca dinamiche espressive, con una relazione intima con lo strumento.',
      comporre:
        'Predilige la composizione rispetto all’esecuzione o all’improvvisazione, spesso con pochi strumenti e atmosfere raccolte.',
      interpretare:
        'Dà valore a sincerità interpretativa, liricità e capacità di far sentire una verità emotiva.',
    },
    valorizza: [
      'Profondità espressiva e memoria emotiva.',
      'Bel suono, dinamiche e liricità.',
      'Composizione e interpretazione sentita.',
      'Voce come suono, soprattutto quando il testo è esistenziale.',
    ],
    difficolta: [
      'Danza e movimento fisico possono risultare sfidanti.',
      'La composizione e l’interpretazione tendono a prevalere su lettura o improvvisazione.',
      'Suoni troppo brillanti, metallici o superficiali possono irrigidire l’ascolto.',
    ],
    paroleChiave: [
      'profondità',
      'introspezione',
      'liricità',
      'dinamiche',
      'memoria',
      'interpretazione',
      'sensibilità',
    ],
  },

  Verde: {
    label: 'Flemmatica',
    profiloEmotivo:
      'Ciò che contraddistingue il temperamento flemmatico è il piacere della lentezza, del silenzio, della calma, del riposo e della contemplazione.',
    cosaCerca:
      'La famiglia flemmatica tende a cercare riposo, armonia, delicatezza e continuità. La musica diventa spesso un luogo in cui sentirsi sostenuti, respirare con gli altri e abitare un clima sonoro senza dover forzare l’esposizione.',
    piaceriAscolto:
      'Subisce in modo speciale il fascino dell’armonia, che lo guida alla calma. Cerca la sensazione del riposo anche durante il giorno. Sente, vive le proprie funzioni vitali come il respiro e il battito costante del cuore che gli portano benessere e rilassatezza. Utilizza il suono come strumento per allontanarsi da tutto ciò che porta frenesia, è alla costante ricerca del piacere consolatorio.',
    linguaggioMusicale: {
      timbri:
        'Timbri scuri, quieti e medio-bassi: corni, fagotti, flauti morbidi, marimba, arpa, chitarra classica e legni dal suono naturale.',
      ritmo:
        'Cadenze dolci, Adagio o Andante, Easy Listening e ritmi delicati; meno adatti i ritmi rapidi, aggressivi o troppo eccitati.',
      melodiaArmonia:
        'Melodie rarefatte, poche note, armonie sospese, toniche e quinte, senza bruschi cambi di tonalità.',
    },
    intervalli: {
      correnti: [
        {
          nome: 'Corrente emotiva della calma flemmatica',
          intervallo: 'Quinta e quinta eccedente',
          significato:
            'La corrente flemmatica richiama un vento gentile, calmo e contemplativo, simile all’occhio del ciclone dove ogni movimento si placa. È la sensazione della pausa, della bonaccia, della leggerezza del non movimento e di un equilibrio quasi perfetto. Nel rapporto con sé stessi, il flemmatico ama riposare e contemplare e orienta questa energia verso un clima di calma e di equilibrio affettivo.',
          stati: ['Rilassato', 'Calmo', 'Gentile', 'Disteso', 'Pacato', 'Placido', 'Pacifico', 'Tranquillo', 'Estatico', 'Serafico', 'Contemplativo', 'Sognante', 'Equilibrato', 'Quieto', 'Tollerante', 'Mistico', 'Prudente', 'Meditativo', 'Ammirato', 'Annoiato', 'Pigro', 'Oziante', 'Svampito', 'Indolente', 'Ignavo'],
        },
      ],
    },
    fareMusica: {
      suonare:
        'Sta bene nel gruppo, accompagna con cura e legge le parti con meticolosità, soprattutto in insiemi timbrici delicati.',
      comporre:
        'Predilige pochi strumenti, climi armonici distesi e atmosfere in cui potersi rilassare o lasciar andare.',
      interpretare:
        'Interpreta con discrezione, privilegiando equilibrio, ascolto reciproco e continuità del respiro musicale.',
    },
    valorizza: [
      'Armonia, morbidezza e senso di riposo.',
      'Lavoro di gruppo e accompagnamento.',
      'Precisione nella lettura e cura del dettaglio.',
      'Atmosfere timbriche delicate e non invadenti.',
    ],
    difficolta: [
      'L’improvvisazione esposta può creare imbarazzo.',
      'Ritmi rapidi, eccitati o fisicamente insistenti possono affaticare.',
      'La centralità scenica e il forte protagonismo non sono il territorio più naturale.',
    ],
    paroleChiave: [
      'armonia',
      'riposo',
      'delicatezza',
      'gruppo',
      'accompagnamento',
      'meticolosità',
      'sogno',
    ],
  },

  Giallo: {
    label: 'Entusiasta',
    profiloEmotivo:
      'Ciò che contraddistingue la natura gioioso-sanguinica è il piacere del movimento, della curiosità, della scoperta del nuovo, dell’estroversione.',
    cosaCerca:
      'La famiglia entusiastica tende a cercare energia, movimento, luce e partecipazione immediata. La musica diventa spesso una spinta vitale: qualcosa che accende il corpo, porta fuori da sé e invita a cantare, ballare o condividere.',
    piaceriAscolto:
      'Subisce in modo speciale il fascino del ritmo, al quale risponde con naturalezza, muovendosi a tempo. Predilige il movimento fisico. Si mette in gioco con spontaneità filtrando la brillantezza e la positività della Musica. Preferisce avere un ruolo musicale attivo e gli capita quindi di cantare senza farsi minimamente domande sul risultato. L’importante è che possa esprimere il suo entusiasmo. Danzare non lo spaventa: è il suo pane.',
    linguaggioMusicale: {
      timbri:
        'Timbri chiari, luminosi, brillanti e decisi: percussioni, trombe, violini, celesta, vibrafono, canto ed elettronica popolare.',
      ritmo:
        'Ritmo accentuato, ripetitivo ma curioso, con tempi Allegro intorno a 110-160 bpm e forte senso di movimento.',
      melodiaArmonia:
        'Melodie chiare, riconoscibili e cariche, atmosfere armoniche semplici, positive, solari e spesso in modo maggiore.',
    },
    intervalli: {
      correnti: [
        {
          nome: 'Corrente della gioia e dell’entusiasmo',
          intervallo: 'Sesta',
          significato:
            'L’Entusiasmo è descritto come un flusso emotivo gioioso, pervaso di solarità e calore. Nel rapporto con sé stessi orienta l’energia verso il mondo, avventurandosi con curiosità e alimentando il piacere di uscire da sé per abbracciare persone, natura, oggetti e attività nuove.',
          stati: ['Gioioso', 'Cinetico', 'Vivace', 'Veloce', 'Vitale', 'Fluido', 'Allegro', 'Felice', 'Festoso', 'Entusiasta', 'Esaltato', 'Ardente', 'Euforico', 'Caloroso', 'Reattivo', 'Curioso', 'Volitivo', 'Dinamico', 'Esuberante', 'Solare', 'Positivista', 'Irrefrenabile'],
        },
        {
          nome: 'Continente dell’entusiasmo volitivo passionale',
          intervallo: 'Prima',
          significato:
            'La Prima è associata all’Entusiasmo volitivo passionale: una forma di partecipazione intensa in cui l’energia entusiasta acquista calore, slancio e adesione. Gli stati collegati descrivono il passaggio dall’ammirazione alla passione e alla veemenza.',
          stati: ['Innamorato', 'Amorevole', 'Ammirato', 'Appassionato', 'Infuocato', 'Ardente', 'Impetuoso', 'Veemente', 'Deferente', 'Illuminato'],
        },
      ],
    },
    fareMusica: {
      suonare:
        'Ama suonare in gruppo, guidare l’interplay e portare avanti l’energia del tempo.',
      comporre:
        'Cerca melodie dirette, ritmi accentuati e variazioni sonore capaci di tenere viva curiosità e carica.',
      interpretare:
        'Interpreta in modo estroverso, fisico e partecipato, dando valore a gioia espressiva e condivisione.',
    },
    valorizza: [
      'Ritmo, movimento e immediatezza.',
      'Canto spontaneo e melodie riconoscibili.',
      'Energia di gruppo e capacità di trascinare.',
      'Novità timbriche, sonorità elettroniche e brillantezza.',
    ],
    difficolta: [
      'La melodia troppo uguale può annoiare.',
      'La pulsazione può prevalere sulla profondità timbrica.',
      'Quando l’energia è in eccesso, il tempo può correre in avanti.',
    ],
    paroleChiave: [
      'energia',
      'ritmo',
      'canto',
      'movimento',
      'brillantezza',
      'gruppo',
      'novità',
    ],
  },

  Rosso: {
    label: 'Marziale',
    introMusicale:
      `Una lettura musicale della famiglia Marziale emersa dal test presuppone un caratteristico modo di percepire il timbro e di esprimere il suono. Ma coinvolge anche il gusto compositivo, il modo di interpretare e organizzare l’esperienza musicale.`,
    profiloEmotivo:
      `La propensione volitiva, che spesso si lega a quella razionale, gli fa apprezzare l’esecuzione quando è precisa e rigorosa. Se non gli vengono in aiuto lampi di malinconia, fatica invece ad interpretare a suo modo una esecuzione. Come musicista è molto organizzato, non abbonda di fantasia, per questo fatica a «lasciarsi andare»; legge solitamente bene. La sua propensione razionale gli fa apprezzare istintivamente l’improvvisazione, che segue con piacere, ma più come ascoltatore che esecutore.`,
    cosaCerca:
      `È solitamente un musicista ben organizzato, ma pensare di dover sempre fare la cosa giusta alimenta la fatica a «lasciarsi andare». La Musica lo coinvolge più mentalmente che fisicamente o sentimentalmente. Riserva molta attenzione ai concetti espressi dal testo. Ciò che contraddistingue le qualità del temperamento volitivo, collerico è il piacere del fare. Per chi ama suonare o cantare significa fare Musica: mettersi alla prova con sé stesso e con il pubblico, realizzare ciò che si desidera nei modi che decide lui e a cui ambisce, vivere il piacere di governarsi e governare.`,
    piaceriAscolto:
      `Chi appartiene alla famiglia Marziale tende a dare concretezza e direzione all’energia della Musica, farla avvivare con forza e convinzione agli ascoltatori. È poco disposto ad abbracciare l’elemento sognante, spesso molto potente specie nelle composizioni per malinconici. Preferisce misurarsi con l’incisività, la potenza e l’intensità. La sua natura volitivo-collerica sente la Musica come occasione per vivere il qui e ora, per restare lucidi e desti. La voce e il pianoforte sono i due strumenti di riferimento della famiglia Marziale. Il primo rimarca la volontà di voler gestire lo strumento degli strumenti, lo strumento dell’essere umano per eccellenza. Il secondo è il grande gestore e organizzatore dei suoni, non solo nella versione acustica ma anche nell’infinito mondo delle tastiere.`,
    pullQuote: {
      titolo: 'Il piacere del fare',
      testo:
        `Per chi ama suonare o cantare significa fare Musica: mettersi alla prova con sé stesso e con il pubblico, realizzare ciò che si desidera nei modi che decide lui e a cui ambisce, vivere il piacere di governarsi e governare.`,
    },
    linguaggioMusicale: {
      timbri:
        `Chi appartiene alla famiglia Marziale predilige Timbri che si posizionano al centro dello spettro sonoro. Timbri medi, decisi, incisivi, fermi e poco modulanti. Non sente particolari fastidi rispetto alle tante diverse qualità e colori timbrici. Accetta bene sia quelle squillanti che ruvidi o sordi, l’importante è che mostrino viva personalità. A titolo esplicativo ma non esaustivo oltre a quelle emesse dalla voce e dal pianoforte, si possono inserire sax, trombe, tromboni. Tra le corde le viole, tra le percussioni la batteria specie il rullante e i tom.`,
      ritmo:
        `La famiglia dei Marziali predilige tempi forti e costanti, intorno a 100 / 130 bpm. Ama la Musica con i piedi per terra, dalle sonorità chiare e leggibili. Tra Battere e Levare, i due elementi essenziali che costituiscono lo scandire fantasioso del ritmo, separati da un elemento centrale, orizzontale di silenzio, l’assertivo, il volitivo, predilige il Battere ma ama anche farsi spiazzare.`,
      melodiaArmonia:
        `L’assertivo collerico subisce il fascino della melodia che memorizza con facilità così come i testi. Predilige melodie memorabili, frammenti anche brevi ma intensi, unisoni potenti, scale meno consuete e intervalli duri. Così com’è attento e attratto a tutto ciò che musicalmente è consequenziale specie dallo svolgimento delle melodie che, se si sviluppano a mo’ di racconto, ovvero melodie lunghe, segue con intenzione quasi meditativa. Se invece, com’è più consueto oggi, la melodia è fatta di brevi frammenti, la prende e l’accetta con leggerezza come un giochino divertente che colora il tempo in modo positivo ma leggero.`,
    },
    intervalli: {
      intro:
        `La distanza, l’esperienza che si scatena dentro di noi quando elaboriamo la vibrazione simultanea di due suoni uno distante dall’altro, è per il Marziale un preludio di armonia. Percepisce la realtà immaginativa che esce dall’insieme di queste vibrazioni come qualcosa di magico, ma che non lo rassicura, in quanto le tante combinazioni possono evocare tante diverse correnti emotive che fanno sorgere stati d’animo diversi dal suo Mood emotivo.`,
      correnti: [
        {
          intervallo: 'Prima',
          significato:
            `Se la volontà lo rende forte, affidabile, determinato, con la Musica si confronta nello stesso modo, affrontandola con fermezza e, in età adulta, con saggezza.`,
          stati: ['Stabile', 'Saggio', 'Sicuro', 'Fattivo', 'Certo', 'Volitivo', 'Assertivo', 'Indubitabile', 'Saldo', 'Fermo', 'Fiero', 'Schietto', 'Sincero', 'Franco', 'Decisionista', 'Risoluto', 'Irritabile', 'Calcolatore', 'Combattivo', 'Caparbio', 'Perseverante', 'Collerico'],
        },
      ],
    },
    fareMusica: {
      suonare:
        `Quando studia tende a concentrarsi a tener fuori i disturbi esteriori, a ripetere più e più volte le cose che non gli vengono. Ma tende a pensare che la ragione dei suoi errori siano cause tecniche, meccaniche. In pubblico tende a prendersi la scena senza troppi patemi, esegue in modo rigoroso rispetto a ciò che ha programmato e si esprime senza troppa timidezza specie se si sente sicuro. Ma a volte rischia di concentrarsi troppo su sé stesso e ad ascoltare poco chi ha attorno. Nello stesso tempo il suo spirito organizzativo, specie se suona tastiere e pianoforte, lo stimola e spinge a dirigere e a governare lui stesso l’interplay. In un gruppo musicale il Collerico-Volitivo ha un ruolo determinante per il raggiungimento degli obiettivi concreti.`,
      interpretare:
        `Chi appartiene alla Famiglia Marziale tende a leggere la Musica e ad apprendere le regole teorico armoniche con una certa facilità. Esegue con sicurezza, osserva criticamente l’interpretazione altrui. Ma quando si tratta di dover interpretare, se non gli vengono in aiuto le propensioni malinconiche e quelle legate all’entusiasmo, si ritrova costretto ad impegnarsi in esecuzioni magari perfette ma che restituiscono rigidità, più che musicalità.`,
      comporre:
        `Chi della famiglia Marziale ha predisposizioni creative considera il tempo della composizione un tempo ben speso. Gli permette di precisare ciò che immagina, all’occorrenza di correggere per unire per bene l’immaginazione con il risultato finale. Nella composizione le regole matematiche per lui sono una guida sicura. Spesso cerca strutture che lo stimolano ad andare fuori dagli schemi. Nel Jazz e nel Pop strumentale una scrittura con misure e tempi irregolari, unisoni.`,
      improvvisare:
        `La tendenza alla precisione e all’organizzazione, a tenere tutto sotto controllo non giocano a favore del temperamento volitivo collerico. In ambito improvvisativo il prodigio della composizione in tempo reale, in fondo questa è l’improvvisazione, si realizza quando la fantasia che nasce da impulsi emotivi, immaginativi, extracognitivi, arrivano d’istinto e trovano immediatamente modo di incarnarsi in suoni. Significa abbandonarsi, entrare in uno stato di flow dove quel controllo non c’è più. Significa connettersi con una immensa banca dati dove soggiorna nella memoria esperienziale di ciascuno il vissuto musicale, dalla conoscenza di scale accordi modulazioni fino a ricordi di esperienze emotive vissute. Il tutto da corroborare mischiando conoscenza passata, scale, accordi con il nuovo, con nuove visioni del suono e tensioni intervallari da sperimentare.`,
    },
    paroleChiave: [
      'forza',
      'direzione',
      'precisione',
      'ritmo',
      'controllo',
      'incisività',
      'memoria',
      'struttura',
    ],
  },

  Grigio: {
    label: 'Razionale',
    profiloEmotivo:
      'Ciò che contraddistingue il temperamento agnostico anaffettivo è il piacere del calcolo, della dubbiosità di origine intellettuale, dell’oggettività fisica.',
    cosaCerca:
      'La famiglia razionale tende a cercare distanza, sospensione, dubbio e osservazione. La sua natura intellettuale-razionale può vivere la musica come un territorio ambiguo e mentale, capace di stare tra dentro e fuori senza consegnarsi subito a una risposta emotiva netta.',
    piaceriAscolto:
      'Ogni cosa viene osservata ma senza vero interesse, con un distacco intellettuale anaffettivo che riduce tutto a qualcosa di banale, di poco appagante, di dissacrante. Si manifesta anch’essa come un piacere, ma è un piacere astratto, intellettuale, che si usa prevalentemente a livello numerico matematico.',
    linguaggioMusicale: {
      timbri:
        'Il materiale disponibile non indica una tavolozza strumentale stabile: il centro è la qualità sospesa, fredda o ambigua del suono più che una famiglia timbrica specifica.',
      ritmo:
        'Il ritmo non è il primo criterio: conta di più la sensazione di sospensione, distanza e instabilità percettiva.',
      melodiaArmonia:
        'La fonte non definisce una preferenza stabile per melodia e armonia: il centro della lettura è la distanza affettiva con cui il suono viene osservato.',
    },
    intervalli: {
      correnti: [
        {
          nome: 'Corrente agnostica anaffettiva',
          intervallo: 'Ottava',
          significato:
            'La corrente agnostica anaffettiva è descritta come un flusso che raffredda affettivamente e agisce in modo trasversale sulle altre aree temperamentali. Il suo centro è la dubbiosità di origine intellettuale: osservazione, calcolo e distacco. Lo stesso impulso può però orientarsi eticamente verso saggezza, dedizione e devozione.',
          stati: ['Anaffettivo', 'Apatico', 'Matematico', 'Lucido', 'Freddo', 'Insensibile', 'Indifferente', 'Nullista', 'Impotente', 'Distaccato', 'Imperturbabile', 'Saggio', 'Dedito', 'Devoto', 'Beato', 'Illuminato'],
        },
      ],
    },
    fareMusica: {
      suonare:
        'Tende a osservare e controllare il materiale sonoro, mantenendo distanza critica più che abbandono emotivo.',
      comporre:
        'Può cercare tensioni sospese, ambiguità armoniche e forme che non risolvono subito il loro significato.',
      interpretare:
        'Interpreta privilegiando lucidità, precisione e ambivalenza, lasciando spazio al dubbio più che all’enfasi affettiva.',
    },
    valorizza: [
      'Sospensione, ambiguità e tensione mentale.',
      'Distanza critica e osservazione del suono.',
      'Intervalli che non si risolvono facilmente.',
      'Linguaggi capaci di attraversare freddezza, dubbio e instabilità.',
    ],
    difficolta: [
      'Il coinvolgimento affettivo può restare trattenuto.',
      'L’esperienza musicale può essere letta in modo molto mentale.',
      'La musica può diventare territorio di dubbio più che di appartenenza.',
    ],
    paroleChiave: [
      'dubbio',
      'sospensione',
      'ambiguità',
      'tritono',
      'distanza',
      'lucidità',
      'instabilità',
    ],
  },
}

/** @deprecated Usare MUSICISTI_SCHEDE — mantenuto per compatibilità import accidentali. */
export const MUSICA_DISPOSIZIONE = MUSICISTI_SCHEDE

/** @deprecated Usare MUSICISTI_INTRO */
export const FORMULA_INTRODUTTIVA = MUSICISTI_INTRO
