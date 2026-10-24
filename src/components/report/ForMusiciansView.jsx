import React from 'react'
import StanzeMusicisti from './musicisti/StanzeMusicisti.jsx'
import { FAMIGLIE_MUSICA } from '../../content/musicistiStanze.js'

/**
 * Report per musicisti: stanze da consultare (vedi musicisti/StanzeMusicisti.jsx).
 * La vecchia lettura (SezioneMusica, Aree sonore, Ascolto emotivo consapevole)
 * resta nel repository finché non viene confermata la rimozione.
 */
export default function ForMusiciansView({ profilo = {}, accentColor = '#4ade80', onClose, backButtonRef }) {
  const famiglia = FAMIGLIE_MUSICA[profilo?.famiglia] ? profilo.famiglia : null
  return (
    <StanzeMusicisti
      famigliaPrevalente={famiglia}
      accentColor={accentColor}
      onClose={onClose}
      backButtonRef={backButtonRef}
    />
  )
}
