/**
 * Report per musicisti — contenuti delle stanze.
 *
 * Fonti di contesto del progetto (testi riformulati in tono aperto, senza
 * aggiungere informazioni): «Climi, stati d'animo, correnti emotive»,
 * «Il Pianeta della Musica» (capitoli «Che Musica predilige…»),
 * «Parole per TST». Gli intervalli delle nature si leggono da config/tstSistema.js;
 * qui sono citati solo quelli su cui le fonti concordano.
 *
 * Chiavi famiglia: Blu | Rosso | Verde | Giallo | Grigio (come profilo.famiglia).
 * `suoni`: numeri dei file audio del test (audio/TST_NN …mp3).
 */

/** Nome di ogni file audio del test, dal nome del file in audio/. */
export const NOMI_SUONI = Object.freeze({
  1: 'Ottavino, oboe, tromba, violino', 2: 'Flauto, clarinetto, corno, viola',
  3: 'Flauto basso, fagotto, trombone, violoncello', 4: 'Triangolo, campana tibetana, celesta, vibrafono',
  5: 'Basso tuba', 6: 'Controfagotto', 7: 'Corno', 8: 'Clarinetto basso', 9: 'Sax', 10: 'Oboe',
  11: 'Tromba', 12: 'Flauto', 13: 'Cassa', 14: 'Djembe', 15: 'Campana tibetana', 16: 'Tabla',
  17: 'Darbuka', 18: 'Chimes', 19: 'Triangolo', 20: 'Rullante', 21: 'Contrabbasso',
  22: 'Basso elettrico', 23: 'Chitarra distorta', 24: 'Violoncello', 25: 'Arpa', 26: 'Viola',
  27: 'Chitarra acustica', 28: 'Violino',
  29: 'Unisono', 30: '2a maggiore', 31: '2a minore', 32: '3a maggiore', 33: '3a minore',
  34: '4a giusta', 35: '4a aumentata', 36: '5a giusta', 37: '6a maggiore', 38: '6a minore',
  39: '7a minore', 40: '7a maggiore', 41: '8a giusta',
  42: 'Groove 57 bpm', 43: 'Groove 77 bpm', 44: 'Groove 105 bpm', 45: 'Groove 150 bpm',
  46: 'Riascolto groove', 47: 'Ritmo ondulato', 48: 'Ritmo binario', 49: 'Ritmo ternario',
  50: 'Ritmo sincopato', 51: 'Riascolto ritmi',
  52: 'Arpa, canone circolare', 53: 'Arpa ascendente maggiore', 54: 'Arpa ascendente minore',
  55: 'Arpa discendente maggiore', 56: 'Arpa discendente minore', 57: 'Arpa a picchi', 58: 'Riascolto arpa',
  59: 'Do → La minore', 60: 'La minore → Do', 61: 'Do → Fa', 62: 'Fa → Do', 63: 'Mi minore → Do',
  64: 'Do → Mi minore', 65: 'La minore → Re minore', 66: 'Re minore → La minore', 67: 'Si diminuito → Do',
  68: 'Mi♭ diminuito settima → Do/Mi', 69: 'Do → Si diminuito', 70: 'Do/Mi → Mi♭ diminuito settima',
  71: 'Do → Sol', 72: 'Sol → Do',
})

/** Stanze disponibili. Le altre (distanze, timbri, tempo…) si aggiungono qui quando sono pronte. */
export const STANZE = Object.freeze([
  {
    id: 'famiglia',
    titolo: 'La famiglia nella musica',
    descrizione: 'Timbri, tempo, armonia e modo di suonare, famiglia per famiglia.',
  },
])

export const ORDINE_FAMIGLIE = Object.freeze(['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio'])

