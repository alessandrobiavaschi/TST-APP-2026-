/**
 * Copy UI del report TST — didattico e chiaro.
 * Narrativa da punteggi: content_report.json / buildReportData.
 */

import {
  CONTEXT,
  HERO,
  GLOSSARY_UI,
  LEGAL_FOOTER,
  SECTION_INTROS,
  SINTESI_UI as SINTESI_REST,
} from '../../content/reportRestitution.js'
import { LESSICO_INTRO } from '../../content/statiAnimoLessico.js'

/** Criteri di lettura numerica — usare ovunque compaiano punteggi o etichette dominanti. */
export const REPORT_CRITERION = {
  legendItems: [
    'Prevalenza = somma dei punteggi della famiglia.',
    'Presenza = quanto quella famiglia ha risuonato nelle tue risposte durante l’ascolto.',
  ],
  legend:
    'Prevalenza = somma dei punteggi della famiglia. Presenza = quanto quella famiglia ha risuonato nelle tue risposte durante l’ascolto.',
  legendCompact:
    'Prevalenza · somma dei punteggi  |  Presenza · % di risonanza nel profilo',
  prevalenza: 'Prevalenza',
  attivazione: 'Presenza nel tuo profilo',
  attivazioneShort: 'Presenza',
  attivazioneTooltip:
    'Indica l’intensità con cui questa frequenza emotiva ha risuonato nelle tue risposte durante l’ascolto dei suoni.',
  famigliaPrevalente: 'Famiglia prevalente (somma dei punteggi)',
  temperamentoPrevalente: 'Temperamento (da prevalenza)',
  sottodisposizionePrevalente: 'Sottodisposizione (prevalenza)',
  portatoPrevalente: 'Portato prevalente (somma dei punteggi PE)',
  livelloRelativo: 'Livello relativo (1–7)',
  quotaPortato: 'Quota sul totale PE',
  quotaGrezza: 'Quota sul totale dei punteggi',
  naturaCriterio: 'Natura e temperamento derivano dalla prevalenza: la famiglia con più punti.',
  graficiAttivazione: 'Grafici e barre mostrano la presenza: quanto ogni famiglia ha risuonato nel profilo.',
}

/** @deprecated Usare REPORT_CRITERION.legend */
export const REPORT_CRITERION_LEGEND = REPORT_CRITERION.legend

/** Formatta un valore di attivazione (0–100). */
export function formatAttivazione(value) {
  const n = Math.round(Number(value) || 0)
  return `${n}%`
}

export const HERO_UI = {
  ...HERO,
  prevalenzaLabel: 'Famiglia con più punti · somma dei punteggi',
  activationLabel: 'Presenza · %',
  sottodisposizioneLabel: 'Sfumatura · corrente più forte',
}
export { GLOSSARY_UI }

export const SINTESI_UI = {
  eyebrow: 'Passo 1 · sintesi',
  title: SINTESI_REST.title,
  subtitle: SINTESI_REST.subtitle,
  srOnlyTitle: (userName) =>
    `Il tuo profilo, in sintesi — ${userName || 'report TST'}`,
  chipOrientamento: 'Orientamento',
  chipSottodisposizione: 'Sfumatura prevalente',
  chipPortato: 'Portato (prevalenza)',
  chipsAria: 'Indicatori chiave del profilo',
  howToReadToggle: SINTESI_REST.orientationTitle,
  leadExpandToggle: 'Approfondisci la sintesi del profilo',
  cardDominante: 'Temperamento (da prevalenza)',
  cardFamiglia: 'Famiglia prevalente',
  prevalenzaMethod: 'Più punti in questo test',
  naturaPrevalenteLabel: 'Temperamento',
  sottodisposizioneMethod: 'Corrente più forte',
  distribuzioneTitle: 'Presenza per famiglia',
  distribuzioneCaption: REPORT_CRITERION.graficiAttivazione,
  distribuzioneOrderLabel: 'Ordine per presenza',
  cardFocus: 'Dimensione di orientamento',
  orientationTitle: SINTESI_REST.orientationTitle,
  orientationBody: SINTESI_REST.orientationBody,
  orientationPoints: SINTESI_REST.orientationPoints,
  leadTitle: SINTESI_REST.leadTitle,
  integrativeTitle: SINTESI_REST.integrativeTitle,
  visualToggle: SINTESI_REST.visualToggle,
  glossaryLink: GLOSSARY_UI.openGlossary,
  radarTitle: 'Confronto presenza',
  radarCaption:
    'Assi: famiglie emotive. Valori: presenza % di risonanza nel profilo.',
  radarAriaLabel:
    'Grafico radar: presenza percentuale delle cinque famiglie emotive.',
  flowerAriaLabel:
    'Diagramma a petali: area proporzionale alla presenza di ciascuna famiglia.',
  subcurrentsTitle: 'Sottocorrenti (presenza)',
  editorialNote: SINTESI_REST.editorialNote,
  disclaimerShort:
    'Fotografia di questo test, non una definizione fissa della persona.',
  prevalenzaNota:
    `${REPORT_CRITERION.naturaCriterio} ${REPORT_CRITERION.graficiAttivazione}`,
}

