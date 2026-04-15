import React, { useRef } from 'react'

/** Icona stile logo/badge in linea con la palette (verde oliva, cielo) */
function LogoIcon() {
  return (
    <span className="logo-block-icon" aria-hidden>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <rect width="48" height="48" rx="8" fill="url(#logo-block-grad)" />
        <path
          d="M24 12c-2 0-4 1.5-5 3.5L14 22l5 4 5-8 5 8 5-4-5-6.5C28 13.5 26 12 24 12z"
          fill="rgba(255,255,255,0.95)"
        />
        <path
          d="M18 28l4 3 2-4 2 4 4-3-3-5h-2l-2 3-2-3h-2l-2 5z"
          fill="rgba(255,255,255,0.7)"
        />
        <defs>
          <linearGradient id="logo-block-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6F8469" />
            <stop offset="0.6" stopColor="#86AC8D" />
            <stop offset="1" stopColor="#7a9b7a" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}

/**
 * Blocco logo: icona o loghi PNG a sinistra + testo (e opzionali link o children) a destra.
 * @param {{ text?: string, links?: Array<{ href: string, label: string }>, logos?: string[], children?: React.ReactNode, className?: string }} props
 */
function LogoBlock({ text, links, logos, children, className = '' }) {
  const hasLogos = logos && logos.length > 0
  const containerRef = useRef(null)
  return (
    <div ref={containerRef} className={`logo-block ${className}`.trim()}>
      {hasLogos ? (
        <div className="logo-block-logos" aria-hidden>
          {logos.map((src, i) => (
            <img key={i} src={src} alt="" className="logo-block-logo-img" />
          ))}
        </div>
      ) : (
        <LogoIcon />
      )}
      <div className="logo-block-content">
        {children != null ? children : <span className="logo-block-text">{text}</span>}
        {links && links.length > 0 && (
          <div className="logo-block-links">
            {links.map((link, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LogoBlock
