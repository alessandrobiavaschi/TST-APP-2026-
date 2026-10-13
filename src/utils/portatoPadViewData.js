import { allocateRoundedPercentages } from './reportRecordUtils.js'

const DEFAULT_LABELS = {
  Simpatia: 'Sintonia',
  Antipatia: 'Distonia',
  Indifferenza: 'Indifferenza',
}

const DIMENSION_CLASS_BY_KEY = {
  Simpatia: 'sintonia',
  Antipatia: 'distonia',
  Indifferenza: 'distanza',
}

const TRIANGLE_VERTICES = {
  Simpatia: { x: 8, y: 8 },
  Antipatia: { x: 92, y: 8 },
  Indifferenza: { x: 50, y: 92 },
}

const SHARE_ALIASES = {
  Simpatia: ['Simpatia', 'simpatia', 'Sintonia', 'sintonia'],
  Antipatia: ['Antipatia', 'antipatia', 'Distonia', 'distonia'],
  Indifferenza: ['Indifferenza', 'indifferenza', 'Distanza', 'distanza'],
}

const INTERPRETATION_THRESHOLDS = {
  nearShare: 0.08,
  nearlyAbsent: 0.05,
  contained: 0.15,
}

function toNonNegativeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function readContractShare(shares, key) {
  if (!shares || typeof shares !== 'object') return null
  const match = SHARE_ALIASES[key].find((alias) => shares[alias] != null)
  if (!match) return null
  const value = Number(shares[match])
  return Number.isFinite(value) && value >= 0 ? value : null
}

export function buildPortatoInterpretation(dimensions) {
  const sorted = [...dimensions].sort((a, b) => b.share - a.share)
  const spread = sorted[0].share - sorted[2].share
  if (spread <= INTERPRETATION_THRESHOLDS.nearShare) {
    return 'Durante questo ascolto sintonia, distonia e distanza hanno mostrato quote molto vicine: il contenuto musicale ha generato una compresenza delle tre modalità, senza un unico orientamento netto.'
  }

  if (sorted[0].share - sorted[1].share <= INTERPRETATION_THRESHOLDS.nearShare) {
    const thirdLabel = sorted[2].ui.label.toLowerCase()
    const thirdClause = sorted[2].share <= INTERPRETATION_THRESHOLDS.nearlyAbsent
      ? `la ${thirdLabel} è rimasta quasi assente`
      : sorted[2].share <= INTERPRETATION_THRESHOLDS.contained
        ? `la ${thirdLabel} è emersa in misura contenuta`
        : `la ${thirdLabel} ha avuto una presenza più contenuta`
    return `Durante questo ascolto ${sorted[0].ui.label.toLowerCase()} e ${sorted[1].ui.label.toLowerCase()} sono emerse con intensità simile; ${thirdClause}. Il contenuto musicale ha quindi generato un orientamento misto, senza una sola modalità nettamente prevalente.`
  }

  return `Durante questo ascolto ha prevalso la ${sorted[0].ui.label.toLowerCase()} con il contenuto musicale; la ${sorted[1].ui.label.toLowerCase()} è emersa in misura secondaria, mentre la ${sorted[2].ui.label.toLowerCase()} è rimasta più contenuta.`
}

export function buildPortatoViewData(portato, labels = DEFAULT_LABELS) {
  const sourceDimensions = Array.isArray(portato?.dimensioni) ? portato.dimensioni : []
  const sourceByKey = new Map(sourceDimensions.map((dimension) => [dimension?.key, dimension]))
  const rawDimensions = Object.keys(DEFAULT_LABELS).map((key) => ({
    key,
    ui: {
      label: labels?.[key] || DEFAULT_LABELS[key],
      className: DIMENSION_CLASS_BY_KEY[key],
    },
    value: toNonNegativeNumber(sourceByKey.get(key)?.valore ?? portato?.[key.toLowerCase()]),
  }))
  const total = rawDimensions.reduce((sum, dimension) => sum + dimension.value, 0)
  const contractShares = portato?.quoteNormalizzate || portato?.pad?.quote ||
    portato?.pad?.quotes || portato?.normalizedShares || portato?.shares
  const contractValues = rawDimensions.map((dimension) =>
    readContractShare(contractShares, dimension.key) ??
      (() => {
        const value = Number(sourceByKey.get(dimension.key)?.quotaNormalizzata)
        return Number.isFinite(value) && value >= 0 ? value : null
      })(),
  )
  const hasCompleteContract = contractValues.every((value) => value != null)
  const contractScale = hasCompleteContract && contractValues.some((value) => value > 1) ? 100 : 1
  const scaledContractValues = contractValues.map((value) =>
    value == null ? null : value / contractScale,
  )
  const contractTotal = hasCompleteContract
    ? scaledContractValues.reduce((sum, value) => sum + value, 0)
    : 0

  const shares = rawDimensions.map((dimension, index) =>
    contractTotal > 0
      ? scaledContractValues[index] / contractTotal
      : total > 0
        ? dimension.value / total
        : 0,
  )
  const percentages = allocateRoundedPercentages(shares)
  const dimensions = rawDimensions.map((dimension, index) => ({
    ...dimension,
    share: shares[index],
    percentage: percentages[index],
  }))

  const contractPoint = portato?.pad?.punto || portato?.puntoTriangolo ||
    portato?.trianglePoint || portato?.point
  const pointX = Number(contractPoint?.x)
  const pointY = Number(contractPoint?.y)
  const hasContractPoint = Number.isFinite(pointX) && Number.isFinite(pointY)
  const normalizedContractPoint = hasContractPoint
    ? {
        x: pointX <= 1 ? 8 + clamp(pointX, 0, 1) * 84 : clamp(pointX, 8, 92),
        y: pointY <= 1 ? 8 + clamp(pointY, 0, 1) * 84 : clamp(pointY, 8, 92),
      }
    : null
  const barycentricPoint = total > 0 || contractTotal > 0
    ? dimensions.reduce(
        (point, dimension) => ({
          x: point.x + TRIANGLE_VERTICES[dimension.key].x * dimension.share,
          y: point.y + TRIANGLE_VERTICES[dimension.key].y * dimension.share,
        }),
        { x: 0, y: 0 },
      )
    : null

  const hasData = portato?.hasData === false ? false : total > 0 || contractTotal > 0
  return {
    dimensions,
    hasData,
    point: hasData ? normalizedContractPoint || barycentricPoint : null,
  }
}
