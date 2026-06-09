/**
 * Testi del report TST — restituzione integrativa (lettura ad alta voce).
 * Ipotesi e tendenze emerse dal test; niente meta-manuale nel corpo del report.
 */

import { FAMILY_THEME } from '../config/reportFamilyTheme.js'

const FAMILIES = ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio']

/** @typedef {{ id: string, term: string, oneLine: string, explain: string, usefulFor: string, tags?: string[] }} GlossaryEntry */

export const CONTEXT = {
  eyebrow: 'Esito disponibile',
  title: 'Come leggere questo profilo',
  body: [
    'Il Test Temperamentale Sonoro (TST) registra le reazioni agli stimoli musicali del protocollo. Non valuta competenze musicali: misura l’organizzazione affettiva emersa in ascolto (avvicinamento, rifiuto o distacco).',
    'I punteggi sono raggruppati in cinque famiglie emotive — malinconia, volitività, calma, entusiasmo, anaffettività — ciascuna con uno o più temperamenti (ad es. lunare, marziale, flemmatico). Tutte le famiglie compaiono nel profilo; le percentuali indicano il peso relativo in questa somministrazione.',
    'Il report descrive una configurazione ottenuta in un momento specifico, non un tratto permanente della persona. Le sezioni seguenti presentano sintesi numerica, profilo descrittivo, aree sonore, rapporti, portato esperienziale e lessico delle risposte.',
  ],
  pills: [],
  dontShowAgainLabel: 'Non visualizzare più questo messaggio',
  whyToggle: 'Perché gli stimoli sonori?',
  whyExpanded:
    'La musica agisce sul sistema uditivo e sul respiro e può evocare stati d’animo senza richiedere un contenuto narrativo esterno. Il TST usa questa proprietà per rendere osservabili reazioni che altrimenti resterebbero implicite. Le percentuali indicano dove si concentrano i punteggi; i testi descrittivi li collocano nel lessico del modello.',
  pillsAria: 'Concetti chiave del profilo',
  cta: 'Apri il report',
}

export const HERO = {
  label: 'Prima lettura',
  ariaSection: 'Prima lettura del profilo',
  correntiAriaLabel: 'Peso delle cinque correnti emotive',
  ctaReport: 'Inizia la lettura',
  ctaGalassia: 'Esplora la galassia degli affetti',
  scrollHint: 'Scorri al report',
}

export const PANEL_READING = {
  natura: '',
  racconto: 'Come questa natura si dispiega nel tempo e nelle sotto-correnti.',
  risorse: 'Qualità che possono sostenere l’equilibrio quando restano vitali.',
  ombre: 'Dove la stessa energia, se irrigidita, conviene osservare con attenzione.',
}

export const PROFILO_UI = {
  letturaLabel: 'Lettura',
  quotidianoLabel: 'Nel quotidiano',
  approfondimentoLabel: 'Termini',
  approfondimentoToggle: 'Apri spiegazioni',
  legalNote:
    'Restituzione descrittiva da test sonoro. In caso di disagio persistente rivolgersi a un professionista qualificato.',
}

export const SINTESI_UI = {
  title: 'Il tuo profilo, in sintesi',
  subtitle: '',
  orientationTitle: 'Come leggere questa pagina',
  orientationBody:
    'Le cinque famiglie emotive compaiono tutte nel profilo; le percentuali indicano il peso relativo in questa somministrazione.',
  orientationPoints: [
    'Petali e radar: confronto visivo immediato tra le cinque disposizioni.',
    'Barre percentuali: peso di ciascuna famiglia rispetto al proprio massimo teorico.',
    'Testi sotto i grafici: sintesi descrittiva, distribuzione e portato esperienziale.',
  ],
  leadTitle: 'Sintesi del profilo',
  integrativeTitle: 'Distribuzione e integrazione',
  editorialNote:
    'I colori Blu, Rosso, Verde, Giallo e Grigio sono convenzioni grafiche della corrente prevalente, non giudizi sulla persona.',
}

export const PROFILO_SECTION_INTRO = {
  title: 'Il tuo profilo emotivo',
  paragraphs: [],
  readHint: '',
}

export const GLOSSARY_UI = {
  title: 'Termini del profilo',
  searchPlaceholder: 'Cerca…',
  searchAria: 'Cerca nei termini',
  closeAria: 'Chiudi',
  openLink: 'Cos’è questo?',
  openGlossary: 'Termini del profilo',
  usefulForLabel: 'Approfondimento',
  noResults: 'Nessun risultato.',
}

