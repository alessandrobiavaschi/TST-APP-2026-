/**
 * Lettura dei test salvati con un modello precedente a quello attuale:
 * - senza `versione_modello` (epoche 2025_v1 e 2025_v2);
 * - con `versione_modello` 2026_v2 o 2026_v3 (regole fino al 10/10/2026 e fino
 *   al 23/10/2026; il 2026_v3 ha avuto due insiemi di regole nello stesso giorno,
 *   «2026_v3a» e «2026_v3», e si prova quale riproduce i punti salvati).
 *
 * Questi test hanno i punti salvati con le regole della loro epoca e, fino al
 * 15 settembre 2026, verde e grigio sotto nomi di campo che oggi non esistono
 * più (VERDE_1_Calma, GRIGIO_1_Distaccato_Nichilista, GRIGIO_2_Intellettuale_Saggio).
 *
 * Qui il test si ricalcola con le regole della SUA epoca (copiate dalla storia
 * di src/testLogic.js e scritte con i nomi di natura attuali) e si controlla che
 * il risultato coincida con i punti salvati. Solo se coincide si usa: i
 * risultati consegnati allora non cambiano, ma si leggono con i nomi di oggi.
 * Se non coincide, si mostrano i totali salvati e niente viene ricostruito.
 * Non scrive mai su Firestore.
 */
import {
  CAMPI_PER_COLORE,
  FAMIGLIE,
  NATURE,
  PASSI_FINO_2026_V3,
  PORTATI,
  VERSIONE_MODELLO,
  VERSIONE_MODELLO_LEGACY,
  getPasso,
} from '../config/tstSistema.js'
import { MASSIMI_TEORICI, calcolaCeste, calcolaMassimiTeorici } from './cesteTst.js'

const S = 'simpatia'
const A = 'antipatia'
const I = 'indifferenza'
const DEP = 'blu_malinconica_lunare_depressiva'
const INT = 'blu_malinconica_lunare_introspettiva'
const NOS = 'blu_malinconica_nostalgica'
const SOL = 'blu_malinconica_solare'
const VOL = 'rosso_marziale_volitiva'
const COL = 'rosso_marziale_collerica'
const CON = 'verde_flemmatica_calma_contemplativa'
const FIS = 'verde_flemmatica_calma_fisica'
const GIO = 'giallo_entusiasta_gioiosa_solare'
const SAN = 'giallo_entusiasta_sanguigna_operosa'
const ANA = 'grigio_razionale_anaffettiva'
const DIS = 'grigio_razionale_distaccata'

/** Campi Firestore usati fino al 15/09/2026 per verde e grigio. */
export const CAMPI_STORICI_PER_COLORE = Object.freeze({
  verde: Object.freeze(['VERDE_1_Calma']),
  grigio: Object.freeze(['GRIGIO_1_Distaccato_Nichilista', 'GRIGIO_2_Intellettuale_Saggio']),
})

/**
 * Tabella di un'epoca → funzione numeroPasso → regole, come getRegolePerPasso.
 * Tutte le epoche storiche usano la disposizione dei passi PASSI_FINO_2026_V3.
 * Ogni riga è [risposta, natura, portato, punti?] (punti di default 1).
 * `t.AFFINITA_PER_PASSO` (facoltativo): regole proprie dei passi di affinità.
 */
function tabella(t) {
  const righe = (lista, molt = 1) =>
    Object.freeze(lista.map(([risposta, natura, portato, punti = 1]) => Object.freeze({ risposta, natura, portato, punti: punti * molt })))
  const perTipo = {
    SENSAZIONI: righe(t.SENSAZIONI),
    AGGETTIVI: righe(t.AGGETTIVI),
    AFFINITA_BASE: righe(t.AFFINITA_BASE || []),
    AFFINITA_STANDARD: righe(t.AFFINITA_STANDARD || []),
    AFFINITA_ECCEZIONE: righe(t.AFFINITA_STANDARD || [], 2),
  }
  const perPasso = Object.fromEntries(Object.entries(t.AFFINITA_PER_PASSO || {}).map(([n, lista]) => [n, righe(lista)]))
  const regole = (numero) => perPasso[numero] || perTipo[getPasso(numero, PASSI_FINO_2026_V3)?.tipoDomanda] || []
  // Le regole portano con sé la disposizione dei passi della loro epoca (letta da cesteTst.js).
  regole.passi = PASSI_FINO_2026_V3
  return Object.freeze(regole)
}