export const PROFILO_UI = {
  eyebrow: 'Passo 2 · racconto',
  title: 'Cosa significa?',
  subtitle: 'Quattro capitoli in sequenza: natura, racconto, risorse, ombre.',
  panelIntroTitle: 'Cosa trovi qui',
  chapterNavHint: 'Salta al capitolo o scorri in ordine — tutti aperti.',
}

export const APPROFONDIMENTO_AREAS = ['Timbro', 'Intervalli', 'Ritmo', 'Melodia', 'Armonia']

export const APPROFONDIMENTO_UI = {
  eyebrow: 'Passo 5 · approfondimento sonoro',
  title: 'In quali stimoli si accende?',
  lead:
    'Il test sonoro si articola in cinque aree. Qui vedi se le famiglie emotive restano omogenee o se emergono contrasti a seconda dello stimolo.',
  chartPlainTitle: 'Come leggere il grafico',
  chartPlainSummary:
    'Ogni colonna è un’area del test. Le barre colorate mostrano quanto pesa ciascuna famiglia emotiva in quell’area: confronta le colonne per capire dove il profilo si accende di più.',
  chartCaption: 'Attivazione per area sonora · cinque famiglie emotive',
  areaTips: {
    Timbro: 'Colore e qualità del suono: cosa ti risuona come familiare o estraneo.',
    Intervalli: 'Distanze tra le note: tensione, rilascio e dialogo interno.',
    Ritmo: 'Pulsazione e tempo: slancio, calma e rapporto con l’agire.',
    Melodia: 'Linea cantabile: come segui o ti distacchi dal racconto sonoro.',
    Armonia: 'Accordi e insieme: clima complessivo e contemplazione.',
  },
  filtroEyebrow: 'Feedback finale',
  filtroTitle: 'Filtro musicale',
  filtroLead:
    'Risposte alle domande conclusive del test: aree di maggiore o minore agio, stato d’animo percepito e difficoltà incontrata.',
  accordionTitle: 'Cosa misura ogni area',
  accordionIntro:
    'Apri un’area per la lettura completa. I nomi corrispondono alle colonne del grafico sopra.',
  /** @deprecated Usare title/lead */
  intro:
    'Confronto immediato tra le cinque famiglie emotive in ogni area del test sonoro: Timbro, Intervalli, Ritmo, Melodia e Armonia.',
}

export const RAPPORTI_UI = {
  eyebrow: 'Passo 3 · quattro lenti',
  title: 'Dove cambia?',
  intro:
    'Quattro lenti sullo stesso profilo: natura, sé, altro e agire. Apri una scheda alla volta.',
  tablistAria: 'Seleziona rapporto',
  correntePrincipaleLabel: 'Famiglia più alta in questa lente',
  radarCaption: 'Livello relativo 1–7 per famiglia in questo rapporto (non è attivazione %).',
  radarScaleNote: 'Scala 1–7 · confronto interno a questa lente',
  scaleBannerTitle: 'Come leggere i grafici',
  scaleBanner:
    'Qui i grafici usano una scala 1–7 (confronto interno a ciascun rapporto), non le percentuali di attivazione della Sintesi.',
  readLabels: {
    composizione: 'Composizione',
    cosaIndica: 'Cosa indica',
  },
}

