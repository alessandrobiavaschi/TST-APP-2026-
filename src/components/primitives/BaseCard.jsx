import React from 'react'
import { colors, radius, shadows, spacing } from '../../design-tokens'

export default function BaseCard({ children, as = 'section', style, ...props }) {
  const Element = as

  return (
    <Element
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.base,
        boxShadow: shadows.base,
        padding: spacing.md,
        color: colors.text,
        ...style,
      }}
      {...props}
    >
      {children}
    </Element>
  )
}