/**
 * Regole delle due epoche precedenti:
 * - 2025_v1: fino al 15/09/2026 (src/testLogic.js al commit bf2c4e5);
 * - 2025_v2: dal 15/09 al 10/10/2026 (commit bbc92cf).
 * Pesi, riconferme e punti dell'affinità al passo 46 sono gli stessi di oggi.
 * Nel 2025_v1 verde e grigio erano una natura sola: i punti vanno alla natura
 * di oggi della risposta che li ha generati (es. «Mi rilassa» → Calma Fisica).
 */
export const REGOLE_STORICHE = Object.freeze({
  '2025_v1': tabella({
    SENSAZIONI: [
      ['Mi dà gioia', GIO, S],
      ['Mi inquieta', COL, A],
      ['Mi spegne', DEP, A],
      ['Mi stupisce', GIO, S],
      ['Mi rilassa', FIS, S],
      ['Mi disturba / mi repelle', COL, A],
      ['Mi è indifferente', DIS, I],
      ['Mi calma / mi fa sognare', CON, S],
      ['Mi accende / mi motiva', VOL, S],
      ['Mi irrita / mi infastidisce', COL, A],
      ['Mi annoia / mi stufa', DIS, A],
      ['Mi completa / mi incoraggia', VOL, S],
      ['Mi fa riflettere / mi porta a ricordare', NOS, S],
      ['Mi arrovella / mi rattrista', INT, A],
      ['Mi accompagna / mi consola', SOL, S],
    ],
    AGGETTIVI: [
      ['Saldo - sicuro - volitivo', VOL, S],
      ['Inquieto - chiuso - pauroso', DEP, A],
      ['Angosciato - ansioso - indifferente', DEP, A],
      ['Sereno - fiducioso - aperto', SOL, S],
      ['Malinconico - triste - riflessivo', INT, S],
      ['Arrabbiato - distaccato - dubbioso', COL, A],
      ['Ambiguo - incerto - equivoco', COL, A],
      ['Calmo - equilibrato - sognante', FIS, S],
      ['Gioioso - caloroso - entusiasta', GIO, S],
      ['Dinamico - curioso - fluido', GIO, S],
      ['Nostalgico - consolato - afflitto', NOS, S],
      ['Desolato - rimpiangente - abbandonato', NOS, A],
      ['Illuminato - amorevole - passionale', SAN, S],
      ['Mi è indifferente', DIS, I],
    ],
    AFFINITA_BASE: [
      ['opzione1', GIO, S],
      ['opzione2', FIS, S],
      ['opzione3', VOL, S],
      ['opzione4', SOL, S],
      ['nessuna', ANA, I],
    ],
    AFFINITA_STANDARD: [
      ['opzione1', NOS, S],
      ['opzione2', VOL, S],
      ['opzione3', FIS, S],
      ['opzione4', GIO, S],
      ['nessuna', ANA, I],
    ],
  }),
  '2025_v2': tabella({
    SENSAZIONI: [
      ['Mi dà gioia', GIO, S],
      ['Mi inquieta', COL, A],
      ['Mi spegne', DEP, A],
      ['Mi stupisce', GIO, S],
      ['Mi rilassa', FIS, S],
      ['Mi disturba / mi repelle', COL, A],
      ['Mi è indifferente', ANA, I],
      ['Mi calma / mi fa sognare', CON, S],
      ['Mi accende / mi motiva', VOL, S],
      ['Mi irrita / mi infastidisce', COL, A],
      ['Mi annoia / mi stufa', ANA, A],
      ['Mi completa / mi incoraggia', VOL, S],
      ['Mi fa riflettere / mi porta a ricordare', NOS, S],
      ['Mi arrovella / mi rattrista', INT, A],
      ['Mi accompagna / mi consola', SOL, S],
    ],
    AGGETTIVI: [
      ['Saldo - sicuro - volitivo', VOL, S],
      ['Sognante - meditativo - ascetico', CON, S],
      ['Angosciato - avvilito - sofferente', DEP, A],
      ['Sereno - fiducioso - aperto', SOL, S],
      ['Malinconico - triste - pensieroso', INT, S],
      ['Rabbioso - diffidente - dubbioso', COL, A],
      ['Ambiguo - incerto - equivoco', COL, A],
      ['Calmo - prudente - lento', FIS, S],
      ['Gioioso - caloroso - festoso', GIO, S],
      ['Dinamico - curioso - fluido', SAN, S],
      ['Nostalgico - rimembrante - afflitto', NOS, S],
      ['Desolato - rimpiangente - abbandonato', NOS, A],
      ['Illuminato - amorevole - passionale', SAN, S],
      ['Mi è indifferente', ANA, I],
    ],
    AFFINITA_BASE: [
      ['opzione1', GIO, S],
      ['opzione2', FIS, S],
      ['opzione3', VOL, S],
      ['opzione4', SOL, S],
      ['nessuna', ANA, I],
    ],
    AFFINITA_STANDARD: [
      ['opzione1', NOS, S],
      ['opzione2', VOL, S],
      ['opzione3', FIS, S],
      ['opzione4', GIO, S],
      ['nessuna', ANA, I],
    ],
  }),
})

