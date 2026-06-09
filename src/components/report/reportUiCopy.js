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

export const HERO_UI = HERO
export { GLOSSARY_UI }

export const SINTESI_UI = {
  eyebrow: 'Prima lettura',
  title: SINTESI_REST.title,
  subtitle: SINTESI_REST.subtitle,
  srOnlyTitle: (userName) =>
    `Il tuo profilo, in sintesi — ${userName || 'report TST'}`,
  chipOrientamento: 'Orientamento',
  chipSottodisposizione: 'Sottodisposizione',
  chipPortato: 'Portato',
  chipsAria: 'Indicatori chiave del profilo',
  howToReadToggle: SINTESI_REST.orientationTitle,
  leadExpandToggle: 'Approfondisci la sintesi del profilo',
  cardDominante: 'Corrente dominante',
  cardFamiglia: 'Disposizione prevalente',
  cardFocus: 'Dimensione di orientamento',
  orientationTitle: SINTESI_REST.orientationTitle,
  orientationBody: SINTESI_REST.orientationBody,
  orientationPoints: SINTESI_REST.orientationPoints,
  leadTitle: SINTESI_REST.leadTitle,
  integrativeTitle: SINTESI_REST.integrativeTitle,
  editorialNote: SINTESI_REST.editorialNote,
  glossaryLink: GLOSSARY_UI.openGlossary,
  radarTitle: 'Radar principale',
  radarCaption:
    'Ogni petalo rappresenta una disposizione; la lunghezza indica il livello relativo (più è lungo, più la risonanza in quell’area).',
  radarAriaLabel:
    'Grafico radar: peso percentuale delle cinque famiglie emotive in questo test.',
  flowerAriaLabel:
    'Diagramma a petali: area proporzionale al peso di ciascuna famiglia emotiva.',
}

export const PROFILO_UI = {
  eyebrow: 'Profilo emotivo',
  title: 'Il tuo profilo emotivo',
  subtitle: 'La tua Natura · Il tuo Racconto · Le tue Risorse · Le tue Ombre',
  sectionIntro: '',
  panelIntroTitle: 'Cosa trovi qui',
}

export const APPROFONDIMENTO_UI = {
  title: 'Approfondimento sulle singole sezioni',
  intro:
    'Confronto immediato tra le cinque famiglie emotive in ogni area del test sonoro: Timbro, Intervalli, Ritmo, Melodia e Armonia. Utile per vedere se il profilo resta omogeneo o se emergono contrasti a seconda dello stimolo.',
  accordionTitle: 'Cosa misura ogni area',
  accordionIntro:
    'Timbro e intervalli toccano colore e tensione del suono; ritmo e melodia organizzano tempo e linea melodica; armonia lega le sonorità in un clima complessivo. Confrontare le aree significa vedere dove il sentire si accende di più.',
}

export const RAPPORTI_UI = {
  eyebrow: 'Quattro rapporti',
  title: 'I quattro rapporti',
  intro:
    'Lo stesso profilo si legge da quattro prospettive. Ogni rapporto nasce dalla combinazione di aree specifiche del test (Timbro, Intervalli, Ritmo, Melodia, Armonia). Apri solo il rapporto che vuoi approfondire; i contrasti tra schede fanno parte della lettura.',
  tablistAria: 'Seleziona rapporto',
}

export const PORTATO_UI = {
  eyebrow: 'Portato esperienziale',
  title: 'Portato esperienziale',
  lead:
    'Oltre alle correnti emotive, emerge il portato esperienziale: simpatia (avvicinamento allo stimolo), antipatia (rifiuto), indifferenza (distacco). Indica come hai «vissuto» l’ascolto in questa somministrazione — non un giudizio di valore, ma una fotografia del coinvolgimento affettivo.',
  prevalenteLabel: 'Prevalenza',
  gridAria: 'Punteggi portato esperienziale',
}

