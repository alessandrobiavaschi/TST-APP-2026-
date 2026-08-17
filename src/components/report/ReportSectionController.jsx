import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  getReportNavGroups,
} from './reportSectionsConfig'
import { REPORT_NAV_UI } from './reportUiCopy.js'
import { getStickyOffsetPx, scrollToReportSection } from './reportSectionNavUtils'
import { PROFILO_CHAPTER_EVENT } from './profiloChapterNav'

/**
 * Menu laterale del report: indice piatto delle sezioni principali.
 * Scroll-spy con IntersectionObserver; il click scrolla alla sezione.
 */
export default function ReportSectionController({
  profilo = {},
  musicista = {},
  sections: sectionsProp,
  onNavigate,
}) {
  const reduceMotion = useReducedMotion()
  const sections = useMemo(
    () =>
      sectionsProp ||
      getReportNavGroups(profilo, { musicista }),
    [sectionsProp, profilo, musicista],
  )
  const navSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        label: section.title || section.label,
      })),
    [sections],
  )
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const [railOpen, setRailOpen] = useState(false)
  const resolvedActiveId = useMemo(() => {
    let targetId = activeId
    if (targetId && targetId.startsWith('report-chapter-')) {
      targetId = 'report-group-profilo-generale'
    }
    return sections.some((s) => s.id === targetId)
      ? targetId
      : sections[0]?.id ?? ''
  }, [activeId, sections])
  const scrollLockRef = useRef(false)
  const userNavigatedRef = useRef(false)
  const mobileListRef = useRef(null)
  const activeMobileBtnRef = useRef(null)
  const activeRailBtnRef = useRef(null)
  const railToggleRef = useRef(null)

  useEffect(() => {
    if (!railOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setRailOpen(false)
        railToggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [railOpen])

  useEffect(() => {
    const onChapterNav = () => {
      setActiveId('report-group-profilo-generale')
    }
    window.addEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
    return () => window.removeEventListener(PROFILO_CHAPTER_EVENT, onChapterNav)
  }, [])

  useEffect(() => {
    const ids = sections.map((s) => s.id)
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (elements.length === 0) return undefined

    const ratios = new Map(ids.map((id) => [id, 0]))
    let observer = null

    const pickActive = () => {
      if (scrollLockRef.current) return
      const offset = getStickyOffsetPx()
      let bestId = ids[0]
      let bestRatio = -1
      for (const [id, ratio] of ratios) {
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = id
        }
      }
      if (bestRatio <= 0) {
        const scrollY = window.scrollY + offset + 8
        for (let i = elements.length - 1; i >= 0; i -= 1) {
          const el = elements[i]
          if (el.offsetTop <= scrollY) {
            bestId = el.id
            break
          }
        }
      }
      if (bestId && bestId.startsWith('report-chapter-')) {
        bestId = `report-chapter-${window.__tstActiveProfiloChapter || 'natura'}`
      }
      setActiveId((prev) => (prev === bestId ? prev : bestId))
    }

    const bindObserver = () => {
      if (observer) observer.disconnect()
      const offset = getStickyOffsetPx()
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
          })
          pickActive()
        },
        {
          rootMargin: `-${offset}px 0px -45% 0px`,
          threshold: [0, 0.05, 0.15, 0.35, 0.55, 0.75, 1],
        },
      )
      elements.forEach((el) => observer.observe(el))
    }

    bindObserver()
    let scrollRafId = null
    const onScroll = () => {
      if (scrollRafId) return
      scrollRafId = requestAnimationFrame(() => {
        pickActive()
        scrollRafId = null
      })
    }
    const onResize = () => bindObserver()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    pickActive()

    return () => {
      observer?.disconnect()
      if (scrollRafId) cancelAnimationFrame(scrollRafId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [sections])

  useEffect(() => {
    if (!userNavigatedRef.current) return undefined
    userNavigatedRef.current = false
    const btn = activeMobileBtnRef.current
    if (!btn || !mobileListRef.current) return undefined
    btn.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
    return undefined
  }, [resolvedActiveId, reduceMotion])

  const handleSectionClick = useCallback(
    (id) => {
      scrollLockRef.current = true
      userNavigatedRef.current = true
      setActiveId(id)
      setRailOpen(false)
      if (onNavigate) {
        onNavigate(id, {
          onScrollComplete: () => {
            scrollLockRef.current = false
          },
        })
      } else {
        scrollToReportSection(id, {
          reduceMotion,
          onLockChange: (locked) => {
            scrollLockRef.current = locked
          },
        })
      }
    },
    [onNavigate, reduceMotion],
  )

  const navProps = {
    'aria-label': REPORT_NAV_UI.ariaLabel,
  }

  const renderSectionLink = (section, variant) => {
    const isActive = resolvedActiveId === section.id
    const activeRef = variant === 'rail' ? activeRailBtnRef : activeMobileBtnRef
    return (
      <li
        key={`${variant}-${section.id}`}
        className={`report-section-controller__section-li report-section-controller__section-li--${variant}`}
      >
        <button
          type="button"
          ref={isActive ? activeRef : null}
          className={`report-section-controller__section report-section-controller__section--${variant}`}
          data-active={isActive ? 'true' : 'false'}
          aria-current={isActive ? 'location' : undefined}
          onClick={() => handleSectionClick(section.id)}
        >
          <span className="report-section-controller__section-copy">
            <span className="report-section-controller__section-label">{section.label}</span>
            {section.navHint ? (
              <span className="report-section-controller__section-hint">{section.navHint}</span>
            ) : null}
          </span>
        </button>
      </li>
    )
  }

  return (
    <>
      <nav
        className="report-section-controller report-section-controller--mobile"
        data-visible="true"
        {...navProps}
      >
        <div ref={mobileListRef} className="report-section-controller__mobile-scroll-container">
          <ul className="report-section-controller__mobile-steps">
            {navSections.map((section) => renderSectionLink(section, 'mobile'))}
          </ul>
        </div>
      </nav>

      <button
        type="button"
        ref={railToggleRef}
        className="report-section-controller__toggle"
        data-open={railOpen ? 'true' : 'false'}
        aria-label={railOpen ? 'Chiudi il percorso di lettura' : 'Apri il percorso di lettura'}
        aria-expanded={railOpen}
        aria-controls="report-section-controller-rail"
        tabIndex={railOpen ? -1 : 0}
        onClick={() => setRailOpen((prev) => !prev)}
      >
        <span aria-hidden="true">☰</span>
      </button>

      <div
        className="report-section-controller__backdrop"
        data-open={railOpen ? 'true' : 'false'}
        onClick={() => setRailOpen(false)}
        aria-hidden="true"
      />

      <nav
        id="report-section-controller-rail"
        className="report-section-controller report-section-controller--rail"
        data-visible="true"
        data-open={railOpen ? 'true' : 'false'}
        {...navProps}
      >
        <div className="report-section-controller__index-head report-section-controller__index-head--rail">
          <p className="report-section-controller__rail-label">{REPORT_NAV_UI.indexTitle}</p>
          <button
            type="button"
            className="report-section-controller__rail-close"
            aria-label="Chiudi il percorso di lettura"
            onClick={() => {
              setRailOpen(false)
              railToggleRef.current?.focus()
            }}
          >
            ×
          </button>
        </div>
        <ul className="report-section-controller__rail-list">
          {navSections.map((section) => renderSectionLink(section, 'rail'))}
        </ul>
      </nav>
    </>
  )
}
