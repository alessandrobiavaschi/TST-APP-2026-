import React, { useEffect, useRef } from 'react'

/**
 * Micro-interazione visiva: genera scintille stellari a 4 punte e pulviscolo luminoso
 * nelle immediate vicinanze della parola chiave attiva/hoverata,
 * intensificando la risonanza con lo sfondo cosmico.
 */
export default function LandingSparkleEmitter({ targetPoint, accentColor = '#8b5cf6' }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!targetPoint || !targetPoint.active) return

    // Genera 10-16 particelle attorno al rettangolo della parola chiave
    const { x, y, width, height } = targetPoint
    const newParticles = []
    const count = 12

    for (let i = 0; i < count; i += 1) {
      const offsetX = (Math.random() - 0.5) * (width + 36)
      const offsetY = (Math.random() - 0.5) * (height + 28)
      const isStar = Math.random() > 0.4
      const size = isStar ? 3.5 + Math.random() * 4.5 : 1.5 + Math.random() * 2.5
      const angle = Math.random() * Math.PI * 2
      const speed = 0.35 + Math.random() * 0.9

      newParticles.push({
        x: x + width / 2 + offsetX,
        y: y + height / 2 + offsetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.25, // leggero drift verso l'alto
        size,
        alpha: 1,
        decay: 0.016 + Math.random() * 0.02,
        isStar,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.08,
        color: Math.random() > 0.45 ? '#ffffff' : accentColor,
      })
    }

    particlesRef.current = [...particlesRef.current, ...newParticles].slice(-45)
  }, [targetPoint, accentColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Funzione per disegnare una stella a 4 punte (croce stellare)
    const drawFourPointStar = (context, cx, cy, outerRadius, color, alpha, rot) => {
      const innerRadius = outerRadius * 0.25
      context.save()
      context.translate(cx, cy)
      context.rotate(rot)
      context.beginPath()
      for (let i = 0; i < 8; i += 1) {
        const r = i % 2 === 0 ? outerRadius : innerRadius
        const a = (i * Math.PI) / 4
        const px = Math.cos(a) * r
        const py = Math.sin(a) * r
        if (i === 0) context.moveTo(px, py)
        else context.lineTo(px, py)
      }
      context.closePath()
      context.fillStyle = color
      context.globalAlpha = Math.max(0, Math.min(1, alpha))
      context.shadowColor = color
      context.shadowBlur = 8
      context.fill()
      context.restore()
    }

    let isRunning = true

    const loop = () => {
      if (!isRunning) return
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
        } else if (p.isStar) {
          drawFourPointStar(ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation)
        } else {
          ctx.save()
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.fill()
          ctx.restore()
        }
      }

      animFrameRef.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      isRunning = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', updateCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="tst-sparkle-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
