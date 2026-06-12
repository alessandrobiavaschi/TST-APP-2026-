import React, { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getProfiloPanelDisplay } from '../../utils/profiloDisplayCopy.js'
import { buildProfiloThreadLine } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { PROFILO_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
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

function ChapterBlock({ sezione, index, famiglia, profilo, reduceMotion }) {
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
      id={chapterAnchorId(sezione.id)}
      className="profilo-chapter-block report-tst-section-anchor"
      data-panel={sezione.id}
      style={{ '--profilo-accent': accent }}
    >
      <header className="profilo-chapter-block__head">
        <span className="profilo-chapter-block__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <p className="profilo-panel__capitolo">{sezione.capitolo}</p>
          <h3 className="profilo-panel__title">{sezione.titolo}</h3>
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
  integrationsSlot = null,
}) {
  const reduceMotion = useReducedMotion()
  const [activeChapter, setActiveChapter] = useState('natura')

  const ordered = PANEL_ORDER.map((id) => sezioni.find((s) => s && s.id === id)).filter(Boolean)
  const list = ordered.length > 0 ? ordered : sezioni.filter(Boolean)

  const headerColor = list[0]?.correnteColore || accentColor || HEADER_COLOR_FALLBACK
  const threadLine = buildProfiloThreadLine({
    profilo,
    domTheme: FAMILY_THEME[famiglia] || null,
    famiglia,
  })

  const scrollToChapter = useCallback(
    (panelId) => {
      if (!PANEL_ORDER.includes(panelId)) return
      setActiveChapter(panelId)
      const el = document.getElementById(chapterAnchorId(panelId))
      if (!el) return
      el.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
    },
    [reduceMotion, setActiveChapter],
  )

  useEffect(() => {
    const onChapterNav = (event) => {
      scrollToChapter(event.detail)
    }
    window.addEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
    return () => window.removeEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
  }, [scrollToChapter])

  useEffect(() => {
    const ids = list.map((s) => chapterAnchorId(s.id))
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) {
          const panelId = visible[0].target.id.replace('report-chapter-', '')
          setActiveChapter(panelId)
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.2, 0.5] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [list])

  return (
    <section aria-labelledby="pe-section-title" className="report-tst-profilo">
      <div className="pe-container">
        <ReportPassageHeader
          step="2"
          eyebrow={PROFILO_UI.eyebrow}
          title={PROFILO_UI.title}
          lead={PROFILO_UI.subtitle}
          accentColor={headerColor}
          titleId="pe-section-title"
        />
        {threadLine ? (
          <p className="profilo-section-header__thread">{threadLine}</p>
        ) : null}
        <p className="profilo-section-header__nav-hint">{PROFILO_UI.chapterNavHint}</p>

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
                  {CHAPTER_NAV_LABELS[sezione.id] || sezione.titolo}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="profilo-chapter-list">
          {list.map((sezione, index) => (
            <React.Fragment key={sezione.id || index}>
              <ChapterBlock
                sezione={sezione}
                index={index}
                famiglia={famiglia}
                profilo={profilo}
                reduceMotion={reduceMotion}
              />
              {sezione.id === 'ombre' && integrationsSlot ? (
                <div id="report-tst-mappa" className="report-tst-section-anchor profilo-integrations-slot">
                  {integrationsSlot}
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