export const PAROLE_UI = {
  eyebrow: 'Stati d\'animo',
  title: 'Stati d\'animo e lessico per famiglia',
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
  eyebrow: 'Dinamiche tra famiglie',
  title: 'Come le correnti si incontrano',
  intro: SECTION_INTROS.mappa.intro,
  methodTitle: 'Come leggere questa sezione',
  methodParagraphs: SECTION_INTROS.mappa.points,
  methodPoints: [
    'Famiglia prevalente: il contributo percentuale maggiore tra le cinque famiglie del protocollo.',
    'Famiglie secondarie: modulano o contrastano la prevalente con pesi minori.',
    'Portato esperienziale: indica se lo stimolo è stato vissuto con simpatia, antipatia o indifferenza.',
  ],
  solarEyebrow: 'Campo emotivo',
  solarTitle: 'Le cinque aree del profilo',
  solarCopy:
    'Calma, Malinconia, Volitività, Entusiasmo e Anaffettività: il peso indica quanto ciascuna partecipa alla risposta in questo test.',
  relationsEyebrow: 'Relazioni tra temperamenti',
  relationsTitle: 'Il temperamento dominante nelle relazioni',
  relationsCopy: '',
  sourceNote: null,
}

export const DIALOGO_UI = {
  eyebrow: 'Struttura del profilo',
  title: 'Il Dialogo delle Correnti',
  subtitle: (dominantLabel, nCoppie) =>
    `Come la parte ${dominantLabel} si affianca alle altre correnti presenti in questo profilo. ${nCoppie === 1 ? '1 combinazione attiva.' : `${nCoppie} combinazioni attive.`}`,
  notaToggle: 'Nota metodologica',
  notaBody:
    'Questa sezione descrive la coesistenza delle correnti temperamentali all\'interno dello stesso profilo — non compatibilità interpersonale né dinamiche tra persone diverse. Le parole chiave sono tratte dal documento del comitato scientifico TST.',
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
  lead:
    'Il report procede dal quadro generale al dettaglio: ogni blocco aggiunge un livello di analisi rispetto al precedente.',
  items: [
    {
      title: 'Sintesi',
      text: 'Peso percentuale delle cinque correnti, radar comparativo e diagramma a petali.',
    },
    {
      title: 'Profilo descrittivo',
      text: 'Natura prevalente, narrativa, risorse e aree di tensione della famiglia dominante.',
    },
    {
      title: 'Approfondimento',
      text: 'Distribuzione delle correnti per parametro sonoro: Timbro, Intervalli, Ritmo, Melodia, Armonia.',
    },
    {
      title: 'Quattro rapporti',
      text: 'Quattro dimensioni (natura, sé, altro, agire) lette su radar dedicato.',
    },
    {
      title: 'Portato esperienziale',
      text: 'Simpatia, antipatia e indifferenza nell’ascolto: punteggi e prevalenza.',
    },
    {
      title: 'Lessico',
      text:
        'Parole del test associate alle correnti. Il colore indica la famiglia. Clicca per copiare.',
    },
    {
      title: 'Dinamiche tra famiglie',
      text: 'Come la corrente prevalente dialoga, contrasta o si affianca alle altre nel campo affettivo di questo test.',
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
  temperamentLabel: 'Temperamento',
  helpAria: 'Guida alla lettura del report',
  download: 'Scarica',
}

export const REPORT_NAV_UI = {
  indexTitle: 'Sezioni',
  indexHint: 'Indice del report',
  layoutHint:
    'Indice a sinistra; qui sotto il contenuto della sezione aperta. In alto puoi passare a Galassia o scaricare il report.',
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

export const GALASSIA_UI = {
  sceneKicker: 'Mappa · Rosa dei venti',
  sceneTitle: 'Rosa dei venti emotiva',
  sceneSubtitle:
    'Cinque famiglie emotive con pesi del test: seleziona una corrente per vedere relazioni, sfumature e rapporti',
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
  clickPlanetHint: 'Tocca il mondo per aprire costellazione e lettura.',
}
