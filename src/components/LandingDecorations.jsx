import React from 'react'

export function LandingDecorations() {
  return (
    <div className="landing-decorations" aria-hidden="true">
      {/* Luna grande lato sinistro */}
      <svg className="landing-deco-moon-icon" viewBox="0 0 80 80" fill="none">
        <circle cx="32" cy="32" r="15" fill="#FDF7EB" opacity="0.96" />
        <path
          d="M38 18 A15 15 0 1 0 42 46 A11 11 0 1 1 38 18 Z"
          fill="#F1E4CF"
          opacity="0.9"
        />
      </svg>
      {/* Sole grande lato destro */}
      <svg className="landing-deco-sun-icon" viewBox="0 0 80 80" fill="none">
        <circle cx="46" cy="30" r="15" fill="#F9E0B8" opacity="0.95" />
        <circle cx="46" cy="30" r="22" stroke="#F9E0B8" strokeWidth="1.3" opacity="0.4" />
      </svg>

      {/* Colline a linee, distribuite verso l'esterno (sinistra/destra) */}
      <svg className="landing-deco-hills landing-deco-hills--left" viewBox="0 0 320 120" fill="none">
        <g stroke="#90AF93" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
          <path d="M0 92 Q60 66 120 78 T220 76 T320 90" />
          <path d="M0 100 Q70 74 140 86 T230 84 T320 96" />
        </g>
        <g stroke="currentColor" strokeLinecap="round">
          <path d="M40 92 L40 68" strokeWidth="1" opacity="0.5" />
          <path d="M36 80 L44 74" strokeWidth="0.95" opacity="0.48" />

          <path d="M76 94 L76 66" strokeWidth="1" opacity="0.5" />
          <path d="M72 78 L82 72" strokeWidth="0.95" opacity="0.48" />
        </g>
      </svg>
      <svg className="landing-deco-hills landing-deco-hills--right" viewBox="0 0 320 120" fill="none">
        <g stroke="#90AF93" strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
          <path d="M0 92 Q60 66 120 78 T220 76 T320 90" />
          <path d="M0 100 Q70 74 140 86 T230 84 T320 96" />
        </g>
        <g stroke="currentColor" strokeLinecap="round">
          <path d="M208 94 L208 66" strokeWidth="1" opacity="0.48" />
          <path d="M204 78 L214 72" strokeWidth="0.95" opacity="0.46" />

          <path d="M244 92 L244 66" strokeWidth="1" opacity="0.46" />
          <path d="M240 78 L250 72" strokeWidth="0.95" opacity="0.44" />
        </g>
      </svg>
      <svg className="landing-deco-branch landing-deco-branch--left" viewBox="0 0 80 140" fill="none">
        {/* stelo sottile verticale */}
        <path d="M18 130 L26 18" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.22" />
        {/* tante righe sottili verso destra */}
        <path d="M20 120 L40 112" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.28" />
        <path d="M20 112 L40 104" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.26" />
        <path d="M20 104 L40 96" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.25" />
        <path d="M20 96 L40 88" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.24" />
        <path d="M20 88 L40 80" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.23" />
        <path d="M20 80 L40 72" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.22" />
        <path d="M20 72 L40 64" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.21" />
        <path d="M20 64 L40 56" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.2" />
        <path d="M20 56 L40 48" stroke="currentColor" strokeWidth="0.45" strokeLinecap="round" opacity="0.18" />
        <path d="M20 48 L36 42" stroke="currentColor" strokeWidth="0.45" strokeLinecap="round" opacity="0.17" />
        <path d="M20 40 L34 36" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" opacity="0.16" />
        <path d="M20 32 L32 30" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" opacity="0.15" />
      </svg>
      <svg className="landing-deco-branch landing-deco-branch--right" viewBox="0 0 80 140" fill="none">
        <path d="M62 130 L54 18" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.22" />
        {/* tante righe sottili verso sinistra */}
        <path d="M60 120 L40 112" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.28" />
        <path d="M60 112 L40 104" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.26" />
        <path d="M60 104 L40 96" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.25" />
        <path d="M60 96 L40 88" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" opacity="0.24" />
        <path d="M60 88 L40 80" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.23" />
        <path d="M60 80 L40 72" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.22" />
        <path d="M60 72 L40 64" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.21" />
        <path d="M60 64 L40 56" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.2" />
        <path d="M60 56 L40 48" stroke="currentColor" strokeWidth="0.45" strokeLinecap="round" opacity="0.18" />
        <path d="M60 48 L44 42" stroke="currentColor" strokeWidth="0.45" strokeLinecap="round" opacity="0.17" />
        <path d="M60 40 L46 36" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" opacity="0.16" />
        <path d="M60 32 L48 30" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" opacity="0.15" />
      </svg>
      <svg className="landing-deco-sound-badge" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1" opacity="0.13" />
        <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1" opacity="0.16" />
        <rect x="24" y="26" width="4" height="12" rx="2" fill="currentColor" opacity="0.32" />
        <rect x="30" y="22" width="4" height="16" rx="2" fill="currentColor" opacity="0.45" />
        <rect x="36" y="28" width="4" height="10" rx="2" fill="currentColor" opacity="0.32" />
      </svg>
      <svg className="landing-deco-orbit" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="36" r="20" stroke="currentColor" strokeWidth="0.9" opacity="0.18" />
        <circle cx="36" cy="36" r="12" stroke="currentColor" strokeWidth="0.9" opacity="0.12" />
        <path d="M20 30 Q36 18 52 30" stroke="currentColor" strokeWidth="0.9" opacity="0.2" />
        <circle cx="24" cy="28" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="48" cy="28" r="2" fill="currentColor" opacity="0.35" />
      </svg>
      <div className="landing-deco-wave">
        <span className="landing-deco-wave-bar" />
        <span className="landing-deco-wave-bar" />
        <span className="landing-deco-wave-bar" />
        <span className="landing-deco-wave-bar" />
        <span className="landing-deco-wave-bar" />
      </div>
      <svg className="landing-deco-star" viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.15" />
      </svg>
    </div>
  )
}