export const FAMIGLIE_MUSICA = Object.freeze({
  Blu: {
    colorKey: 'blu',
    nome: 'Malinconica',
    apertura:
      'Una sensibilità che può trovare piacere nello stare con sé, nell’osservarsi da dentro, nel riflettere su ciò che si è vissuto.',
    sezioni: [
      {
        titolo: 'Timbri',
        testo:
          'Spesso si avvicina a timbri medi che pesano verso il basso, scuri e puliti: oboi, clarinetti, violoncelli, contrabbassi, chitarre dal suono ampio.',
        suoni: [10, 24, 21, 27],
      },
      {
        titolo: 'Tempo',
        testo: 'Tende ad accordarsi con un tempo medio, un Andante intorno ai 60–100 bpm, e con ritmi non invasivi.',
        suoni: [],
      },
      {
        titolo: 'Armonia',
        testo:
          'Può sentirsi a casa nei modi minori, negli accordi larghi a più voci e nei cambi di tonalità. La terza minore è vicina alla natura Lunare Introspettiva; la terza maggiore alla Solare.',
        suoni: [33, 32, 54],
      },
      {
        titolo: 'Suonare',
        testo:
          'Chi suona con questa sensibilità può sentirsi più vicino all’interpretare e al comporre che all’improvvisare, con un’attenzione particolare al bel suono e alle dinamiche.',
        suoni: [],
      },
    ],
  },
  Rosso: {
    colorKey: 'rosso',
    nome: 'Marziale',
    apertura:
      'Una sensibilità che può trovare piacere nel fare, nel realizzare ciò a cui si ambisce, nel mettersi alla prova.',
    sezioni: [
      {
        titolo: 'Timbri',
        testo:
          'Spesso si avvicina a timbri decisi e ruvidi, nella zona centrale ma anche negli estremi: sax, trombe, tromboni, tamburi e rullanti.',
        suoni: [9, 11, 20],
      },
      {
        titolo: 'Tempo',
        testo: 'Tende ad accordarsi con tempi forti e costanti, intorno ai 90–130 bpm.',
        suoni: [44, 48],
      },
      {
        titolo: 'Armonia',
        testo:
          'Può trovare interesse negli unisoni pieni e nelle scale con intervalli duri, come la seconda. La quarta eccedente è vicina alla natura Collerica.',
        suoni: [29, 35],
      },
      {
        titolo: 'Suonare',
        testo:
          'Chi suona con questa sensibilità spesso legge ed esegue con precisione; lasciarsi andare può chiedere un passo in più. Pianoforte e batteria sono gli strumenti che più gli somigliano.',
        suoni: [],
      },
    ],
  },
  Verde: {
    colorKey: 'verde',
    nome: 'Flemmatica',
    apertura: 'Una sensibilità che può trovare piacere nella lentezza, nel silenzio, nella calma e nella contemplazione.',
    sezioni: [
      {
        titolo: 'Timbri',
        testo:
          'Spesso si avvicina a timbri scuri e quieti, nella zona medio-bassa, con suoni ovattati ma puliti: corni, fagotti, flauti, l’arpa.',
        suoni: [7, 6, 25],
      },
      {
        titolo: 'Tempo',
        testo:
          'Tende ad accordarsi con tempi lenti, Adagio o Andante fino a circa 70 bpm, e con cadenze dolci più che con ritmi eccitati.',
        suoni: [42, 43],
      },
      {
        titolo: 'Armonia',
        testo:
          'Può sentirsi a casa in un’armonia sospesa, con pochi movimenti di accordi e molte quinte. L’intervallo di quinta è vicino alla natura Calma Contemplativa.',
        suoni: [36],
      },
      {
        titolo: 'Suonare insieme',
        testo:
          'Chi suona con questa sensibilità trova spesso il suo posto nell’insieme, nell’accompagnare e nel leggere con cura; l’improvvisazione può chiedere un passo in più.',
        suoni: [],
      },
    ],
  },
  Giallo: {
    colorKey: 'giallo',
    nome: 'Entusiasta',
    apertura: 'Una sensibilità che può trovare piacere nel movimento, nella curiosità, nella scoperta del nuovo.',
    sezioni: [
      {
        titolo: 'Timbri',
        testo:
          'Spesso si avvicina a timbri chiari e brillanti, medio-alti e alti: percussioni, celesta e vibrafono, trombe, violini.',
        suoni: [19, 11, 28],
      },
      {
        titolo: 'Tempo',
        testo: 'Tende ad accordarsi con un Allegro, intorno ai 110–160 bpm, e con ritmi accentuati.',
        suoni: [45, 50],
      },
      {
        titolo: 'Armonia',
        testo:
          'Può sentirsi a casa in armonie semplici e luminose, nei modi maggiori, con melodie chiare che non restano mai uguali. La sesta è vicina alla natura Gioiosa Solare.',
        suoni: [37, 53],
      },
      {
        titolo: 'Suonare insieme',
        testo:
          'Chi suona con questa sensibilità spesso ama farlo in gruppo e può tendere a spingere il tempo in avanti. Il canto e il movimento gli sono vicini.',
        suoni: [],
      },
    ],
  },
  Grigio: {
    colorKey: 'grigio',
    nome: 'Razionale',
    apertura:
      'Una sensibilità che può trovare piacere nel calcolo, nel dubbio di origine intellettuale, nell’osservazione oggettiva.',
    sezioni: [
      {
        titolo: 'Timbri',
        testo: 'I timbri non naturali tendono a essere ascoltati come informazioni più che come emozioni.',
        suoni: [],
      },
    ],
  },
})
