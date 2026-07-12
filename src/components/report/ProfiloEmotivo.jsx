import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getProfiloPanelDisplay } from '../../utils/profiloDisplayCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import { PROFILO_CHAPTER_EVENT, chapterAnchorId } from './profiloChapterNav.js'
import { scrollToReportSection } from './reportSectionNavUtils.js'
import { getPersonalizedTitles } from '../../config/reportFamilyTheme.js'
import { PROFILO_UI } from './reportUiCopy.js'

void motion

const PANEL_ORDER = ['natura', 'racconto', 'risorse', 'ombre']
const CHAPTER_NAV_LABELS = {
  natura: 'Natura',
  racconto: 'Memoria, Esperienza, Essere Musica',
  risorse: 'Risorse',
  ombre: 'Ombre',
}
const HEADER_COLOR_FALLBACK = '#4ade80'

function PanelBody({ display }) {
  const skipHeader = /^FAMIGLIA\s+\d+/i

  return (
    <div className="profilo-panel__body">
      {display.hook ? (
        <p className="profilo-panel__lead">{display.hook}</p>
      ) : null}

      {display.blocks.map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={`ul-${i}`} className="profilo-panel__list">
              {block.items.map((item) => (
                <li key={item.slice(0, 32)} className="profilo-panel__list-item">
                  {item}
                </li>
              ))}
            </ul>
          )
        }
        if (skipHeader.test(block.text)) return null
        return (
          <p key={`p-${i}`} className="profilo-panel__paragraph">
            {block.text}
          </p>
        )
      })}
    </div>
  )
}

function ChapterBlock({ sezione, index, famiglia, profilo, reduceMotion, title }) {
  const accent = sezione.correnteColore || '#4ade80'
  const display = getProfiloPanelDisplay({
    panelId: sezione.id,
    famiglia,
    rawTesto: sezione.testo,
    profilo,
  })
  const subtitle =
    sezione.id === 'natura' && (profilo?.natura || sezione.label)
      ? (profilo?.natura || sezione.label).replace(/\s*·\s*/g, ' · ')
      : null

  return (
    <article
      className="profilo-chapter-block"
      data-panel={sezione.id}
      style={{ '--profilo-accent': accent }}
    >
      <header className="profilo-chapter-block__head">
        <span className="profilo-chapter-block__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <h3 className="profilo-panel__title">{title || sezione.titolo}</h3>
          {sezione.sottotitolo ? (
            <p className="profilo-chapter-block__preview">{sezione.sottotitolo}</p>
          ) : null}
        </div>
      </header>

      <motion.div
        className="profilo-chapter-block__panel"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
      >
        {subtitle ? (
          <p className="profilo-panel__subtitle" style={{ color: accent }}>
            {subtitle}
          </p>
        ) : null}
        {display.panelIntro ? (
          <p className="profilo-panel__connector">{display.panelIntro}</p>
        ) : null}
        <PanelBody display={display} />
      </motion.div>
    </article>
  )
}

