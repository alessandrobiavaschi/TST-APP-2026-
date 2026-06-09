import React from 'react'
import { getSemanticConcept, SEMANTIC_CONCEPT_EVENT } from '../../config/semanticConcepts'

export default function SemanticConcept({
  id,
  children,
  source = 'report',
  scrollToGalaxy = true,
  className = '',
}) {
  const concept = getSemanticConcept(id)
  if (!concept) return children

  const activateConcept = () => {
    window.dispatchEvent(
      new CustomEvent(SEMANTIC_CONCEPT_EVENT, {
        detail: {
          id,
          source,
          scrollToGalaxy,
        },
      }),
    )
  }

  return (
    <button
      type="button"
      className={`semantic-concept ${className}`.trim()}
      data-semantic-concept-id={id}
      aria-label={`Segui la traccia: ${concept.label}`}
      onClick={activateConcept}
    >
      <span className="semantic-concept-label">{children || concept.label}</span>
      <span className="semantic-concept-preview" role="tooltip">
        {concept.shortMeaning}
      </span>
    </button>
  )
}
