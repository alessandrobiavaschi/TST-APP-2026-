/**
 * Sezione Musicisti — sintesi del rapporto tra famiglia emotiva e Musica.
 *
 * Chiavi famiglia: Blu | Verde | Giallo | Rosso | Grigio
 */

export const MUSICISTI_INTRO =
  'Una lettura musicale della famiglia emotiva emersa dal test: ascolto, suono, composizione e interpretazione come modi di organizzare l’esperienza.'

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
    cosaCerca:
      'La famiglia malinconica tende a cercare profondità, sfumature, memoria emotiva e introspezione. La musica diventa spesso uno spazio in cui osservare ciò che è complesso, fragile o difficile da esprimere a parole.',
    linguaggioMusicale: {
      timbri:
        'Timbri medi e scuri, corposi e pastosi: oboi, clarinetti, violoncelli, contrabbassi, arpa, pianoforte morbido e chitarre dal suono ampio.',
      ritmo:
        'Cadenze fantasiose e non violente, spesso tra Andante e ballad, con ritmi presenti ma non invasivi.',
      melodiaArmonia:
        'Melodie anche complesse, modi minori, accordi larghi, cambi armonici e intervalli che evocano interiorità.',
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
    label: 'Calma',
    cosaCerca:
      'La famiglia calma tende a cercare riposo, armonia, delicatezza e continuità. La musica diventa spesso un luogo in cui sentirsi sostenuti, respirare con gli altri e abitare un clima sonoro senza dover forzare l’esposizione.',
    linguaggioMusicale: {
      timbri:
        'Timbri scuri, quieti e medio-bassi: corni, fagotti, flauti morbidi, marimba, arpa, chitarra classica e legni dal suono naturale.',
      ritmo:
        'Cadenze dolci, Adagio o Andante, Easy Listening e ritmi delicati; meno adatti i ritmi rapidi, aggressivi o troppo eccitati.',
      melodiaArmonia:
        'Melodie rarefatte, poche note, armonie sospese, toniche e quinte, senza bruschi cambi di tonalità.',
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
    label: 'Entusiastica',
    cosaCerca:
      'La famiglia entusiastica tende a cercare energia, movimento, luce e partecipazione immediata. La musica diventa spesso una spinta vitale: qualcosa che accende il corpo, porta fuori da sé e invita a cantare, ballare o condividere.',
    linguaggioMusicale: {
      timbri:
        'Timbri chiari, luminosi, brillanti e decisi: percussioni, trombe, violini, celesta, vibrafono, canto ed elettronica popolare.',
      ritmo:
        'Ritmo accentuato, ripetitivo ma curioso, con tempi Allegro intorno a 110-160 bpm e forte senso di movimento.',
      melodiaArmonia:
        'Melodie chiare, riconoscibili e cariche, atmosfere armoniche semplici, positive, solari e spesso in modo maggiore.',
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
    label: 'Volitiva',
    cosaCerca:
      'La famiglia volitiva tende a cercare forza, direzione, concretezza e controllo dell’energia. La musica diventa spesso un campo di prova: un luogo in cui restare svegli, governare il tempo, riconoscere struttura e misurarsi con intensità.',
    linguaggioMusicale: {
      timbri:
        'Timbri medi, decisi, fermi, squillanti o ruvidi: sax, trombe, tromboni, viole, percussioni, pianoforte e tastiere.',
      ritmo:
        'Tempi forti e costanti, spesso vicini al Rock, intorno a 90-130 bpm, con sonorità chiare e leggibili.',
      melodiaArmonia:
        'Melodie memorabili, frammenti brevi e intensi, unisoni potenti, scale meno consuete e intervalli duri.',
    },
    fareMusica: {
      suonare:
        'Tende a dirigere, suonare da solo o governare l’interplay. Pianoforte e batteria rappresentano bene controllo e ritmo.',
      comporre:
        'Cerca strutture incisive, unisoni forti e climi che mantengano attivazione, evitando ripetitività eccessiva.',
      interpretare:
        'Legge ed esegue con sicurezza, osserva criticamente l’interpretazione e ama passaggi brevi, chiari e intensi.',
    },
    valorizza: [
      'Incisività, organizzazione e direzione.',
      'Lettura, esecuzione e controllo ritmico.',
      'Memoria melodica e impatto timbrico.',
      'Testi chiari e aspetti interpretativi solidi.',
    ],
    difficolta: [
      'Lasciarsi andare nell’improvvisazione musicale può essere difficile.',
      'Minimalismo e ripetitività possono essere poco tollerati.',
      'L’ascolto può diventare molto razionale e analitico.',
    ],
    paroleChiave: [
      'forza',
      'direzione',
      'ritmo',
      'controllo',
      'incisività',
      'memoria',
      'struttura',
    ],
  },

  Grigio: {
    label: 'Anaffettiva',
    cosaCerca:
      'La famiglia anaffettiva tende a cercare distanza, sospensione, dubbio e osservazione. La musica viene vissuta come un territorio ambiguo e mentale, capace di stare tra dentro e fuori senza consegnarsi subito a una risposta emotiva netta.',
    linguaggioMusicale: {
      timbri:
        'Il materiale disponibile non indica una tavolozza strumentale stabile: il centro è la qualità sospesa, fredda o ambigua del suono più che una famiglia timbrica specifica.',
      ritmo:
        'Il ritmo non è il primo criterio: conta di più la sensazione di sospensione, distanza e instabilità percettiva.',
      melodiaArmonia:
        'Emergono la quarta, la quarta eccedente e il tritono, con richiami a Rock Metal e Blues come luoghi di ambiguità e tensione.',
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
