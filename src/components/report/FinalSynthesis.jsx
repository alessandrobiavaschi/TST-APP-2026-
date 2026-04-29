import React from 'react'
import BaseCard from '../primitives/BaseCard'
import HighlightText from '../primitives/HighlightText'
import { spacing, typography } from '../../design-tokens'

/**
 * @typedef {import('../../report.types').FinalSynthesisProps} FinalSynthesisProps
 */

/**
 * @param {FinalSynthesisProps} props
 */
function FinalSynthesis({ synthesis }) {
  return (
    <section id="final-synthesis" data-report-section="final-synthesis">
      <BaseCard
        style={{
          marginTop: spacing.section,
          marginBottom: spacing.section,
          padding: spacing.xl,
          display: 'grid',
          gap: spacing.md,
          justifyItems: 'center',
          textAlign: 'center',
        }}
      >
        <HighlightText as="p" style={{ margin: 0 }}>
          {synthesis?.eyebrow || 'TODO: synthesis eyebrow missing'}
        </HighlightText>
        <h2
          style={{
            margin: 0,
            fontSize: typography.h1.fontSize,
            lineHeight: 1.15,
            maxWidth: typography.h1.maxWidth,
          }}
        >
          {synthesis?.title || 'TODO: synthesis title missing'}
        </h2>
        <p
          style={{
            margin: 0,
            maxWidth: typography.body.maxWidth,
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
          }}
        >
          {synthesis?.body || 'TODO: synthesis body missing'}
        </p>
      </BaseCard>
    </section>
  )
}

export default FinalSynthesis
