/**
 * Ascolto emotivo consapevole — i cinque elementi del codice musicale
 * (Terra/Acqua/Aria/Luce/Calore, corrispondenti a Timbro/Ritmo/Melodia/
 * Intervallo/Armonia) con gli esempi di ascolto a due poli indicati
 * dall'autore. Fonte: "Il Pianeta della Musica" di Franco Mussida,
 * capitolo "Metodo per l'Ascolto emotivo consapevole".
 *
 * Contenuto non legato alla famiglia emotiva del singolo utente: è lo
 * stesso esercizio di ascolto proposto dal libro a qualunque lettore,
 * quindi resta invariato indipendentemente dal risultato del test.
 */

export const ASCOLTO_INTRO =
  'Un metodo per allenare l’ascolto emotivo: cinque elementi del suono, ciascuno raccontato attraverso due brani reali agli estremi opposti di una stessa sensazione.'

export const ELEMENTI_ASCOLTO = [
  {
    key: 'terra',
    elemento: 'Terra sonora',
    dimensione: 'Timbro',
    definizione:
      'La sostanza vibrante del suono: l’identità timbrica di strumenti, voci ed elementi naturali. È il terreno su cui si misurano leggerezza, pesantezza, spessore e densità.',
    domande: [
      'Questa musica ti dà un senso di peso, ti porta a riflettere?',
      'Oppure ti fa sentire sospeso e leggero, con un senso di sorridente libertà?',
      'Ti fa entrare dentro di te o ti porta fuori?',
    ],
    poli: [
      {
        direzione: 'Verso la leggerezza',
        artista: 'Nicola Piovani',
        brano: 'Nel pancione della tv',
        sintesi:
          'Un flusso gentile e liscio, timbri ariosi passati di mano tra tanti strumenti d’aria. Nasce un disteso senso d’ironia, un sorriso appena accennato — che nella seconda parte lascia affiorare una tristezza delusa.',
      },
      {
        direzione: 'Verso pesantezza e profondità',
        artista: 'Paco de Lucía',
        brano: 'María de La O',
        sintesi:
          'Il flusso porta verso l’interno, verso la riflessione, ma con gentilezza — le corde accarezzate più che percosse. Un profondo senso di fiducia tra musicisti, dove la malinconia si vive anche con piacere e gioia.',
      },
    ],
  },
  {
    key: 'acqua',
    elemento: 'Acqua sonora',
    dimensione: 'Ritmo',
    definizione:
      'Il senso del tempo che scorre: la manifestazione del ritmo. Muove le emozioni con più o meno velocità, verso il basso e l’interiorità con la lentezza, verso il fuori con la velocità.',
    domande: [
      'Cosa ti dà istintivamente lo scorrere di questo flusso sonoro?',
      'A che movimento lo accosti: un ruscello, un fiume lento, un lago, un mare?',
      'Il ritmo ti porta verso il riposo o verso l’eccitazione?',
    ],
    poli: [
      {
        direzione: 'Verso la lentezza',
        artista: 'Mark Knopfler',
        brano: 'Wild Theme',
        sintesi:
          'Uno spirito ritmico calmo e riposante, un tempo lento che si lascia contemplare come un grande fiume osservato da lontano — con momenti di accelerazione negli arpeggi che increspano appena la superficie.',
      },
      {
        direzione: 'Verso la velocità',
        artista: 'Johann Sebastian Bach',
        brano: 'Variazione Goldberg n° 6 (Glenn Gould)',
        sintesi:
          'Due piani sonori limpidi e brillanti che si rincorrono in parallelo, come le correnti di un ruscello allegro che gira intorno agli ostacoli. Una velocità costante, gioiosa ed esaltante.',
      },
    ],
  },
  {
    key: 'aria',
    elemento: 'Aria sonora',
    dimensione: 'Melodia',
    definizione:
      'Il flusso monofonico che, suono per suono, racconta: la melodia si muove nello spazio fisico ed emotivo come il vento, tracciando linee che restano impresse nella memoria.',
    domande: [
      'Che sensazione ti fa sorgere l’ascolto: ti senti fermo e coraggioso, o eccitato ed esaltato?',
      'Ti porta in una dimensione epica?',
      'Che tipo di energia senti uscire dalla musica?',
    ],
    poli: [
      {
        direzione: 'Verso la fermezza gioiosa',
        artista: 'Bill Conti',
        brano: 'Gonna Fly Now (Rocky)',
        sintesi:
          'Una melodia che guarda avanti, verso l’epicità della speranza di un domani gioioso — una vittoria viscerale, del corpo e della fatica, che si scioglie in fierezza coraggiosa e sorridente.',
      },
      {
        direzione: 'Verso la fermezza nostalgica',
        artista: 'Kenny G',
        brano: 'You Raise me Up',
        sintesi:
          'La stessa fermezza, ma rivolta in alto, con un velo di nostalgia — un’epicità intima che può commuovere nel ricordo di una vita difficile ormai superata: la vittoria dei sentimenti positivi.',
      },
    ],
  },
  {
    key: 'luce',
    elemento: 'Luce sonora',
    dimensione: 'Intervallo',
    definizione:
      'Il movimento della luce interiore, legato agli intervalli armonici: più la dimensione luminosa si accende, più ci si avvicina alla speranza e alla serenità; più scema verso l’ombra, più cresce l’inquietudine.',
    domande: [
      'Questa musica ti restituisce spazi aperti o spazi chiusi?',
      'Senti un’atmosfera di luce diretta, o più una luce riflessa?',
      'Ti fa sentire in contatto con la natura o con l’intimità?',
    ],
    poli: [
      {
        direzione: 'Verso la solarità',
        artista: 'Max Steiner',
        brano: 'Theme From a Summer Place',
        sintesi:
          'Una melodia semplice suonata in alto dagli archi, senza mai toccare terra: la sensazione di un orizzonte marino, del sole che accarezza e consola — luce diretta che accompagna e sveglia.',
      },
      {
        direzione: 'Verso la lunarità',
        artista: 'Chet Baker',
        brano: 'Almost Blue',
        sintesi:
          'La tromba esplora le zone più basse della melodia, un procedere nell’ombra caldo e sospeso. Una luce riflessa, intima e malinconico-nostalgica, che cerca un posto per fermarsi.',
      },
    ],
  },
  {
    key: 'calore',
    elemento: 'Calore sonoro',
    dimensione: 'Armonia',
    definizione:
      'Una forza etica finissima, impercettibile: il dualismo tra il senso dell’Io e il senso del Noi. In musica il Tutto da contemplare è l’armonia — trasmetterla è compito di chi scrive e di chi insegna.',
    domande: [
      'Dove ti portano eticamente queste due musiche?',
      'Senti un calore più egoico, o più sociale?',
      'Cosa ti incitano a fare?',
    ],
    poli: [
      {
        direzione: 'Verso un’etica del Noi interiore',
        artista: 'Johann Sebastian Bach',
        brano: 'Suite n° 3, Aria sulla quarta corda (Swingle Singers)',
        sintesi:
          'Un calore interiore, un’immagine pura dell’energia emotiva — una gentilezza consolatrice che pare esistere da sempre, come lievito madre di ogni sentire: compassione, dedizione, venerazione.',
      },
      {
        direzione: 'Verso un’etica del Noi sociale',
        artista: 'Maurice Ravel',
        brano: 'Bolero',
        sintesi:
          'Un racconto che cresce, di mano in mano, di strumento in strumento, fino a farsi imponente — un cammino comune, un’umanità che lavora e si sostiene, in cerca di un futuro da costruire insieme.',
      },
    ],
  },
]
