import React from 'react'

/**
 * @typedef {import('../../report.types').StickyNavigatorProps} StickyNavigatorProps
 */

/**
 * @param {StickyNavigatorProps} props
 */
function StickyNavigator({
  flowers,
  sectionIds,
  activeSectionId,
  progressPercent,
  onSectionSelect,
}) {
  const sectionLabels = [
    'Hero',
    ...flowers.map((flower, index) => flower?.title || `Flower ${index + 1}`),
    'Synthesis',
    'Closing',
  ]

  return (
    <nav aria-label="Report section navigator">
      <div aria-live="polite">Progress: {Math.round(progressPercent)}%</div>
      <ul>
        {sectionIds.map((sectionId, index) => (
          <li key={sectionId}>
            <button
              type="button"
              aria-current={activeSectionId === sectionId ? 'true' : undefined}
              onClick={() => onSectionSelect(sectionId)}
            >
              {sectionLabels[index] || sectionId}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default StickyNavigator
