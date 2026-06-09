import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { REPORT_TST_SECTIONS } from './reportSectionsConfig'
import { getStickyOffsetPx, scrollToReportSection } from './reportSectionNavUtils'

export { REPORT_TST_SECTIONS }

/**
 * Sub-nav orizzontale sticky sotto NavbarTST: scroll alle sezioni + scroll-spy.
 * @deprecated Preferire ReportSectionController nel ReportShell.
 */
export default function ReportSectionNav({
  heroRef,
  forceVisible = false,
  accentColor = '#4ade80',
  sections = REPORT_TST_SECTIONS,
}) {
  const reduceMotion = useReducedMotion()
  const [heroInView, setHeroInView] = useState(true)
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const scrollLockRef = useRef(false)
  const listRef = useRef(null)
  const activeBtnRef = useRef(null)

  useEffect(() => {
    if (forceVisible) return undefined
    const el = heroRef?.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      const raf = window.requestAnimationFrame(() => setHeroInView(false))
      return () => window.cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.5] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [heroRef, forceVisible])

  const chromeVisible = forceVisible || !heroInView

  useEffect(() => {
    if (!chromeVisible) return undefined
    const ids = sections.map((s) => s.id)
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
    if (elements.length === 0) return undefined

    const offset = getStickyOffsetPx()
    const ratios = new Map(ids.map((id) => [id, 0]))

    const pickActive = () => {
      if (scrollLockRef.current) return
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
      setActiveId((prev) => (prev === bestId ? prev : bestId))
    }

    const observer = new IntersectionObserver(
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
    const onScroll = () => pickActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    pickActive()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [chromeVisible, sections])

  useEffect(() => {
    if (!chromeVisible || !activeBtnRef.current || !listRef.current) return
    activeBtnRef.current.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [activeId, chromeVisible, reduceMotion])

  const scrollToSection = useCallback(
    (id) => {
      scrollLockRef.current = true
      setActiveId(id)
      scrollToReportSection(id, {
        reduceMotion,
        onLockChange: (locked) => {
          scrollLockRef.current = locked
        },
      })
    },
    [reduceMotion],
  )

  if (!chromeVisible) return null

  return (
    <nav
      className="report-section-nav"
      aria-label="Sezioni del report"
      data-visible="true"
      style={{ '--section-nav-accent': accentColor }}
    >
      <ul ref={listRef} className="report-section-nav__scroll">
        {sections.map((section) => {
          const isActive = activeId === section.id
          return (
            <li key={section.id} className="report-section-nav__li">
              <button
                type="button"
                ref={isActive ? activeBtnRef : null}
                className="report-section-nav__item"
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