export const PORTATO_UI = {
  eyebrow: 'Passo 3 · vissuto',
  title: 'Come hai vissuto gli stimoli',
  lead:
    'Il portato esperienziale fotografa come hai orientato l’ascolto: attrazione (simpatia), rifiuto (antipatia) o distacco (indifferenza). Nel modello TST ogni stimolo mette in moto il calore affettivo — la voce prevalente è quella con più punti; le percentuali mostrano il bilancio tra le tre.',
  prevalenteLabel: 'Prevalenza',
  quotaLabel: 'Quota',
  badgePrevalente: 'Prevalente',
  gridAria: 'Punteggi portato esperienziale e quote',
}

export const PAROLE_UI = {
  eyebrow: 'Passo 4 · lessico',
  title: 'Quali parole restano?',
  zoneEmerseTitle: 'Le tue parole dal test',
  zoneEmerseLead: 'Aggettivi scelti nelle risposte — clicca per copiarli.',
  zoneDizionarioTitle: 'Dizionario di riferimento',
  zoneDizionarioLead: 'Vocabolario per famiglia: forme e aggettivi, non scelti da te nel test.',
  intro: SECTION_INTROS.parole.intro,
  guide: LESSICO_INTRO,
  paroleEmerseTitle: 'Parole emerse dal test',
  paroleEmerseHint: 'Aggettivi scelti nelle risposte del test (file 29–42). Clicca per copiare.',
  apriElencoCompleto: 'Apri elenco completo',
  chiudiElencoCompleto: 'Chiudi elenco completo',
  formeTitle: 'Forme',
  formeHint: 'Vocabolario nominale da «parole - STATI D\'ANIMO IN 4 FAMIGLIE».',
  aggettiviTitle: 'Aggettivi',
  aggettiviHint: 'Stati d\'animo aggettivali da «STATI D\'ANIMO IN 4 FAMIGLIE», per sotto-corrente.',
  sottoCorrentiTitle: 'Aggettivi per sotto-corrente',
  rapportoSeLabel: 'Nel rapporto con sé',
  noteMusicaliLabel: 'Predilezioni musicali',
  filtroAria: 'Filtra per corrente emotiva',
  filtroTutte: 'Tutte',
  filtroTutteAria: 'Mostra tutte le correnti',
  copyHint: 'Clicca un termine per copiarlo',
  footerModel: 'Report sonoro trasformativo',
  footerCredit: LEGAL_FOOTER,
  scrollTop: 'Torna all’inizio',
  copied: 'Copiato',
}

export const MAPPA_UI = {
  eyebrow: 'Mappa e relazioni',
  title: 'Campo emotivo e relazioni con gli altri',
  intro: SECTION_INTROS.mappa.intro,
  methodTitle: 'Come leggere questa sezione',
  methodParagraphs: SECTION_INTROS.mappa.points,
  methodPoints: [
    'Famiglia prevalente: famiglia con più punti complessivi.',
    'Attivazione nei grafici a petali: quanto si accende ciascuna famiglia.',
    'Portato esperienziale: voce con più punti tra simpatia, antipatia e indifferenza.',
  ],
  solarEyebrow: 'Campo emotivo',
  solarTitle: 'Le cinque aree del profilo',
  solarCopy:
    'Calma, Malinconia, Volitività, Entusiasmo e Anaffettività: i punteggi dei pianeti derivano da attivazione e sotto-correnti.',
  relationsEyebrow: 'Relazioni tra temperamenti',
  relationsTitle: 'Temperamento prevalente nelle relazioni (da prevalenza)',
  relationsCopy: '',
  sourceNote: null,
  simpleLead:
    'Dopo lo schema interno, qui trovi la mappa visiva del profilo e — in fondo — come il tuo temperamento si relaziona con gli altri.',
  summaryBoxTitle: 'In parole semplici',
  summaryZero:
    'La mappa solare mostra come si accendono le cinque famiglie nel tuo profilo. Le relazioni in fondo descrivono invece l’incontro con altri temperamenti — non la convivenza interna, già letta sopra.',
  advancedToggle: 'Mostra mappa solare e relazioni interpersonali',
}

