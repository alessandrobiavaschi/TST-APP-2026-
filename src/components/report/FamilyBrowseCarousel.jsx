import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import CalculationDisclosure from './CalculationDisclosure.jsx'
import { useUiSounds } from '../../UiSoundProvider.jsx'
import { COMPOSIZIONE_UI } from './reportUiCopy.js'
import './FamilyBrowseCarousel.css'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

const PANEL_FIELDS = [
  { key: 'natura', heading: 'Natura' },
  { key: 'racconto', heading: 'Racconto' },
  { key: 'qualita', heading: 'Risorse' },
  { key: 'ombre', heading: 'Ombre' },
]

function briefFor(card) {
  const content = card?.content || {}
  for (const { key } of PANEL_FIELDS) {
    if (Array.isArray(content[key]) && content[key].length) return content[key][0]
  }
  return ''
}

/**
 * Stanza "sfogliabile" con le famiglie non prevalenti del profilo: una alla volta,
 * nome + percentuale di presenza + breve sintesi sempre visibili, dettaglio completo
 * (i 4 blocchi già usati altrove per famiglia) dietro "Scopri di più".
 */
export default function FamilyBrowseCarousel({ families = [], isActive = false }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const uiSounds = useUiSounds()
  const reduceMotion = useReducedMotion()
  const pointerStartXRef = useRef(null)
  const total = families.length

  useEffect(() => {
    if (index > total - 1) setIndex(0)
  }, [total, index])

  const goTo = useCallback((nextIndex, dir) => {
    if (nextIndex < 0 || nextIndex >= total || nextIndex === index) return
    setDirection(dir)
    setIndex(nextIndex)
    uiSounds.playSwipe()
  }, [total, index, uiSounds])

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index])
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index])

  useEffect(() => {
    if (!isActive) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') goNext()
      else if (event.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isActive, goNext, goPrev])

  const handlePointerDown = (event) => {
    pointerStartXRef.current = event.clientX
  }
  const handlePointerUp = (event) => {
    const startX = pointerStartXRef.current
    pointerStartXRef.current = null
    if (startX == null) return
    const delta = event.clientX - startX
    if (Math.abs(delta) < 40) return
    if (delta < 0) goNext()
    else goPrev()
  }

  if (!total) return null
  const active = families[index]

  return (
    <div className="family-browse">
      <div className="family-browse__stage">
        <button
          type="button"
          className="family-browse__nav family-browse__nav--prev"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Famiglia precedente"
        >
          ‹
        </button>

        <div
          className="family-browse__viewport"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={active.familyKey}
              className="family-browse__card"
              style={{ '--family-accent': active.colore || '#94a3b8' }}
              initial={reduceMotion ? false : { opacity: 0, rotateY: direction * 26, x: direction * 36 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, rotateY: -direction * 26, x: -direction * 36 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="family-browse__card-head">
                <h3 className="family-browse__name">{active.content?.nome || active.familyName}</h3>
                {active.presencePercent != null ? (
                  <span className="family-browse__percent">{active.presencePercent}%</span>
                ) : null}
              </header>
              {active.isQuasiParitaria ? (
                <p className="family-browse__qualifier">quasi paritaria</p>
              ) : null}

              <p className="family-browse__brief">{briefFor(active)}</p>

              <CalculationDisclosure
                label={COMPOSIZIONE_UI.scopriDiPiu}
                className="family-browse__detail"
              >
                {PANEL_FIELDS.map(({ key, heading }) => (
                  Array.isArray(active.content?.[key]) && active.content[key].length ? (
                    <div key={key} className="family-browse__detail-block">
                      <h4 className="family-browse__detail-heading">{heading}</h4>
                      {active.content[key].map((paragraph) => (
                        <p key={paragraph.slice(0, 40)} className="family-browse__detail-paragraph">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null
                ))}
              </CalculationDisclosure>
            </motion.article>
          </AnimatePresence>
        </div>

        <button
          type="button"
          className="family-browse__nav family-browse__nav--next"
          onClick={goNext}
          disabled={index === total - 1}
          aria-label="Famiglia successiva"
        >
          ›
        </button>
      </div>

      {total > 1 ? (
        <div className="family-browse__dots" role="tablist" aria-label="Famiglie">
          {families.map((family, i) => (
            <button
              key={family.familyKey}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={family.content?.nome || family.familyName}
              className={`family-browse__dot${i === index ? ' family-browse__dot--active' : ''}`}
              style={{ '--dot-accent': family.colore || '#94a3b8' }}
              onClick={() => goTo(i, i > index ? 1 : -1)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
