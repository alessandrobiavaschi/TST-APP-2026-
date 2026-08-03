import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import SectionNumber from './SectionNumber.jsx'
import { scrollElementToReportCenter } from './reportSectionNavUtils.js'
import '../../styles/quattro-rapporti.css'

const FALLBACK_COLOR = '#94a3b8'

const RELATIONSHIP_ROWS = [
  ['Flemmatica + Malinconica', 'Modulazione', 'Calma e interiorità si accompagnano, senza essere in opposizione.'],
  ['Flemmatica + Marziale', 'Tensione', 'La pausa e la moderazione incontrano la spinta ad agire.'],
  ['Flemmatica + Entusiasta', 'Tensione', 'La quiete incontra il movimento e l’eccitazione.'],
  ['Marziale + Entusiasta', 'Affinità dinamica', 'Volontà e slancio si sostengono a vicenda.'],
  ['Marziale + Malinconica', 'Compensazione', 'Azione e riflessione si bilanciano.'],
  ['Razionale + Marziale / Entusiasta', 'Tensione', 'Distanza osservativa e slancio si confrontano.'],
  ['Razionale + Malinconica / Flemmatica', 'Attenuazione', 'La distanza razionale rende più misurata l’intensità emotiva.'],
]

function RapportiHelpModal({ onClose }) {
  const [page, setPage] = useState(1)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="quattro-rapporti-help" role="presentation" onMouseDown={onClose}>
      <section
        className="quattro-rapporti-help__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quattro-rapporti-help-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="quattro-rapporti-help__close"
          aria-label="Chiudi la guida ai quattro rapporti"
          onClick={onClose}
        >
          ×
        </button>
        <p className="quattro-rapporti-help__eyebrow">Guida semplice</p>
        <h2 id="quattro-rapporti-help-title">
          {page === 1 ? 'Come si formano i quattro rapporti' : 'Come le famiglie cambiano la lettura'}
        </h2>

        {page === 1 ? (
          <div className="quattro-rapporti-help__page">
            <p>
              Ogni rapporto somma soltanto alcune parti del test. Per ciascuna delle cinque famiglie
              emotive confrontiamo quei punteggi: la famiglia che incide di più orienta la lettura.
            </p>
            <div className="quattro-rapporti-help__formula-list">
              <div><strong>Natura di base</strong><span>Timbro + Intervalli + Armonia</span></div>
              <div><strong>Rapporto con te stesso</strong><span>Intervalli + Melodia</span></div>
              <div><strong>Rapporto con l’Altro</strong><span>Timbro + Melodia</span></div>
              <div><strong>Rapporto con l’Agire</strong><span>Ritmo + Melodia</span></div>
            </div>
            <p className="quattro-rapporti-help__note">
              Non è un voto: è un modo per capire quale componente del tuo profilo è più rilevante in quella situazione.
            </p>
          </div>
        ) : (
          <div className="quattro-rapporti-help__page">
            <p>
              Ogni lente usa una componente principale e la mette in relazione con la tua natura di base:
              Malinconica per il rapporto con te stesso, Entusiasta per l’Altro, Marziale per l’Agire.
            </p>
            <div className="quattro-rapporti-help__relationship-list">
              {RELATIONSHIP_ROWS.map(([pair, type, copy]) => (
                <div key={pair}>
                  <strong>{pair}</strong>
                  <span>{type}</span>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="quattro-rapporti-help__footer">
          <span>Pagina {page} di 2</span>
          <button type="button" onClick={() => setPage((current) => current === 1 ? 2 : 1)}>
            {page === 1 ? 'Vedi le relazioni tra famiglie' : 'Torna ai calcoli'}
          </button>
        </footer>
      </section>
    </div>
  )
}

export default function QuattroRapporti({ rapporti = [] }) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const rapportiMainRef = useRef(null)
  const shouldCenterRapportoRef = useRef(false)

  const activeIndex = rapporti.length > 0
    ? Math.min(Math.max(selectedIndex, 0), rapporti.length - 1)
    : 0
  const active = rapporti[activeIndex] || null
  const activeColor = active?.correntePrincipale?.colore || FALLBACK_COLOR
  const fadeDuration = reduceMotion ? 0 : 0.15

  useEffect(() => {
    if (!isHelpOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isHelpOpen])

  const selectRapporto = (index) => {
    shouldCenterRapportoRef.current = true
    if (index === selectedIndex) {
      window.requestAnimationFrame(() => {
        shouldCenterRapportoRef.current = false
        scrollElementToReportCenter(rapportiMainRef.current, { reduceMotion, placement: 'start' })
      })
    }
    setSelectedIndex(index)
  }

  useEffect(() => {
    if (!shouldCenterRapportoRef.current) return undefined
    shouldCenterRapportoRef.current = false
    const raf = window.requestAnimationFrame(() => {
      scrollElementToReportCenter(rapportiMainRef.current, { reduceMotion, placement: 'start' })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [selectedIndex, reduceMotion])

  return (
    <section
      aria-label="I quattro rapporti"
      className="quattro-rapporti-section"
      style={{ '--qr-accent': activeColor }}
    >
      <div className="quattro-rapporti-section__inner">
        <div className="quattro-rapporti-heading-row">
          <h2>I quattro rapporti</h2>
          <button
            type="button"
            className="quattro-rapporti-help-trigger"
            aria-label="Apri la guida su come vengono calcolati i quattro rapporti"
            onClick={() => setIsHelpOpen(true)}
          >
            ?
          </button>
        </div>

        <div role="tablist" aria-label={RAPPORTI_UI.tablistAria} className="quattro-rapporti-tabs">
          {rapporti.map((r, i) => {
            const selected = i === activeIndex
            const color = r?.correntePrincipale?.colore || FALLBACK_COLOR
            const lensCopy = RAPPORTI_UI.lensCards?.find((item) => item.id === r?.id)
            return (
              <button
                key={r?.id ?? i}
                type="button"
                role="tab"
                id={`quattro-rapporti-tab-${r?.id ?? i}`}
                aria-selected={selected}
                aria-controls={`quattro-rapporti-panel-${r?.id ?? i}`}
                tabIndex={selected ? 0 : -1}
                className={`quattro-rapporti-tab${selected ? ' quattro-rapporti-tab--selected' : ''}`}
                style={{ '--qr-tab-color': color }}
                onClick={() => selectRapporto(i)}
              >
                <SectionNumber value={i + 1} size="sm" className="quattro-rapporti-tab__index" />
                <span className="quattro-rapporti-tab__name">{r?.nome}</span>
                <span className="quattro-rapporti-tab__meaning">{lensCopy?.plain}</span>
                <span className="quattro-rapporti-tab__dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div ref={rapportiMainRef} className="quattro-rapporti-main quattro-rapporti-main--reading-only">
          <div
            className="quattro-rapporti-read"
            role="tabpanel"
            id={active ? `quattro-rapporti-panel-${active.id}` : undefined}
            aria-labelledby={active ? `quattro-rapporti-tab-${active.id}` : undefined}
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id ?? activeIndex}
                  className="quattro-rapporti-read__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fadeDuration }}
                >
                  <h3 className="quattro-rapporti-read__title">
                    <SectionNumber value={activeIndex + 1} size="sm" className="quattro-rapporti-read__index-prefix" />
                    {active.nome}
                  </h3>
                  {active.sottotitolo ? <p className="quattro-rapporti-read__question">{active.sottotitolo}</p> : null}
                  {active.levelLabel ? <p className="quattro-rapporti-read__level-label">{active.levelLabel}</p> : null}
                  <div className="quattro-rapporti-read__block">
                    {Array.isArray(active.sintesiBreveParagrafi) && active.sintesiBreveParagrafi.length
                      ? active.sintesiBreveParagrafi.map((paragraph, index) => (
                        <p key={`${active.id}-summary-${index}`} className={`quattro-rapporti-read__text${index === 0 ? ' quattro-rapporti-read__text--lead' : ''}`}>
                          {paragraph}
                        </p>
                      ))
                      : <p className="quattro-rapporti-read__text">{active.definizione}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isHelpOpen ? <RapportiHelpModal onClose={() => setIsHelpOpen(false)} /> : null}
    </section>
  )
}