export const DIALOGO_UI = {
  eyebrow: 'Passo 3 · dentro di te',
  title: 'Come convivono le correnti nel tuo profilo',
  /** @deprecated Usare lead */
  subtitle: (dominantLabel, nCoppie) =>
    `Come la parte ${dominantLabel} si affianca alle altre correnti presenti in questo profilo. ${nCoppie === 1 ? '1 combinazione attiva.' : `${nCoppie} combinazioni attive.`}`,
  lead: (dominantLabel, nCoppie) =>
    `Le famiglie convivono nello stesso profilo — non relazioni tra persone diverse. Parti da ${dominantLabel}: ${nCoppie === 1 ? '1 combinazione attiva' : `${nCoppie} combinazioni attive`}. Apri una card per le parole chiave.`,
  notaToggle: 'Nota metodologica e quote percentuali',
  notaBody:
    'Le percentuali sulle card sono quote sul totale dei punteggi delle famiglie in questo test. Le parole chiave descrivono come una famiglia modula l\'altra nello stesso profilo — non compatibilità tra persone. Fonte: documento del comitato scientifico TST.',
  quotaPctTitle: 'Quota sul totale dei punteggi',
}

export const TRACCE_UI = {
  eyebrow: 'Tracce',
  title: 'Collegamenti report–Galassia',
  lead:
    'In questa area ogni sezione del report si collegherà alla mappa delle correnti, con navigazione diretta alla famiglia corrispondente.',
  note: 'Sezione in preparazione',
}

export const HELP_MODAL_UI = {
  title: 'Guida alla lettura del report',
  closeAria: 'Chiudi la guida',
  rileggLabel: 'Rileggi l’introduzione',
  lead:
    'Leggi il report in cinque passi, dall’alto verso il basso. Ogni passo aggiunge un livello di dettaglio.',
  items: [
    {
      title: '1 · Che profilo emerge?',
      text: 'Sintesi del profilo: famiglia prevalente, sfumatura e distribuzione generale.',
    },
    {
      title: '2 · Cosa significa?',
      text: 'Profilo descrittivo in quattro capitoli: natura, racconto, risorse e ombre.',
    },
    {
      title: '3 · Dove cambia?',
      text: 'Quattro rapporti, portato, schema interno delle correnti e mappa con relazioni interpersonali.',
    },
    {
      title: '4 · Quali parole restano?',
      text: 'Lessico emerso dal test e vocabolario di riferimento per famiglia. Clicca un termine per copiarlo.',
    },
    {
      title: '5 · In quali stimoli si accende?',
      text: 'Approfondimento sonoro: Timbro, Intervalli, Ritmo, Melodia e Armonia, più filtro musicale finale.',
    },
    {
      title: 'Galassia',
      text: 'Mappa interattiva delle correnti e delle sotto-correnti del modello.',
    },
  ],
}

export const PRIMA_LETTURA_UI = {
  eyebrow: CONTEXT.eyebrow,
  title: CONTEXT.title,
  body: CONTEXT.body,
  pills: CONTEXT.pills,
  dontShowAgainLabel: CONTEXT.dontShowAgainLabel,
  whyToggle: CONTEXT.whyToggle,
  whyPanelAria: 'Perché partire da qui',
  whyExpanded: CONTEXT.whyExpanded,
  pillsAria: CONTEXT.pillsAria,
  cta: CONTEXT.cta,
}

export const NAVBAR_UI = {
  reportKicker: 'Il tuo report',
  modalitaAria: 'Vista: report scritto o mappa Galassia',
  temperamentLabel: 'Temperamento (prevalenza)',
  helpAria: 'Guida alla lettura del report',
  download: 'Scarica',
}

export const REPORT_NAV_UI = {
  indexTitle: 'Percorso di lettura',
  indexHint: 'Cinque passi in ordine. Tocca una voce per saltare alla sezione.',
  ariaLabel: 'Indice del report — navigazione tra sezioni',
  layoutHint:
    'Leggi dall’alto verso il basso. Ogni blocco aggiunge un livello: prima sintesi, poi racconto, poi dettagli.',
}

