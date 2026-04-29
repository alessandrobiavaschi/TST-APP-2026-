import React from 'react'
import BaseCard from '../primitives/BaseCard'
import HighlightText from '../primitives/HighlightText'
import { colors, spacing, typography } from '../../design-tokens'

/**
 * @typedef {import('../../report.types').HeroProfileProps} HeroProfileProps
 */

/**
 * @param {HeroProfileProps} props
 */
function HeroProfile({ heroProfile }) {
  const rawDominantTraits = Array.isArray(heroProfile?.dominantTraits) ? heroProfile.dominantTraits : []
  const dominantTraits = [...rawDominantTraits]
  while (dominantTraits.length < 3) dominantTraits.push('TODO: dominant trait missing')

  return (
    <section id="hero-profile" data-report-section="hero-profile">
      <BaseCard
        style={{
          minHeight: '80vh',
          display: 'grid',
          placeItems: 'center',
          padding: spacing.lg,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1080px',
            display: 'grid',
            gap: spacing.md,
            textAlign: 'center',
            justifyItems: 'center',
          }}
        >
          <HighlightText as="p" style={{ fontSize: typography.caption.fontSize }}>
            {heroProfile?.identityLabel || 'TODO: hero identity label missing'}
          </HighlightText>
          <div
            aria-hidden="true"
            style={{
              width: 'min(60vw, 420px)',
              aspectRatio: '1 / 1',
              borderRadius: '999px',
              background:
                'radial-gradient(circle at 32% 25%, rgba(255,255,255,0.92), rgba(255,255,255,0) 58%), linear-gradient(145deg, #eef2ff, #dbeafe)',
              border: `1px solid ${colors.border}`,
              boxShadow: '0 24px 48px rgba(43,76,140,0.18)',
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: typography.h1.fontSize,
              lineHeight: 1.2,
              maxWidth: typography.h1.maxWidth,
            }}
          >
            {heroProfile?.title || 'TODO: hero title missing'}
          </h1>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: spacing.sm,
              width: '100%',
              maxWidth: '920px',
            }}
          >
            {dominantTraits.slice(0, 3).map((trait, index) => (
              <BaseCard key={`${trait}-${index}`} as="article" style={{ textAlign: 'center' }}>
                <strong>{trait}</strong>
              </BaseCard>
            ))}
          </div>
        </div>
      </BaseCard>
    </section>
  )
}

export default HeroProfile
