/**
 * View model unico e deterministico per "Galassia Lessicale 2.0".
 *
 * Adatta le sei funzionalità descritte in AI_TASK.md (campo di forze lessicale,
 * costellazioni semantiche, lessico stabile e situazionale, contrasti lessicali,
 * firma personale, tracciabilità musica-parola) a dati già calcolati a monte
 * (`reportData`, `rawRecord`). Nessun nuovo calcolo scientifico: nessuna soglia,
 * peso o relazione qui introdotta modifica `testLogic.js` o i punteggi persistiti.
 *
 * Ogni funzione è pura (stesso input → stesso output) e non ha effetti collaterali.
 * Le sezioni dove i dati reali non sostengono pienamente il concetto richiesto
 * sono segnalate esplicitamente in `_gap` invece di essere inventate.
 *
 * Forma del view model restituito da `buildLessicoAnaliticoViewModel`:
 * {
 *   datiDisponibili: boolean,            // false se nessuna famiglia ha valoreAssoluto > 0 (record vuoto/non svolto)
 *   lessicoStabile: {                    // teoria, uguale per tutti gli utenti — sempre popolato, anche a datiDisponibili:false
 *     [familyName]: { vocabolarioForme: string[], vocabolarioAggettivi: string[], fonte: 'teoria' }
 *   },
 *   lessicoSituazionale: [{              // dipende dalle risposte reali di questo utente — [] se datiDisponibili:false
 *     parola, familyKey, familyName, correnteKey, count, fileKeys: string[], fonte: 'test',
 *   }],                                  // ordinato per count decrescente, vedi §tie-break sotto
 *   campoDiForze: {
 *     perFamiglia: [{ familyKey, familyName, direzione: {x,y,z}, polarita, peso, vettore: {x,y,z} }],
 *     risultante: { x, y, z },           // {0,0,0} se datiDisponibili:false (dato onesto, non un default plausibile)
 *     magnitudineRisultante: number,
 *     polaritaDominante: string,         // '' se datiDisponibili:false — MAI un default silenzioso (es. Verde) spacciato per dominanza reale
 *     criterio: 'vettore statico per famiglia (config/dispositions.ts) scalato per peso reale (0-1); metafora visiva, non un calcolo scientifico',
 *   },
 *   contrastiLessicali: [],              // [] se datiDisponibili:false, altrimenti le 3 coppie con gap/isContrastante/parole
 *   firmaPersonale: {                    // tutto vuoto/[] se datiDisponibili:false — niente codice plausibile per un profilo senza dati
 *     codice: string, componenti: { dominante, sottodisposizione, rankingFamiglie },
 *   },
 *   costellazioniSemantiche: [{
 *     conceptId, label, famiglieCollegate: string[], correntiUtenteCollegate: [{rawKey,nome,percentuale}],
 *     relatedConceptsDisponibili: boolean,
 *   }],                                  // correntiUtenteCollegate naturalmente [] a datiDisponibili:false (nessun filtro aggiuntivo necessario)
 *   _gap: string[],                      // parti della missione non sostenute dai dati attuali
 * }
 *
 * Stato vuoto: un record senza alcun punteggio reale (nessuna famiglia con
 * valoreAssoluto > 0) NON deve mai produrre un output "plausibile" che sembri
 * un profilo reale. `lessicoStabile` resta popolato perché è materiale di
 * riferimento dichiarato (teoria, uguale per chiunque, mai spacciato per dato
 * personale) — tutto il resto che dipenderebbe da un confronto/ranking tra
 * famiglie (`polaritaDominante`, `firmaPersonale`, `contrastiLessicali`) viene
 * esplicitamente svuotato invece di ricadere su un default (es. la famiglia
 * Verde, prima in `FAMILY_ORDER`, che altrimenti vincerebbe silenziosamente
 * ogni confronto a punteggi tutti pari).
 */