export const READING_GUIDE_UI = {
  eyebrow: 'Percorso di lettura',
  title: 'Leggi il report in 5 passaggi',
  toggleLabel: 'Mostra il percorso consigliato',
  toggleLabelOpen: 'Nascondi il percorso',
  body:
    'Parti dalla sintesi e scorri in ordine, oppure salta al passo che risponde alla tua domanda in questo momento.',
  rememberClosedLabel: 'Non aprire automaticamente al prossimo accesso',
  rememberClosedHint: 'Puoi riaprire il percorso in qualsiasi momento con il pulsante sopra.',
  stepButtonAria: (title) => `Vai al passo: ${title}`,
  steps: [
    {
      id: 'report-tst-sintesi',
      groupId: 'report-group-identita',
      label: '1',
      title: 'Che profilo emerge?',
      text: 'Guarda famiglia prevalente, sfumatura principale e distribuzione delle cinque famiglie.',
    },
    {
      id: 'report-tst-profilo',
      groupId: 'report-group-profilo',
      label: '2',
      title: 'Cosa significa?',
      text: 'Leggi natura, racconto, risorse e ombre: qui il numero diventa testo.',
    },
    {
      id: 'report-tst-rapporti',
      groupId: 'report-group-rapporti',
      label: '3',
      title: 'Dove cambia?',
      text: 'Confronta natura, sé, altro e agire; poi portato, schema interno e relazioni con altri temperamenti.',
    },
    {
      id: 'report-tst-parole',
      groupId: 'report-group-lessico',
      label: '4',
      title: 'Quali parole restano?',
      text: 'Usa il lessico per nominare meglio gli stati d’animo emersi.',
    },
    {
      id: 'report-tst-approfondimento',
      groupId: 'report-group-approfondimento',
      label: '5',
      title: 'In quali stimoli si accende?',
      text: 'Confronta Timbro, Intervalli, Ritmo, Melodia e Armonia per vedere dove il profilo cambia.',
    },
  ],
}

export const REPORT_SHELL_UI = {
  unavailableTitle: 'Report non disponibile',
  unavailableMessage:
    'I dati del report non sono stati caricati correttamente. Apri di nuovo il test dalla pagina risultati.',
  galassiaAria: 'Modalità Galassia',
  reportAria: 'Report del profilo',
  loading: 'Caricamento del report',
  loadingInline: 'Caricamento in corso',
  home: 'Torna alla home',
  archive: 'Vai all’archivio',
}

export const GALASSIA_PORTATO_UI = {
  intro:
    'Il portato esperienziale descrive come hai vissuto l’ascolto nel test: attrazione (simpatia), rifiuto (antipatia) o distacco (indifferenza). Nel modello TST, ogni stimolo sonoro mette in moto il «calore» affettivo: per simpatia il flusso si aggancia al filtro personale, per antipatia si allontana, per indifferenza resta neutro.',
  scaleNote:
    'Le percentuali sono quote sul totale dei tre punteggi PE in questo test — non giudizi sulla persona, ma fotografia di come hai orientato le risposte.',
  tapHint: 'Tocca un mondo per la lettura di quella voce: definizione, quota e significato nel test.',
  prevalenteLabel: 'Voce prevalente',
  vitalitaLabel: 'Asse vitalità / depressione',
  triadAria: 'Bilancio portato esperienziale: simpatia, antipatia, indifferenza',
  axisAttrazione: 'Attrazione',
  axisRifiuto: 'Rifiuto',
  axisDistacco: 'Distacco',
  cosaIndicaLabel: 'Nel modello TST',
  cards: [
    {
      id: 'Simpatia',
      label: 'Simpatia / Empatia',
      areas: 'Calore · Risonanza',
      metaphor: 'Aggancio al suono',
      meaning:
        'Attrazione, piacere, coinvolgimento: il flusso musicale si lega al filtro affettivo e provoca fono-sintesi — evocazione emotiva in risonanza.',
    },
    {
      id: 'Antipatia',
      label: 'Antipatia',
      areas: 'Rifiuto · Fastidio',
      metaphor: 'Distanza dal suono',
      meaning:
        'Repulsione, irritazione, chiusura: il materiale sonoro tocca corde di rifiuto; energia presente ma orientata all’allontanamento.',
    },
    {
      id: 'Indifferenza',
      label: 'Indifferenza / Nichilismo',
      areas: 'Neutro · Distacco',
      metaphor: 'Presa di distanza',
      meaning:
        'Scarso coinvolgimento, neutralità: l’esperienza resta «da fuori»; nel modello indica raffreddamento del calore interiore verso lo stimolo.',
    },
  ],
}

