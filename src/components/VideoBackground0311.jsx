import React, { useCallback, useEffect, useRef } from 'react'
import { useSyncVideoToCanvas } from '../hooks/useSyncVideoToCanvas.js'

/** Sfondo landing e report: `public/SFONDO LANDING.mp4`. */
const LANDING_FILE = 'SFONDO LANDING.mp4'
// In Vite, files in `public/` are served from the app root (not `/public/...`).
const LANDING_LOOP = `${import.meta.env.BASE_URL}${encodeURI(LANDING_FILE)}`

function VideoBackground0311({ className = '', showOverlay = false }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  useSyncVideoToCanvas({
    videoRef,
    canvasRef,
    containerRef,
    objectPosition: { x: 50, y: 50 },
    enabled: true,
  })

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
    } catch {
      // ignore
    }
  }, [])

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
    <div ref={containerRef} className={`page-video-bg ${className}`}>
      <video
        ref={videoRef}
        className="page-video-bg__layer page-video-bg__video-source page-video-bg__landing-loop"
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
        onLoadedData={ensurePlaying}
        onCanPlay={ensurePlaying}
        onError={(e) => {
          console.warn('Video sfondo: caricamento fallito', LANDING_LOOP, e?.target?.error)
        }}
      />
      <canvas
        ref={canvasRef}
        className="page-video-bg__layer page-video-bg__display-canvas page-video-bg__landing-loop"
        aria-hidden="true"
      />
      {showOverlay && <div className="page-video-overlay" />}
    </div>
  )
}

export default VideoBackground0311
