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
    'Il TST non misura competenze musicali. Legge come hai reagito agli stimoli sonori: avvicinamento, rifiuto, distacco e famiglie emotive più presenti.',
    'La prima cosa da guardare è la famiglia prevalente. Subito dopo vengono la natura o caratteristica emotiva, il portato esperienziale e le parole emerse dalle risposte.',
    'Leggi il report come una fotografia del test, non come una definizione fissa della persona. Ogni sezione aggiunge un livello: sintesi, profilo, rapporti, portato, lessico e approfondimenti.',
  ],
  pills: [],
  dontShowAgainLabel: 'Non visualizzare più questo messaggio',
  whyToggle: 'Perché gli stimoli sonori?',
  whyExpanded:
    'La musica può evocare stati d’animo senza passare da una storia o da una spiegazione razionale. Il TST usa questa via per osservare reazioni che spesso restano implicite. I grafici mostrano dove si concentrano i punteggi; i testi aiutano a dare parole a quei risultati.',
  pillsAria: 'Concetti chiave del profilo',
  cta: 'Apri il report',
}

export const HERO = {
  label: 'Prima lettura',
  ariaSection: 'Prima lettura del profilo',
  ctaReport: 'Inizia la lettura',
  ctaGalassia: 'Esplora la galassia degli affetti',
  scrollHint: 'Vai alla sintesi',
  readingDurationHint: '',
  journeyLabel: '',
  journeySteps: [],
}

export const PANEL_READING = {
  natura: '',
  racconto: '',
  risorse: '',
  ombre: '',
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
    'Questo report descrive come hai risposto agli stimoli sonori in questa somministrazione. Non è una diagnosi né un’etichetta fissa.',
  orientationPoints: [
    'Famiglia prevalente: somma dei punteggi — quale famiglia pesa di più.',
    'Presenza (%): quanto quella famiglia ha risuonato nelle tue risposte durante l’ascolto.',
    'Livello 1–7: solo nella sezione «Quattro rapporti», non confrontarlo con le percentuali.',
    'I colori sono convenzioni grafiche, non giudizi sulla persona.',
  ],
  leadTitle: 'Esito principale',
  integrativeTitle: 'Distribuzione e integrazione',
  visualToggle: 'Grafici petalo e radar',
  editorialNote:
    'I colori Blu, Rosso, Verde, Giallo e Grigio sono convenzioni grafiche, non giudizi sulla persona.',
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
      'Ogni direzione corrisponde a una famiglia: Malinconica, Marziale, Flemmatica, Entusiasta o Razionale. Il grafico confronta i pesi relativi; i colori sono soltanto una convenzione visiva.',
    usefulFor:
      'Usa la Rosa dei venti per confrontare le cinque famiglie nello stesso test, non per stabilire un’identità fissa.',
    tags: ['galassia'],
  },
  {
    id: 'corrente-emotiva',
    term: 'Caratteristica emotiva',
    oneLine: 'Natura che specifica come si esprime una famiglia emotiva.',
    explain:
      'La famiglia è una delle cinque categorie del modello; la caratteristica emotiva, chiamata anche natura, ne descrive la qualità. Per esempio: famiglia Marziale, natura Volitivo-collerica.',
    usefulFor:
      'Leggi sempre i due livelli insieme: famiglia Flemmatica e natura Contemplativa.',
    tags: ['sintesi'],
  },
  {
    id: 'sotto-corrente',
    term: 'Sotto-corrente',
    oneLine: 'Sfumatura più fine dentro una corrente.',
    explain: 'Articola il profilo oltre la famiglia principale: nella famiglia Malinconica, per esempio, la natura Nostalgica può essere Solare o Lunare.',
    usefulFor:
      'Le sfumature affinano la lettura: due persone con la stessa famiglia dominante possono differire nella sotto-corrente prevalente.',
    tags: ['galassia'],
  },
  {
    id: 'natura',
    term: 'Natura',
    oneLine: 'Caratteristica emotiva con cui si esprime la famiglia prevalente.',
    explain:
      'Specifica la famiglia prevalente: Lunare per la Malinconica, Volitivo-collerica per la Marziale, Contemplativa per la Flemmatica, Gioioso-Sanguinico per l’Entusiasta e Intellettuale-Razionale per la Razionale.',
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
      'Mostra le cinque famiglie e, per ciascuna, qualità e sotto-correnti con peso proporzionale alle risposte del test.',
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
  'La mappa riproduce la Rosa dei venti del modello TST: cinque famiglie emotive (Malinconica, Marziale, Flemmatica, Entusiasta, Razionale), ciascuna con una o più nature e sfumature.',
  'Il cerchio principale indica la qualità dominante in quella famiglia; i cerchi secondari sono sotto-correnti. La dimensione è proporzionale al peso nelle risposte di questo test.',
  'Il colore distingue la famiglia ed è un codice di lettura, non un giudizio. Selezionando un elemento si apre il dettaglio testuale corrispondente.',
]

