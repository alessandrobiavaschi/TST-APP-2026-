import React, { useEffect, useRef, useState } from 'react'
import { buildTestAudioUrl, getAudioSourceIssue } from '../../../audioUrls.js'
import { NOMI_SUONI } from '../../../content/musicistiStanze.js'

/**
 * Lettore unico delle stanze: suona un file audio del test alla volta.
 * Resta in basso mentre si scorre; si chiude quando si esce dalle stanze.
 */
export default function LettoreSuoni({ file, onClose }) {
  const audioRef = useRef(null)
  const [inRiproduzione, setInRiproduzione] = useState(false)
  const [errore, setErrore] = useState('')
  const url = file ? buildTestAudioUrl(file) : ''

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !url) return undefined
    const problema = getAudioSourceIssue(url)
    setErrore(problema)
    if (problema) return undefined
    audio.currentTime = 0
    audio.play().catch(() => setErrore('Tocca ▶ per avviare l’ascolto.'))
    return () => audio.pause()
  }, [url])

  if (!file) return null

  const alterna = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().then(() => setErrore('')).catch(() => {})
    else audio.pause()
  }

  return (
    <div className="stanze-lettore" role="region" aria-label="Ascolto in corso">
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        onPlay={() => setInRiproduzione(true)}
        onPause={() => setInRiproduzione(false)}
        onEnded={() => setInRiproduzione(false)}
        onError={() => setErrore('Questo suono non si riesce a caricare.')}
      />
      <button
        type="button"
        className="stanze-lettore__play"
        onClick={alterna}
        aria-label={inRiproduzione ? 'Pausa' : 'Ascolta'}
      >
        {inRiproduzione ? '❚❚' : '▶'}
      </button>
      <div className="stanze-lettore__testo">
        <span className="stanze-lettore__nome">{NOMI_SUONI[file] || `Suono ${file}`}</span>
        {errore ? <span className="stanze-lettore__nota">{errore}</span> : null}
      </div>
      <button type="button" className="stanze-lettore__chiudi" onClick={onClose} aria-label="Chiudi l’ascolto">
        ✕
      </button>
    </div>
  )
}
