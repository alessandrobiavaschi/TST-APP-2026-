import React from 'react'

/**
 * Finestra chiusa che si apre su richiesta: l'ultimo livello della matrioska
 * (area → stanza → finestra). Le finestre con lo stesso `gruppo` si escludono:
 * aprendone una si chiude l'altra (attributo nativo `name` di <details>).
 */
export default function Finestra({ titolo, nota, gruppo, famiglia, tua = false, children }) {
  return (
    <details className={`stanza-finestra${tua ? ' is-tua' : ''}`} name={gruppo} data-famiglia={famiglia}>
      <summary className="stanza-finestra__testa">
        <span className="stanza-finestra__titolo">{titolo}</span>
        {nota ? <span className="stanza-finestra__nota">{nota}</span> : null}
        <span className="stanza-finestra__segno" aria-hidden="true" />
      </summary>
      <div className="stanza-finestra__corpo">{children}</div>
    </details>
  )
}

/** Pila di finestre di una stanza. */
export function Finestre({ children }) {
  return <div className="stanza-finestre">{children}</div>
}
