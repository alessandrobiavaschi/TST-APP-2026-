import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FioreVisivo } from '../../pages/ResultsPage'
import reportContent from '../../content_report.json'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'

const DISPOSITION_LABELS = {
  blu: 'Blu',
  rosso: 'Rosso',
  giallo: 'Giallo',
  verde: 'Verde',
  grigio: 'Grigio',
}

const MOBILE_MQ = '(max-width: 768px)'

/** Dal testo di guida del report (stesso linguaggio del percorso utente). */
const REPORT_OUTLINE = [
  'In alto vedi la famiglia emotiva prevalente e il suo significato.',
  'La mappa sulle cinque disposizioni mostra come si distribuiscono le tue risposte.',
  'Più sotto trovi come le famiglie si distribuiscono tra natura, sé, altro e azione.',
  'Alla fine un lessico di stati d’animo per dare parole precise a come ti senti.',
]

function firstParagraphAfterHeadline(descrizioneEstesa) {
  if (!descrizioneEstesa || typeof descrizioneEstesa !== 'string') return ''
  const lines = descrizioneEstesa.split('\n').filter(Boolean)
  if (lines.length < 2) return ''
  return lines.slice(1).join('\n').split(/\n\s*\n/)[0].trim()
}

function firstSentence(text, maxLen = 200) {
  if (!text) return ''
  const m = text.match(/^[^.!?]+[.!?]/)
  const s = m ? m[0] : text
  if (s.length <= maxLen) return s
  return `${text.slice(0, maxLen - 1).trim()}…`
}

const PREVIEW_LEVELS_BY_COLOR = {
  Blu: { blu: 6, rosso: 3, giallo: 4, verde: 6, grigio: 2 },
  Rosso: { blu: 3, rosso: 7, giallo: 5, verde: 2, grigio: 4 },
  Grigio: { blu: 4, rosso: 2, giallo: 3, verde: 3, grigio: 7 },
}

const PREVIEW_ACCENTS = {
  Blu: '#38bdf8',
  Rosso: '#fb7185',
  Grigio: '#a78bfa',
}

const RADAR_PROFILES = ['Blu', 'Rosso', 'Grigio'].map((colorKey) => {
  const block = reportContent[colorKey]
  const para = firstParagraphAfterHeadline(block?.descrizione_estesa)
  const lead = firstSentence(para, 220)
  const caratteri = block?.restituzione_caratteri?.trim()
  const subtitle = caratteri ? `${caratteri}. ${lead}` : lead
  return {
    id: colorKey.toLowerCase(),
    colorKey,
    title: block?.restituzione_natura || colorKey,
    subtitle: subtitle || block?.restituzione_caratteri_estesi || '',
    accent: PREVIEW_ACCENTS[colorKey],
    levels: PREVIEW_LEVELS_BY_COLOR[colorKey],
  }
})

function buildTotals(levels) {
  return Object.fromEntries(Object.entries(levels).map(([key, level]) => [key, level * 12]))
}

function methodologyAsideFor(colorKey) {
  const para = firstParagraphAfterHeadline(reportContent[colorKey]?.descrizione_estesa)
  return firstSentence(para, 240)
}

function dominantHintFor(levels) {
  const top = Object.entries(levels)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
  const names = top.map(([key]) => DISPOSITION_LABELS[key])
  return names.join(' e ')
}

function strongestFor(levels) {
  return Object.entries(levels)
    .sort(([, levelA], [, levelB]) => levelB - levelA)
    .slice(0, 2)
    .map(([key, level]) => `${DISPOSITION_LABELS[key]} ${level}/7`)
    .join(' · ')
}

function ProfileSlideAside({ profile, chartHeight }) {
  const totals = buildTotals(profile.levels)
  const methodologyAside = methodologyAsideFor(profile.colorKey)
  const dominantHint = dominantHintFor(profile.levels)
  const strongestDispositions = strongestFor(profile.levels)

  return (
    <div className="landing-preview-mobile-slide-inner">
      <div className="landing-preview-visual landing-preview-visual--report-radar">
        <div className="landing-preview-report-radar">
          <FioreVisivo
            levels={profile.levels}
            totals={totals}
            chartHeight={chartHeight}
            dispositionAccentColor={profile.accent}
            showLegend={false}
          />
        </div>
      </div>
      <div className="landing-preview-mini-copy landing-preview-mini-copy--mobile" aria-label="Estratto dalla restituzione">
        <p className="landing-preview-mini-quote">{methodologyAside}</p>
        <p className="landing-preview-mini-kicker">
          Nell’esempio qui accanto sono in evidenza <strong>{dominantHint}</strong> (solo dimostrativo).
        </p>
        <p className="landing-preview-mini-strong">{strongestDispositions}</p>
      </div>
    </div>
  )
}