/* ── Epoche 2026 (test con `versione_modello`) ─────────────────────────── */

const SENSAZIONI_2026_A = [
  ['Mi dà gioia', GIO, S], ['Mi inquieta', COL, A], ['Mi spegne', DEP, A], ['Mi stupisce', GIO, S],
  ['Mi rilassa', FIS, S], ['Mi disturba / mi repelle', COL, A], ['Mi è indifferente', DIS, I],
  ['Mi calma / mi fa sognare', CON, S], ['Mi accende / mi motiva', VOL, S], ['Mi irrita / mi infastidisce', COL, A],
  ['Mi annoia / mi stufa', DIS, A], ['Mi completa / mi incoraggia', VOL, S],
  ['Mi fa riflettere / mi porta a ricordare', NOS, S], ['Mi arrovella / mi rattrista', INT, A],
  ['Mi accompagna / mi consola', SOL, S],
]
const AGGETTIVI_2026_A = [
  ['Saldo - sicuro - volitivo', VOL, S], ['Sognante - meditativo - ascetico', CON, S],
  ['Angosciato - avvilito - sofferente', DEP, A], ['Sereno - fiducioso - aperto', SOL, S],
  ['Malinconico - triste - pensieroso', INT, S], ['Rabbioso - diffidente - dubbioso', COL, A],
  ['Ambiguo - incerto - equivoco', COL, A], ['Calmo - prudente - lento', FIS, S],
  ['Gioioso - caloroso - festoso', GIO, S], ['Dinamico - curioso - fluido', SAN, S],
  ['Nostalgico - rimembrante - afflitto', NOS, S], ['Desolato - rimpiangente - abbandonato', NOS, A],
  ['Illuminato - amorevole - passionale', SAN, S], ['Mi è indifferente', DIS, I],
]
const SENSAZIONI_2026_B = [
  ['Mi dà gioia', GIO, S], ['Mi inquieta', SAN, A], ['Mi spegne', ANA, I], ['Mi stupisce', GIO, S],
  ['Mi rilassa', FIS, S], ['Mi disturba / mi repelle', FIS, A], ['Mi è indifferente', DIS, I],
  ['Mi calma / mi fa sognare', CON, S], ['Mi accende / mi motiva', VOL, S], ['Mi irrita / mi infastidisce', COL, A],
  ['Mi annoia / mi stufa', DIS, I], ['Mi completa / mi incoraggia', VOL, S],
  ['Mi fa riflettere / mi porta a ricordare', NOS, S], ['Mi arrovella / mi rattrista', INT, A],
  ['Mi accompagna / mi consola', SOL, S],
]
const AGGETTIVI_2026_B = [
  ['Saldo - sicuro - volitivo', VOL, S], ['Sognante - meditativo - ascetico', CON, S],
  ['Inquieto - chiuso - pauroso', DEP, A], ['Angosciato - avvilito - sofferente', DEP, I],
  ['Sereno - fiducioso - aperto', SOL, S], ['Malinconico - triste - pensieroso', INT, S],
  ['Rabbioso - diffidente - dubbioso', COL, A], ['Ambiguo - incerto - equivoco', COL, I],
  ['Calmo - prudente - lento', FIS, S], ['Gioioso - caloroso - festoso', GIO, S],
  ['Dinamico - curioso - fluido', SAN, S], ['Nostalgico - rimembrante - afflitto', NOS, S],
  ['Desolato - rimpiangente - abbandonato', NOS, A], ['Illuminato - amorevole - passionale', SAN, S, 0],
  ['Mi è indifferente', DIS, I],
]
const AFF_POSIZIONE_BASE = [['opzione1', GIO, S], ['opzione2', FIS, S], ['opzione3', VOL, S], ['opzione4', SOL, S], ['nessuna', ANA, I]]
const AFF_POSIZIONE_STANDARD = [['opzione1', NOS, S], ['opzione2', VOL, S], ['opzione3', FIS, S], ['opzione4', GIO, S], ['nessuna', ANA, I]]
/** Affinità per suono (dal 10/10/2026, commit 7d8db71), con il portato di allora. */
const affinita = (nature, punti = 1) => [
  ...nature.map((natura, i) => [`opzione${i + 1}`, natura, S, punti]),
  ['nessuna', ANA, I, punti],
]
const AFF_PER_SUONO_2026 = {
  1: affinita([GIO, FIS, VOL, SOL]),
  2: affinita([GIO, VOL, FIS, SOL]),
  3: affinita([GIO, VOL, FIS, SOL]),
  4: affinita([GIO, FIS, VOL, SOL]),
  46: affinita([NOS, FIS, VOL, GIO], 2),
  51: affinita([NOS, VOL, FIS, GIO]),
  58: affinita([GIO, NOS, VOL, FIS]),
}