export const LEGAL_FOOTER = 'Il Pianeta della Musica · Franco Mussida'

/** @type {GlossaryEntry[]} */
export const GLOSSARY = [
  {
    id: 'rosa-dei-venti',
    term: 'Rosa dei venti',
    oneLine: 'Schema del modello che dispone le cinque famiglie emotive su cinque direzioni.',
    explain:
      'Ogni direzione corrisponde a una famiglia (malinconia, volitività, calma, entusiasmo, anaffettività). Il grafico confronta i pesi relativi; non indica luoghi né condizioni esterne.',
    usefulFor:
      'Usa la Rosa dei venti per confrontare le cinque famiglie nello stesso test, non per stabilire un’identità fissa.',
    tags: ['galassia'],
  },
  {
    id: 'corrente-emotiva',
    term: 'Corrente emotiva',
    oneLine: 'Denominazione del temperamento (es. lunare, flemmatico) all’interno di una famiglia.',
    explain:
      'La famiglia è il raggruppamento (malinconia, calma, ecc.); il temperamento è l’etichetta sul grafico. Tutte le famiglie sono presenti; la prevalente indica il peso maggiore in questa somministrazione.',
    usefulFor:
      'Leggi famiglia e temperamento insieme: ad esempio malinconia e lunare si riferiscono allo stesso polo con due livelli di descrizione.',
    tags: ['sintesi'],
  },
  {
    id: 'sotto-corrente',
    term: 'Sotto-corrente',
    oneLine: 'Sfumatura più fine dentro una corrente.',
    explain: 'Articola il profilo oltre la famiglia principale (es. nostalgico dentro la malinconia).',
    usefulFor:
      'Le sfumature affinano la lettura: due persone con la stessa famiglia dominante possono differire nella sotto-corrente prevalente.',
    tags: ['galassia'],
  },
  {
    id: 'natura',
    term: 'Natura',
    oneLine: 'Suolo emotivo di fondo emerso dal test.',
    explain:
      'Indica quale famiglia prevale nel profilo complessivo in questa somministrazione. Punto di partenza per ipotesi, non carattere immutabile.',
    usefulFor: 'Adatta ritmo, profondità e tipo di stimolo (movimento vs riflessione).',
    tags: ['profilo'],
  },
  {
    id: 'disposizione',
    term: 'Disposizione',
    oneLine: 'Modo abituale di disporsi verso sé, l’altro e il mondo.',
    explain:
      'Nomina l’orientamento affettivo prevalente (es. contemplativa, volitiva): il modo abituale di disporsi verso sé, l’altro e il mondo emerso dal test.',
    usefulFor:
      'La disposizione completa la natura indicando l’orientamento abituale del sentire emerso dal test.',
    tags: ['profilo'],
  },
  {
    id: 'pianeta-affettivo',
    term: 'Pianeta affettivo',
    oneLine: 'Metafora del modello per l’organizzazione affettiva emersa dal test.',
    explain:
      'Termine del manuale TST per indicare l’insieme delle reazioni affettive organizzate dal protocollo sonoro. Non indica uno spazio fisico.',
    usefulFor: 'Spiega che reazioni diverse allo stesso brano sono attese e utili.',
    tags: ['galassia'],
  },
  {
    id: 'galassia',
    term: 'Galassia',
    oneLine: 'Vista interattiva della Rosa dei venti con pesi delle correnti.',
    explain:
      'Mostra le cinque famiglie e, per ciascuna, temperamenti e sotto-correnti con peso proporzionale alle risposte del test.',
    usefulFor:
      'Usala per passare dal numero al significato: toccando un mondo vedi corrente, sfumature e parole del test collegate.',
    tags: ['galassia'],
  },
  {
    id: 'portato-esperienziale',
    term: 'Portato esperienziale',
    oneLine: 'Come hai vissuto lo stimolo: attrazione, rifiuto o distacco.',
    explain: 'Simpatia, antipatia e indifferenza completano le correnti: dicono se un clima è cercato, respinto o lasciato lì.',
    usefulFor:
      'Incrocia portato e corrente: la stessa famiglia può essere cercata (simpatia), respinta (antipatia) o lasciata in disparte (indifferenza).',
    tags: ['portato'],
  },
  {
    id: 'quattro-rapporti',
    term: 'Quattro rapporti',
    oneLine: 'Quattro lenti: natura, sé, altro, agire.',
    explain:
      'Natura = suolo; Sé = interiorità; Altro = verso le persone; Agire = verso fare e muoversi. Confrontare le schede rivela scarti utili.',
    usefulFor:
      'Confrontare natura e agire rivela scarti preziosi: es. calma di fondo ma slancio nel fare indica una composizione, non una contraddizione da “risolvere”.',
    tags: ['rapporti'],
  },
  {
    id: 'configurazione-prevalente',
    term: 'Configurazione prevalente',
    oneLine: 'Composizione delle correnti ora, non identità fissa.',
    explain: 'Una corrente in evidenza con contributi delle altre. Materiale per conversazione, non verdetto.',
    usefulFor:
      'Formula sempre al presente del test: «emerge soprattutto…» descrive una configurazione temporanea, non un carattere immutabile.',
    tags: ['generale'],
  },
  {
    id: 'lessico-protocollo',
    term: 'Lessico del test',
    oneLine: 'Parole con cui sono state lette le tue risposte.',
    explain: 'Aggettivi e stati d’animo scelti o ricondotti al test. Vocabolario condiviso per dialogo, non etichetta chiusa.',
    usefulFor:
      'Le parole elencate sono il vocabolario con cui il test ha letto le tue reazioni: utile per nominare il vissuto con precisione.',
    tags: ['lessico'],
  },
]

