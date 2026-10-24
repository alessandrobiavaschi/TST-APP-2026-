import React from 'react'
import StanzeMusicisti from './musicisti/StanzeMusicisti.jsx'
import { FAMIGLIE_MUSICA } from '../../content/musicistiStanze.js'

/**
 * For Musicians & Music Lovers: aree → stanze → riquadri (vedi musicisti/StanzeMusicisti.jsx).
 * I componenti della versione precedente (PersonalSonicProfile, DistanzeInterattive,
 * SuoniDelTuoTest, MussidaBookAtlas…) restano nel repository finché non si decide di rimuoverli.
 */
export default function ForMusiciansView({ profilo = {}, accentColor = '#4ade80', rawRecord = {}, onClose, backButtonRef }) {
  const famiglia = FAMIGLIE_MUSICA[profilo?.famiglia] ? profilo.famiglia : null
  return (
    <StanzeMusicisti
      famigliaPrevalente={famiglia}
      accentColor={accentColor}
      rawRecord={rawRecord}
      onClose={onClose}
      backButtonRef={backButtonRef}
    />
  )
}
