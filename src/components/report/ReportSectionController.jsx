import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { REPORT_GROUPS, REPORT_SECTIONS, SECTION_TO_GROUP } from './reportSectionsConfig'
import { REPORT_NAV_UI } from './reportUiCopy.js'
import { getStickyOffsetPx, scrollToReportSection } from './reportSectionNavUtils'

/**
 * Controller sezioni report: sidebar desktop con sottogruppi accordion +
 * pannello mobile/tablet sempre visibile. Scroll-spy con IntersectionObserver.
 */
export default function ReportSectionController({
  accentColor = '#4ade80',
  sections = REPORT_SECTIONS,
  groups = REPORT_GROUPS,
  groupOpen = {},
  onToggleGroup,
  onEnsureGroupOpen,
  onNavigate,
}) {
  const reduceMotion = useReducedMotion()
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const scrollLockRef = useRef(false)
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
    const groupId = SECTION_TO_GROUP[activeId]
    if (groupId) onEnsureGroupOpen?.(groupId)
  }, [activeId, onEnsureGroupOpen])

  useEffect(() => {
    const ids = sections.map((s) => s.id)
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
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
  }, [sections])

  useEffect(() => {
    const btn = activeMobileBtnRef.current
    if (!btn || !mobileListRef.current) return
    btn.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [activeId, reduceMotion])

  const handleSectionClick = useCallback(
    (id) => {
      scrollLockRef.current = true
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
    'aria-label': 'Indice del report',
    style: { '--section-nav-accent': accentColor },
  }

  const renderSectionLink = (section, variant) => {
    const isActive = activeId === section.id
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
          aria-current={isActive ? 'true' : undefined}
          onClick={() => handleSectionClick(section.id)}
        >
          {section.label}
        </button>
      </li>
    )
  }

  const renderGroup = (group, variant) => {
    const childSections = sectionsByGroup.get(group.id) || []
    if (childSections.length === 0) return null
    const isExpanded = Boolean(groupOpen[group.id])
    const groupActive = childSections.some((s) => s.id === activeId)
    const panelId = `report-nav-group-${variant}-${group.id}`

    return (
      <li
        key={`${variant}-group-${group.id}`}
        className={`report-section-controller__group report-section-controller__group--${variant}${isExpanded ? ' report-section-controller__group--open' : ''}${groupActive ? ' report-section-controller__group--active' : ''}`}
      >
        <button
          type="button"
          className={`report-section-controller__group-trigger report-section-controller__group-trigger--${variant}`}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={() => onToggleGroup?.(group.id)}
        >
          <span className="report-section-controller__group-title">{group.title}</span>
          <span className="report-section-controller__group-chevron" aria-hidden="true" />
        </button>
        <ul
          id={panelId}
          className={`report-section-controller__group-sections report-section-controller__group-sections--${variant}`}
          hidden={!isExpanded}
        >
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
          {groups.map((group) => renderGroup(group, 'mobile'))}
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
          {groups.map((group) => renderGroup(group, 'rail'))}
        </ul>
      </nav>
    </>
  )
}