export const GALASSIA_INTRO = [
  'La mappa riproduce la Rosa dei venti del modello TST: cinque famiglie emotive (malinconia, volitività, calma, entusiasmo, anaffettività), ciascuna con uno o più temperamenti.',
  'Il cerchio principale indica il temperamento dominante in quella famiglia; i cerchi secondari sono sotto-correnti. La dimensione è proporzionale al peso nelle risposte di questo test.',
  'Il colore distingue la famiglia ed è un codice di lettura, non un giudizio. Selezionando un elemento si apre il dettaglio testuale corrispondente.',
]

export const GALASSIA_CRT = {
  idleTitle: 'Mappa delle correnti',
  idleLead: 'Cinque famiglie disposte come la Rosa dei venti del modello TST.',
  idleTapHint: 'Passa su un mondo per l’anteprima, poi tocca per entrare.',
  idleSteps: [],
  hierarchyPlanet: 'Corrente in questa direzione',
  hierarchySub: (parent) => `Sfumatura dentro ${parent}`,
  hierarchyIdle: 'Orientamento',
  famigliaLabel: 'Famiglia',
  polaritaLabel: 'Direzione del flusso',
  sintesiLabel: 'In sintesi',
  significatoLabel: 'Significato della sfumatura',
  cosaIndicaLabel: 'Suggerisce',
  paroleLabel: 'Parole incontrate nel test',
  costellazioneHint: (n) =>
    n === 1
      ? '1 sfumatura intorno: toccala per la lettura, o lo sfondo per tornare alla mappa.'
      : `${n} sfumature intorno: toccane una o lo sfondo per tornare alla mappa.`,
  previewHint: 'Tocca il mondo per entrare nella costellazione e leggere nel dettaglio.',
  costellazioneKicker: 'Costellazione',
  costellazioneSubtitle: (n) =>
    n === 1
      ? '1 sfumatura in orbita — toccala per la lettura TST'
      : `${n} sfumature in orbita — toccane una per la lettura TST`,
  costellazioneSectionTitle: 'Sfumature in orbita',
  pesoLabel: 'Peso nel test',
  caratteristicheLabel: 'Caratteristiche TST',
  intervalloLabel: 'Intervallo',
  coloreLabel: 'Colore',
  kickerIdle: 'Orientamento',
  kickerPreview: 'Anteprima',
  kickerViewing: 'Lettura',
  kickerCostellazione: 'Costellazione',
}

/** Testo introduttivo sotto l’accordion di ogni macro-blocco. */
export const GROUP_INTROS = {
  'report-group-identita': '',
  'report-group-profilo': '',
  'report-group-rapporti':
    'Quattro lenti sullo stesso profilo: natura di fondo, rapporto con sé, con l’altro e con l’agire. Il portato esperienziale completa il quadro con simpatia, antipatia o indifferenza verso gli stimoli.',
  'report-group-lessico':
    'Parole emerse dal test in evidenza; su richiesta, forme nominali e aggettivi per sotto-corrente (entrambe le fonti del vocabolario).',
  'report-group-approfondimento':
    'Confronto immediato tra le cinque famiglie emotive in ciascuna area sonora del test — Timbro, Intervalli, Ritmo, Melodia, Armonia.',
}

