import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSyncVideoToCanvas } from '../hooks/useSyncVideoToCanvas.js'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import { getSkyVideo } from '../skyVideosConfig.js'

const DEFAULT_CROSSFADE_DURATION_MS = 2400
const LANDING_CROSSFADE_DURATION_MS = 1600
// 0.5x garantisce cadenza percepita fluida sui sorgenti a 25/30 fps.
const PLAYBACK_RATE = 0.5
const CROSSFADE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'
const VIDEO_VISIBLE_OPACITY = 0.9

function getCompositeKey(timeOfDay, weather) {
  return `${timeOfDay || 'unknown'}__${weather || 'unknown'}`
}

// Doppio-buffer A/B con swap differito.
// - Entrambi i layer sono sempre montati: nessun unmount durante la transizione.
// - Quando cambia il cielo richiesto, carichiamo il nuovo video nel layer INATTIVO.
// - Il crossfade (CSS opacity) parte SOLO quando il nuovo video ha decodificato
//   un primo frame (canplay + almeno un RAF disegnato sul canvas), così la
//   transizione non mostra mai un canvas nero/bianco.
function SkyBackground() {
  const { timeOfDay, weather, config } = useSkyTheme()
  const location = useLocation()
  const isLandingRoute = location.pathname === '/'
  const crossfadeDurationMs = isLandingRoute
    ? LANDING_CROSSFADE_DURATION_MS
    : DEFAULT_CROSSFADE_DURATION_MS

  const requestedKey = getCompositeKey(timeOfDay, weather)

  const [slotA, setSlotA] = useState(() => ({ key: requestedKey }))
  const [slotB, setSlotB] = useState({ key: null })
  const [activeSlot, setActiveSlot] = useState('a')
  const [pendingSlot, setPendingSlot] = useState(null)
  const [slotAReady, setSlotAReady] = useState(false)
  const [slotBReady, setSlotBReady] = useState(false)
  const [prevRequestedKey, setPrevRequestedKey] = useState(requestedKey)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)

  // Derive-state-from-props: quando cambia il cielo richiesto, carichiamo
  // il nuovo video nel layer INATTIVO. Il crossfade partirà solo quando
  // quel video avrà decodificato un primo frame (vedi handleReady).
  if (prevRequestedKey !== requestedKey) {
    setPrevRequestedKey(requestedKey)
    const activeKey = activeSlot === 'a' ? slotA.key : slotB.key
    if (requestedKey !== activeKey) {
      const inactiveSlot = activeSlot === 'a' ? 'b' : 'a'
      const inactiveKey = inactiveSlot === 'a' ? slotA.key : slotB.key
      if (inactiveKey !== requestedKey) {
        if (inactiveSlot === 'a') {
          setSlotAReady(false)
          setSlotA({ key: requestedKey })
        } else {
          setSlotBReady(false)
          setSlotB({ key: requestedKey })
        }
      }
      setPendingSlot(inactiveSlot)
    }
  }

  const containerRef = useRef(null)
  const videoRefA = useRef(null)
  const videoRefB = useRef(null)
  const canvasRefA = useRef(null)
  const canvasRefB = useRef(null)

  const shouldUseStaticBackground = Boolean(config.staticMode || isLowPowerMode)
  const skyObjectPosition = { x: 50, y: 42 }

  const configA = slotA.key ? getSkyVideo(...slotA.key.split('__')) : null
  const configB = slotB.key ? getSkyVideo(...slotB.key.split('__')) : null

  useSyncVideoToCanvas({
    videoRef: videoRefA,
    canvasRef: canvasRefA,
    containerRef,
    objectPosition: skyObjectPosition,
    enabled: !shouldUseStaticBackground && Boolean(configA),
  })
  useSyncVideoToCanvas({
    videoRef: videoRefB,
    canvasRef: canvasRefB,
    containerRef,
    objectPosition: skyObjectPosition,
    enabled: !shouldUseStaticBackground && Boolean(configB),
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = navigator.connection
    const evaluate = () => {
      setIsLowPowerMode(Boolean(motionQuery.matches || connection?.saveData))
    }
    evaluate()
    motionQuery.addEventListener('change', evaluate)
    connection?.addEventListener?.('change', evaluate)
    return () => {
      motionQuery.removeEventListener('change', evaluate)
      connection?.removeEventListener?.('change', evaluate)
    }
  }, [])

  // Play helper resiliente (tab in background, iOS, ecc.).
  const ensureVideoPlaying = useCallback((videoEl, customPlaybackRate) => {
    if (!videoEl) return
    try {
      videoEl.muted = true
      videoEl.defaultMuted = true
      videoEl.playsInline = true
      videoEl.autoplay = true
      videoEl.loop = true
      videoEl.controls = false
      const rate = typeof customPlaybackRate === 'number' ? customPlaybackRate : PLAYBACK_RATE
      videoEl.defaultPlaybackRate = rate
      videoEl.playbackRate = rate
      const p = videoEl.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } catch {
      // no-op
    }
  }, [])

  // Keep-alive: se il tab torna visibile o il browser mette in pausa i video,
  // ri-avvia la riproduzione.
  useEffect(() => {
    const tick = () => {
      ensureVideoPlaying(videoRefA.current, configA?.playbackRate)
      ensureVideoPlaying(videoRefB.current, configB?.playbackRate)
    }
    tick()
    const interval = window.setInterval(tick, 2000)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', tick)
    }
  }, [ensureVideoPlaying, configA?.playbackRate, configB?.playbackRate])

  const handleReady = useCallback(
    (slotId) => {
      if (slotId === 'a') setSlotAReady(true)
      else setSlotBReady(true)
      // Quando il layer pendente ha decodificato un primo frame → swap attivo.
      // Questo fa partire il crossfade CSS senza mai mostrare un canvas nero.
      if (pendingSlot === slotId) {
        setActiveSlot(slotId)
        setPendingSlot(null)
      }
    },
    [pendingSlot],
  )

  const handleReset = useCallback((slotId) => {
    if (slotId === 'a') setSlotAReady(false)
    else setSlotBReady(false)
  }, [])

  if (shouldUseStaticBackground) {
    return (
      <div
        className="app-sky-background app-sky-background--static app-sky-background--solid"
        aria-hidden="true"
      >
        <div className="app-sky-overlay-polaroid" />
      </div>
    )
  }

  if (!configA && !configB) {
    return null
  }

  const isActiveA = activeSlot === 'a'
  // Il layer attivo resta visibile finché il nuovo è pronto; in quel momento
  // l'altro fade-in e questo fade-out contemporaneamente.
  const opacityA = isActiveA ? VIDEO_VISIBLE_OPACITY : 0
  const opacityB = isActiveA ? 0 : VIDEO_VISIBLE_OPACITY
  const anyReady = slotAReady || slotBReady
  const showFallback = !anyReady
  const styleLayerA = {
    opacity: configA ? opacityA : 0,
    transition: `opacity ${crossfadeDurationMs}ms ${CROSSFADE_EASING}`,
  }
  const styleLayerB = {
    opacity: configB ? opacityB : 0,
    transition: `opacity ${crossfadeDurationMs}ms ${CROSSFADE_EASING}`,
  }

  return (
    <div ref={containerRef} className="app-sky-background" aria-hidden="true">
      <div
        className={[
          'app-sky-fallback',
          showFallback ? 'app-sky-fallback--visible' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {configA && (
        <>
          <video
            ref={videoRefA}
            key={`a:${slotA.key}`}
            className="app-sky-video-source"
            src={configA.src}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onLoadedData={() => {
              ensureVideoPlaying(videoRefA.current, configA?.playbackRate)
              handleReady('a')
            }}
            onCanPlay={() => handleReady('a')}
            onPlaying={() => handleReady('a')}
            onEmptied={() => handleReset('a')}
            onError={() => handleReset('a')}
          />
          <canvas
            ref={canvasRefA}
            className="app-sky-canvas app-sky-canvas--a"
            aria-hidden="true"
            style={styleLayerA}
          />
        </>
      )}

      {configB && (
        <>
          <video
            ref={videoRefB}
            key={`b:${slotB.key}`}
            className="app-sky-video-source"
            src={configB.src}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onLoadedData={() => {
              ensureVideoPlaying(videoRefB.current, configB?.playbackRate)
              handleReady('b')
            }}
            onCanPlay={() => handleReady('b')}
            onPlaying={() => handleReady('b')}
            onEmptied={() => handleReset('b')}
            onError={() => handleReset('b')}
          />
          <canvas
            ref={canvasRefB}
            className="app-sky-canvas app-sky-canvas--b"
            aria-hidden="true"
            style={styleLayerB}
          />
        </>
      )}

      <div className="app-sky-overlay-polaroid" />
      <div className="app-sky-grain" />
    </div>
  )
}

export default SkyBackground
