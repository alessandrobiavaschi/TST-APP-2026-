import React from 'react'

/**
 * Capitolo del For Musicians tratto dal libro: titolo, pagine di «Il Pianeta della
 * Musica» e, quando c'è, il testo trascritto (capitolo.testo, un paragrafo per voce).
 */
export default function CapitoloLibro({ capitolo }) {
  const titleId = `${capitolo.id}-title`
  const paragrafi = capitolo.testo || []
  return (
    <section id={capitolo.id} className="fm-section fm-capitolo-libro" aria-labelledby={titleId}>
      <h2 id={titleId}>{capitolo.title}</h2>
      <p className="fm-capitolo-libro__fonte">{capitolo.subtitle}</p>
      {paragrafi.length ? (
        <div className="fm-capitolo-libro__testo">
          {paragrafi.map((paragrafo) => (
            <p key={paragrafo.slice(0, 40)}>{paragrafo}</p>
          ))}
        </div>
      ) : null}
    </section>
  )
}
