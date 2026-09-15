/**
 * Contenuti teorici della Galassia derivati ESCLUSIVAMENTE dai PDF:
 * - "TEST DI RILEVAZIONE DELLA IDENTITÀ EMOTIVA"
 * - "STATI D'ANIMO IN 4 FAMIGLIE (Salvataggio automatico)"
 * - "parole - STATI D'ANIMO IN 4 FAMIGLIE"
 *
 * Le descrizioni riprendono in forma sintetica le metafore dei PDF
 * (Rosa dei venti, luce lunare, occhio del ciclone, vento solare, ecc.).
 * Gli elenchi `states` sono l'unione fedele degli stati d'animo elencati.
 */

import { getAggettiviForRawKey } from '../content/paroleTst.js'

export type GalaxyTheoryCurrent = {
  rawKey: string
  title: string
  interval: string
  color: string
  description: string
  states: string[]
}

export type GalaxyTheoryFamily = {
  dispositionId: string
  familyLabel: string
  coreDescription: string
  selfRelation: string
  musicNotes: string
  currents: GalaxyTheoryCurrent[]
}

export const GALAXY_THEORY_INTRO: string[] = [
  `Il Test usa la Musica come specchio della nostra organizzazione emotiva: i flussi sonori entrano dentro di noi attraverso l'orecchio e il respiro, "rendendo visibile l'invisibile come potrebbe fare una Tac".`,
  `Esiste una comune struttura emotiva: gli stati d'animo non vengono inventati di volta in volta, sono parti integranti di noi che la Musica illumina ed eccita finché non li facciamo vivere "in modo purissimo", senza una relazione esterna.`,
  `L'Energia Emotiva aiuta a immaginarli: ogni temperamento è un'energia che si muove da una direzione precisa del nostro pianeta affettivo. I 13 intervalli musicali sono le sue energie: a ogni corrente corrisponde un intervallo, un colore e una zona della mappa.`,
]

