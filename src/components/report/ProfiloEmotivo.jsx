import React, { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getProfiloPanelDisplay } from '../../utils/profiloDisplayCopy.js'
import { buildProfiloThreadLine } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { PROFILO_UI } from './reportUiCopy.js'
import { PROFILO_CHAPTER_EVENT, chapterAnchorId } from './profiloChapterNav.js'

void motion

const PANEL_ORDER = ['natura', 'racconto', 'risorse', 'ombre']
const CHAPTER_NAV_LABELS = {
  natura: 'Natura',
  racconto: 'Racconto',
  risorse: 'Risorse',
  ombre: 'Ombre',
}
const HEADER_COLOR_FALLBACK = '#4ade80'
const TEXT_MAX_WIDTH = '720px'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`profilo-chapter-card__chevron${open ? ' profilo-chapter-card__chevron--open' : ''}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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

function ChapterCard({
  sezione,
  index,
  isOpen,
  onToggle,
  famiglia,
  profilo,
  reduceMotion,
}) {
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

  const textVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <section
      id={chapterAnchorId(sezione.id)}
      className={`profilo-chapter-card${isOpen ? ' profilo-chapter-card--open' : ''}`}
      data-panel={sezione.id}
      style={{ '--profilo-accent': accent }}
    >
      <button
        type="button"
        className="profilo-chapter-card__trigger"
        aria-expanded={isOpen}
        aria-controls={`${chapterAnchorId(sezione.id)}-panel`}
        onClick={onToggle}
      >
        <span className="profilo-chapter-card__index" aria-hidden="true">
          {index + 1}
        </span>
        <div className="profilo-chapter-card__head">
          <p className="profilo-panel__capitolo">{sezione.capitolo}</p>
          <h3 className="profilo-panel__title">{sezione.titolo}</h3>
          {sezione.sottotitolo && !isOpen ? (
            <p className="profilo-chapter-card__preview">{sezione.sottotitolo}</p>
          ) : null}
        </div>
        <span className="profilo-chapter-card__state">
          <span className="profilo-chapter-card__state-label">
            {isOpen ? 'Chiudi' : 'Apri'}
          </span>
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen ? (
        <motion.article
          id={`${chapterAnchorId(sezione.id)}-panel`}
          className="profilo-chapter-card__panel"
          variants={textVariants}
          initial="hidden"
          animate="visible"
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
        </motion.article>
      ) : null}
    </section>
  )
}

export default function ProfiloEmotivo({
  sezioni = [],
  famiglia = '',
  accentColor = '',
  profilo = {},
}) {
  const reduceMotion = useReducedMotion()
  const [openPanel, setOpenPanel] = useState('natura')

  const ordered = PANEL_ORDER.map((id) => sezioni.find((s) => s && s.id === id)).filter(Boolean)
  const list = ordered.length > 0 ? ordered : sezioni.filter(Boolean)

  const headerColor = list[0]?.correnteColore || accentColor || HEADER_COLOR_FALLBACK
  const threadLine = buildProfiloThreadLine({
    profilo,
    domTheme: FAMILY_THEME[famiglia] || null,
    famiglia,
  })

  const openChapter = useCallback(
    (panelId, { scroll = false } = {}) => {
      if (!PANEL_ORDER.includes(panelId)) return
      setOpenPanel(panelId)
      if (!scroll) return
      const el = document.getElementById(chapterAnchorId(panelId))
      if (!el) return
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [reduceMotion],
  )

  useEffect(() => {
    const onChapterNav = (event) => {
      const panelId = event.detail
      openChapter(panelId, { scroll: false })
    }
    window.addEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
    return () => window.removeEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
  }, [openChapter])

  return (
    <section
      aria-labelledby="pe-section-title"
      className="report-tst-profilo"
      style={{
        backgroundColor: '#0f172a',
        paddingTop: '120px',
        paddingBottom: '120px',
        width: '100%',
      }}
    >
      <style>{`
        .pe-container { max-width: 1200px; margin: 0 auto; padding-left: 24px; padding-right: 24px; }
      `}</style>

      <div className="pe-container">
        <header className="profilo-section-header">
          <p className="profilo-section-header__eyebrow" style={{ color: headerColor }}>
            {PROFILO_UI.eyebrow}
          </p>
          <h2 id="pe-section-title" className="report-tst-display profilo-section-header__title">
            {PROFILO_UI.title}
          </h2>
          <p className="profilo-section-header__subtitle">{PROFILO_UI.subtitle}</p>
          {threadLine ? (
            <p className="profilo-section-header__thread">{threadLine}</p>
          ) : null}
        </header>

        <nav
          className="profilo-chapter-nav"
          aria-label="Capitoli del profilo emotivo"
          style={{ maxWidth: TEXT_MAX_WIDTH, width: '100%', margin: '0 auto 24px' }}
        >
          {list.map((sezione, index) => {
            const isActive = openPanel === sezione.id
            return (
              <button
                key={`nav-${sezione.id}`}
                type="button"
                className={`profilo-chapter-nav__btn${isActive ? ' profilo-chapter-nav__btn--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => openChapter(sezione.id, { scroll: true })}
              >
                <span className="profilo-chapter-nav__num">{index + 1}</span>
                <span className="profilo-chapter-nav__label">
                  {CHAPTER_NAV_LABELS[sezione.id] || sezione.titolo}
                </span>
              </button>
            )
          })}
        </nav>

        <div
          className="profilo-chapter-list"
          style={{ maxWidth: TEXT_MAX_WIDTH, width: '100%', margin: '0 auto' }}
        >
          {list.map((sezione, index) => (
            <ChapterCard
              key={sezione.id || index}
              sezione={sezione}
              index={index}
              isOpen={openPanel === sezione.id}
              onToggle={() =>
                setOpenPanel((current) => (current === sezione.id ? '' : sezione.id))
              }
              famiglia={famiglia}
              profilo={profilo}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
