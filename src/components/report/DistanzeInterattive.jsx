import React, { useState, useRef, useEffect } from 'react'
import { DISTANZE_MUSICALI_13 } from '../../content/musicaPerMusicisti.js'
import { playIntervalAudio } from '../../utils/audioIntervalSynth.js'

export default function DistanzeInterattive({
  profilo = {},
  accentColor = '#4ade80',
  colorTotals = {},
}) {
  const [playingIndex, setPlayingIndex] = useState(null)
  const [expandedInfoIndex, setExpandedInfoIndex] = useState(null)
  const stopAudioRef = useRef(null)
  const timerRef = useRef(null)

  const userFamily = profilo?.famiglia || ''

  useEffect(() => {
    return () => {
      if (stopAudioRef.current) stopAudioRef.current()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handlePlayInterval = (index, semitoni) => {
    if (stopAudioRef.current) {
      stopAudioRef.current()
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setPlayingIndex(index)
    stopAudioRef.current = playIntervalAudio(semitoni, { baseFreq: 261.63, duration: 1.6 })

    timerRef.current = setTimeout(() => {
      setPlayingIndex(null)
      stopAudioRef.current = null
    }, 1600)
  }

  const toggleInfo = (index) => {
    setExpandedInfoIndex((prev) => (prev === index ? null : index))
  }

  return (
    <section id="fm-distanze" className="fm-section fm-distanze" aria-labelledby="fm-distanze-title">
      <div className="fm-distanze__head">
        <p className="fm-kicker">Stanza 2 · Il codice delle 13 distanze musicali</p>
        <h2 id="fm-distanze-title">Le 13 distanze musicali (dal Buio alla Luce)</h2>
        <p className="fm-section-lead">
          Dall'unisono fino alla compiutezza dell'ottava. Tocca «Ascolta» per attivare il sintetizzatore
          e ascoltare la vibrazione simultanea dei due suoni, osservando il loro significato psicofisiologico
          secondo la ricerca di Franco Mussida.
        </p>
      </div>

      <div className="fm-distanze__timeline" role="list">
        {DISTANZE_MUSICALI_13.map((dist, idx) => {
          const isPlaying = playingIndex === idx
          const isUserDominantFamily =
            userFamily && dist.famigliaKey.toLowerCase() === userFamily.toLowerCase()
          const familyScore = colorTotals?.[dist.famigliaKey] || 0
          const isUserActiveFamily = familyScore > 0 || isUserDominantFamily
          const isExpanded = expandedInfoIndex === idx

          return (
            <article
              key={`${dist.semitoni}-${dist.nome}`}
              role="listitem"
              className={`fm-distanza-card${isPlaying ? ' is-playing' : ''}${
                isUserDominantFamily ? ' is-dominant' : ''
              }${isUserActiveFamily ? ' is-active-in-profile' : ''}`}
              style={{
                '--dist-color': dist.coloreFamiglia,
                '--user-accent': accentColor,
              }}
            >
              <div className="fm-distanza-card__left">
                <div className="fm-distanza-card__step-badge">
                  <span className="fm-distanza-card__step-num">{dist.semitoni}</span>
                  <span className="fm-distanza-card__step-label">
                    {dist.semitoni === 1 ? 'semitono' : 'semitoni'}
                  </span>
                </div>

                <button
                  type="button"
                  className={`fm-distanza-card__play-btn${isPlaying ? ' is-active' : ''}`}
                  onClick={() => handlePlayInterval(idx, dist.semitoni)}
                  aria-label={`Ascolta l'intervallo ${dist.nome}`}
                >
                  <span className="fm-distanza-card__play-icon" aria-hidden="true">
                    {isPlaying ? '■' : '▶'}
                  </span>
                  <span className="fm-distanza-card__play-text">
                    {isPlaying ? 'In riproduzione…' : 'Ascolta'}
                  </span>
                </button>
              </div>

              <div className="fm-distanza-card__center">
                <div className="fm-distanza-card__header">
                  <h3 className="fm-distanza-card__title">
                    <span className="fm-distanza-card__sigla">{dist.sigla}</span> {dist.nome}
                  </h3>
                  <span className="fm-distanza-card__notes">{dist.note}</span>
                  <span className="fm-distanza-card__ratio" title="Rapporto di frequenze">
                    {dist.rapportoFrequenza}
                  </span>
                </div>

                <p className="fm-distanza-card__evocativa">{dist.evocativa}</p>
                <p className="fm-distanza-card__mussida">{dist.descrizioneMussida}</p>

                {isExpanded && dist.motivoStato && (
                  <div className="fm-distanza-card__detail-box">
                    <p className="fm-distanza-card__detail-title">Nota sul modello:</p>
                    <p className="fm-distanza-card__detail-text">{dist.motivoStato}</p>
                  </div>
                )}
              </div>

              <div className="fm-distanza-card__right">
                <div className="fm-distanza-card__nature-box">
                  <span className="fm-distanza-card__nature-label">Natura associata</span>
                  <span
                    className="fm-distanza-card__nature-tag"
                    style={{
                      borderColor: dist.coloreFamiglia,
                      backgroundColor: `${dist.coloreFamiglia}18`,
                      color: '#f8fafc',
                    }}
                  >
                    <span
                      className="fm-distanza-card__nature-dot"
                      style={{ backgroundColor: dist.coloreFamiglia }}
                      aria-hidden="true"
                    />
                    {dist.naturaNome} ({dist.famigliaNome})
                  </span>

                  {isUserDominantFamily && (
                    <span className="fm-distanza-card__profile-badge" style={{ color: dist.coloreFamiglia }}>
                      ✦ Nel tuo profilo prevalente
                    </span>
                  )}
                </div>

                <div className="fm-distanza-card__status-box">
                  <button
                    type="button"
                    onClick={() => toggleInfo(idx)}
                    className={`fm-distanza-card__status-btn ${
                      dist.stato === 'in verifica' ? 'is-in-verifica' : 'is-consolidato'
                    }`}
                    title="Clicca per i dettagli metodologici"
                  >
                    <span className="fm-distanza-card__status-indicator" />
                    <span>{dist.stato === 'in verifica' ? 'In verifica' : 'Consolidato'}</span>
                    <span className="fm-distanza-card__info-icon" aria-hidden="true">
                      {isExpanded ? '▲' : 'ℹ'}
                    </span>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
