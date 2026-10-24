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
    'Presenza = quota percentuale di ciascuna famiglia rispetto al totale del profilo (fette di una torta).',
  ],
  legend:
    'Prevalenza = somma dei punteggi della famiglia. Presenza = quota percentuale di ciascuna famiglia rispetto al totale del profilo (fette di una torta).',
  legendCompact:
    'Prevalenza · somma dei punteggi  |  Presenza · quota % sul totale del profilo (fette di una torta)',
  prevalenza: 'Prevalenza',
  attivazione: 'Presenza nel tuo profilo',
  attivazioneShort: 'Presenza',
  attivazioneTooltip:
    'Indica la quota percentuale di ciascuna famiglia emotiva rispetto al totale del profilo (come fette di una torta).',
  famigliaPrevalente: 'Famiglia prevalente (somma dei punteggi)',
  temperamentoPrevalente: 'Qualità (da prevalenza)',
  sottodisposizionePrevalente: 'Sottodisposizione (prevalenza)',
  portatoPrevalente: 'Portato prevalente (somma dei punteggi PE)',
  livelloRelativo: 'Livello relativo (1–7)',
  quotaPortato: 'Quota sul totale PE',
  quotaGrezza: 'Quota sul totale dei punteggi',
  naturaCriterio: 'Natura e qualità derivano dalla prevalenza: la famiglia con più punti.',
  graficiAttivazione: 'Presenza = quota percentuale di ciascuna famiglia emotiva rispetto al totale del profilo (fette di una torta).',
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
  activationLabel: 'Presenza · %',
  sottodisposizioneLabel: 'Sfumatura · corrente più forte',
}
export { GLOSSARY_UI }

export const SINTESI_UI = {
  eyebrow: 'Sintesi del profilo',
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
  cardDominante: 'Qualità (da prevalenza)',
  cardFamiglia: 'Famiglia prevalente',
  prevalenzaMethod: 'Più punti in questo test',
  naturaPrevalenteLabel: 'Qualità',
  sottodisposizioneMethod: 'Corrente più forte',
  distribuzioneTitle: 'Grafici dei risultati',
  distribuzioneCaption: '',
  distribuzioneOrderLabel: 'Ordine delle famiglie per presenza',
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
  prevalenzaNota: REPORT_CRITERION.naturaCriterio,
}

export const PROFILO_UI = {
  eyebrow: 'Natura emotiva',
  title: 'La tua natura emotiva di appartenenza',
  panelIntroTitle: 'Cosa trovi qui',
  chapterNavHint: 'Salta all’aspetto o scorri in ordine — tutti aperti.',
  compositionIntro: 'Il tuo profilo non è fatto da una sola famiglia: ecco come vi entrano le altre.',
  compositionCta: 'Approfondisci tutte le famiglie',
}

export const COMPOSIZIONE_UI = {
  title: 'Le altre famiglie nel tuo profilo',
  lead: PROFILO_UI.compositionIntro,
  scopriDiPiu: 'Scopri di più',
}

export const APPROFONDIMENTO_AREAS = ['Timbro', 'Intervalli', 'Ritmo', 'Melodia', 'Armonia']

export const APPROFONDIMENTO_UI = {
  eyebrow: 'Approfondimento sonoro',
  title: 'Aree sonore in relazione alle cinque famiglie',
  lead:
    'Durante il test hai ascoltato e risposto in diverse sezioni, ciascuna dedicata a un aspetto del linguaggio musicale. Qui vedi con più precisione come hai risposto sezione per sezione: quali famiglie emotive sono state più presenti, per un quadro più completo oltre al solo risultato finale.',
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
  areeSectionEyebrow: 'Le dimensioni dell’ascolto',
  areeSectionTitle: 'Le 5 aree musicali',
  areeSectionIntro:
    'Il TST attraversa cinque dimensioni fondamentali dell’esperienza musicale. Ognuna osserva un aspetto diverso del rapporto con il suono.',
  areeToFeedbackBridge:
    'Ora che conosci le cinque dimensioni, ecco come le hai vissute durante il test.',
  filtroEyebrow: 'Feedback finale',
  filtroTitle: 'Filtro musicale',
  filtroLead:
    'Risposte alle domande conclusive del test: aree di maggiore o minore agio, stato d’animo percepito e difficoltà incontrata.',
  accordionTitle: 'Cosa misura ogni area',
  accordionIntro:
    'Seleziona un’area per la lettura completa. I nomi corrispondono alle colonne del grafico sopra.',
  /** @deprecated Usare title/lead */
  intro:
    'Confronto immediato tra le cinque famiglie emotive in ogni area del test sonoro: Timbro, Intervalli, Ritmo, Melodia e Armonia.',
}

