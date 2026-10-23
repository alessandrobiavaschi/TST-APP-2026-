import { massimiPerRecord } from '../utils/testStorici.js'
import { DISPOSITIONS } from './dispositions'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/** Percentuale 0–100 rispetto al massimo teorico della famiglia (da testLogic), non al massimo del singolo report. */
function toPercentScores(totalsByKey = {}, massimi = {}) {
  const cap = (value, denom) => {
    const v = Number(value) || 0
    const d = Number(denom) || 0
    if (d <= 0) return 0
    return Math.round(clamp((v / d) * 100, 0, 100))
  }
  return {
    blu: cap(totalsByKey.blu, massimi.blu),
    rosso: cap(totalsByKey.rosso, massimi.rosso),
    verde: cap(totalsByKey.verde, massimi.verde),
    giallo: cap(totalsByKey.giallo, massimi.giallo),
    grigio: cap(totalsByKey.grigio, massimi.grigio),
  }
}

function computeDepthScore(rawRecord = {}, disposition, score) {
  const rawValues = disposition.rawKeys.map((key) => Number(rawRecord?.[key]) || 0)
  const rawSum = rawValues.reduce((sum, value) => sum + value, 0)
  const peak = Math.max(0, ...rawValues)
  const concentration = rawSum > 0 ? (peak / rawSum) * 100 : 0
  return Math.round(clamp(score * 0.68 + concentration * 0.32, 0, 100))
}

export function getDepthBand(depthScore) {
  if (depthScore >= 70) return 'alta'
  if (depthScore >= 40) return 'media'
  return 'bassa'
}

export function buildDispositionNodes({ rawRecord, totalsByKey }) {
  const massimiFamiglie = massimiPerRecord(rawRecord).famiglie
  const scoreByColor = toPercentScores(totalsByKey, massimiFamiglie)
  return DISPOSITIONS.map((disposition, index) => {
    const score = scoreByColor[disposition.colorKey] || 0
    const depthScore = computeDepthScore(rawRecord, disposition, score)
    const maxFam = massimiFamiglie[disposition.colorKey] || 1
    const totFam = Number(totalsByKey[disposition.colorKey]) || 0
    const familyFraction = maxFam > 0 ? Math.min(1, Math.max(0, totFam / maxFam)) : 0
    /** Raggio nominale px: 18 + percentualeGrezza * 48 (max teorico famiglia). */
    const sphereRadius = 18 + familyFraction * 48
    const glowRadius = sphereRadius * (0.4 + (depthScore / 100) * 1.2)
    const glowOpacity = 0.25 + (depthScore / 100) * 0.55
    return {
      ...disposition,
      score,
      familyFraction,
      depthScore,
      depthBand: getDepthBand(depthScore),
      sphereRadius,
      glowRadius,
      glowOpacity,
      // Disposizione pseudo-3D stabile + lieve variazione in base allo score.
      position3d: {
        x: Math.round(Math.cos((index / DISPOSITIONS.length) * Math.PI * 2) * 32 + (score - 50) * 0.2),
        y: Math.round(Math.sin((index / DISPOSITIONS.length) * Math.PI * 2) * 20),
        z: Math.round(disposition.directionVector.z * 34 + (depthScore - 50) * 0.25),
      },
    }
  })
}

/** Testo neutro: il tipo di linea è solo un codice dell’interfaccia (non descritto in STATI D’ANIMO IN 4 FAMIGLIE). */
function relationNarrative(fromLabel, toLabel, relationType) {
  const kind =
    relationType === 'synergy'
      ? 'linea continua'
      : relationType === 'tension'
        ? 'tratteggio breve'
        : relationType === 'compensation'
          ? 'tratteggio puntinato'
          : 'tratteggio lungo'
  return `${fromLabel} ↔ ${toLabel}: messaggio grafico (${kind}), derivato in questa interfaccia dal confronto tra i punteggi delle due famiglie in questo report.`
}

function relationTypeFromNodes(fromNode, toNode, relationScore) {
  const fromPolar = fromNode.polarity
  const toPolar = toNode.polarity
  if (fromPolar === toPolar && relationScore >= 52) return 'synergy'
  if (
    (fromPolar === 'centripeta' && toPolar === 'centrifuga') ||
    (fromPolar === 'centrifuga' && toPolar === 'centripeta')
  ) {
    return relationScore < 40 ? 'tension' : 'compensation'
  }
  if (relationScore < 30) return 'tension'
  if (relationScore >= 65) return 'synergy'
  return 'neutral'
}

export function buildDispositionRelations(nodes = []) {
  const relations = []
  for (let fromIndex = 0; fromIndex < nodes.length; fromIndex += 1) {
    for (let toIndex = fromIndex + 1; toIndex < nodes.length; toIndex += 1) {
      const fromNode = nodes[fromIndex]
      const toNode = nodes[toIndex]
      const distance = Math.abs(fromNode.score - toNode.score)
      const relationScore = Math.round(clamp(100 - distance * 1.15, 0, 100))
      const relationType = relationTypeFromNodes(fromNode, toNode, relationScore)
      relations.push({
        fromDispositionId: fromNode.dispositionId,
        toDispositionId: toNode.dispositionId,
        relationType,
        relationScore,
        opacity: clamp(0.15 + relationScore / 120, 0.2, 0.92),
        relationNarrative: relationNarrative(fromNode.label, toNode.label, relationType),
      })
    }
  }
  return relations
}

export function getDominantAndSecondary(nodes = []) {
  const sorted = [...nodes].sort((a, b) => b.score - a.score)
  const dominant = sorted[0] || null
  const secondary = sorted[1] || null
  const contrastPercent = dominant && secondary ? Math.round(clamp(dominant.score - secondary.score, 0, 100)) : 0
  return { dominant, secondary, contrastPercent }
}

/**
 * Equilibrio globale = (1 - varianzaNormalizzata) * 100.
 *
 * varianza = media((score_i - mediaScore)^2), su 5 score in [0,100].
 * varianzaMax teorica per 5 correnti in [0,100] e distribuzione estrema [100,0,0,0,0]:
 * media=20, varianzaMax=1600.
 */
export function computeGlobalBalance(nodes = []) {
  if (!nodes.length) return 0
  const scores = nodes.map((node) => Number(node.score) || 0)
  const mean = scores.reduce((sum, value) => sum + value, 0) / scores.length
  const variance = scores.reduce((sum, value) => sum + (value - mean) ** 2, 0) / scores.length
  const varianceNormalized = clamp(variance / 1600, 0, 1)
  return Math.round((1 - varianceNormalized) * 100)
}

export const NARRATIVE_TIMELINE_STEPS = [
  { step: 1, title: 'Panorama generale', description: 'Osserva equilibrio globale e distribuzione delle cinque correnti.' },
  { step: 2, title: 'Corrente dominante', description: 'Approfondisci la corrente con score più alto e la sua profondità.' },
  { step: 3, title: 'Correnti secondarie', description: 'Valuta le correnti di supporto e il contrasto con la dominante.' },
  { step: 4, title: 'Rapporti tra correnti', description: 'Osserva le linee come confronto grafico dei punteggi (codice interfaccia). Per il senso delle correnti e degli intervalli fare riferimento al testo STATI D’ANIMO IN 4 FAMIGLIE.' },
  { step: 5, title: 'Sintesi operativa', description: 'Integra i segnali principali in una lettura personale orientata all’azione.' },
]
