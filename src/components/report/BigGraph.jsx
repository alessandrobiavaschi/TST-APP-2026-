import React from 'react'

/**
 * @typedef {import('../../report.types').BigGraphProps} BigGraphProps
 */

const GRAPH_WIDTH = 1000
const GRAPH_HEIGHT = 460
const LEFT_LABEL_COL = 350
const RIGHT_PAD = 40
const TOP_PAD = 40
const BOTTOM_PAD = 36
const ROW_GAP = 22
const DOMINANT_OPACITY = 1
const SECONDARY_OPACITY = 0.3

function normalizeGraphData(graphData) {
  if (Array.isArray(graphData)) {
    return graphData
      .map((item, index) => {
        if (!item || typeof item !== 'object') return null
        const label = item.label ?? item.name ?? item.trait ?? item.title ?? `Trait ${index + 1}`
        const value = Number(item.value ?? item.score ?? item.level ?? item.amount ?? 0)
        return Number.isFinite(value) ? { label: String(label), value: Math.max(0, value) } : null
      })
      .filter(Boolean)
  }

  if (graphData && typeof graphData === 'object') {
    const nestedArray =
      Array.isArray(graphData.traits) ? graphData.traits : Array.isArray(graphData.items) ? graphData.items : null
    if (nestedArray) return normalizeGraphData(nestedArray)

    return Object.entries(graphData)
      .filter(([, rawValue]) => typeof rawValue === 'number' && Number.isFinite(rawValue))
      .map(([label, value]) => ({ label, value: Math.max(0, Number(value)) }))
  }

  return []
}

/**
 * @param {BigGraphProps} props
 */
function BigGraph({ graphData, themeColor }) {
  const normalizedTraits = normalizeGraphData(graphData).slice(0, 8)
  if (normalizedTraits.length === 0) {
    return <div>TODO: graph data missing</div>
  }
  const sortedTraits = [...normalizedTraits].sort((traitA, traitB) => traitB.value - traitA.value)
  const dominantTrait = sortedTraits[0]
  const maxValue = Math.max(...sortedTraits.map((trait) => trait.value), 1)

  const drawableHeight = GRAPH_HEIGHT - TOP_PAD - BOTTOM_PAD
  const rowHeight =
    sortedTraits.length > 0
      ? Math.max((drawableHeight - ROW_GAP * (sortedTraits.length - 1)) / sortedTraits.length, 24)
      : 0
  const maxBarWidth = GRAPH_WIDTH - LEFT_LABEL_COL - RIGHT_PAD

  return (
    <svg
      role="img"
      aria-label="Big graph with dominant and secondary traits"
      viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      width="100%"
      height={GRAPH_HEIGHT}
      style={{ display: 'block', minHeight: 420, maxHeight: 520 }}
      preserveAspectRatio="xMidYMid meet"
    >
      {sortedTraits.map((trait, traitIndex) => {
        const isDominant = dominantTrait && trait.label === dominantTrait.label
        const y = TOP_PAD + traitIndex * (rowHeight + ROW_GAP)
        const barWidth = (trait.value / maxValue) * maxBarWidth

        return (
          <g key={`${trait.label}-${traitIndex}`} opacity={isDominant ? DOMINANT_OPACITY : SECONDARY_OPACITY}>
            <text
              x={LEFT_LABEL_COL - 16}
              y={y + rowHeight / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill={isDominant ? themeColor : '#d7d7d7'}
              fontSize={isDominant ? 27 : 20}
              fontWeight={isDominant ? 800 : 600}
              letterSpacing={isDominant ? 0.5 : 0}
            >
              {trait.label}
            </text>

            <rect
              x={LEFT_LABEL_COL}
              y={y}
              width={barWidth}
              height={rowHeight}
              rx={rowHeight / 2}
              fill={themeColor}
            />

            <text
              x={LEFT_LABEL_COL + barWidth + 10}
              y={y + rowHeight / 2}
              dominantBaseline="middle"
              fill={isDominant ? themeColor : '#d7d7d7'}
              fontSize={isDominant ? 20 : 16}
              fontWeight={isDominant ? 700 : 500}
            >
              {Math.round(trait.value)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default BigGraph
