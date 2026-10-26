import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import MusiciansCompassNav from './MusiciansCompassNav.jsx'
import ReportChaptersIndex from './ReportChaptersIndex.jsx'
import { ReportChapterTopBar, ReportChapterBottomNav } from './ReportChapterBar.jsx'
import PersonalSonicProfile from './PersonalSonicProfile.jsx'
import DistanzeInterattive from './DistanzeInterattive.jsx'
import SuoniDelTuoTest from './SuoniDelTuoTest.jsx'
import ApprofondimentoSezioni from './ApprofondimentoSezioni.jsx'
import { MUSICISTI_INTRO, MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import { getMusicianRooms, MUSICIAN_INDEX_UI } from '../../config/musiciansConfig.js'
import CapitoloLibro from './musicisti/CapitoloLibro.jsx'
import '../../styles/sezione-musica.css'

// La vista vive dentro un layer fixed che scorre da sé: scroll e scrollspy passano da lì.
const findScroller = (node) => node?.closest?.('.report-tst-musicians-layer') || null

export default function ForMusiciansView({
  profilo = {},
  approfondimento = {},
  filtroMusicale = {},
  accentColor = '#4ade80',
  colorTotals = {},
  correntiByPeso = [],
  correnti = {},
  rawRecord = {},
  onClose,
  backButtonRef,
}) {
  const MUSICIAN_ROOMS = useMemo(() => getMusicianRooms(profilo?.famiglia || ''), [profilo?.famiglia])
  const [viewMode, setViewMode] = useState('capitoli')
  const [activeChapterId, setActiveChapterId] = useState(null)
  const [activeRoom, setActiveRoom] = useState('fm-impronta')
  const viewContainerRef = useRef(null)

  const scheda = MUSICISTI_SCHEDE[profilo?.famiglia || '']
  const introMusicale = scheda?.introMusicale || MUSICISTI_INTRO

  const isChapters = viewMode === 'capitoli'
  const chapterIndex = MUSICIAN_ROOMS.findIndex((room) => room.id === activeChapterId)
  const currentChapter = chapterIndex >= 0 ? MUSICIAN_ROOMS[chapterIndex] : null
  const prevChapter = chapterIndex > 0 ? MUSICIAN_ROOMS[chapterIndex - 1] : null
  const nextChapter = chapterIndex >= 0 ? MUSICIAN_ROOMS[chapterIndex + 1] || null : null

  const scrollToTop = useCallback(() => {
    const scroller = findScroller(viewContainerRef.current)
    if (scroller) scroller.scrollTo({ top: 0 })
    else window.scrollTo({ top: 0 })
  }, [])

  const selectChapter = useCallback((chapterId) => {
    setActiveChapterId(chapterId)
    scrollToTop()
  }, [scrollToTop])

  const switchMode = useCallback((mode) => {
    setViewMode(mode)
    setActiveChapterId(null)
    scrollToTop()
  }, [scrollToTop])

  const handleClose = useCallback(() => {
    setActiveChapterId(null)
    onClose?.()
  }, [onClose])

  // ScrollSpy della barra a tab, solo nella vista continua
  useEffect(() => {
    if (viewMode !== 'continuo') return undefined
    const scroller = findScroller(viewContainerRef.current)
    const target = scroller || window
    const handleScroll = () => {
      const originTop = scroller ? scroller.getBoundingClientRect().top : 0
      let current = MUSICIAN_ROOMS[0].id
      MUSICIAN_ROOMS.forEach((room) => {
        const el = document.getElementById(room.id)
        if (el && el.getBoundingClientRect().top - originTop <= 180) current = room.id
      })
      setActiveRoom(current)
    }
    target.addEventListener('scroll', handleScroll, { passive: true })
    return () => target.removeEventListener('scroll', handleScroll)
  }, [viewMode, MUSICIAN_ROOMS])

  const handleSelectRoom = (roomId) => {
    setActiveRoom(roomId)
    document.getElementById(roomId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const chapterContent = {
    // 1. Il tuo test nel codice musicale: impronta e aree musicali insieme.
    'fm-impronta': (
      <>
        <PersonalSonicProfile
          profilo={profilo}
          colorTotals={colorTotals}
          correntiByPeso={correntiByPeso}
          correnti={correnti}
          accentColor={accentColor}
          introMusicale={introMusicale}
        />
        <section id="fm-aree" className="fm-section fm-sound-areas" aria-labelledby="fm-sound-areas-title">
          <div className="fm-sound-areas__head">
            <h2 id="fm-sound-areas-title">Aree musicali e percentuali</h2>
            <p className="fm-section-lead">
              Come le tue risposte si sono distribuite lungo i cinque parametri dell'esperienza sonora:
              Timbro, Intervalli, Ritmo, Melodia e Accordi.
            </p>
          </div>
          <ApprofondimentoSezioni
            sezioniData={approfondimento?.sezioniData}
            sezioniTest={approfondimento?.sezioniTest}
            filtroMusicale={filtroMusicale}
            correnteColore={accentColor}
            plainLanguage={false}
          />
        </section>
      </>
    ),
    'fm-distanze': (
      <DistanzeInterattive profilo={profilo} accentColor={accentColor} colorTotals={colorTotals} />
    ),
    'fm-passi': <SuoniDelTuoTest rawRecord={rawRecord} accentColor={accentColor} />,
  }

  const isVisible = (roomId) => !isChapters || activeChapterId === roomId

  return (
    <div ref={viewContainerRef} className="for-musicians-view" style={{ '--music-accent': accentColor }}>
      {!isChapters && (
        <MusiciansCompassNav
          rooms={MUSICIAN_ROOMS}
          activeRoom={activeRoom}
          onSelectRoom={handleSelectRoom}
          onClose={onClose ? handleClose : undefined}
          backButtonRef={backButtonRef}
          accentColor={accentColor}
        />
      )}

      {isChapters && !currentChapter && (
        <>
          {onClose && (
            <div className="for-musicians-view__index-back">
              <button ref={backButtonRef} type="button" className="for-musicians-view__back-btn" onClick={handleClose}>
                {MUSICIAN_INDEX_UI.backToReport}
              </button>
            </div>
          )}
          <ReportChaptersIndex
            chapters={MUSICIAN_ROOMS}
            onSelectChapter={selectChapter}
            onSwitchToContinuous={() => switchMode('continuo')}
            accentColor={accentColor}
            eyebrow={null}
            title={MUSICIAN_INDEX_UI.title}
            lead={MUSICIAN_INDEX_UI.lead}
          />
        </>
      )}

      {isChapters && currentChapter && (
        <ReportChapterTopBar
          currentIndex={chapterIndex}
          totalChapters={MUSICIAN_ROOMS.length}
          currentTitle={currentChapter.title}
          onBackToIndex={() => selectChapter(null)}
          onPrevChapter={() => prevChapter && selectChapter(prevChapter.id)}
          onNextChapter={() => nextChapter && selectChapter(nextChapter.id)}
          onSwitchToContinuous={() => switchMode('continuo')}
          accentColor={accentColor}
        />
      )}

      {!isChapters && (
        <div className="report-continuous-mode-banner" style={{ '--chap-accent': accentColor }}>
          <span>{MUSICIAN_INDEX_UI.continuousBanner}</span>
          <button type="button" className="report-continuous-mode-btn" onClick={() => switchMode('capitoli')}>
            {MUSICIAN_INDEX_UI.backToChapters}
          </button>
        </div>
      )}

      <div className="for-musicians-view__content">
        {MUSICIAN_ROOMS.map((room) => (
          <div key={room.id} className="for-musicians-view__chapter" hidden={!isVisible(room.id)}>
            {chapterContent[room.id] || <CapitoloLibro capitolo={room} />}
          </div>
        ))}

        {isChapters && currentChapter && (
          <ReportChapterBottomNav
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            onSelectChapter={selectChapter}
            onBackToIndex={() => selectChapter(null)}
            accentColor={accentColor}
          />
        )}

        {!isChapters && onClose && (
          <div className="for-musicians-view__footer-nav">
            <button
              type="button"
              className="for-musicians-view__back-btn for-musicians-view__back-btn--bottom"
              onClick={handleClose}
            >
              {MUSICIAN_INDEX_UI.backToReport}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
