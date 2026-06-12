import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { REPORT_GROUPS, SECTION_TO_GROUP, getVisibleReportSections } from './reportSectionsConfig'
import { REPORT_NAV_UI } from './reportUiCopy.js'
import { getStickyOffsetPx, scrollToReportSection } from './reportSectionNavUtils'

/**
 * Menu laterale del report: cinque passi sempre visibili + sotto-voci per sezione.
 * Scroll-spy con IntersectionObserver; il click apre il blocco contenuto e scrolla.
 */
export default function ReportSectionController({
  accentColor = '#4ade80',
  profilo = {},
  filtroMusicale = {},
  sections: sectionsProp,
  groups = REPORT_GROUPS,
  onEnsureGroupOpen,
  onNavigate,
}) {
  const reduceMotion = useReducedMotion()
  const sections = useMemo(
    () =>
      sectionsProp ||
      getVisibleReportSections(profilo, {
        filtroMusicaleHasData: Boolean(filtroMusicale?.hasData),
      }),
    [sectionsProp, profilo, filtroMusicale],
  )
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const resolvedActiveId = sections.some((s) => s.id === activeId)
    ? activeId
    : sections[0]?.id ?? ''
  const scrollLockRef = useRef(false)
  const userNavigatedRef = useRef(false)
  const mobileListRef = useRef(null)
  const activeMobileBtnRef = useRef(null)
  const activeRailBtnRef = useRef(null)

  const sectionsByGroup = useMemo(() => {
    const map = new Map(groups.map((g) => [g.id, []]))
    sections.forEach((section) => {
      const list = map.get(section.groupId)
      if (list) list.push(section)
    })
    return map
  }, [groups, sections])

  useEffect(() => {
    const groupId = SECTION_TO_GROUP[resolvedActiveId]
    if (groupId) onEnsureGroupOpen?.(groupId)
  }, [resolvedActiveId, onEnsureGroupOpen])

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
    const onScroll = () => pickActive()
    const onResize = () => bindObserver()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    pickActive()

    return () => {
      observer?.disconnect()
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
      if (onNavigate) {
        onNavigate(id, {
          reduceMotion,
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
    style: { '--section-nav-accent': accentColor },
  }

  const renderSectionLink = (section, variant) => {
    const isActive = resolvedActiveId === section.id
    const activeRef = variant === 'rail' ? activeRailBtnRef : activeMobileBtnRef
    return (
      <li
        key={`${variant}-${section.id}`}
        className={`report-section-controller__section-li report-section-controller__section-li--${variant}${section.isSub ? ' report-section-controller__section-li--sub' : ''}`}
      >
        <button
          type="button"
          ref={isActive ? activeRef : null}
          className={`report-section-controller__section report-section-controller__section--${variant}${section.isSub ? ' report-section-controller__section--sub' : ''}`}
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

  const renderStep = (group, variant) => {
    const childSections = sectionsByGroup.get(group.id) || []
    if (childSections.length === 0) return null
    const stepActive = childSections.some((s) => s.id === resolvedActiveId)
    const sectionsClass = `report-section-controller__step-sections report-section-controller__step-sections--${variant}`

    return (
      <li
        key={`${variant}-step-${group.id}`}
        className={`report-section-controller__step report-section-controller__step--${variant}${stepActive ? ' report-section-controller__step--active' : ''}`}
      >
        <div className="report-section-controller__step-head">
          <span className="report-section-controller__step-num" aria-hidden="true">
            {group.stepLabel}
          </span>
          <div className="report-section-controller__step-copy">
            <p className="report-section-controller__step-title">{group.title}</p>
            {group.subtitle ? (
              <span className="report-section-controller__step-subtitle">{group.subtitle}</span>
            ) : null}
          </div>
        </div>
        <ul className={sectionsClass}>
          {childSections.map((section) => renderSectionLink(section, variant))}
        </ul>
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
        <div className="report-section-controller__index-head">
          <p className="report-section-controller__mobile-label">{REPORT_NAV_UI.indexTitle}</p>
          <p className="report-section-controller__index-hint">{REPORT_NAV_UI.indexHint}</p>
        </div>
        <ul ref={mobileListRef} className="report-section-controller__mobile-list">
          {groups.map((group) => renderStep(group, 'mobile'))}
        </ul>
      </nav>

      <nav
        className="report-section-controller report-section-controller--rail"
        data-visible="true"
        {...navProps}
      >
        <div className="report-section-controller__index-head report-section-controller__index-head--rail">
          <p className="report-section-controller__rail-label">{REPORT_NAV_UI.indexTitle}</p>
          <p className="report-section-controller__index-hint">{REPORT_NAV_UI.indexHint}</p>
        </div>
        <ul className="report-section-controller__rail-list">
          {groups.map((group) => renderStep(group, 'rail'))}
        </ul>
      </nav>
    </>
  )
}