export default function ProfiloEmotivo({
  sezioni = [],
  famiglia = '',
  accentColor = '',
  profilo = {},
  stepPrefix = '1',
}) {
  const reduceMotion = useReducedMotion()
  const [activeChapter, setActiveChapter] = useState('natura')
  const [isExpanded, setIsExpanded] = useState(false)
  const personalizedTitles = useMemo(() => getPersonalizedTitles(famiglia), [famiglia])

  const ordered = PANEL_ORDER.map((id) => sezioni.find((s) => s && s.id === id)).filter(Boolean)
  const list = ordered.length > 0 ? ordered : sezioni.filter(Boolean)
  const activeSezione = useMemo(
    () => list.find((s) => s.id === activeChapter) || list[0],
    [list, activeChapter],
  )
  const activeIndex = Math.max(0, list.findIndex((s) => s.id === activeSezione?.id))

  const headerColor = list[0]?.correnteColore || accentColor || HEADER_COLOR_FALLBACK

  const selectChapter = useCallback(
    (panelId, shouldScroll = false, isExternalEvent = false) => {
      if (!PANEL_ORDER.includes(panelId)) return
      setActiveChapter(panelId)

      // Update global helper variable for scrollspy override
      window.__tstActiveProfiloChapter = panelId

      // Dispatch the event so other components (like the sidebar) sync their active state immediately
      if (!isExternalEvent) {
        window.dispatchEvent(
          new CustomEvent(PROFILO_CHAPTER_EVENT, {
            detail: panelId,
          }),
        )
      }

      if (!shouldScroll) return
      window.requestAnimationFrame(() => {
        scrollToReportSection('report-tst-famiglia', {
          reduceMotion,
        })
      })
    },
    [reduceMotion, setActiveChapter],
  )

  const scrollToChapter = useCallback(
    (panelId) => {
      selectChapter(panelId, true, false)
    },
    [selectChapter],
  )

  const activateChapter = useCallback(
    (panelId) => {
      selectChapter(panelId, false, true)
    },
    [selectChapter],
  )

  useEffect(() => {
    if (!activeSezione?.id && list[0]?.id) {
      setActiveChapter(list[0].id)
      window.__tstActiveProfiloChapter = list[0].id
    }
  }, [activeSezione, list])

  useEffect(() => {
    // Set global helper on mount/activeChapter changes
    window.__tstActiveProfiloChapter = activeChapter
  }, [activeChapter])

  useEffect(() => {
    const onChapterNav = (event) => {
      activateChapter(event.detail)
    }
    window.addEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
    return () => window.removeEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
  }, [activateChapter])

  return (
    <section aria-labelledby="pe-section-title" className="report-tst-profilo">
      <div className="pe-container">
        <ReportPassageHeader
          step={`${stepPrefix}.3`}
          eyebrow={PROFILO_UI.eyebrow}
          title={PROFILO_UI.title}
          lead={PROFILO_UI.subtitle}
          accentColor={headerColor}
          titleId="pe-section-title"
        />

        {/* Card di sintesi della famiglia emotiva con Approfondisci */}
        <div className="profilo-family-summary-card" style={{ maxWidth: '860px', margin: '0 auto 2.5rem', width: '100%', boxSizing: 'border-box' }}>
          <h4 className="profilo-family-summary-card__title" style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            color: headerColor
          }}>
            Famiglia {profilo.famiglia} ({profilo.disposizione})
          </h4>
          <p className="profilo-family-summary-card__brief" style={{
            fontSize: '1.05rem',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '1rem'
          }}>
            {profilo.fraseChiave}
          </p>

          {isExpanded && (
            <div
              id="family-extended-description"
              className="profilo-family-summary-card__extended"
              role="region"
              style={{
                marginTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '1rem'
              }}
            >
              {profilo.descrizioneEstesa ? (
                profilo.descrizioneEstesa.split('\n').map((para, i) => (
                  <p key={i} className="profilo-family-summary-card__para" style={{
                    fontSize: '1.00rem',
                    lineHeight: '1.6',
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginBottom: '0.75rem',
                    textAlign: 'left'
                  }}>
                    {para}
                  </p>
                ))
              ) : (
                <p className="profilo-family-summary-card__para" style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic',
                  textAlign: 'left'
                }}>
                  Approfondimento non ancora disponibile per questa famiglia emotiva.
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <button
              type="button"
              className="profilo-family-summary-card__btn"
              aria-expanded={isExpanded}
              aria-controls="family-extended-description"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.5rem 1.25rem',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.borderColor = headerColor
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {isExpanded ? 'Riduci' : 'Approfondisci'}
            </button>
          </div>
        </div>

        <nav className="profilo-chapter-nav" aria-label="Capitoli del profilo emotivo">
          {list.map((sezione, index) => {
            const isActive = activeChapter === sezione.id
            return (
              <button
                key={`nav-${sezione.id}`}
                type="button"
                className={`profilo-chapter-nav__btn${isActive ? ' profilo-chapter-nav__btn--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollToChapter(sezione.id)}
              >
                <span className="profilo-chapter-nav__num">{index + 1}</span>
                <span className="profilo-chapter-nav__label">
                  {personalizedTitles[sezione.id] || CHAPTER_NAV_LABELS[sezione.id] || sezione.titolo}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="profilo-chapter-anchors" aria-hidden="true">
          {list.map((sezione) => (
            <span
              key={`anchor-${sezione.id}`}
              id={chapterAnchorId(sezione.id)}
              className="report-tst-section-anchor"
            />
          ))}
        </div>

        <div className="profilo-chapter-list profilo-chapter-list--tabs">
          {activeSezione ? (
            <ChapterBlock
              key={activeSezione.id}
              sezione={activeSezione}
              index={activeIndex}
              famiglia={famiglia}
              profilo={profilo}
              reduceMotion={reduceMotion}
              title={personalizedTitles[activeSezione.id]}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
