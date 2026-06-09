import type { GalaxyGlyphKind } from '../config/galaxyDocBridge'

export interface WindRoseDot {
  colorHex: string
  atCenter?: boolean
  angleRad?: number
}

export function drawWindRoseBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ms: number,
  reducedMotion: boolean,
  windDots: WindRoseDot[] | null = null,
) {
  const cx = width / 2
  const cy = height / 2
  const r = Math.min(width, height) * 0.42
  const rot = reducedMotion ? 0 : ms * 0.00004
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.strokeStyle = 'rgba(148,163,184,0.9)'
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i += 1) {
    const a = rot + (i * Math.PI) / 2
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * (r * 0.12), cy + Math.sin(a) * (r * 0.12))
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  if (windDots?.length) {
    const rr = r * 0.11
    windDots.forEach((dot) => {
      const a = (dot.angleRad ?? 0) + rot * 0.35
      ctx.save()
      ctx.globalAlpha = dot.atCenter ? 0.42 : 0.38
      ctx.fillStyle = dot.colorHex
      ctx.beginPath()
      if (dot.atCenter) {
        ctx.arc(cx, cy, 3.4, 0, Math.PI * 2)
      } else {
        ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3, 0, Math.PI * 2)
      }
      ctx.fill()
      ctx.restore()
    })
  }
}

export function drawGalaxyGlyph(
  ctx: CanvasRenderingContext2D,
  kind: GalaxyGlyphKind,
  x: number,
  y: number,
  size: number,
  accentHex: string,
  ms: number,
  reducedMotion: boolean,
) {
  const pulse = reducedMotion ? 1 : 1 + Math.sin(ms * 0.003) * 0.06
  const s = size * pulse
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = accentHex
  ctx.fillStyle = accentHex
  ctx.lineWidth = Math.max(1, s * 0.14)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.globalAlpha = 0.92

  switch (kind) {
    case 'well': {
      ctx.beginPath()
      ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      ctx.arc(0, s * 0.06, s * 0.2, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'crescent': {
      ctx.globalAlpha = 0.95
      ctx.beginPath()
      ctx.arc(-s * 0.05, 0, s * 0.36, -Math.PI * 0.65, Math.PI * 0.65)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(s * 0.08, 0, s * 0.28, Math.PI * 0.55, -Math.PI * 0.55, true)
      ctx.stroke()
      break
    }
    case 'wave_ring': {
      for (let i = 0; i < 3; i += 1) {
        const off = i * s * 0.14
        ctx.globalAlpha = 0.55 - i * 0.12
        ctx.beginPath()
        ctx.arc(0, 0, s * 0.22 + off, -Math.PI * 0.85, -Math.PI * 0.15)
        ctx.stroke()
      }
      break
    }
    case 'sun_minor': {
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2)
      ctx.fill()
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2 + ms * 0.00015
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * s * 0.26, Math.sin(a) * s * 0.26)
        ctx.lineTo(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42)
        ctx.stroke()
      }
      break
    }
    case 'summit': {
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.42)
      ctx.lineTo(s * 0.38, s * 0.38)
      ctx.lineTo(-s * 0.38, s * 0.38)
      ctx.closePath()
      ctx.stroke()
      break
    }
    case 'zigzag': {
      ctx.beginPath()
      ctx.moveTo(-s * 0.38, s * 0.28)
      ctx.lineTo(-s * 0.12, -s * 0.32)
      ctx.lineTo(s * 0.08, s * 0.22)
      ctx.lineTo(s * 0.38, -s * 0.38)
      ctx.stroke()
      break
    }
    case 'pool': {
      ctx.globalAlpha = 0.55
      ctx.beginPath()
      ctx.ellipse(0, 0, s * 0.46, s * 0.26, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 0.35
      ctx.beginPath()
      ctx.ellipse(0, s * 0.06, s * 0.34, s * 0.18, 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'burst': {
      for (let i = 0; i < 8; i += 1) {
        const a = (i / 8) * Math.PI * 2 + ms * 0.00025
        ctx.globalAlpha = 0.75
        ctx.beginPath()
        ctx.moveTo(Math.cos(a) * s * 0.12, Math.sin(a) * s * 0.12)
        ctx.lineTo(Math.cos(a) * s * 0.44, Math.sin(a) * s * 0.44)
        ctx.stroke()
      }
      break
    }
    case 'pulse_arc': {
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      ctx.arc(0, 0, s * 0.34, -Math.PI * 0.85, Math.PI * 0.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, -s * 0.05, s * 0.18, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'shard': {
      ctx.globalAlpha = 0.88
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.44)
      ctx.lineTo(s * 0.2, s * 0.08)
      ctx.lineTo(s * 0.06, s * 0.12)
      ctx.lineTo(-s * 0.24, s * 0.42)
      ctx.lineTo(-s * 0.1, s * 0.02)
      ctx.closePath()
      ctx.stroke()
      break
    }
    case 'rings': {
      for (let i = 0; i < 3; i += 1) {
        ctx.globalAlpha = 0.45 + i * 0.15
        ctx.beginPath()
        ctx.arc(0, 0, s * (0.18 + i * 0.14), 0, Math.PI * 2)
        ctx.stroke()
      }
      break
    }
    default:
      break
  }
  ctx.restore()
}
