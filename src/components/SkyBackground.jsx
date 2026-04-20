import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSyncVideoToCanvas } from '../hooks/useSyncVideoToCanvas.js'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import { getSkyVideo } from '../skyVideosConfig.js'

const DEFAULT_CROSSFADE_DURATION_MS = 1800
const LANDING_CROSSFADE_DURATION_MS = 150
const PLAYBACK_RATE = 0.25
const VIDEO_VISIBLE_OPACITY = 0.9

function getCompositeKey(timeOfDay, weather) {
  return `${timeOfDay || 'unknown'}__${weather || 'unknown'}`
}

function SkyBackground() {
  const { timeOfDay, weather, config } = useSkyTheme()
  const location = useLocation()
  const [currentKey, setCurrentKey] = useState(() => getCompositeKey(timeOfDay, weather))
  const [nextKey, setNextKey] = useState(null)
  const [isCrossfading, setIsCrossfading] = useState(false)
  const [isCurrentVideoPlaying, setIsCurrentVideoPlaying] = useState(false)
  const [isNextVideoPlaying, setIsNextVideoPlaying] = useState(false)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const containerRef = useRef(null)
  const currentVideoRef = useRef(null)
  const nextVideoRef = useRef(null)
  const currentCanvasRef = useRef(null)
  const nextCanvasRef = useRef(null)

  const currentConfig = getSkyVideo(...currentKey.split('__'))
  const nextConfig = nextKey ? getSkyVideo(...nextKey.split('__')) : null
  const shouldUseStaticBackground = Boolean(config.staticMode || isLowPowerMode)

  const skyObjectPosition = { x: 50, y: 42 }

  useSyncVideoToCanvas({
    videoRef: currentVideoRef,
    canvasRef: currentCanvasRef,
    containerRef,
    objectPosition: skyObjectPosition,
    enabled: !shouldUseStaticBackground && Boolean(currentConfig),
  })
  useSyncVideoToCanvas({
    videoRef: nextVideoRef,
    canvasRef: nextCanvasRef,
    containerRef,
    objectPosition: skyObjectPosition,
    enabled: !shouldUseStaticBackground && Boolean(nextConfig),
  })

  const nextCompositeKey = getCompositeKey(timeOfDay, weather)
  const isLandingRoute = location.pathname === '/'
  const crossfadeDurationMs = isLandingRoute
    ? LANDING_CROSSFADE_DURATION_MS
    : DEFAULT_CROSSFADE_DURATION_MS
  const shouldRevealNextLayer = Boolean(nextConfig && isCrossfading && isNextVideoPlaying)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = navigator.connection
    const evaluateLowPowerMode = () => {
      setIsLowPowerMode(Boolean(motionQuery.matches || connection?.saveData))
    }

    evaluateLowPowerMode()

    const onMotionChange = () => evaluateLowPowerMode()
    const onConnectionChange = () => evaluateLowPowerMode()
    motionQuery.addEventListener('change', onMotionChange)
    connection?.addEventListener?.('change', onConnectionChange)

    return () => {
      motionQuery.removeEventListener('change', onMotionChange)
      connection?.removeEventListener?.('change', onConnectionChange)
    }
  }, [])

  useEffect(() => {
    if (nextCompositeKey === currentKey) return
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H2',location:'src/components/SkyBackground.jsx:60',message:'crossfade started',data:{currentKey,nextCompositeKey,crossfadeDurationMs,isLandingRoute},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    setNextKey(nextCompositeKey)
    setIsCrossfading(true)

    const t = setTimeout(() => {
      setCurrentKey(nextCompositeKey)
      setNextKey(null)
      setIsCrossfading(false)
      // #region agent log
      fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H2',location:'src/components/SkyBackground.jsx:70',message:'crossfade ended',data:{nextCompositeKey,crossfadeDurationMs},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
    }, crossfadeDurationMs)

    return () => clearTimeout(t)
  }, [nextCompositeKey, currentKey, crossfadeDurationMs])

  const ensureVideoPlaying = useCallback((videoRef, onPlaying, onPaused) => {
    const el = videoRef.current
    if (!el) return

    try {
      el.muted = true
      el.defaultMuted = true
      el.playsInline = true
      el.autoplay = true
      el.loop = true
      el.controls = false
      el.playbackRate = PLAYBACK_RATE
      const playPromise = el.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(onPlaying).catch(onPaused)
      } else {
        onPlaying()
      }
    } catch {
      onPaused()
    }
  }, [])

  useEffect(() => {
    setIsCurrentVideoPlaying(false)
    ensureVideoPlaying(currentVideoRef, () => setIsCurrentVideoPlaying(true), () =>
      setIsCurrentVideoPlaying(false)
    )
  }, [currentKey, ensureVideoPlaying])

  useEffect(() => {
    if (!nextKey) {
      setIsNextVideoPlaying(false)
      return
    }
    setIsNextVideoPlaying(false)
    ensureVideoPlaying(nextVideoRef, () => setIsNextVideoPlaying(true), () =>
      setIsNextVideoPlaying(false)
    )
  }, [nextKey, ensureVideoPlaying])

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H3',location:'src/components/SkyBackground.jsx:117',message:'sky playback state changed',data:{currentKey,nextKey,isCrossfading,isCurrentVideoPlaying,isNextVideoPlaying,shouldRevealNextLayer,staticMode:Boolean(config?.staticMode)},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
  }, [
    currentKey,
    nextKey,
    isCrossfading,
    isCurrentVideoPlaying,
    isNextVideoPlaying,
    shouldRevealNextLayer,
    config?.staticMode,
  ])

  useEffect(() => {
    const tick = () => {
      ensureVideoPlaying(currentVideoRef, () => setIsCurrentVideoPlaying(true), () =>
        setIsCurrentVideoPlaying(false)
      )
      if (nextKey) {
        ensureVideoPlaying(nextVideoRef, () => setIsNextVideoPlaying(true), () =>
          setIsNextVideoPlaying(false)
        )
      }
    }

    tick()

    const interval = window.setInterval(tick, 1400)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick()
      }
    }
    const onPageShow = () => {
      tick()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [nextKey, ensureVideoPlaying])

  if (shouldUseStaticBackground) {
    return (
      <div className="app-sky-background app-sky-background--static app-sky-background--solid" aria-hidden="true">
        <div className="app-sky-overlay-polaroid" />
      </div>
    )
  }

  if (!currentConfig) {
    return null
  }

  return (
    <div ref={containerRef} className="app-sky-background" aria-hidden="true">
      <div
        className={[
          'app-sky-fallback',
          !isCurrentVideoPlaying && !isNextVideoPlaying ? 'app-sky-fallback--visible' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <video
        ref={currentVideoRef}
        key={currentKey}
        className="app-sky-video-source app-sky-video--current"
        src={currentConfig.src}
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        onLoadedData={() => {
          // #region agent log
          fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H4',location:'src/components/SkyBackground.jsx:198',message:'current video loaded data',data:{currentKey,src:currentConfig?.src ?? null},timestamp:Date.now()})}).catch(()=>{})
          // #endregion
          ensureVideoPlaying(currentVideoRef, () => setIsCurrentVideoPlaying(true), () =>
            setIsCurrentVideoPlaying(false)
          )
        }}
        onError={() => {
          // #region agent log
          fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H4',location:'src/components/SkyBackground.jsx:205',message:'current video error',data:{currentKey,src:currentConfig?.src ?? null},timestamp:Date.now()})}).catch(()=>{})
          // #endregion
          setIsCurrentVideoPlaying(false)
        }}
        onPlaying={() => setIsCurrentVideoPlaying(true)}
        onPause={() => setIsCurrentVideoPlaying(false)}
      />
      {nextConfig && (
        <video
          ref={nextVideoRef}
          key={nextKey}
          className="app-sky-video-source app-sky-video--next"
          src={nextConfig.src}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedData={() => {
            // #region agent log
            fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H4',location:'src/components/SkyBackground.jsx:225',message:'next video loaded data',data:{nextKey,src:nextConfig?.src ?? null},timestamp:Date.now()})}).catch(()=>{})
            // #endregion
            ensureVideoPlaying(nextVideoRef, () => setIsNextVideoPlaying(true), () =>
              setIsNextVideoPlaying(false)
            )
          }}
          onError={() => {
            // #region agent log
            fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H4',location:'src/components/SkyBackground.jsx:232',message:'next video error',data:{nextKey,src:nextConfig?.src ?? null},timestamp:Date.now()})}).catch(()=>{})
            // #endregion
            setIsNextVideoPlaying(false)
          }}
          onPlaying={() => setIsNextVideoPlaying(true)}
          onPause={() => setIsNextVideoPlaying(false)}
        />
      )}
      <canvas
        ref={currentCanvasRef}
        className="app-sky-canvas app-sky-video--current"
        aria-hidden="true"
        style={{
          opacity: shouldRevealNextLayer ? 0 : VIDEO_VISIBLE_OPACITY,
          transition: `opacity ${crossfadeDurationMs}ms ease-in-out`,
          '--sky-blur': isCrossfading ? '10px' : '0px',
        }}
      />
      {nextConfig && (
        <canvas
          ref={nextCanvasRef}
          className="app-sky-canvas app-sky-video--next"
          aria-hidden="true"
          style={{
            opacity: shouldRevealNextLayer ? VIDEO_VISIBLE_OPACITY : 0,
            transition: `opacity ${crossfadeDurationMs}ms ease-in-out`,
            '--sky-blur': isCrossfading ? '10px' : '0px',
          }}
        />
      )}
      <div
        className="app-sky-crossfade-mask"
        style={{
          opacity: shouldRevealNextLayer ? (isLandingRoute ? 0.48 : 0.22) : 0,
          transition: `opacity ${Math.max(120, Math.round(crossfadeDurationMs * 0.8))}ms ease-out`,
        }}
      />
      <div className="app-sky-overlay-watermark" aria-hidden="true" />
      <div className="app-sky-overlay-polaroid" />
      <div className="app-sky-grain" />
    </div>
  )
}

export default SkyBackground