import { FAMILY_ORDER, FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { DISPOSITIONS, POLARITY_LABEL } from '../config/dispositions'
import { SEMANTIC_CONCEPTS, getPrimarySemanticConceptIdForColor } from '../config/semanticConcepts'
import { getFamigliaLessico } from '../content/statiAnimoLessico.js'
import { extractParoleDalTest, CONTRASTING_PAIRS, detectContrastingPresence } from './buildReportData.js'

const DISPOSITION_BY_COLOR_KEY = Object.fromEntries(DISPOSITIONS.map((d) => [d.colorKey, d]))

function toSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Lessico stabile (teoria, invariato tra utenti) per tutte le 5 famiglie. */
function buildLessicoStabile() {
  const out = {}
  FAMILY_ORDER.forEach((familyName) => {
    const dettaglio = getFamigliaLessico(familyName)
    out[familyName] = {
      vocabolarioForme: dettaglio?.vocabolarioForme || [],
      vocabolarioAggettivi: dettaglio?.vocabolarioAggettivi || [],
      fonte: 'teoria',
    }
  })
  return out
}

/**
 * Campo di forze lessicale: somma vettoriale delle direzioni statiche per
 * famiglia (config/dispositions.ts, mai modificate qui) scalate per il peso
 * reale (0-1) di questo profilo. È una metafora visiva per la Galassia, non
 * un calcolo scientifico del TST: nessun punteggio viene derivato da qui.
 */
function buildCampoDiForze(correnti = [], datiDisponibili = false) {
  const perFamiglia = FAMILY_ORDER.map((familyName) => {
    const theme = FAMILY_THEME[familyName]
    const corrente = correnti.find((c) => c.familyKey === theme.key)
    const disposition = DISPOSITION_BY_COLOR_KEY[theme.key]
    const peso = Number(corrente?.peso) || 0
    const direzione = disposition?.directionVector || { x: 0, y: 0, z: 0 }
    const scala = peso / 100
    return {
      familyKey: theme.key,
      familyName,
      direzione,
      polarita: disposition ? POLARITY_LABEL[disposition.polarity] || disposition.polarity : '',
      peso,
      vettore: { x: direzione.x * scala, y: direzione.y * scala, z: direzione.z * scala },
    }
  })

  const risultante = perFamiglia.reduce(
    (acc, f) => ({ x: acc.x + f.vettore.x, y: acc.y + f.vettore.y, z: acc.z + f.vettore.z }),
    { x: 0, y: 0, z: 0 },
  )
  const magnitudineRisultante = Math.sqrt(risultante.x ** 2 + risultante.y ** 2 + risultante.z ** 2)

  // A datiDisponibili:false ogni famiglia ha peso 0: senza questa guardia
  // il reduce sceglierebbe comunque la prima famiglia di FAMILY_ORDER (Verde)
  // come "dominante", un default silenzioso che sembrerebbe un dato reale.
  const dominante = datiDisponibili
    ? perFamiglia.reduce((best, f) => (f.peso > best.peso ? f : best), perFamiglia[0])
    : null

  return {
    perFamiglia,
    risultante,
    magnitudineRisultante,
    polaritaDominante: dominante?.polarita || '',
    criterio:
      'vettore statico per famiglia (config/dispositions.ts) scalato per peso reale (0-1); metafora visiva, non un calcolo scientifico',
  }
}

/**
 * Contrasti lessicali: riusa le stesse 3 coppie e la stessa soglia già in
 * produzione per i "Quattro Rapporti" (buildReportData.js: CONTRASTING_PAIRS,
 * detectContrastingPresence — gap ≤ 1 su scala 1-7, minore comunque ≥ 4),
 * applicata qui a `correnti[].scala1a7` invece che ai livelli dei rapporti,
 * cosi' la soglia di "contrasto" resta un'unica policy in tutto il report.
 * Le parole illustrative preferiscono il lessico situazionale (di questo
 * utente); se assente per una famiglia, il fallback esplicito è il lessico
 * stabile di quella famiglia (mai una parola inventata).
 */
function buildContrastiLessicali(correnti = [], lessicoSituazionale = [], lessicoStabile = {}) {
  const scala1a7ByKey = Object.fromEntries(correnti.map((c) => [c.familyKey, Number(c.scala1a7) || 1]))

  const paroleUtenteByFamiglia = {}
  lessicoSituazionale.forEach((p) => {
    if (!paroleUtenteByFamiglia[p.familyName]) paroleUtenteByFamiglia[p.familyName] = []
    paroleUtenteByFamiglia[p.familyName].push(p.parola)
  })

  const resolveParole = (familyName) => {
    const situazionali = paroleUtenteByFamiglia[familyName] || []
    if (situazionali.length > 0) return { parole: situazionali.slice(0, 5), fonte: 'test' }
    const stabili = lessicoStabile[familyName]?.vocabolarioAggettivi || []
    if (stabili.length > 0) return { parole: stabili.slice(0, 5), fonte: 'teoria' }
    return { parole: [], fonte: 'nessuna' }
  }

  return CONTRASTING_PAIRS.map(([keyA, keyB]) => {
    const familyNameA = FAMILY_ORDER.find((name) => FAMILY_THEME[name].key === keyA)
    const familyNameB = FAMILY_ORDER.find((name) => FAMILY_THEME[name].key === keyB)
    const a = scala1a7ByKey[keyA] ?? 1
    const b = scala1a7ByKey[keyB] ?? 1
    const gap = Math.abs(a - b)
    const detected = detectContrastingPresence({ [keyA]: a, [keyB]: b })
    const isContrastante = Boolean(detected?.isContrasting)
    const paroleA = resolveParole(familyNameA)
    const paroleB = resolveParole(familyNameB)
    return {
      coppia: [familyNameA, familyNameB],
      gap,
      isContrastante,
      paroleA: paroleA.parole,
      fonteParoleA: paroleA.fonte,
      paroleB: paroleB.parole,
      fonteParoleB: paroleB.fonte,
    }
  })
}

/**
 * Firma personale: codice deterministico (non crittografico) composto da
 * famiglia dominante + sottodisposizione (se presente) + le 3 famiglie meglio
 * classificate. Stessi dati di input → stesso codice, sempre. Nessun dato
 * viene derivato che non sia già in `reportData`.
 */
function buildFirmaPersonale({ dominantColorName, sottodisposizionePrevalente, correntiByPeso = [], datiDisponibili = false }) {
  // Un profilo senza dati reali non riceve un codice plausibile: niente da firmare.
  if (!datiDisponibili) {
    return { codice: '', componenti: { dominante: '', sottodisposizione: '', rankingFamiglie: [] } }
  }

  const rankingFamiglie = correntiByPeso.map((c) => c.familyKey)
  const dominanteSlug = toSlug(dominantColorName)
  const sottodisposizioneSlug = sottodisposizionePrevalente ? toSlug(sottodisposizionePrevalente) : ''
  const codice = [dominanteSlug, sottodisposizioneSlug, rankingFamiglie.slice(0, 3).join('-')]
    .filter(Boolean)
    .join('_')

  return {
    codice,
    componenti: {
      dominante: dominantColorName || '',
      sottodisposizione: sottodisposizionePrevalente || '',
      rankingFamiglie,
    },
  }
}

/**
 * Costellazioni semantiche: per ogni famiglia, il concetto semantico primario
 * già definito in config/semanticConcepts.ts (nessun concetto nuovo inventato),
 * incrociato con le sottocorrenti realmente valorizzate di questo utente
 * (`relatedRawKeys` ∩ `sottocorrenti` con `valore > 0`).
 *
 * Limite noto dei dati attuali: `SEMANTIC_CONCEPTS[*].relatedConcepts` è oggi
 * sempre vuoto in tutta la configurazione — il grafo concetto→concetto che
 * formerebbe una vera "costellazione" (rete di concetti collegati) non esiste
 * ancora. Qui viene esposta solo la relazione concetto→correnti dell'utente,
 * che è l'unica sostenuta dai dati; `relatedConceptsDisponibili` è sempre
 * `false` finché quel grafo non viene popolato altrove (fuori da questo task).
 * Rosso e Grigio non hanno un concetto primario assegnato: restano assenti
 * dall'elenco invece di essere associati a un concetto non pertinente.
 */
function buildCostellazioniSemantiche(sottocorrenti = []) {
  const sottocorrentiConValore = sottocorrenti.filter((s) => (Number(s.valore) || 0) > 0)

  return FAMILY_ORDER.map((familyName) => {
    const conceptId = getPrimarySemanticConceptIdForColor(familyName)
    if (!conceptId) return null
    const concept = SEMANTIC_CONCEPTS[conceptId]
    if (!concept) return null

    const correntiUtenteCollegate = sottocorrentiConValore
      .filter((s) => concept.relatedRawKeys.includes(s.rawKey))
      .map((s) => ({ rawKey: s.rawKey, nome: s.nome, percentuale: s.percentuale }))

    return {
      conceptId,
      label: concept.label,
      famiglieCollegate: [familyName],
      correntiUtenteCollegate,
      relatedConceptsDisponibili: Array.isArray(concept.relatedConcepts) && concept.relatedConcepts.length > 0,
    }
  }).filter(Boolean)
}

/**
 * Punto di ingresso unico. Non ricalcola punteggi: usa solo campi già presenti
 * in `reportData` (vedi buildReportData.js) e il `rawRecord` per il lessico
 * situazionale/tracciabilità.
 *
 * @param {object} params
 * @param {object} params.rawRecord               record grezzo (`record.raw`).
 * @param {Array} params.correnti                  `reportData.correnti[]`.
 * @param {Array} params.correntiByPeso            `reportData.correntiByPeso`.
 * @param {Array} params.sottocorrenti             `reportData.sottocorrenti[]`.
 * @param {string} params.dominantColorName        `reportData.profilo.famiglia`.
 * @param {string} params.sottodisposizionePrevalente `reportData.sottodisposizionePrevalente`.
 */
export function buildLessicoAnaliticoViewModel({
  rawRecord = {},
  correnti = [],
  correntiByPeso = [],
  sottocorrenti = [],
  dominantColorName = '',
  sottodisposizionePrevalente = '',
} = {}) {
  const gap = []

  // Nessuna famiglia con un punteggio reale => record vuoto/test non svolto.
  // Da qui in poi ogni sezione derivata da un confronto tra famiglie deve
  // restare esplicitamente vuota invece di ricadere su un default plausibile.
  const datiDisponibili = correnti.some((c) => (Number(c.valoreAssoluto) || 0) > 0)
  if (!datiDisponibili) {
    gap.push(
      'datiDisponibili: false — nessuna famiglia ha un punteggio reale (record vuoto o test non completato). polaritaDominante, firmaPersonale e contrastiLessicali sono stati svuotati esplicitamente invece di usare un default silenzioso.',
    )
  }

  const lessicoStabile = buildLessicoStabile()
  const lessicoSituazionale = extractParoleDalTest(rawRecord)
  if (lessicoSituazionale.length === 0) {
    gap.push('lessicoSituazionale: nessuna parola emersa (nessuna risposta DIZIONARIO_2 nel record).')
  }

  const campoDiForze = buildCampoDiForze(correnti, datiDisponibili)
  const contrastiLessicali = datiDisponibili
    ? buildContrastiLessicali(correnti, lessicoSituazionale, lessicoStabile)
    : []
  const firmaPersonale = buildFirmaPersonale({
    dominantColorName,
    sottodisposizionePrevalente,
    correntiByPeso,
    datiDisponibili,
  })
  const costellazioniSemantiche = buildCostellazioniSemantiche(sottocorrenti)

  gap.push(
    'costellazioniSemantiche: il grafo concetto→concetto (relatedConcepts) e\' vuoto in semanticConcepts.ts per tutti i concetti: esposta solo la relazione concetto→correnti utente, non una rete di concetti collegati.',
  )
  gap.push(
    'costellazioniSemantiche: Rosso e Grigio non hanno un concetto semantico primario assegnato in semanticConcepts.ts (PRIMARY_SEMANTIC_CONCEPT_BY_COLOR: null) — restano fuori dall\'elenco.',
  )
  gap.push(
    'contrastiLessicali: la coppia famiglia-famiglia è dati reali (scala1a7 + policy già in uso per i Quattro Rapporti); la contrapposizione parola-per-parola dentro la coppia non è invece sostenuta da alcuna struttura semantica (nessun thesaurus/antonimi nei dati) — le parole mostrate sono un campione illustrativo per famiglia, non coppie di parole opposte verificate.',
  )
  gap.push(
    'campoDiForze: direzione/polarità per famiglia sono costanti di design già presenti in config/dispositions.ts, non derivate da nuovi dati; il vettore risultante è una metafora visiva per la Galassia, non un indicatore scientifico aggiuntivo del TST.',
  )

  return {
    datiDisponibili,
    lessicoStabile,
    lessicoSituazionale,
    campoDiForze,
    contrastiLessicali,
    firmaPersonale,
    costellazioniSemantiche,
    _gap: gap,
  }
}

export default buildLessicoAnaliticoViewModel