/**
 * Etichette in linguaggio non tecnico per il report generale (mai nella scheda For Musicians,
 * dove restano i nomi tecnici Timbro/Intervalli/Ritmo/Melodia/Armonia).
 */
export const AREA_PLAIN_LABEL = {
  Timbro: 'Suono',
  Intervalli: 'Distanze tra le note',
  Ritmo: 'Tempo',
  Melodia: 'Melodia',
  Armonia: 'Accordi',
}

const AREA_PLAIN_COPY_OVERRIDES = {
  Timbro: {
    cosa_comprende:
      'Questa sezione lavora sul colore del suono, sulla qualità e sulla «voce» degli strumenti e dei materiali sonori che incontri durante il test.',
    rapporto_anima:
      'Il suono ha un rapporto diretto con l’anima intesa come risonanza interiore: rivela come ti riconosci (o meno) in certe sonorità e come la tua parte più intima risponde al colore del suono.',
  },
  Intervalli: {
    cosa_comprende:
      'Questa sezione riguarda le distanze tra le note, le tensioni e i rilasci che la musica crea tra suono e suono.',
    rapporto_anima:
      'Le distanze tra le note toccano il rapporto con l’anima nel senso del dialogo con te stesso: rivelano come abiti lo spazio interiore tra tensione e quiete, tra domanda e risposta emotiva.',
  },
  Ritmo: {
    cosa_comprende:
      'Questa sezione lavora sulla pulsazione, sul tempo, sugli andamenti veloci o lenti e sulla spinta al movimento che la musica trasmette.',
    rapporto_anima:
      'Il tempo ha un rapporto con l’anima come slancio vitale: mostra come la tua parte più profonda si mette in moto o si placa, come stai nel fluire del tempo e nell’impulso ad agire.',
  },
  Armonia: {
    cosa_comprende:
      'Questa sezione lavora sugli accordi, sulla sovrapposizione dei suoni e sul clima che nasce dall’insieme delle voci musicali.',
    cosa_rappresenta:
      'Rappresenta la tua capacità di stare nell’insieme, nella complessità e nella contemplazione: come vivi gli spazi ampi, le trame ricche, il sostegno che gli accordi danno alla riflessione e al sogno.',
    cosa_attiva:
      'Attiva la dimensione contemplativa e di risonanza globale: non più la singola linea ma il «luogo» emotivo che gli accordi creano. È l’area che più si avvicina al silenzio interiore, alla calma e alla ricerca di senso.',
    rapporto_anima:
      'Gli accordi hanno un rapporto con l’anima come spazio di risonanza: rivelano come ti apri (o ti chiudi) al clima affettivo complesso, come abiti il silenzio e la pienezza dell’ascolto.',
  },
}

/** Etichetta visibile di un'area: tecnica per i musicisti, in linguaggio comune nel report generale. */
export function getAreaLabel(nomeSezione, plainLanguage) {
  return plainLanguage ? AREA_PLAIN_LABEL[nomeSezione] || nomeSezione : nomeSezione
}

/** Testo dell'area: tecnico per i musicisti, riscritto in linguaggio comune nel report generale. */
export function getAreaCopy(nomeSezione, sezione, plainLanguage) {
  if (!plainLanguage || !sezione) return sezione
  const overrides = AREA_PLAIN_COPY_OVERRIDES[nomeSezione]
  return overrides ? { ...sezione, ...overrides } : sezione
}