/**
 * Regole dei test salvati con `versione_modello` (src/config/tstSistema.js alla
 * data indicata). Disposizione dei passi: PASSI_FINO_2026_V3.
 */
export const REGOLE_STORICHE_2026 = Object.freeze({
  /** 2026_v2 (commit 1fe357b): affinità per posizione del bottone. */
  '2026_v2': tabella({ SENSAZIONI: SENSAZIONI_2026_A, AGGETTIVI: AGGETTIVI_2026_A, AFFINITA_BASE: AFF_POSIZIONE_BASE, AFFINITA_STANDARD: AFF_POSIZIONE_STANDARD }),
  /** 2026_v3, prima versione (commit 7d8db71, 10/10/2026): affinità per suono, sensazioni e aggettivi del 2026_v2. */
  '2026_v3a': tabella({ SENSAZIONI: SENSAZIONI_2026_A, AGGETTIVI: AGGETTIVI_2026_A, AFFINITA_PER_PASSO: AFF_PER_SUONO_2026 }),
  /** 2026_v3 (commit f1cfa53, 10/10–23/10/2026). */
  '2026_v3': tabella({ SENSAZIONI: SENSAZIONI_2026_B, AGGETTIVI: AGGETTIVI_2026_B, AFFINITA_PER_PASSO: AFF_PER_SUONO_2026 }),
})

/** Epoche candidate per ogni `versione_modello` salvata (la più probabile prima). */
const EPOCHE_PER_VERSIONE = Object.freeze({
  '2026_v2': ['2026_v2'],
  '2026_v3': ['2026_v3', '2026_v3a'],
})

const TUTTE_LE_REGOLE = { ...REGOLE_STORICHE, ...REGOLE_STORICHE_2026 }

const num = (v) => Number(v) || 0
const presente = (record, campo) => record?.[campo] !== undefined && record?.[campo] !== null && record?.[campo] !== ''
const CAMPI_STORICI = Object.values(CAMPI_STORICI_PER_COLORE).flat()
const NUOVI_VERDE_GRIGIO = [...CAMPI_PER_COLORE.verde, ...CAMPI_PER_COLORE.grigio]

/** Totali per famiglia così come sono salvati (campi attuali + campi storici). */
export function famiglieSalvate(record = {}) {
  return Object.fromEntries(
    FAMIGLIE.map((f) => {
      const campi = [...(CAMPI_PER_COLORE[f.colorKey] || []), ...(CAMPI_STORICI_PER_COLORE[f.colorKey] || [])]
      return [f.colorKey, campi.reduce((sum, campo) => sum + num(record[campo]), 0)]
    }),
  )
}

