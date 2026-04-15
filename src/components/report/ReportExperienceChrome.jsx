import React, { useEffect, useMemo, useState } from 'react'

/**
 * Menu allineato ai titoli reali del report. Sottosezioni = id degli h3 in EmotionalProfileCards.
 */
const NAV_TREE = [
  {
    id: 'report-sintesi',
    label: 'SINTESI',
    num: '01',
    mobileShort: 'Sintesi',
  },
  {
    id: 'report-profilo',
    label: 'Il tuo profilo emotivo',
    num: '02',
    mobileShort: 'Profilo',
    children: [
      { id: 'report-chapter-natura', label: 'La tua Natura', mobileShort: 'Natura' },
      { id: 'report-chapter-racconto', label: 'Il tuo Racconto', mobileShort: 'Racconto' },
      { id: 'report-chapter-risorse', label: 'Le tue Risorse', mobileShort: 'Risorse' },
      { id: 'report-chapter-ombre', label: 'Le tue Ombre', mobileShort: 'Ombre' },
    ],
  },
  {
    id: 'report-operatori',
    label: 'Approfondimento sulle singole sezioni',
    num: '03',
    mobileShort: 'Approfondimento',
  },
  {
    id: 'report-rapporti',
    label: 'I quattro rapporti',
    num: '04',
    mobileShort: 'Rapporti',
  },
  {
    id: 'report-lessico',
    label: 'Parole',
    num: '05',
    mobileShort: 'Parole',
  },
]

/** Ordine nel documento per scroll-spy (include sezioni non in menu) */
const SPY_ORDER = [
  'report-sintesi',
  'report-profilo',
  'report-chapter-natura',
  'report-chapter-racconto',
  'report-chapter-risorse',
  'report-chapter-ombre',
  'report-operatori',
  'report-natura-base',
  'report-rapporti',
  'report-lessico',
  'report-dati',
  'report-guida',
]

function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function isParentActive(item, activeId) {
  if (!item.children?.length) return false
  return item.children.some((c) => c.id === activeId)
}

export default function ReportExperienceChrome({ children }) {
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState(NAV_TREE[0].id)

  const mobilePills = useMemo(() => {
    const pills = []
    for (const item of NAV_TREE) {
      pills.push({
        id: item.id,
        short: item.mobileShort,
      })
      item.children?.forEach((c) => {
        pills.push({ id: c.id, short: c.mobileShort })
      })
    }
    return pills
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0)

      const present = SPY_ORDER.map((id) => ({ id, el: document.getElementById(id) })).filter((x) => x.el)
      if (!present.length) return
      const marker = window.scrollY + window.innerHeight * 0.22
      let current = present[0].id
      for (const { id, el } of present) {
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= marker) current = id
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <div className="report-xp-progress" aria-hidden="true">
        <div className="report-xp-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="report-xp-grid">
        <aside className="report-xp-dock" aria-label="Navigazione sezioni report">
          <p className="report-xp-dock-title">Percorso</p>
          <nav className="report-xp-dock-nav">
            {NAV_TREE.map((item) => (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  className={`report-xp-dock-link report-xp-dock-link--top ${activeId === item.id ? 'report-xp-dock-link--active' : ''} ${isParentActive(item, activeId) ? 'report-xp-dock-link--branch-open' : ''}`}
                  onClick={() => scrollToId(item.id)}
                  aria-current={activeId === item.id ? 'location' : undefined}
                >
                  <span className="report-xp-dock-num">{item.num}</span>
                  <span className="report-xp-dock-label-text">{item.label}</span>
                </button>
                {item.children?.map((child) => (
                  <button
                    key={child.id}
                    type="button"
                    className={`report-xp-dock-link report-xp-dock-link--sub ${activeId === child.id ? 'report-xp-dock-link--active' : ''}`}
                    onClick={() => scrollToId(child.id)}
                    aria-current={activeId === child.id ? 'location' : undefined}
                  >
                    <span className="report-xp-dock-sub-mark" aria-hidden="true">
                      ›
                    </span>
                    <span className="report-xp-dock-label-text">{child.label}</span>
                  </button>
                ))}
              </React.Fragment>
            ))}
          </nav>
          <button
            type="button"
            className="report-xp-dock-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Torna su
          </button>
        </aside>

        <div className="report-xp-main">{children}</div>
      </div>

      <div className="report-xp-mobile-bar" role="navigation" aria-label="Sezioni rapide">
        <div className="report-xp-mobile-scroll">
          {mobilePills.map(({ id, short }) => (
            <button
              key={id}
              type="button"
              className={`report-xp-mobile-pill ${activeId === id ? 'report-xp-mobile-pill--active' : ''}`}
              onClick={() => scrollToId(id)}
            >
              {short}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
