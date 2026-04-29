import React from 'react'
import { spacing, typography } from '../../design-tokens'

/**
 * @typedef {import('../../report.types').ClosingNarrativeProps} ClosingNarrativeProps
 */

/**
 * @param {ClosingNarrativeProps} props
 */
function ClosingNarrative({ closingNarrative }) {
  const paragraphs = Array.isArray(closingNarrative?.paragraphs) ? closingNarrative.paragraphs : []

  return (
    <section id="closing-narrative" data-report-section="closing-narrative">
      <div
        style={{
          maxWidth: typography.body.maxWidth,
          marginInline: 'auto',
          paddingBlock: spacing.section,
          display: 'grid',
          gap: spacing.md,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight,
        }}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p key={`${index}-${String(paragraph).slice(0, 24)}`}>{paragraph}</p>
          ))
        ) : (
          <p>TODO: closing narrative missing</p>
        )}
      </div>
    </section>
  )
}

export default ClosingNarrative