export const RAPPORTI_UI = {
  eyebrow: 'Quattro lenti',
  title: 'Quattro prospettive',
  intro:
    "Le quattro lenti leggono lo stesso profilo in prospettive diverse: fondo emotivo, rapporto con sé, apertura all’altro e spinta ad agire.",
  lensesKicker: 'Per cosa stanno',
  lensesTitle: 'Ogni lente risponde a una domanda diversa',
  lensesLead:
    'Il numero 1–7 non è un voto sulla persona: indica quanto la famiglia emotiva più forte domina dentro quella lente.',
  tablistAria: 'Seleziona rapporto',
  correntePrincipaleLabel: 'Famiglia più alta in questa lente',
  radarCaption:
    'Cinque famiglie distinte: Malinconica, Marziale, Flemmatica, Entusiasta e Razionale · seleziona un vertice o una riga',
  radarScaleNote:
    '7 = famiglia più alta nella lente; gli altri valori sono proporzionati allo stesso massimo; 0 punti è mostrato come minimo visuale 1/7',
  scaleBannerTitle: 'Come leggere i grafici',
  scaleBanner:
    'Qui i grafici usano una scala 1–7 (confronto interno a ciascun rapporto), non le percentuali di attivazione della Sintesi.',
  lensCards: [
    {
      id: 'natura',
      question: 'Che tono emotivo hai di base?',
      plain: 'Il tuo equilibrio emotivo di base',
      areasPlain: 'Suono, Distanze tra le note e Accordi',
    },
    {
      id: 'se',
      question: 'Come stai in rapporto con te?',
      plain: 'Come riconosci ciò che senti',
      areasPlain: 'Distanze tra le note e Melodia',
    },
    {
      id: 'altro',
      question: 'Come ti apri a persone e ambiente?',
      plain: 'Come entri in relazione con gli altri',
      areasPlain: 'Suono e Melodia',
    },
    {
      id: 'agire',
      question: 'Come trasformi il sentire in azione?',
      plain: 'Come trasformi il sentire in azione',
      areasPlain: 'Tempo e Melodia',
    },
  ],
  readLabels: {
    composizione: 'Aree sonore usate',
    cosaIndica: 'Cosa indica nel profilo',
  },
}

export const PORTATO_UI = {
  eyebrow: 'Vissuto del test',
  title: 'La tua relazione con il contenuto musicale',
  lead:
    'Il punto combina sintonia, distonia e distanza emerse durante questo ascolto.',
  labels: {
    Simpatia: 'Sintonia',
    Antipatia: 'Distonia',
    Indifferenza: 'Indifferenza',
  },
  padAria: 'Orientamento dell’ascolto tra sintonia, distonia e distanza',
  padCenterLabel: 'Compresenza',
  prevalenteLabel: 'Prevalenza',
  quotaLabel: 'Quota',
  badgePrevalente: 'Prevalente',
  gridAria: 'Punteggi di sintonia, distonia e distanza e relative quote',
}

export const PAROLE_UI = {
  eyebrow: "Un contributo all'educazione emotiva",
  title: 'Parole',
  educazioneSubtitle: 'Aggettivi, sostantivi, parole di sintesi e collegamenti tra le famiglie',
  educazioneParagraphs: [
    "Uno degli aspetti dell'educazione emotiva è rendersi sempre più consapevoli degli effetti che la Musica provoca nel suscitare in modo del tutto naturale sentimenti, emozioni e stati d'animo.",
    "Al sorgere di queste molteplici sensazioni dovrebbe essere associata anche la capacità di nominarle e di selezionarle. La costruzione di un proprio dizionario dei sentimenti è un preludio concreto per praticare l'educazione emotiva.",
  ],
  educazioneCta: 'Naviga qui sotto e rendi vive queste parole quando ti trovi ad ascoltare la Musica.',
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
  formeHint: 'Sostantivi dal PDF «Parole per TST» (Franco Mussida).',
  aggettiviTitle: 'Aggettivi',
  aggettiviHint: 'Aggettivi dal PDF «Parole per TST» (Franco Mussida), per natura.',
  sottoCorrentiTitle: 'Aggettivi per sotto-corrente',
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
  eyebrow: 'Passo 3 · relazioni',
  title: 'Le cinque famiglie emotive in relazione tra loro',
  intro: SECTION_INTROS.mappa.intro,
  methodTitle: 'Come leggere questa sezione',
  methodParagraphs: SECTION_INTROS.mappa.points,
  methodPoints: [
    'Famiglia prevalente: la famiglia con più punti complessivi; dà il tono principale del profilo.',
    'Relazioni tra temperamenti: come il temperamento prevalente può incontrare gli altri temperamenti.',
    'Le ipotesi descrivono tendenze emerse dal test, non un verdetto fisso sulla persona.',
  ],
  relationsEyebrow: 'Relazioni tra temperamenti',
  relationsTitle: 'Temperamento prevalente nelle relazioni (da prevalenza)',
  relationsCopy: '',
  sourceNote: null,
  simpleLead:
    'Qui trovi una lettura su come il temperamento prevalente può incontrare gli altri temperamenti.',
  summaryBoxTitle: 'In parole semplici',
  summaryZero:
    'Questa sezione risponde a una domanda diversa: come il temperamento prevalente incontra altri temperamenti.',
  advancedToggle: 'Mostra relazioni interpersonali',
}

