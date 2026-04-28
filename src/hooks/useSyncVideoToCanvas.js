import { useEffect } from 'react'

/**
 * Replica object-fit: cover + object-position (percentuali CSS) su canvas 2D.
 */
export function drawVideoCover(ctx, video, dstW, dstH, positionPct = { x: 50, y: 50 }) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh || video.readyState < 2) return

  const scale = Math.max(dstW / vw, dstH / vh)
  const sw = vw * scale
  const sh = vh * scale
  const dx = (dstW - sw) * (positionPct.x / 100)
  const dy = (dstH - sh) * (positionPct.y / 100)
  ctx.drawImage(video, 0, 0, vw, vh, dx, dy, sw, sh)
}

/**
 * Disegna i frame di un video su un canvas: il video può restare nascosto (nessun overlay nativo iOS/Safari).
 */
export function useSyncVideoToCanvas({
  videoRef,
  canvasRef,
  containerRef,
  objectPosition = { x: 50, y: 50 },
  enabled = true,
}) {
  const objectPositionX = objectPosition?.x ?? 50
  const objectPositionY = objectPosition?.y ?? 50

  useEffect(() => {
    if (!enabled) return

    let raf = 0
    let lastCanvasWidth = 0
    let lastCanvasHeight = 0

    const getContainer = () =>
      containerRef?.current ?? canvasRef.current?.parentElement ?? null

    const drawFrame = () => {
      const canvas = canvasRef.current
      const video = videoRef.current
      const container = getContainer()
      if (!canvas || !video || !container || canvas.width <= 0 || canvas.height <= 0) return
      const ctx = canvas.getContext('2d', { alpha: false })
      const styleW = parseFloat(canvas.style.width)
      const cw = container.clientWidth
      const dpr = canvas.width / Math.max(1, styleW || cw)
      const logicalW = canvas.width / dpr
      const logicalH = canvas.height / dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, logicalW, logicalH)
      drawVideoCover(ctx, video, logicalW, logicalH, { x: objectPositionX, y: objectPositionY })
    }

    const resize = () => {
      const canvas = canvasRef.current
      const container = getContainer()
      if (!canvas || !container) return
      const narrow = typeof window !== 'undefined' && window.innerWidth < 768
      const dprCap = narrow ? 1.25 : 2
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      const w = container.clientWidth
      const h = container.clientHeight
      if (w < 1 || h < 1) return
      const nextCanvasWidth = Math.floor(w * dpr)
      const nextCanvasHeight = Math.floor(h * dpr)
      if (nextCanvasWidth === lastCanvasWidth && nextCanvasHeight === lastCanvasHeight) return
      canvas.width = nextCanvasWidth
      canvas.height = nextCanvasHeight
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lastCanvasWidth = nextCanvasWidth
      lastCanvasHeight = nextCanvasHeight
      // Ridisegna subito dopo un resize reale: evita il "vuoto" durante scroll mobile.
      drawFrame()
    }

    const loop = () => {
      drawFrame()
      raf = requestAnimationFrame(loop)
    }

    const ro = new ResizeObserver(() => resize())
    const container = getContainer()
    if (container) ro.observe(container)
    window.addEventListener('resize', resize)
    resize()
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [videoRef, canvasRef, containerRef, enabled, objectPositionX, objectPositionY])
}
