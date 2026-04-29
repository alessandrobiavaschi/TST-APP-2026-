import React from 'react'
import { typography } from '../../design-tokens'

/**
 * @typedef {import('../../report.types').ScientificDeepDiveProps} ScientificDeepDiveProps
 */

/**
 * @param {ScientificDeepDiveProps} props
 */
function ScientificDeepDive({ content }) {
  return (
    <div
      style={{
        maxWidth: typography.body.maxWidth,
        marginInline: 'auto',
      }}
    >
      {content}
    </div>
  )
}

export default ScientificDeepDive