export const DIALOGO_UI = {
  eyebrow: 'Passo 4 · dentro di te',
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
  title: 'Come orientarti nel report',
  closeAria: 'Chiudi la guida',
  rileggLabel: 'Rileggi l’introduzione',
  lead:
    'Non devi leggere tutto in una volta. Parti dalla sintesi e approfondisci ciò che ti incuriosisce: ogni sezione osserva le risposte sonore da un punto di vista diverso.',
  items: [
    {
      title: '1 · Il profilo in sintesi',
      text: 'Riconosci la disposizione prevalente, la sottodisposizione e la presenza delle cinque famiglie emotive nel risultato.',
    },
    {
      title: '2 · La famiglia emotiva',
      text: 'Entra nella lettura di Natura, Racconto, Risorse e Ombre della famiglia emersa come prevalente.',
    },
    {
      title: '3 · I quattro rapporti e il dialogo interno',
      text: 'Osserva come le correnti si organizzano nella natura di base e nei rapporti con te, con l’altro e con l’agire.',
    },
    {
      title: '4 · Attivazioni e portato esperienziale',
      text: 'Distingui la forza delle correnti dal modo in cui gli stimoli hanno generato simpatia, antipatia o indifferenza.',
    },
    {
      title: '5 · Parole e stati d’animo',
      text: 'Usa il lessico emotivo per dare un nome alle sfumature emerse e confrontarle con quelle delle altre famiglie.',
    },
    {
      title: '6 · Dove si attiva il profilo',
      text: 'Scopri quali risposte arrivano da Suono, Distanze tra le note, Tempo, Melodia e Accordi e come contribuiscono al filtro musicale.',
    },
    {
      title: 'Le viste alternative',
      text: 'Apri Galassia per esplorare la mappa interattiva delle correnti, oppure For Musicians & Music Lovers per la lettura dedicata alla dimensione musicale.',
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
  temperamentLabel: 'Qualità (prevalenza)',
  helpAria: 'Guida alla lettura del report',
  download: 'Scarica',
}

export const REPORT_NAV_UI = {
  indexTitle: 'Percorso di lettura',
  indexHint: 'Cinque passi in ordine. Apri un blocco e scegli la sotto-sezione.',
  ariaLabel: 'Indice del report — navigazione tra sezioni',
  layoutHint:
    'Leggi dall’alto verso il basso. Ogni blocco aggiunge un livello: prima sintesi, poi racconto, poi dettagli.',
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
    'Il portato esperienziale descrive come hai vissuto l’ascolto nel test: sintonia, distonia o distanza. Nel modello TST, ogni stimolo sonoro può entrare in risonanza, generare attrito oppure restare neutro.',
  scaleNote:
    'Le percentuali sono quote sul totale dei tre punteggi PE in questo test — non giudizi sulla persona, ma fotografia di come hai orientato le risposte.',
  tapHint: 'Tocca un mondo per la lettura di quella voce: definizione, quota e significato nel test.',
  prevalenteLabel: 'Voce prevalente',
  vitalitaLabel: 'Asse vitalità / depressione',
  triadAria: 'Bilancio portato esperienziale: sintonia, distonia, distanza',
  axisAttrazione: 'Sintonia',
  axisRifiuto: 'Distonia',
  axisDistacco: 'Indifferenza',
  cosaIndicaLabel: 'Nel modello TST',
  cards: [
    {
      id: 'Simpatia',
      label: 'Sintonia',
      areas: 'Calore · Risonanza',
      metaphor: 'Aggancio al suono',
      meaning:
        'Attrazione, piacere, coinvolgimento: il flusso musicale si lega al filtro affettivo e provoca fono-sintesi — evocazione emotiva in risonanza.',
    },
    {
      id: 'Antipatia',
      label: 'Distonia',
      areas: 'Rifiuto · Fastidio',
      metaphor: 'Distanza dal suono',
      meaning:
        'Repulsione, irritazione, chiusura: il materiale sonoro tocca corde di rifiuto; energia presente ma orientata all’allontanamento.',
    },
    {
      id: 'Indifferenza',
      label: 'Indifferenza',
      areas: 'Neutro · Distacco',
      metaphor: 'Presa di distanza',
      meaning:
        'Scarso coinvolgimento, neutralità: l’esperienza resta «da fuori»; nel modello indica raffreddamento del calore interiore verso lo stimolo.',
    },
  ],
}

export const GALASSIA_RAPPORTI_UI = {
  intro:
    'Quattro lenti sullo stesso profilo: tono di base, rapporto con sé, apertura all’altro e spinta ad agire. Ogni lente mostra quale famiglia emotiva pesa di più in quella direzione.',
  scaleNote:
    'I valori sono livelli 1–7 interni a ciascuna lente, non le percentuali della Sintesi.',
  tapHint: 'Seleziona una lente per vedere da quali famiglie emotive è composta.',
  idleHintKicker: 'Quattro rapporti',
  idleHintLead:
    'Natura, sé, altro e agire non sono persone diverse: sono quattro modi di leggere lo stesso profilo. Livelli 1–7, non percentuali.',
  constellationHint: 'Tocca un satellite per il livello di una singola famiglia (scala 1–7).',
  dominantLabel: 'Famiglia più alta in questa lente',
  cards: [
    {
      id: 'natura',
      label: 'Natura di base',
      areas: 'Suono + Distanze tra le note + Accordi',
      metaphor: 'Terra · Luce · Calore',
      meaning: 'Risponde a: che tono emotivo hai di base?',
    },
    {
      id: 'se',
      label: 'Rapporto con te stesso',
      areas: 'Distanze tra le note + Melodia',
      metaphor: 'Luce · Aria',
      meaning: 'Risponde a: come stai in rapporto con la tua interiorità?',
    },
    {
      id: 'altro',
      label: 'Rapporto con l’Altro',
      areas: 'Suono + Melodia',
      metaphor: 'Terra · Aria',
      meaning: 'Risponde a: come ti apri a persone e ambiente?',
    },
    {
      id: 'agire',
      label: 'Rapporto con l’Agire',
      areas: 'Tempo + Melodia',
      metaphor: 'Acqua · Aria',
      meaning: 'Risponde a: come trasformi il sentire in movimento?',
    },
  ],
}

export const GALASSIA_MAP_MODES = [
  { id: 'disposizioni', label: 'Disposizioni', shortLabel: 'Mappa', hint: 'Cinque famiglie · Energia Emotiva' },
  {
    id: 'portato',
    label: 'Portato',
    shortLabel: 'Portato',
    hint: 'Come hai vissuto gli stimoli: simpatia, antipatia, indifferenza',
  },
  {
    id: 'parole',
    label: 'Lessico',
    shortLabel: 'Lessico',
    hint: 'Parole emerse e dizionario TST per ogni disposizione',
  },
]

export const GALASSIA_UI = {
  chromeTitle: 'Galassia',
  sceneKicker: 'Mappa · Energia Emotiva',
  sceneTitle: 'Energia Emotiva',
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
    portato: 'Come hai vissuto il test',
    parole: 'Lessico',
  },
  modeSwitchAria: 'Sezione della Galassia',
  modeIdle: {
    disposizioni: 'Cinque famiglie sulla rosa dei venti del modello TST.',
    rapporti: GALASSIA_RAPPORTI_UI.intro,
    portato: GALASSIA_PORTATO_UI.intro,
    parole:
      'Lessico TST: ogni pianeta è una famiglia emotiva; il numero indica quante parole del dizionario sono collegate a quella famiglia.',
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
    parole: 'Tocca una famiglia: vedrai parole emerse dal test, lessico di riferimento e sfumature interne.',
  },
}

export const GALASSIA_READING_STEPS_BY_MODE = {
  parole: [
    {
      id: 'famiglie',
      label: '1',
      title: 'Ogni pianeta è una famiglia',
      text: 'Entusiasmo, Calma, Volitività, Malinconia e Anaffettività raccolgono parole dello stesso colore emotivo.',
    },
    {
      id: 'conteggio',
      label: '2',
      title: 'Il numero conta le parole',
      text: '“34 parole” significa parole collegate a quella famiglia nel lessico TST; non è un punteggio né una percentuale.',
    },
    {
      id: 'emerse',
      label: '3',
      title: 'Distingui emerse e riferimento',
      text: 'Le parole emerse sono quelle scelte nelle risposte; le altre sono dizionario di riferimento per nominare meglio il profilo.',
    },
    {
      id: 'sfumature',
      label: '4',
      title: 'Apri le sfumature',
      text: 'Tocca una famiglia: i satelliti mostrano sottodisposizioni e parole specifiche di ciascuna sfumatura.',
    },
  ],
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
    text: 'Scegli Disposizioni, Portato o Lessico — stessi dati del report, lenti diverse.',
  },
]

export const GALASSIA_TUTORIAL_UI = {
  eyebrow: 'Prima volta sulla mappa',
  title: 'Come esplorare la Galassia',
  lead:
    'Cinque famiglie emotive disposte secondo l’Energia Emotiva del modello TST. Ecco come orientarti.',
  cta: 'Inizia l’esplorazione',
  dontShowAgainLabel: 'Non mostrare più all’apertura',
  dialogAria: 'Introduzione alla Galassia',
  backdropAria: 'Chiudi introduzione',
}