export const GALASSIA_CRT = {
  idleTitle: 'Mappa delle correnti',
  idleLead: 'Cinque famiglie sulla Rosa dei venti del modello TST.',
  idleTapHint: 'Tocca un mondo per aprire costellazione e lettura.',
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
  'report-group-relazioni': '',
  'report-group-rapporti': '',
  'report-group-lessico':
    'Qui trovi le parole utili per nominare meglio ciò che il test ha fatto emergere.',
  'report-group-musica':
    'Scheda riservata a chi suona uno strumento: strumenti, timbri, ritmo, armonia, modi e modalità di suonare, comporre e interpretare secondo la disposizione prevalente.',
  'report-group-approfondimento': '',
  'report-group-profilo-generale': '',
  'report-group-quattro-rapporti': '',
  'report-group-forza-correnti': '',
  'report-group-educazione': '',
}

export const SECTION_INTROS = {
  rapporti: {
    intro:
      'Quattro lenti sullo stesso profilo, dal modello del Pianeta della Musica: Natura (Timbro + Intervalli + Armonia, il suolo emotivo), Sé (Intervalli + Melodia, interiorità), Altro (Timbro + Melodia, relazione), Agire (Ritmo + Melodia, movimento). Ogni scheda usa una scala 1–7 — gli scarti tra lenti sono parte della lettura.',
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
      'Questa sezione descrive come il temperamento prevalente può incontrare gli altri temperamenti — materiale diverso dallo schema interno letto poco sopra.',
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
  const temperamentoLine = corrente ? ` (qualità ${corrente})` : ''
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
    c.nome && c.label && c.nome !== c.label ? `, qualità ${c.nome}` : ''
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
    'Le percentuali nel grafico indicano la quota percentuale di ciascuna famiglia emotiva rispetto al totale del profilo (come fette di una torta).',
  ]
  const domEntry = findCorrenteByFamiglia(correntiByPeso, famigliaPrevalente)
  const topPeso = Math.round(Number(correntiByPeso[0]?.peso) || 0)
  const tiedTop = correntiByPeso.filter((c) => Math.round(Number(c.peso) || 0) === topPeso)

  if (domEntry && typeof domEntry.peso === 'number') {
    parts.push(
      `Presenza della famiglia prevalente (${domEntry.label || domEntry.nome}): ${Math.round(domEntry.peso)}% del totale del profilo.`,
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
  const famigliaLabel = (profilo.famigliaLabel || theme?.family || '').trim()
  const natura = (profilo.disposizione || theme?.characteristic || '').trim()
  if (!famigliaLabel && !natura) return ''

  const parti = []
  if (famigliaLabel) parti.push(`Famiglia prevalente: ${famigliaLabel}.`)
  if (natura) parti.push(`Caratteristica emotiva (natura): ${natura}.`)
  return parti.join(' ')
}

/**
 * Fatti chiave compatti per la griglia sintesi (prevalenza, sfumatura, orientamento, portato).
 * @returns {Array<{ id: string, label: string, value: string, method: string }>}
 */
export function buildSintesiKeyFacts({
  profilo = {},
  domTheme = {},
  textBlock = {},
  sottodisposizione = '',
  portato = null,
}) {
  const famiglia = (profilo.famigliaLabel || domTheme?.family || '').trim()
  const natura = (profilo.disposizione || domTheme?.characteristic || '').trim()
  const dimensione = textBlock?.restituzione_dimensione || profilo.focus || ''
  const facts = []

  if (famiglia) {
    facts.push({
      id: 'famiglia',
      label: 'Famiglia prevalente',
      value: famiglia,
      method: 'Più punti in questo test',
    })
  }

  if (natura) {
    facts.push({
      id: 'natura',
      label: 'Caratteristica emotiva (natura)',
      value: natura,
      method: 'Profilo della famiglia prevalente',
    })
  }

  const sotto = String(sottodisposizione || '').trim()
  const famValue = facts.find((f) => f.id === 'famiglia')?.value || ''
  if (sotto && sotto !== famValue && !famValue.includes(sotto)) {
    facts.push({
      id: 'sfumatura',
      label: 'Sfumatura prevalente',
      value: sotto,
      method: 'Corrente più forte',
    })
  }

  if (dimensione) {
    facts.push({
      id: 'orientamento',
      label: 'Orientamento',
      value: capitalizeLabel(dimensione),
      method: 'Descrittivo',
    })
  }

  if (portato?.prevalenteLabel) {
    facts.push({
      id: 'portato',
      label: 'Portato',
      value: portato.prevalenteLabel,
      method: 'Voce con più punti',
    })
  }

  return facts
}

/**
 * Sintesi del profilo — max 2 frasi per above-the-fold (senza codice colore né orientamento).
 */
export function buildSintesiLead({
  profilo = {},
  correntiByPeso = [],
  domTheme = {},
  textBlock = {},
}) {
  const famiglia = (profilo.famigliaLabel || domTheme?.family || '').trim()
  const natura = (profilo.disposizione || domTheme?.characteristic || '').trim()

  const estesi = (textBlock?.restituzione_caratteri_estesi || '').trim()
  const hook =
    firstSentence(estesi) ||
    firstSentence(profilo.fraseChiave) ||
    firstSentence(domTheme?.tagline) ||
    ''

  const parts = []

  if (famiglia && natura) {
    parts.push(`Prevalente la famiglia ${famiglia}, con natura ${natura}.`)
  } else if (famiglia) {
    parts.push(`Prevalente la famiglia ${famiglia}.`)
  }

  if (hook) {
    const plain = hook.replace(/\.$/, '')
    parts.push(`${plain.charAt(0).toUpperCase()}${plain.slice(1)}.`)
  }

  void correntiByPeso
  return parts.slice(0, 2).join(' ')
}

/**
 * Testo esteso per disclosure (orientamento e note integrative dal lead legacy).
 */
export function buildSintesiLeadExtended({
  profilo = {},
  domTheme: _domTheme = {},
  textBlock = {},
}) {
  const dimensione = textBlock?.restituzione_dimensione || profilo.focus || ''
  const orient = orientamentoNarrativo(dimensione)
  return orient ? [orient] : []
}

/**
 * Paragrafi di distribuzione percentuale, portato e chiusura integrativa.
 */
export function buildIntegrativeParagraphs({
  profilo = {},
  correntiByPeso = [],
  domTheme = {},
  portato = null,
  sottodisposizione = '',
}) {
  const famigliaPrevalente = profilo.famiglia || domTheme?.label || ''
  const famigliaLabel = (profilo.famigliaLabel || domTheme?.family || '').trim()
  const natura = (profilo.disposizione || domTheme?.characteristic || '').trim()

  const p1Parts = []
  if (famigliaLabel && natura) {
    p1Parts.push(`In questa somministrazione prevale la famiglia ${famigliaLabel}, con natura ${natura}.`)
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
