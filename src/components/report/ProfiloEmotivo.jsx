import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getProfiloPanelDisplay } from '../../utils/profiloDisplayCopy.js'
import SectionNumber from './SectionNumber.jsx'
import { PROFILO_CHAPTER_EVENT, chapterAnchorId } from './profiloChapterNav.js'
import { scrollElementToReportCenter } from './reportSectionNavUtils.js'
import { getPersonalizedTitles } from '../../config/reportFamilyTheme.js'
import { PROFILO_UI } from './reportUiCopy.js'
import { buildProgressiveContentViewModel } from '../../utils/buildProgressiveContentViewModel.js'

void motion

const PANEL_ORDER = ['natura', 'racconto', 'risorse', 'ombre']
const CHAPTER_NAV_LABELS = {
  natura: 'Natura',
  racconto: 'Memoria, Esperienza, Essere Musica',
  risorse: 'Risorse',
  ombre: 'Ombre',
}

const MOBILE_CHAPTER_NAV_LABELS = {
  natura: 'Natura',
  racconto: 'Racconto',
  risorse: 'Risorse',
  ombre: 'Ombre',
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

function ChapterComposition({ onOpenAllFamilies, entryBtnRef }) {
  return (
    <div className="profilo-composition-extra">
      <p className="report-room-preview-lead">{PROFILO_UI.compositionIntro}</p>
      <button
        ref={entryBtnRef}
        type="button"
        className="report-room-preview-cta"
        onClick={onOpenAllFamilies}
      >
        {PROFILO_UI.compositionCta}
      </button>
    </div>
  )
}

function ChapterBlock({ sezione, index, famiglia, profilo, reduceMotion, title, composition }) {
  const accent = sezione.correnteColore || '#4ade80'
  const display = getProfiloPanelDisplay({
    panelId: sezione.id,
    famiglia,
    rawTesto: sezione.testo,
    profilo,
  })
  const showComposition = sezione.id === 'natura' && composition?.visible
  return (
    <article
      className="profilo-chapter-block"
      data-panel={sezione.id}
      style={{ '--profilo-accent': accent }}
    >
      <header className="profilo-chapter-block__head">
        <SectionNumber value={index + 1} size="sm" className="profilo-chapter-block__index" />
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
        {display.panelIntro ? (
          <p className="profilo-panel__connector">{display.panelIntro}</p>
        ) : null}
        <PanelBody display={display} />
        {showComposition ? (
          <ChapterComposition
            onOpenAllFamilies={composition.onOpenAllFamilies}
            entryBtnRef={composition.entryBtnRef}
          />
        ) : null}
      </motion.div>
    </article>
  )
}

export default function ProfiloEmotivo({
  sezioni = [],
  famiglia = '',
  profilo = {},
  contentCards = null,
  globalRanking = null,
  dominantFamilyKey = '',
  onOpenAllFamilies = () => {},
  allFamiliesEntryBtnRef = null,
}) {
  const reduceMotion = useReducedMotion()
  // La famiglia dominante è già raccontata per intero nei 4 capitoli sopra: esclusa qui
  // per non mostrare due volte la stessa scheda.
  const compositionViewModel = useMemo(
    () => buildProgressiveContentViewModel({
      ranking: globalRanking,
      contentCards: contentCards || {},
      excludeFamilyKeys: dominantFamilyKey ? [dominantFamilyKey] : [],
    }),
    [globalRanking, contentCards, dominantFamilyKey],
  )
  const hasExtraPrimary = compositionViewModel.primaryFamilies.length > 0
  const hasFullComposition = compositionViewModel.theoreticalFamilies.length > 0
    || compositionViewModel.marginalFamilies.length > 0
  const [activeChapter, setActiveChapter] = useState('natura')
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    setIsMobileViewport(media.matches)
    const listener = (e) => setIsMobileViewport(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])
  const chapterContentRef = useRef(null)
  const shouldCenterChapterRef = useRef(false)
  const personalizedTitles = useMemo(() => getPersonalizedTitles(famiglia), [famiglia])

  const ordered = PANEL_ORDER.map((id) => sezioni.find((s) => s && s.id === id)).filter(Boolean)
  const list = ordered.length > 0 ? ordered : sezioni.filter(Boolean)
  const activeSezione = useMemo(
    () => list.find((s) => s.id === activeChapter) || list[0],
    [list, activeChapter],
  )
  const activeIndex = Math.max(0, list.findIndex((s) => s.id === activeSezione?.id))

  const selectChapter = useCallback(
    (panelId, shouldScroll = false, isExternalEvent = false) => {
      if (!PANEL_ORDER.includes(panelId)) return
      const isAlreadyActive = panelId === activeChapter
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
      shouldCenterChapterRef.current = true
      if (isAlreadyActive) {
        window.requestAnimationFrame(() => {
          shouldCenterChapterRef.current = false
          const target = chapterContentRef.current?.querySelector('.profilo-chapter-block__head')
            || chapterContentRef.current
          scrollElementToReportCenter(target, { reduceMotion })
        })
      }
    },
    [activeChapter, reduceMotion],
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

    if (!shouldCenterChapterRef.current) return undefined
    shouldCenterChapterRef.current = false
    const raf = window.requestAnimationFrame(() => {
      const target = chapterContentRef.current?.querySelector('.profilo-chapter-block__head')
        || chapterContentRef.current
      scrollElementToReportCenter(target, { reduceMotion })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [activeChapter, reduceMotion])

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
        <p className="report-room-preview-lead">{PROFILO_UI.title}</p>

        {/* Sintesi breve; l'approfondimento e distribuito nei quattro capitoli. */}
        {profilo.fraseChiave ? (
          <div className="profilo-family-summary-card" style={{ maxWidth: '860px', margin: '0 auto 2.5rem', width: '100%', boxSizing: 'border-box' }}>
            <p className="profilo-family-summary-card__brief" style={{
              fontSize: '1.05rem',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '1rem'
            }}>
              {profilo.composizioneSintesi || profilo.fraseChiave}
            </p>
            {profilo.composizioneSintesi ? (
              <p className="profilo-family-summary-card__brief" style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.76)',
                margin: 0,
              }}>
                La descrizione della famiglia prevalente qui sotto è una base di lettura; non annulla le altre componenti significative.
              </p>
            ) : null}
          </div>
        ) : null}

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
                  {isMobileViewport
                    ? (MOBILE_CHAPTER_NAV_LABELS[sezione.id] || CHAPTER_NAV_LABELS[sezione.id] || sezione.titolo)
                    : (personalizedTitles[sezione.id] || CHAPTER_NAV_LABELS[sezione.id] || sezione.titolo)}
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

        <div ref={chapterContentRef} className="profilo-chapter-list profilo-chapter-list--tabs">
          {activeSezione ? (
            <ChapterBlock
              key={activeSezione.id}
              sezione={activeSezione}
              index={activeIndex}
              famiglia={famiglia}
              profilo={profilo}
              reduceMotion={reduceMotion}
              title={personalizedTitles[activeSezione.id]}
              composition={{
                visible: hasExtraPrimary || compositionViewModel.hasCompanion || hasFullComposition,
                onOpenAllFamilies,
                entryBtnRef: allFamiliesEntryBtnRef,
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