export const GALASSIA_RAPPORTI_UI = {
  intro:
    'Quattro lenti — natura, sé, altro, agire — sullo stesso profilo. Ogni lente mostra come si distribuiscono le cinque famiglie in quella direzione.',
  scaleNote:
    'I valori sono livelli 1–7 interni a ciascuna lente, non le percentuali della Sintesi.',
  tapHint: 'Seleziona una lente per aprire il radar delle cinque famiglie.',
  idleHintKicker: 'Quattro rapporti',
  idleHintLead:
    'Natura, sé, altro e agire: quattro lenti sullo stesso profilo. Livelli 1–7, non percentuali.',
  constellationHint: 'Tocca un satellite per il livello di una singola famiglia (scala 1–7).',
  dominantLabel: 'Famiglia più alta in questa lente',
  cards: [
    {
      id: 'natura',
      label: 'Natura di base',
      areas: 'Timbro + Intervalli + Armonia',
      metaphor: 'Terra · Luce · Calore',
      meaning: 'Il suolo emotivo: chi sei al di là delle situazioni.',
    },
    {
      id: 'se',
      label: 'Rapporto con te stesso',
      areas: 'Intervalli + Melodia',
      metaphor: 'Luce · Aria',
      meaning: 'Interiorità e dialogo con te stesso.',
    },
    {
      id: 'altro',
      label: 'Rapporto con l’Altro',
      areas: 'Timbro + Melodia',
      metaphor: 'Terra · Aria',
      meaning: 'Come ti disponi verso persone e ambiente.',
    },
    {
      id: 'agire',
      label: 'Rapporto con l’Agire',
      areas: 'Ritmo + Melodia',
      metaphor: 'Acqua · Aria',
      meaning: 'Come trasformi emozioni in movimento e iniziativa.',
    },
  ],
}

export const GALASSIA_MAP_MODES = [
  { id: 'disposizioni', label: 'Disposizioni', shortLabel: 'Mappa', hint: 'Cinque famiglie · Rosa dei venti' },
  {
    id: 'rapporti',
    label: 'Quattro rapporti',
    shortLabel: 'Rapporti',
    hint: 'Quattro lenti: natura, sé, altro, agire · scala 1–7',
  },
  {
    id: 'portato',
    label: 'Portato',
    shortLabel: 'Portato',
    hint: 'Come hai vissuto gli stimoli: simpatia, antipatia, indifferenza',
  },
  { id: 'parole', label: 'Parole', shortLabel: 'Parole', hint: 'Lessico per disposizione, sfumature e relazioni' },
]

export const GALASSIA_UI = {
  chromeTitle: 'Galassia',
  sceneKicker: 'Mappa · Rosa dei venti',
  sceneTitle: 'Rosa dei venti emotiva',
  sceneSubtitle:
    'Cinque famiglie emotive con pesi del test: seleziona una corrente per vedere relazioni, sfumature e rapporti',
  guideToggleOpen: 'Guida',
  guideToggleClose: 'Chiudi guida',
  guidePanelTitle: 'Percorso di lettura',
  guidePanelDismiss: 'Ho capito',
  guideToggleAria: 'Mostra o nascondi la guida operatore alla mappa',
  idleHintKicker: {
    disposizioni: 'Cinque disposizioni',
    rapporti: 'Quattro rapporti',
    portato: 'Portato esperienziale',
    parole: 'Lessico emerso',
  },
  modeSwitchAria: 'Sezione della Galassia',
  modeIdle: {
    disposizioni: 'Cinque famiglie sulla rosa dei venti del modello TST.',
    rapporti: GALASSIA_RAPPORTI_UI.intro,
    portato: GALASSIA_PORTATO_UI.intro,
    parole: 'Lessico TST per disposizione: parole emerse, dizionario e sfumature interne di ogni famiglia.',
  },
  monitorKicker: 'Lettura',
  monitorAria: 'Lettura della corrente o sfumatura selezionata',
  legend: null,
  hoverHint: null,
  idleDominantLabel: 'Più presente in questo test',
  famigliaPrefix: 'Famiglia',
  polaritaPrefix: 'Flusso',
  cosaIndicaPrefix: 'Cosa suggerisce',
  statiLabel: 'Parole del test',
  sottoCount: (n) =>
    n === 1 ? '1 sfumatura' : `${n} sfumature`,
  backToParent: (nome) => `Torna a ${nome}`,
  backToMap: 'Torna alla mappa',
  resetCamera: 'Centra',
  clickPlanetHint: 'Tocca un mondo per aprire costellazione e lettura.',
  clickPlanetHintShort: 'Tocca un mondo sulla mappa.',
  mapHintByMode: {
    disposizioni: 'Tocca un mondo per aprire costellazione e lettura.',
    rapporti: 'Tocca una lente — natura, sé, altro o agire.',
    portato: 'Tocca un mondo per leggere simpatia, antipatia o indifferenza.',
    parole: 'Tocca una famiglia per vedere parole, sottodisposizioni e relazioni.',
  },
}

