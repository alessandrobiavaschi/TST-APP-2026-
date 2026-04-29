import React from 'react'
import { colors, radius, spacing, typography } from '../../design-tokens'

export default function HighlightText({ children, as = 'span', style, ...props }) {
  const Element = as

  return (
    <Element
      style={{
        display: 'inline',
        color: colors.textStrong,
        backgroundColor: colors.highlight,
        borderRadius: radius.base,
        paddingInline: spacing.xs,
        paddingBlock: spacing.xs,
        fontSize: typography.body.fontSize,
        lineHeight: typography.body.lineHeight,
        ...style,
      }}
      {...props}
    >
      {children}
    </Element>
  )
}
