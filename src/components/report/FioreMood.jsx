import React, { useId, useMemo } from 'react'
import { radarFamiglie } from '../../design-tokens'

const RADAR_FAMIGLIE = radarFamiglie

function mixHexWith(hex, target, amount = 0.5) {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return hex
  const parse = (value) => parseInt(value, 16)
  const r1 = parse(hex.slice(1, 3))
  const g1 = parse(hex.slice(3, 5))
  const b1 = parse(hex.slice(5, 7))
  const r2 = parse(target.slice(1, 3))
  const g2 = parse(target.slice(3, 5))
  const b2 = parse(target.slice(5, 7))
  const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)))
  const mix = (a, b) => clamp(a + (b - a) * amount)
  return `#${mix(r1, r2).toString(16).padStart(2, '0')}${mix(g1, g2).toString(16).padStart(2, '0')}${mix(b1, b2).toString(16).padStart(2, '0')}`
}

function hexToHsl(hex) {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
    return { h: 215, s: 38, l: 61 }
  }
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: s * 100, l: l * 100 }
}

function hslToHex(h, s, l) {
  const hh = ((h % 360) + 360) % 360
  const ss = Math.max(0, Math.min(100, s)) / 100
  const ll = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ll - 1)) * ss
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1))
  const m = ll - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (hh < 60) [r, g, b] = [c, x, 0]
  else if (hh < 120) [r, g, b] = [x, c, 0]
  else if (hh < 180) [r, g, b] = [0, c, x]
  else if (hh < 240) [r, g, b] = [0, x, c]
  else if (hh < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function buildAnalogPastelPalette(hex) {
  const { h, s, l } = hexToHsl(hex)
  const base = hslToHex(h + 8, Math.max(24, Math.min(52, s * 0.56)), Math.max(78, Math.min(90, l + 25)))
  const analog = hslToHex(h + 30, Math.max(22, Math.min(50, s * 0.52)), Math.max(74, Math.min(88, l + 20)))
  const center = hslToHex(h + 14, Math.max(20, Math.min(42, s * 0.4)), Math.max(86, Math.min(94, l + 30)))
  return { base, analog, center }
}

/**
 * Fiore organico SVG: petali a goccia con curve Bezier morbide e gradienti leggeri.
 * La lunghezza dei petali resta proporzionale al livello (1-7).
 */
export default function FioreMood({ levels, portato, size = 200, className = '' }) {
  const gradientPrefix = useId().replace(/:/g, '')
  const viewBoxSize = 220
  const cx = viewBoxSize / 2
  const cy = viewBoxSize / 2

  const petali = useMemo(
    () =>
      RADAR_FAMIGLIE.map((f, i) => {
        const level = Math.max(1, Math.min(7, Number(levels?.[f.key]) || 1))
        const angleDeg = -90 + i * 72 + (i % 2 === 0 ? -3.8 : 3.8)
        const angle = (angleDeg * Math.PI) / 180
        const dirX = Math.cos(angle)
        const dirY = Math.sin(angle)
        const perpX = -dirY
        const perpY = dirX

        const innerRadius = 26
        const outerRadius = 74 + (level / 7) * 58
        const width = 17 + (level / 7) * 14
        const baseTension = 0.64
        const tipTension = 0.36
        const asymmetry = i % 2 === 0 ? 1 : -1

        const baseLeft = {
          x: cx + dirX * innerRadius + perpX * width * 0.58,
          y: cy + dirY * innerRadius + perpY * width * 0.58,
        }
        const baseRight = {
          x: cx + dirX * innerRadius - perpX * width * 0.58,
          y: cy + dirY * innerRadius - perpY * width * 0.58,
        }
        const tip = {
          x: cx + dirX * outerRadius + perpX * width * 0.1 * asymmetry,
          y: cy + dirY * outerRadius + perpY * width * 0.1 * asymmetry,
        }

        const c1Left = {
          x: cx + dirX * (innerRadius + (outerRadius - innerRadius) * 0.28) + perpX * width,
          y: cy + dirY * (innerRadius + (outerRadius - innerRadius) * 0.28) + perpY * width,
        }
        const c2Left = {
          x: cx + dirX * (innerRadius + (outerRadius - innerRadius) * (1 - tipTension)) + perpX * width * 0.72,
          y: cy + dirY * (innerRadius + (outerRadius - innerRadius) * (1 - tipTension)) + perpY * width * 0.72,
        }
        const c1Right = {
          x: cx + dirX * (innerRadius + (outerRadius - innerRadius) * 0.28) - perpX * width,
          y: cy + dirY * (innerRadius + (outerRadius - innerRadius) * 0.28) - perpY * width,
        }
        const c2Right = {
          x: cx + dirX * (innerRadius + (outerRadius - innerRadius) * (1 - tipTension)) - perpX * width * 0.72,
          y: cy + dirY * (innerRadius + (outerRadius - innerRadius) * (1 - tipTension)) - perpY * width * 0.72,
        }
        const baseLeftPull = {
          x: baseLeft.x - dirX * innerRadius * baseTension - perpX * width * 0.25,
          y: baseLeft.y - dirY * innerRadius * baseTension - perpY * width * 0.25,
        }
        const baseRightPull = {
          x: baseRight.x - dirX * innerRadius * baseTension + perpX * width * 0.25,
          y: baseRight.y - dirY * innerRadius * baseTension + perpY * width * 0.25,
        }

        const path = [
          `M ${baseLeft.x} ${baseLeft.y}`,
          `C ${c1Left.x} ${c1Left.y}, ${c2Left.x} ${c2Left.y}, ${tip.x} ${tip.y}`,
          `C ${c2Right.x} ${c2Right.y}, ${c1Right.x} ${c1Right.y}, ${baseRight.x} ${baseRight.y}`,
          `C ${baseRightPull.x} ${baseRightPull.y}, ${baseLeftPull.x} ${baseLeftPull.y}, ${baseLeft.x} ${baseLeft.y}`,
          'Z',
        ].join(' ')

        return {
          index: i,
          level,
          color: f.color,
          subject: f.subject,
          path,
          gradientFrom: mixHexWith(f.color, '#ffffff', 0.28),
          gradientMid: mixHexWith(f.color, '#ffffff', 0.08),
          gradientTo: mixHexWith(f.color, '#0f172a', 0.14),
          gradientStartX: cx + dirX * innerRadius,
          gradientStartY: cy + dirY * innerRadius,
          gradientEndX: tip.x,
          gradientEndY: tip.y,
        }
      }),
    [levels, cx, cy],
  )

  const dominantPetal = useMemo(() => {
    return petali.reduce((best, item) => {
      if (!best) return item
      return item.level > best.level ? item : best
    }, null)
  }, [petali])

  const backgroundPalette = useMemo(() => {
    return buildAnalogPastelPalette(dominantPetal?.color || '#94a3b8')
  }, [dominantPetal])

  const portatoClass = portato ? `fiore-mood-${portato}` : ''

  return (
    <div
      className={`fiore-mood fiore-mood-organic ${portatoClass} ${className}`.trim()}
      role="img"
      aria-label={portato ? `Fiore del profilo: portato ${portato}` : 'Fiore del profilo'}
      style={{
        width: size,
        height: size,
        '--fiore-dominant-color': dominantPetal?.color || '#94a3b8',
        '--fiore-bg-primary': backgroundPalette.base,
        '--fiore-bg-analog': backgroundPalette.analog,
        '--fiore-bg-center': backgroundPalette.center,
      }}
    >
      <svg
        className="fiore-mood-svg fiore-mood-svg--organic"
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {petali.map((p) => {
            const gradientId = `${gradientPrefix}-organic-petal-${p.index}`
            return (
              <linearGradient
                key={gradientId}
                id={gradientId}
                x1={p.gradientStartX}
                y1={p.gradientStartY}
                x2={p.gradientEndX}
                y2={p.gradientEndY}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={p.gradientFrom} stopOpacity="0.84" />
                <stop offset="58%" stopColor={p.gradientMid} stopOpacity="0.95" />
                <stop offset="100%" stopColor={p.gradientTo} stopOpacity="0.9" />
              </linearGradient>
            )
          })}
          <radialGradient id={`${gradientPrefix}-organic-core`} cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="52%" stopColor={mixHexWith(dominantPetal?.color || '#94a3b8', '#ffffff', 0.35)} stopOpacity="0.95" />
            <stop offset="100%" stopColor={mixHexWith(dominantPetal?.color || '#94a3b8', '#0f172a', 0.22)} stopOpacity="0.86" />
          </radialGradient>
          {petali.map((p) => {
            const highlightId = `${gradientPrefix}-organic-highlight-${p.index}`
            return (
              <radialGradient
                key={highlightId}
                id={highlightId}
                cx={p.gradientStartX - 5}
                cy={p.gradientStartY - 7}
                r="62%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.46" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            )
          })}
          <filter
            id={`${gradientPrefix}-organic-material`}
            x="-14%"
            y="-14%"
            width="128%"
            height="128%"
            colorInterpolationFilters="sRGB"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.92"
              numOctaves="2"
              seed="11"
              stitchTiles="stitch"
              result="grainNoise"
            />
            <feColorMatrix
              in="grainNoise"
              type="matrix"
              values="
                0.42 0    0    0    0.48
                0    0.42 0    0    0.48
                0    0    0.42 0    0.48
                0    0    0    1    0
              "
              result="grainTone"
            />
            <feComponentTransfer in="grainTone" result="grainAlpha">
              <feFuncA type="table" tableValues="0 0.09" />
            </feComponentTransfer>
            <feBlend in="SourceGraphic" in2="grainAlpha" mode="multiply" result="textured" />
            <feDropShadow in="textured" dx="0" dy="0.7" stdDeviation="0.8" floodColor="#0f172a" floodOpacity="0.12" />
          </filter>
          <filter
            id={`${gradientPrefix}-organic-inner-shadow`}
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
            colorInterpolationFilters="sRGB"
            filterUnits="objectBoundingBox"
          >
            <feOffset dx="0" dy="0.8" in="SourceAlpha" result="offsetAlpha" />
            <feGaussianBlur in="offsetAlpha" stdDeviation="1.1" result="blurredAlpha" />
            <feComposite in="blurredAlpha" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
            <feColorMatrix
              in="innerShadow"
              type="matrix"
              values="
                0 0 0 0 0.06
                0 0 0 0 0.11
                0 0 0 0 0.18
                0 0 0 0.22 0
              "
            />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <g filter={`url(#${gradientPrefix}-organic-material)`}>
          {petali.map((p) => (
            <g key={p.index}>
              <path
                d={p.path}
                fill={`url(#${gradientPrefix}-organic-petal-${p.index})`}
                className="fiore-mood-organic-petal"
                aria-label={`${p.subject}: ${p.level}/7`}
              />
              <path
                d={p.path}
                fill={`url(#${gradientPrefix}-organic-highlight-${p.index})`}
                className="fiore-mood-organic-highlight"
                aria-hidden="true"
              />
            </g>
          ))}
        </g>
        <circle cx={cx} cy={cy} r={15} fill={`url(#${gradientPrefix}-organic-core)`} className="fiore-mood-organic-core" />
        <circle
          cx={cx}
          cy={cy}
          r={15}
          fill={`url(#${gradientPrefix}-organic-core)`}
          className="fiore-mood-organic-core-shadow"
          filter={`url(#${gradientPrefix}-organic-inner-shadow)`}
          aria-hidden="true"
        />
      </svg>
    </div>
  )
}
