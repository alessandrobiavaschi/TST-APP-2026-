import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

/**
 * Sfondo landing e report: `public/sfondo-landing.mp4`.
 * È la versione leggera di `SFONDO LANDING.mp4` (23 MB HEVC → ~4 MB H.264,
 * stessa resa): codificata con `-movflags +faststart`, così il browser può
 * partire dopo i primi KB invece di scaricare tutto il file prima del 1° frame.
 * Il poster (primo frame) compare subito, finché il video non è pronto.
 * Per rigenerarli dal file originale:
 *   ffmpeg -i "SFONDO LANDING.mp4" -an -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart -g 50 sfondo-landing.mp4
 *   ffmpeg -i "SFONDO LANDING.mp4" -frames:v 1 -q:v 4 sfondo-landing-poster.jpg
 */
const LANDING_FILE = 'sfondo-landing.mp4'
const POSTER_FILE = 'sfondo-landing-poster.jpg'
// In Vite, files in `public/` are served from the app root (not `/public/...`).
const LANDING_LOOP = `${import.meta.env.BASE_URL}${encodeURI(LANDING_FILE)}`
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
  const videoRef = useRef(null)
  // true da subito: finché il video carica si vede il poster (niente schermo nero)
  const [isReady, setIsReady] = useState(true)
  const [isPaused, setIsPaused] = useState(getInitialPaused)

  const markReady = useCallback(() => {
    setIsReady(true)
  }, [])

  const ensurePlaying = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    try {
      el.muted = true
      el.defaultMuted = true
      el.playsInline = true
      el.loop = true
      /* 1.0: playback < 1 su H.264 espone macroblocchi / banding su zone scure */
      el.playbackRate = 1

      if (isPaused) {
        if (!el.paused) {
          el.pause()
        }
        if (el.readyState >= 2) markReady()
        return
      }

      if (el.paused) {
        el.play().catch(() => {})
      }
      /* Video da cache: 'loadeddata'/'canplay' possono scattare prima che React
         attacchi i listener, lasciando isReady bloccato a false (video opaco 0
         per sempre pur essendo già pronto). Controllo diretto come backstop. */
      if (el.readyState >= 2) markReady()
    } catch {
      // ignore
    }
  }, [isPaused, markReady])

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

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (isPaused) {
      if (!el.paused) el.pause()
      if (el.readyState >= 2) markReady()
    } else {
      el.play().catch(() => {})
    }
  }, [isPaused, markReady])

  useEffect(() => {
    ensurePlaying()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') ensurePlaying()
    }
    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', ensurePlaying)
    /* Alcuni browser (iOS Safari in Low Power Mode, Chrome Android con risparmio
       dati) bloccano l'autoplay muto finché non arriva un gesto qualsiasi
       dell'utente: senza questo, il video resta fermo sul primo frame finché
       non arriva il prossimo giro dell'interval sotto. Intercettando il primo
       gesto (tap, scroll, tastiera) il video riparte all'istante invece che
       "solo se clicchi" sul video stesso. */
    const interactionEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll']
    interactionEvents.forEach((evt) =>
      window.addEventListener(evt, ensurePlaying, { passive: true, once: true }),
    )
    const interval = window.setInterval(ensurePlaying, 1400)
    return () => {
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', ensurePlaying)
      interactionEvents.forEach((evt) => window.removeEventListener(evt, ensurePlaying))
      window.clearInterval(interval)
    }
  }, [ensurePlaying])

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
        <video
          ref={videoRef}
          className={`page-video-bg__layer page-video-bg__landing-loop vb0311-video${isReady ? ' vb0311-video--ready' : ''}`}
          src={LANDING_LOOP}
          poster={LANDING_POSTER}
          aria-hidden="true"
          muted
          loop
          playsInline
          autoPlay={!isPaused}
          preload="auto"
          controls={false}
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={() => {
            ensurePlaying()
            markReady()
          }}
          onCanPlay={() => {
            ensurePlaying()
            markReady()
          }}
          onError={(e) => {
            console.warn('Video sfondo: caricamento fallito', LANDING_LOOP, e?.target?.error)
          }}
        />
        {showOverlay && <div className="page-video-overlay" />}
      </motion.div>
      <button
        type="button"
        className="nav-button ghost video-bg-toggle"
        aria-pressed={isPaused}
        aria-label={isPaused ? 'Riproduci video di sfondo' : 'Metti in pausa il video di sfondo'}
        title={isPaused ? 'Riproduci video di sfondo' : 'Metti in pausa il video di sfondo'}
        onClick={togglePause}
      >
        <span aria-hidden="true">{isPaused ? '▶' : '⏸'}</span>
        <span>{isPaused ? 'Riproduci sfondo' : 'Pausa sfondo'}</span>
      </button>
    </>
  )
}

export default VideoBackground0311