export const GALAXY_THEORY_BY_DISPOSITION: Record<string, GalaxyTheoryFamily> = {
  malinconica_nostalgica: {
    dispositionId: 'malinconica_nostalgica',
    familyLabel: 'Famiglia Malinconica - natura Lunare',
    coreDescription: `Vento che soffia da Ovest a Est, in profondità: l'azione riflessa della Luna sul nostro spazio interiore. La Malinconia non è tristezza, è luce riflessa che illumina ciò che si è vissuto. Sorge nell'adolescenza (verso i 13-14 anni), quando la Musica diventa "balsamo che guarisce la solitudine". La Nostalgia è il suo risvolto: dolore della mancanza, ma anche calore del ricordo.`,
    selfRelation: `Forza centripeta che ci porta dentro noi stessi: piacere di stare in disparte, di osservarsi, di riflettere. Il malinconico puro non ha paura della solitudine, anzi vi sta bene; meno volentieri si butta in imprese fisiche estreme o danze forsennate.`,
    musicNotes: `Predilige timbri medi e medio-bassi, scuri e corposi: archi (violoncelli, contrabbassi), oboi e clarinetti, chitarre acustiche. Tempo Andante 60-100 bpm, modi minori, intervalli di terza e settima minore. Cerca la sincerità interpretativa, odia il dilettantismo.`,
    currents: [
      {
        rawKey: 'BLU_1_Depressiva',
        title: 'Malinconia depressiva',
        interval: 'Seconda minore e maggiore',
        color: 'Blu notte / Blu scuro',
        description: `Forza che agisce nel chiuso dell'interiorità scandagliandone gli aspetti più cupi: paura dell'inconosciuto, sensazione che tutto possa farci male. La depressione è il lato più oscuro della solitudine, può provocare il blocco totale dei movimenti.`,
        states: getAggettiviForRawKey('BLU_1_Depressiva'),
      },
      {
        rawKey: 'BLU_2_Lunare',
        title: 'Malinconia lunare',
        interval: 'Terza minore',
        color: 'Blu medio',
        description: `Opera nel chiuso dell'interiorità con visione riflessa. La paura si trasforma in timore, e nella tristezza di non potersi liberare da quel vivere al chiuso: la luce delle relazioni arriva solo di riflesso, come la luce solare che illumina la Luna — una luce fredda e distaccata.`,
        states: getAggettiviForRawKey('BLU_2_Lunare'),
      },
      {
        rawKey: 'BLU_3_Nostalgia',
        title: 'Nostalgica (Solare o Lunare)',
        interval: 'Settima minore e maggiore',
        color: 'Blu reale',
        description: `Nel modello TST questa natura descrive il rapporto con i ricordi e con ciò che si sente perduto o lontano. La forma lunare porta verso il rimpianto; quella solare verso la riconoscenza per ciò che si è vissuto. Non indica tristezza in senso clinico, bensì una memoria affettiva intensa.`,
        states: getAggettiviForRawKey('BLU_3_Nostalgia'),
      },
      {
        rawKey: 'BLU_4_Solare',
        title: 'Malinconia solare',
        interval: 'Terza maggiore',
        color: 'Celeste',
        description: `Apre una breccia verso il mondo: dalla riflessione interiore filtra la luce diretta del Sole, l'esperienza dell'esteriorità. Si accende un clima emotivo positivo — speranza, serenità, fiducia nel futuro — senza perdere la profondità dell'interiorità.`,
        states: getAggettiviForRawKey('BLU_4_Solare'),
      },
    ],
  },
  collerico_volitiva: {
    dispositionId: 'collerico_volitiva',
    familyLabel: 'Famiglia Marziale - natura Volitivo-collerica',
    coreDescription: `Vento che soffia da Est a Ovest, seguendo il percorso del Sole: la forza dell'Io che vuole realizzare nel presente. È la corrente del finalizzatore — come il bomber che chiude la partita o il capitano del ciclismo che vince con l'aiuto dei gregari. "Io sono il padrone del mio destino" (Henley/Mandela). In polo positivo: saldezza, coraggio, decisione. In polo negativo: rigidità, ostinazione, ira.`,
    selfRelation: `Energia orizzontale, che agisce nel presente. L'Io diventa "governatore" attorno ai vent'anni; verso i trenta può attraversare il "deserto" o "periodo del Verme", quando i sentimenti si inabissano come fiume carsico, prima di riemergere più impetuosi. Da qui nasce la possibilità della saggezza, fatta di ironia e di equilibrio fra governatore e gregari interiori.`,
    musicNotes: `Timbri medi, centrali, incisivi: percussioni (tamburi, timpani, rullanti), trombe, sax, viole, pianoforte, batteria. Tempi forti e costanti, Rock 90-130 bpm. Ama unisoni potenti (l'inizio della Quinta di Beethoven), scale dure (seconda), improvvisazione — ma da ascoltatore, perché come musicista è organizzato e fatica a "lasciarsi andare".`,
    currents: [
      {
        rawKey: 'ROSSO_1_Assertivita',
        title: 'Fermezza volitiva',
        interval: 'Quarta',
        color: 'Rosso',
        description: `Forza dell'Io che opera nel presente con volontà e sicurezza: piacere di fare, concretizzare, prendersi responsabilità per sé e per gli altri. Una forza che spinge ad andare oltre l'ostacolo, talvolta cercandolo apposta per superarlo.`,
        states: getAggettiviForRawKey('ROSSO_1_Assertivita'),
      },
      {
        rawKey: 'ROSSO_2_Dubbio_Collera',
        title: 'Rabbia e collera',
        interval: 'Quarta eccedente',
        color: 'Amaranto',
        description: `La collera è una forza che si accende quando l'azione trova ostacolo: rigidità, ostinazione, insofferenza per chi rallenta o si oppone. Dall'inconciliabilità tra persone, da antipatie covate non manifestate, scaturisce una rabbia trattenuta o un'ira aperta.`,
        states: getAggettiviForRawKey('ROSSO_2_Dubbio_Collera'),
      },
    ],
  },
  flemmatica: {
    dispositionId: 'flemmatica',
    familyLabel: 'Famiglia Flemmatica - natura Contemplativa',
    coreDescription: `Qualità gentile e contemplativa che nasce nel centro dell'Energia Emotiva, come stare nell'occhio del ciclone: bonaccia, leggerezza del non-movimento, calma. Si forma nel periodo neonatale, quando le tre attività essenziali sono dormire, mangiare, sognare. Ippocrate la chiamava "flegma": un terreno verde in cui il sentire dorme della grossa, come accade per le piante.`,
    selfRelation: `Il flemmatico ama riposare e contemplare; non cerca tanto la riflessione su di sé, quanto un clima di calma e di equilibrio affettivo. Difficile incontrarlo in gare di snowboard — più facile nello sci di fondo. Quando la gentilezza è gratuita è qualità etica; quando è programmata per evitare conflitti, scivola in pigrizia.`,
    musicNotes: `Timbri scuri e quieti, medio-bassi: corni, fagotti, controfagotto, flauto in sol, clarini, marimba, arpa, chitarra classica. Adagio/Andante fino a 70 bpm; armonie sospese con poche terze, niente bruschi cambi di tonalità. Predilige Easy Listening e cadenze etniche tonali (es. musica irlandese).`,
    currents: [
      {
        rawKey: 'VERDE_1_CalmaContemplativa',
        title: 'Calma contemplativa',
        interval: 'Quinta',
        color: 'Verde',
        description: `Qualità raccolta e contemplativa: ammirazione, meditazione, distacco sereno da ciò che agita. Da qui nascono misticismo e visionarietà — uno sguardo che osserva senza bisogno di intervenire.`,
        states: getAggettiviForRawKey('VERDE_1_CalmaContemplativa'),
      },
      {
        rawKey: 'VERDE_2_CalmaFisica',
        title: 'Calma fisica',
        interval: 'Quinta eccedente',
        color: 'Verde',
        description: `Bonaccia emotiva del corpo e del ritmo: rilassamento, prudenza, ripetitività buona. Da qui nascono pazienza e gentilezza autentica — ma anche, in polarità negativa, pigrizia, ozio fino a indolenza e torpore.`,
        states: getAggettiviForRawKey('VERDE_2_CalmaFisica'),
      },
    ],
  },
  entusiasmo: {
    dispositionId: 'entusiasmo',
    familyLabel: 'Famiglia Entusiasta - natura Gioioso-Sanguinico',
    coreDescription: `Venti caldi che soffiano da Sud a Nord, pervasi di solarità. Si forma nel periodo pre-infantile e infantile, premiando ogni piccolo successo della curiosità: i bambini imparano in fretta proprio perché hanno poco da elaborare emotivamente. È l'antidoto al gelo del Dubbio e all'apatia che porta al nichilismo.`,
    selfRelation: `Forza centrifuga che esce verso il mondo: si abbraccia ciò che è nuovo (persone, natura, oggetti, attività). La gioia è il primo motore; quando l'energia matura, prende anche la forma più profonda della passione — adesione totale a una persona, un'idea, un'esperienza.`,
    musicNotes: `Timbri medio-alti, alti, brillanti: percussioni di ogni tipo (tamburelli, maracas), piatti, vibrafono, celesta, trombe, violini, canto. Tempi Allegro, ritmo accentuato e ripetitivo, modi maggiori, melodie chiare e riconoscibili. "Subisce in modo speciale il fascino del ritmo".`,
    currents: [
      {
        rawKey: 'GIALLO_1_Gioia_Entusiasmo',
        title: 'Gioia e entusiasmo',
        interval: 'Sesta',
        color: 'Giallo',
        description: `Spinta espansiva, vitale, cinetica: piacere di uscire da sé per abbracciare il nuovo. Si attiva con il successo, anche minimo, e sedimenta come continente affettivo dell'Entusiasmo accanto a quello della Flemma.`,
        states: getAggettiviForRawKey('GIALLO_1_Gioia_Entusiasmo'),
      },
      {
        rawKey: 'GIALLO_2_Volitivo_Passionale',
        title: 'Entusiasmo volitivo passionale',
        interval: 'Prima',
        color: 'Giallo dorato',
        description: `Componente passionale dell'entusiasmo: calore, adesione totale, investimento emotivo diretto. È il momento in cui l'Io vibra all'unisono con ciò che ama — una persona, una causa, un'idea, una visione che illumina.`,
        states: getAggettiviForRawKey('GIALLO_2_Volitivo_Passionale'),
      },
    ],
  },
  agnostica_anaffettiva: {
    dispositionId: 'agnostica_anaffettiva',
    familyLabel: 'Famiglia Razionale - natura Intellettuale-Razionale',
    coreDescription: `Venti gelidi che soffiano da Nord a Sud, l'unica corrente trasversale che getta la sua ombra sulle altre quattro famiglie. Si è sedimentata come temperamento dagli anni Settanta: laicismo intellettuale anaffettivo, tempo della distrazione, uso compulsivo della tecnologia. Distacco e calcolo invece di passione.`,
    selfRelation: `Variabile della Volitività ma senza calore: una "cometa scura" che raggela l'affettivo. Tutto viene osservato senza vero interesse, con un piacere astratto, intellettuale, di tipo numerico-matematico. È però anche la soglia da cui può nascere la saggezza: quando l'intelletto si orienta eticamente, diventa "ecologia dei sentimenti" e senso del Noi.`,
    musicNotes: `Si associa all'intervallo di Ottava, polo del raffreddamento affettivo. La Musica, in questo periodo di massima anaffettività, lavora silenziosamente alla costruzione di un domani: aiuta a sviluppare sensibilità ed equilibrio, fa maturare le qualità interiori che riemergeranno dopo il deserto.`,
    currents: [
      {
        rawKey: 'GRIGIO_1_Anaffettiva',
        title: 'Anaffettiva',
        interval: 'Ottava',
        color: 'Grigio',
        description: `L'Io si purifica nella sola dimensione pensante: distacco, calcolo, osservazione senza coinvolgimento. Nel suo polo evolutivo, la stessa lucidità può orientarsi eticamente e diventare saggezza, dedizione, devozione.`,
        states: getAggettiviForRawKey('GRIGIO_1_Anaffettiva'),
      },
    ],
  },
}

const THEORY_BY_RAW_KEY = Object.values(GALAXY_THEORY_BY_DISPOSITION).reduce<Record<string, GalaxyTheoryCurrent>>(
  (acc, family) => {
    family.currents.forEach((current) => {
      acc[current.rawKey] = current
    })
    return acc
  },
  {},
)

export function getGalaxyTheoryForDisposition(dispositionId: string): GalaxyTheoryFamily | null {
  return GALAXY_THEORY_BY_DISPOSITION[dispositionId] ?? null
}

export function getGalaxyTheoryForRawKey(rawKey: string): GalaxyTheoryCurrent | null {
  return THEORY_BY_RAW_KEY[rawKey] ?? null
}
