import React, { useMemo } from 'react'
import { buildProgressiveContentViewModel } from '../../utils/buildProgressiveContentViewModel.js'

/**
 * Composizione del profilo: famiglie presenti con la loro quota, in ordine di
 * intensità. Vive nei «Grafici dei risultati» (1.2), accanto ai dati che la
 * mostrano; l'apertura della stanza 01 resta sulla sola famiglia prevalente.
 * Stessa fonte delle schede famiglia: ranking del profilo globale.
 */

function joinNodes(nodes) {
  return nodes.reduce((acc, node, i) => {
    if (i === 0) return [node]
    if (i === nodes.length - 1) return [...acc, ' e ', node]
    return [...acc, ', ', node]
  }, [])
}

export default function FamigliePresenti({ globalProfileContract = null, contentCards = null }) {
  const composition = useMemo(
    () => buildProgressiveContentViewModel({
      ranking: globalProfileContract?.ranking,
      contentCards: contentCards || {},
    }),
    [globalProfileContract, contentCards],
  )

  const seen = new Set()
  const presenti = []
  for (const item of [...composition.primaryFamilies, composition.compactCompanion]) {
    const nome = item?.content?.nome || item?.familyName
    if (!nome || seen.has(nome)) continue
    seen.add(nome)
    presenti.push({ nome, colore: item.colore, percent: item.presencePercent })
  }
  if (presenti.length < 2) return null

  const nodes = presenti.map((f) => (
    <span key={f.nome}>
      <strong style={f.colore ? { color: f.colore } : undefined}>{f.nome}</strong>
      {typeof f.percent === 'number' ? ` (${Math.round(f.percent)}%)` : ''}
    </span>
  ))

  return (
    <p className="sintesi-correnti__narrative-p famiglie-presenti">
      Nel tuo profilo sono presenti le famiglie {joinNodes(nodes)}, in ordine di intensità
      {composition.isComposite ? ': la prevalente guida di poco e vanno lette quasi sullo stesso piano.' : '.'}
    </p>
  )
}
