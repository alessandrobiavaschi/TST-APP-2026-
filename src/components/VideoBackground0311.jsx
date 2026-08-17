import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

/** Sfondo landing e report: `public/SFONDO LANDING.mp4`. */
const LANDING_FILE = 'SFONDO LANDING.mp4'
// In Vite, files in `public/` are served from the app root (not `/public/...`).
const LANDING_LOOP = `${import.meta.env.BASE_URL}${encodeURI(LANDING_FILE)}`

function VideoBackground0311({ className = '', showOverlay = false, style }) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)

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
      el.play().catch(() => {})
      /* Video da cache: 'loadeddata'/'canplay' possono scattare prima che React
         attacchi i listener, lasciando isReady bloccato a false (video opaco 0
         per sempre pur essendo già pronto). Controllo diretto come backstop. */
      if (el.readyState >= 2) markReady()
    } catch {
      // ignore
    }
  }, [markReady])

  useEffect(() => {
    ensurePlaying()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') ensurePlaying()
    }
    window.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', ensurePlaying)
    const interval = window.setInterval(ensurePlaying, 1400)
    return () => {
      window.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', ensurePlaying)
      window.clearInterval(interval)
    }
  }, [ensurePlaying])

  return (
    <motion.div className={`page-video-bg ${className}`} style={style}>
      <video
        ref={videoRef}
        className={`page-video-bg__layer page-video-bg__landing-loop vb0311-video${isReady ? ' vb0311-video--ready' : ''}`}
        src={LANDING_LOOP}
        aria-hidden="true"
        muted
        loop
        playsInline
        autoPlay
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
  )
}

export default VideoBackground0311
