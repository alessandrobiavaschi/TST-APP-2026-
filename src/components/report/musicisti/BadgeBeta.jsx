import React from 'react'

/** Segnala che la sezione è in versione beta. */
export default function BadgeBeta() {
  return (
    <span className="tst-beta-badge" title="Versione beta: la sezione è in sviluppo">
      <span aria-hidden="true">β</span> Beta
    </span>
  )
}