export const GALASSIA_READING_STEPS_BY_MODE = {
  portato: [
    {
      id: 'cosa',
      label: '1',
      title: 'Tre modi di vivere l’ascolto',
      text: 'Simpatia, antipatia e indifferenza completano le correnti: dicono se uno stimolo è stato cercato, respinto o lasciato in disparte.',
    },
    {
      id: 'triade',
      label: '2',
      title: 'Leggi il triangolo',
      text: 'La barra e i tre mondi mostrano il bilancio: la dimensione del cerchio è la quota % di ciascuna voce sul totale PE.',
    },
    {
      id: 'prevalenza',
      label: '3',
      title: 'Parti dalla prevalente',
      text: 'La voce con più punti orienta la lettura; le altre due mostrano quanto convivono risonanza, rifiuto e distacco.',
    },
    {
      id: 'zoom',
      label: '4',
      title: 'Apri un mondo',
      text: 'Tocca simpatia, antipatia o indifferenza per la definizione dal manuale e il significato nel tuo test.',
    },
  ],
  rapporti: [
    {
      id: 'cosa',
      label: '1',
      title: 'Quattro lenti, stesso profilo',
      text: 'Natura, sé, altro e agire sono quattro direzioni affettive. Ogni lente mescola aree musicali diverse.',
    },
    {
      id: 'scala',
      label: '2',
      title: 'Scala 1–7, non percentuali',
      text: 'Il numero sotto ogni lente è il livello della famiglia dominante in quella direzione (max 7), non un’attivazione %.',
    },
    {
      id: 'confronto',
      label: '3',
      title: 'Confronta le lenti',
      text: 'Gli scarti tra natura e agire, sé e altro, sono parte della lettura: rivelano dove il profilo cambia tono.',
    },
    {
      id: 'zoom',
      label: '4',
      title: 'Apri una lente',
      text: 'Tocca un mondo: i satelliti mostrano il livello di ciascuna famiglia nel radar di quella lente.',
    },
  ],
}

export const GALASSIA_READING_STEPS = [
  {
    id: 'mappa',
    label: '1',
    title: 'Guarda la mappa',
    text: 'La dimensione dei pianeti indica quanto ogni disposizione si accende in questo test.',
  },
  {
    id: 'prevalenza',
    label: '2',
    title: 'Parti dalla prevalente',
    text: 'Il pianeta più presente è il centro della lettura, non una definizione chiusa.',
  },
  {
    id: 'rapporti',
    label: '3',
    title: 'Leggi i rapporti',
    text: 'Le disposizioni si modulano tra loro: alcune calmano, altre spingono o distanziano.',
  },
  {
    id: 'costellazioni',
    label: '4',
    title: 'Apri le costellazioni',
    text: 'Tocca un mondo: i satelliti mostrano le sfumature interne della disposizione selezionata.',
  },
  {
    id: 'modes',
    label: '5',
    title: 'Cambia prospettiva',
    text: 'Scegli Disposizioni, Rapporti, Portato o Parole — stessi dati del report, lenti diverse.',
  },
]

export const GALASSIA_TUTORIAL_UI = {
  eyebrow: 'Prima volta sulla mappa',
  title: 'Come esplorare la Galassia',
  lead:
    'Cinque famiglie emotive disposte come la Rosa dei venti del modello TST. Ecco come orientarti.',
  cta: 'Inizia l’esplorazione',
  dontShowAgainLabel: 'Non mostrare più all’apertura',
  dialogAria: 'Introduzione alla Galassia',
  backdropAria: 'Chiudi introduzione',
}