export const SECTION_INTROS = {
  rapporti: {
    intro:
      'Il modello distingue quattro rapporti: Natura (suolo emotivo), Sé (interiorità), Altro (verso le persone), Agire (verso fare e muoversi). Ogni scheda mostra come le cinque famiglie si distribuiscono in quella direzione — gli scarti tra schede sono parte della lettura.',
  },
  portato: {
    lead:
      'Oltre alle correnti, il test rileva il portato esperienziale: se allo stimolo hai risposto con simpatia (avvicinamento), antipatia (rifiuto) o indifferenza (distacco). Completa il quadro affettivo.',
  },
  approfondimento: {
    title: 'Dove si accende il profilo, area per area',
    intro:
      'Il protocollo sonoro si articola in cinque aree — Timbro, Intervalli, Ritmo, Melodia, Armonia — ciascuna attiva dimensioni affettive diverse. Qui vedi se le famiglie restano omogenee o se emergono contrasti tra aree.',
  },
  parole: {
    intro:
      'La nuvola mostra le parole emerse dalle tue risposte (aggettivi del test). Seleziona una famiglia per la lettura breve; aprendo l’elenco completo trovi le forme nominali e gli aggettivi per sotto-corrente, dalle due fonti del modello.',
  },
  mappa: {
    intro:
      'Qui emergono le dinamiche tra famiglie emotive: come la corrente prevalente dialoga, contrasta o si affianca alle altre nel campo affettivo di questo test.',
    points: [
      'Parti dalla famiglia con peso maggiore nella sintesi.',
      'Confronta coerenze e scarti tra le sezioni del report.',
      'Leggi le ipotesi come tendenze emerse dal test, non come verdetto.',
    ],
  },
}

const FAMILY_KEY = { Blu: 'blu', Rosso: 'rosso', Verde: 'verde', Giallo: 'giallo', Grigio: 'grigio' }

export function normalizeFamigliaName(famiglia) {
  const raw = String(famiglia || '').trim()
  if (FAMILIES.includes(raw)) return raw
  const hit = FAMILIES.find((f) => raw.toLowerCase().includes(f.toLowerCase()))
  return hit || 'Verde'
}

export function getGlossaryEntry(id) {
  return GLOSSARY.find((e) => e.id === id)
}

export function searchGlossary(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return GLOSSARY
  return GLOSSARY.filter(
    (e) =>
      e.term.toLowerCase().includes(q) ||
      e.oneLine.toLowerCase().includes(q) ||
      e.explain.toLowerCase().includes(q) ||
      (e.tags || []).some((t) => t.includes(q)),
  )
}

/** @deprecated Inviti al colloquio rimossi — restituisce array vuoto. */
export function getExploreHintsForFamily() {
  return []
}

/** @deprecated Inviti al colloquio rimossi. */
export function getInPraticaHint() {
  return ''
}

/**
 * Chiusura integrativa sotto i grafici (Sintesi).
 */
export function getIntegrativeClosing(famiglia, correnteDominante = '') {
  const fam = normalizeFamigliaName(famiglia)
  const theme = FAMILY_THEME[fam]
  const macro = theme?.macro || fam
  const corrente = String(correnteDominante || theme?.corrente || '').trim()
  const temperamentoLine = corrente ? ` (temperamento ${corrente})` : ''
  return {
    paragraph: `La disposizione prevalente è ${macro}${temperamentoLine}; le altre famiglie restano presenti con pesi diversi. È una composizione mista, non un’etichetta chiusa.`,
  }
}

const ORIENTAMENTO_LABEL = {
  passato: 'il passato e la riflessione su ciò che è stato vissuto',
  presente: 'il presente e l’azione nel qui e ora',
  futuro: 'il futuro, la curiosità e la scoperta',
  'oblio sospeso': 'un tempo di calma e sospensione interiore',
  trasversale: 'una linea trasversale che attraversa tutte le famiglie emotive',
}

