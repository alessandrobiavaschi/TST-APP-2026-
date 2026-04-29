import React from 'react'
import ScientificDeepDive from './ScientificDeepDive'
import BigGraph from './BigGraph'
import BaseCard from '../primitives/BaseCard'
import HighlightText from '../primitives/HighlightText'
import CollapsibleBox from '../primitives/CollapsibleBox'
import { spacing, typography } from '../../design-tokens'

/**
 * @typedef {import('../../report.types').FlowerSectionProps} FlowerSectionProps
 * @typedef {import('../../report.types').ReportSectionId} ReportSectionId
 */

/**
 * @param {FlowerSectionProps & { sectionId: ReportSectionId }} props
 */
function FlowerSection({ flower, sectionId }) {
  return (
    <section id={sectionId} data-report-section={sectionId}>
      <BaseCard style={{ display: 'grid', gap: spacing.md, padding: spacing.lg }}>
        <header>
          <h2
            style={{
              margin: 0,
              fontSize: typography.h2.fontSize,
              lineHeight: 1.2,
              maxWidth: typography.h2.maxWidth,
            }}
          >
            {flower.title}
          </h2>
        </header>

        <BigGraph graphData={flower.graphData} themeColor={flower.themeColor} />

        <HighlightText as="p" style={{ margin: 0 }}>
          {flower.quickInsightText}
        </HighlightText>

        <div
          style={{
            maxWidth: '720px',
            marginInline: 'auto',
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
          }}
        >
          {flower.scientificText}
        </div>

        <CollapsibleBox
          title="Approfondimento"
          defaultOpen={false}
          style={{ maxWidth: '920px', marginInline: 'auto', width: '100%' }}
        >
          <ScientificDeepDive content={flower.deepDiveText} />
        </CollapsibleBox>
      </BaseCard>
    </section>
  )
}

export default FlowerSection
