/**
 * Domande finali del test (dopo i 72 ascolti): fonte unica di codici ed etichette.
 *
 * Usata dalla schermata finale del test (NewTestPage → FinalFeedbackStep) e dal
 * report (buildReportData). I codici (`value`) sono quelli salvati nel database:
 * non vanno rinominati, altrimenti i test già svolti non si rileggono più.
 * Le etichette si possono modificare liberamente.
 *
 * Queste risposte non entrano nel calcolo del profilo: descrivono l'esperienza
 * di ascolto e vengono mostrate nel report.
 */

export const MAX_SCELTE_DOMANDE_FINALI = 3

export const STATO_ANIMO_FINALE_OPTIONS = [
  { value: 'SA_SERENO', label: 'Sereno/a' },
  { value: 'SA_CURIOSO', label: 'Curioso/a' },
  { value: 'SA_SOLLEVATO', label: 'Sollevato/a' },
  { value: 'SA_COINVOLTO', label: 'Coinvolto/a' },
  { value: 'SA_RIFLESSIVO', label: 'Riflessivo/a' },
  { value: 'SA_STANCO', label: 'Stanco/a' },
  { value: 'SA_TESO', label: 'Teso/a' },
  { value: 'SA_CONFUSO', label: 'Confuso/a' },
]

export const DIFFICOLTA_TEST_OPTIONS = [
  { value: 'DT_NO', label: 'No' },
  { value: 'DT_SI', label: 'Sì' },
]

/** Valore scritto quando l'utente risponde «No» alle difficoltà: non è un codice da mostrare. */
export const DIFFICOLTA_DETTAGLIO_NESSUNA = 'DD_NESSUNA'

export const DIFFICOLTA_DETTAGLIO_OPTIONS = [
  { value: 'DD_CONCENTRAZIONE', label: 'Concentrazione / attenzione' },
  { value: 'DD_COMPRENSIONE', label: 'Comprensione delle sensazioni richieste' },
  { value: 'DD_VOLUMI', label: 'Volume / timbro dei suoni' },
  { value: 'DD_DURATA', label: 'Durata complessiva del test' },
  { value: 'DD_CONTESTO', label: 'Ambiente esterno (rumori/interruzioni)' },
  { value: 'DD_TECNICA', label: 'Aspetti tecnici (audio, cuffie, device)' },
]

/**
 * Aree del test. Gli intervalli di passi sono quelli usati finora da questa
 * domanda e dal report. Nota aperta: l'etichetta di sezione mostrata durante il
 * test (getMacroSectionLabel in NewTestPage) assegna il passo 42 agli Intervalli,
 * qui invece è nel Ritmo. Va deciso con Franco Mussida quale sia corretto.
 */
export const AREE_TEST = [
  { value: 'A', nome: 'Timbro', from: 1, to: 28 },
  { value: 'B', nome: 'Intervalli', from: 29, to: 41 },
  { value: 'C', nome: 'Ritmo', from: 42, to: 51 },
  { value: 'D', nome: 'Melodia', from: 52, to: 58 },
  { value: 'E', nome: 'Armonia', from: 59, to: 72 },
]

export const QUALITA_SUONI_OPTIONS = [
  { value: 'QS_OTTIMI', label: 'Ottimi' },
  { value: 'QS_BUONI', label: 'Buoni' },
  { value: 'QS_SUFFICIENTI', label: 'Sufficienti' },
  { value: 'QS_PESSIMI', label: 'Pessimi' },
]

/** { value: label } a partire da un elenco di opzioni. */
export function etichettePerCodice(options) {
  return Object.fromEntries(options.map((opt) => [opt.value, opt.label]))
}