export default function LandingPreviewShowcase({ onStart, onTrack, chartHeight = 210 }) {
  const [activeProfileIndex, setActiveProfileIndex] = useState(0)
  const mobileScrollRef = useRef(null)
  const isMobile = useMediaQuery(MOBILE_MQ, false)

  const activeProfile = RADAR_PROFILES[activeProfileIndex] || RADAR_PROFILES[0]
  const totals = useMemo(() => buildTotals(activeProfile.levels), [activeProfile.levels])

  useEffect(() => {
    if (onTrack) onTrack('landing_preview_profile_open', { profile: activeProfile.id })
  }, [activeProfile.id, onTrack])

  useEffect(() => {
    if (isMobile) return undefined
    const timer = window.setInterval(() => {
      setActiveProfileIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % RADAR_PROFILES.length
        const nextProfile = RADAR_PROFILES[nextIndex]
        if (onTrack) onTrack('landing_preview_profile_rotate', { profile: nextProfile.id })
        return nextIndex
      })
    }, 3400)
    return () => window.clearInterval(timer)
  }, [onTrack, isMobile])

  const strongestDispositions = useMemo(() => {
    return Object.entries(activeProfile.levels)
      .sort(([, levelA], [, levelB]) => levelB - levelA)
      .slice(0, 2)
      .map(([key, level]) => `${DISPOSITION_LABELS[key]} ${level}/7`)
  }, [activeProfile.levels])

  const dominantHint = useMemo(() => {
    const top = Object.entries(activeProfile.levels).sort(([, a], [, b]) => b - a).slice(0, 2)
    const names = top.map(([key]) => DISPOSITION_LABELS[key])
    return names.join(' e ')
  }, [activeProfile.levels])

  const methodologyAside = useMemo(() => {
    const key = activeProfile.colorKey
    const para = firstParagraphAfterHeadline(reportContent[key]?.descrizione_estesa)
    return firstSentence(para, 240)
  }, [activeProfile.colorKey])

  const syncIndexFromScroll = useCallback(() => {
    const root = mobileScrollRef.current
    if (!root) return
    const track = root.querySelector('.landing-preview-mobile-track')
    const slide = track?.querySelector('.landing-preview-mobile-slide')
    if (!slide || !track) return
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0
    const step = slide.offsetWidth + gap
    if (step <= 0) return
    const idx = Math.max(0, Math.min(RADAR_PROFILES.length - 1, Math.round(root.scrollLeft / step)))
    setActiveProfileIndex((prev) => (prev === idx ? prev : idx))
  }, [])

  useEffect(() => {
    if (!isMobile) return undefined
    const root = mobileScrollRef.current
    if (!root) return undefined
    const onScroll = () => syncIndexFromScroll()
    root.addEventListener('scroll', onScroll, { passive: true })
    syncIndexFromScroll()
    return () => root.removeEventListener('scroll', onScroll)
  }, [isMobile, syncIndexFromScroll])

  return (
    <div className="landing-preview-shell landing-preview-shell--mini">
      <header className="landing-preview-header">
        <p className="landing-preview-eyebrow">Restituzione (testo metodo TST)</p>
        <h2 className="landing-preview-title">{activeProfile.title}</h2>
        <p className="landing-preview-subtitle">{activeProfile.subtitle}</p>
      </header>

      <ul className="landing-preview-report-outline" aria-label="Come è strutturato il report">
        {REPORT_OUTLINE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div
        className="landing-preview-mobile-carousel landing-preview-mobile-only"
        ref={mobileScrollRef}
        role="region"
        aria-label="Anteprima profili: scorri orizzontalmente"
      >
        <div className="landing-preview-mobile-track">
          {RADAR_PROFILES.map((profile) => (
            <div key={profile.id} className="landing-preview-mobile-slide" data-profile-id={profile.id}>
              <ProfileSlideAside profile={profile} chartHeight={chartHeight} />
            </div>
          ))}
        </div>
      </div>

      <div
        className="landing-preview-mobile-progress landing-preview-mobile-only"
        aria-hidden="true"
      >
        {RADAR_PROFILES.map((profile, index) => (
          <span
            key={profile.id}
            className={`landing-preview-mobile-progress-dot${index === activeProfileIndex ? ' is-active' : ''}`}
            style={{ '--preview-accent': profile.accent }}
          />
        ))}
      </div>

      <div className="landing-preview-desktop-mini-body" role="region" aria-label="Anteprima radar dinamica del report">
        <div className="landing-preview-visual landing-preview-visual--report-radar">
          <div className="landing-preview-report-radar">
            <FioreVisivo
              levels={activeProfile.levels}
              totals={totals}
              chartHeight={chartHeight}
              dispositionAccentColor={activeProfile.accent}
              showLegend={false}
            />
          </div>
        </div>

        <aside className="landing-preview-mini-copy" aria-label="Estratto dalla restituzione e livelli di esempio">
          <p className="landing-preview-mini-quote">{methodologyAside}</p>
          <p className="landing-preview-mini-kicker">
            Nell’esempio qui accanto sono in evidenza <strong>{dominantHint}</strong> (solo dimostrativo).
          </p>
          <p className="landing-preview-mini-strong">{strongestDispositions.join(' · ')}</p>
          <div className="landing-preview-mini-dots" role="tablist" aria-label="Profili della mini preview">
            {RADAR_PROFILES.map((profile, index) => {
              const isActive = index === activeProfileIndex
              return (
                <button
                  key={profile.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Mostra profilo ${index + 1}`}
                  className={`landing-preview-mini-dot${isActive ? ' landing-preview-mini-dot--active' : ''}`}
                  style={{ '--preview-accent': profile.accent }}
                  onClick={() => {
                    setActiveProfileIndex(index)
                    if (onTrack) onTrack('landing_preview_profile_select', { profile: profile.id })
                  }}
                />
              )
            })}
          </div>
        </aside>
      </div>

      <footer className="landing-preview-actions">
        <button type="button" className="landing-preview-action landing-preview-action--primary" onClick={onStart}>
          Avvia il test
        </button>
      </footer>
    </div>
  )
}
