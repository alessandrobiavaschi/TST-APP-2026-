import React from 'react'
import { NOMI_SUONI } from '../../../content/musicistiStanze.js'

/** Pulsante che manda un file audio del test al lettore comune. */
export default function BottoneSuono({ file, etichetta, fileInAscolto, onAscolta }) {
  return (
    <button
      type="button"
      className="stanza-suono"
      aria-pressed={fileInAscolto === file}
      onClick={() => onAscolta(file)}
    >
      <span aria-hidden="true">▶</span> {etichetta || NOMI_SUONI[file]}
    </button>
  )
}
