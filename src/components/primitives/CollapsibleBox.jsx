import React, { useState } from 'react'
import { colors, radius, spacing, typography } from '../../design-tokens'
import BaseCard from './BaseCard'

export default function CollapsibleBox({
  title,
  children,
  defaultOpen = false,
  style,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <BaseCard style={{ padding: 0, overflow: 'hidden', ...style }} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          border: 'none',
          backgroundColor: colors.primarySoft,
          color: colors.textStrong,
          padding: spacing.md,
          textAlign: 'left',
          fontSize: typography.h3.fontSize,
          lineHeight: typography.h3.lineHeight,
          cursor: 'pointer',
        }}
      >
        {title}
      </button>
      {isOpen && (
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            padding: spacing.md,
            color: colors.text,
            fontSize: typography.body.fontSize,
            lineHeight: typography.body.lineHeight,
            maxWidth: typography.body.maxWidth,
            borderRadius: radius.base,
          }}
        >
          {children}
        </div>
      )}
    </BaseCard>
  )
}