const ORIENTAMENTO_NARRATIVO = {
  passato:
    'L’orientamento al passato indica una risposta che rielabora e riflette: il sentire tende a tornare su ciò che è già stato vissuto, prima di muoversi verso l’azione.',
  presente:
    'L’orientamento al presente indica una risposta centrata sul qui e ora: il profilo privilegia attivazione, contatto con lo stimolo attuale e regolazione immediata.',
  futuro:
    'L’orientamento al futuro indica slancio proiettivo: curiosità, anticipazione e apertura verso ciò che può ancora accadere.',
  'oblio sospeso':
    'L’orientamento all’oblio sospeso indica una presenza neutra tra stimolo e risposta: pausa contemplativa, come un respiro trattenuto tra le correnti.',
  trasversale:
    'L’orientamento trasversale attraversa le famiglie senza polarizzarsi su una sola direzione temporale.',
}

function firstSentence(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''
  const match = trimmed.match(/^[^.\n]+[.]?/)
  return match ? match[0].trim().replace(/\.$/, '') : trimmed
}

function capitalizeLabel(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function describeFamigliaLeggibile(c) {
  if (!c) return ''
  const famiglia = c.label || c.nome || ''
  const temperamento =
    c.nome && c.label && c.nome !== c.label ? `, temperamento ${c.nome}` : ''
  const peso = typeof c.peso === 'number' ? Math.round(c.peso) : null
  return peso != null ? `${famiglia}${temperamento} (circa ${peso}%)` : `${famiglia}${temperamento}`
}

function orientamentoNarrativo(dimensione) {
  const key = String(dimensione || '').trim().toLowerCase()
  if (!key) return ''
  const label = capitalizeLabel(key)
  if (ORIENTAMENTO_NARRATIVO[key]) {
    return `La dimensione di orientamento prevalente è ${label}. ${ORIENTAMENTO_NARRATIVO[key]}`
  }
  return `La dimensione di orientamento prevalente è ${label}.`
}

function findCorrenteByFamiglia(correntiByPeso, famiglia) {
  const fam = normalizeFamigliaName(famiglia)
  return correntiByPeso.find((c) => c.familyName === fam) || null
}

function buildDistribuzioneParagraph(correntiByPeso, famigliaPrevalente) {
  if (!correntiByPeso.length) return ''
  const parts = [
    'Le percentuali nel grafico indicano il peso di ciascuna famiglia rispetto al proprio massimo teorico in questo test.',
  ]
  const domEntry = findCorrenteByFamiglia(correntiByPeso, famigliaPrevalente)
  const topPeso = Math.round(Number(correntiByPeso[0]?.peso) || 0)
  const tiedTop = correntiByPeso.filter((c) => Math.round(Number(c.peso) || 0) === topPeso)

  if (domEntry && typeof domEntry.peso === 'number') {
    parts.push(
      `La disposizione prevalente (${domEntry.label || domEntry.nome}, temperamento ${domEntry.nome}) si colloca al ${Math.round(domEntry.peso)}%.`,
    )
  }

  if (tiedTop.length > 1) {
    parts.push(
      `Famiglie con peso più alto, affiancate: ${tiedTop.map(describeFamigliaLeggibile).join('; ')}.`,
    )
  } else if (correntiByPeso.length >= 2) {
    const secondaries = correntiByPeso.slice(1, 3).filter((c) => (Number(c.peso) || 0) >= 6)
    if (secondaries.length === 1) {
      parts.push(`Segue ${describeFamigliaLeggibile(secondaries[0])}.`)
    } else if (secondaries.length >= 2) {
      parts.push(
        `Seguono ${describeFamigliaLeggibile(secondaries[0])} e ${describeFamigliaLeggibile(secondaries[1])}.`,
      )
    }
  }

  parts.push(
    'Tutte le famiglie compaiono nel profilo: è una composizione mista, non un’etichetta unica.',
  )
  return parts.join(' ')
}

/**
 * Filo conduttore per l’intro del profilo emotivo (colore famiglia + natura).
 */
export function buildProfiloThreadLine({ profilo = {}, domTheme = {}, famiglia = '' }) {
  const fam = normalizeFamigliaName(famiglia || profilo.famiglia || '')
  const theme = domTheme?.label ? domTheme : FAMILY_THEME[fam]
  const macro = theme?.macro || ''
  const temperamento = (profilo.correnteDominante || theme?.corrente || '').trim()
  const natura = (profilo.natura || theme?.nature || '').trim()
  const caratteri = (profilo.disposizione || '').trim()
  if (!macro && !natura && !caratteri) return ''

  const parti = []
  if (macro && temperamento) {
    parti.push(`Disposizione prevalente: ${macro} (temperamento ${temperamento}).`)
  }
  if (natura && caratteri) {
    parti.push(`${natura} · ${caratteri}.`)
  } else if (natura || caratteri) {
    parti.push([natura, caratteri].filter(Boolean).join(' · '))
  }
  return parti.join(' ')
}

/**
 * Sintesi del profilo — disposizione prevalente, caratteri e orientamento (stile report scientifico).
 */
export function buildSintesiLead({
  profilo = {},
  correntiByPeso = [],
  domTheme = {},
  textBlock = {},
}) {
  const famigliaPrevalente = profilo.famiglia || domTheme?.label || ''
  const macro = domTheme?.macro || ''
  const temperamento = (profilo.correnteDominante || domTheme?.corrente || '').trim()
  const codiceColore = (domTheme?.label || famigliaPrevalente || '').trim()

  const estesi = (textBlock?.restituzione_caratteri_estesi || '').trim()
  const hook =
    firstSentence(estesi) ||
    firstSentence(profilo.fraseChiave) ||
    firstSentence(domTheme?.tagline) ||
    ''

  const dimensione = textBlock?.restituzione_dimensione || profilo.focus || ''
  const parts = []

  if (macro && temperamento) {
    parts.push(
      `La disposizione prevalente rilevata dal test è ${macro} (temperamento ${temperamento}).`,
    )
  } else if (macro) {
    parts.push(`La disposizione prevalente rilevata dal test è ${macro}.`)
  }

  if (codiceColore) {
    parts.push(
      `Il codice cromatico ${codiceColore.toUpperCase()} è una convenzione di rappresentazione grafica della corrente prevalente, non la disposizione in sé.`,
    )
  }

  if (hook) {
    const plain = hook.replace(/\.$/, '')
    parts.push(`${plain.charAt(0).toUpperCase()}${plain.slice(1)}.`)
  }

  const orient = orientamentoNarrativo(dimensione)
  if (orient) parts.push(orient)

  void correntiByPeso
  return parts.join(' ')
}

/**
 * Paragrafi di distribuzione percentuale, portato e chiusura integrativa.
 */
export function buildIntegrativeParagraphs({
  profilo = {},
  correntiByPeso = [],
  domTheme = {},
  textBlock = {},
  portato = null,
  sottodisposizione = '',
}) {
  const famigliaPrevalente = profilo.famiglia || domTheme?.label || ''
  const natura = (textBlock?.restituzione_natura || profilo.natura || '').trim()
  const caratteri = (textBlock?.restituzione_caratteri || profilo.disposizione || '').trim()

  const p1Parts = []
  if (natura && caratteri) {
    p1Parts.push(`In questa somministrazione la natura prevalente è ${natura} · ${caratteri}.`)
  }
  const distribuzione = buildDistribuzioneParagraph(correntiByPeso, famigliaPrevalente)
  if (distribuzione) p1Parts.push(distribuzione)
  const p1 = p1Parts.join(' ')

  const p2Parts = []
  const sotto = String(sottodisposizione || '').trim()
  if (sotto) {
    p2Parts.push(
      `La sottodisposizione ${sotto} aggiunge una sfumatura alla famiglia prevalente, utile per leggere oscillazioni interne alla stessa corrente.`,
    )
  }
  if (portato?.prevalenteLabel && portato?.descrizione) {
    p2Parts.push(
      `Nel portato esperienziale prevale ${portato.prevalenteLabel}: ${portato.descrizione}`,
    )
  } else if (portato?.prevalenteLabel) {
    p2Parts.push(`Nel portato esperienziale prevale ${portato.prevalenteLabel}.`)
  }
  if (portato?.vitalita) {
    p2Parts.push(portato.vitalita)
  }
  const p2 = p2Parts.join(' ')

  const p3 =
    'Le categorie temperamentali descrivono tendenze e orientamenti emersi in questa somministrazione: non sono etichette identitarie fisse.'

  return [p1, p2, p3].map((s) => s.trim()).filter(Boolean)
}

export const PANEL_GLOSSARY_IDS = {
  natura: ['natura', 'configurazione-prevalente'],
  racconto: ['quattro-rapporti', 'disposizione'],
  risorse: ['configurazione-prevalente'],
  ombre: ['configurazione-prevalente'],
}