/** true se il calcolo con le regole dell'epoca coincide con i punti salvati. */
function coincideConISalvati(record, calcolo, versione) {
  if (PORTATI.some((p) => num(record[p.campoDb]) !== calcolo.campiPortato[p.campoDb])) return false
  const conCampiStorici = versione === '2025_v1'
  for (const n of NATURE) {
    if (conCampiStorici && (n.colorKey === 'verde' || n.colorKey === 'grigio')) continue
    if (num(record[n.campoDb]) !== calcolo.campiNature[n.campoDb]) return false
  }
  if (!conCampiStorici) return true
  // Verde e grigio: se i campi storici ci sono, devono coincidere famiglia per famiglia.
  // Se mancano, il portato e le altre nature coincidono già: torna anche la loro somma.
  return Object.entries(CAMPI_STORICI_PER_COLORE).every(([colore, campi]) => {
    if (!campi.some((c) => presente(record, c))) return true
    return campi.reduce((sum, c) => sum + num(record[c]), 0) === calcolo.famiglie[colore]
  })
}

/** Epoche da provare, nell'ordine più probabile per i campi presenti nel record. */
function epocheCandidate(record) {
  const perVersione = EPOCHE_PER_VERSIONE[record?.versione_modello]
  if (perVersione) return perVersione
  const haStorici = CAMPI_STORICI.some((c) => presente(record, c))
  const haNuoviPieni = NUOVI_VERDE_GRIGIO.some((c) => num(record[c]) !== 0)
  if (haStorici) return ['2025_v1']
  if (haNuoviPieni) return ['2025_v2']
  return ['2025_v2', '2025_v1']
}

/**
 * Prepara per la lettura un test senza versione del modello.
 * Restituisce il record con i campi delle nature attuali riempiti e `_ceste`,
 * più `_letturaStorica` = { epoca, verificato, famiglie? }.
 */
export function leggiTestStorico(record = {}) {
  if (record?._letturaStorica) return record // già letto (archivio → report)
  for (const epoca of epocheCandidate(record)) {
    const calcolo = calcolaCeste(record, opzioniEpoca(epoca))
    if (calcolo.risposteValide === 0 || !coincideConISalvati(record, calcolo, epoca)) continue
    return {
      ...record,
      ...calcolo.campiNature,
      _ceste: calcolo.ceste,
      _letturaStorica: Object.freeze({ epoca, verificato: true }),
    }
  }
  return {
    ...record,
    _letturaStorica: Object.freeze({ epoca: null, verificato: false, famiglie: famiglieSalvate(record) }),
  }
}

/** Opzioni di calcolo (regole e disposizione dei passi) di un'epoca storica. */
function opzioniEpoca(epoca) {
  return { regolePerPasso: TUTTE_LE_REGOLE[epoca], passi: PASSI_FINO_2026_V3 }
}

/** Regole con cui leggere le risposte di un record (undefined = regole attuali). */
export function regoleDelTest(record) {
  return opzioniCalcoloDelTest(record).regolePerPasso
}

/**
 * Opzioni per calcolaCeste con cui leggere un record: {} = modello attuale;
 * per un test storico verificato, regole e passi della sua epoca.
 */
export function opzioniCalcoloDelTest(record) {
  const lettura = record?._letturaStorica
  return lettura?.verificato ? opzioniEpoca(lettura.epoca) : {}
}

let massimiStorici = null

/**
 * Massimi teorici con cui normalizzare un record (null = modello attuale).
 * Tutti i test di versioni precedenti si normalizzano sui massimi del modello
 * 2026_v3, cioè esattamente come venivano mostrati fino al 23/10/2026: il cambio
 * di modello non sposta le percentuali né le prevalenze dei test già consegnati.
 */
export function massimiDelTest(record) {
  const versione = record?.versione_modello || VERSIONE_MODELLO_LEGACY
  if (versione === VERSIONE_MODELLO && !record?._letturaStorica) return null
  if (!massimiStorici) {
    const m = calcolaMassimiTeorici(opzioniEpoca('2026_v3'))
    massimiStorici = Object.freeze({ ...m, famiglie: m.famiglieSommaNature })
  }
  return massimiStorici
}

/** Massimi teorici con cui mostrare un record: i suoi se storico, altrimenti quelli attuali. */
export function massimiPerRecord(record) {
  return massimiDelTest(record) || MASSIMI_TEORICI
}
