import React, { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { LANDING_ONLINE_PHOTO } from '../skyVideosConfig.js'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

/**
 * Sfondo landing e report in 4K online (Unsplash CDN) con effetto Ken Burns cinematico.
 * Resa nitidissima a 60fps/120fps su GPU, caricamento istantaneo (300KB WebP),
 * zero consumo di storage nel repo e zero problemi di autoplay su mobile.
 */
const POSTER_FILE = 'sfondo-landing-poster.jpg'
const LANDING_POSTER = `${import.meta.env.BASE_URL}${encodeURI(POSTER_FILE)}`

const STORAGE_KEY_PAUSED = 'tst_video_bg_paused'

function getInitialPaused() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_PAUSED)
    if (stored !== null) return stored === 'true'
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

function VideoBackground0311({ className = '', showOverlay = false, style }) {
  const [isReady, setIsReady] = useState(true)
  const [isPaused, setIsPaused] = useState(getInitialPaused)

  const markReady = useCallback(() => {
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_PAUSED)
        if (stored === null) {
          setIsPaused(e.matches)
        }
      } catch {
        setIsPaused(e.matches)
      }
    }
    mediaQuery.addEventListener?.('change', handleChange)
    return () => {
      mediaQuery.removeEventListener?.('change', handleChange)
    }
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY_PAUSED, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  return (
    <>
      <motion.div className={`page-video-bg ${className}`} style={style}>
        <img
          className={`page-video-bg__layer vb0311-photo${isReady ? ' vb0311-photo--ready' : ''}`}
          src={LANDING_ONLINE_PHOTO}
          alt=""
          aria-hidden="true"
          onLoad={markReady}
          onError={(e) => {
            console.warn('Foto sfondo online non caricata, uso poster locale:', e)
            e.currentTarget.src = LANDING_POSTER
          }}
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
        {showOverlay && <div className="page-video-overlay" />}
      </motion.div>
      <button
        type="button"
        className="nav-button ghost video-bg-toggle"
        aria-pressed={isPaused}
        aria-label={isPaused ? 'Riproduci animazione di sfondo' : 'Metti in pausa animazione di sfondo'}
        title={isPaused ? 'Riproduci animazione di sfondo' : 'Metti in pausa animazione di sfondo'}
        onClick={togglePause}
      >
        <span aria-hidden="true">{isPaused ? '▶' : '⏸'}</span>
        <span>{isPaused ? 'Riproduci sfondo' : 'Pausa sfondo'}</span>
      </button>
    </>
  )
}

export default VideoBackground0311
