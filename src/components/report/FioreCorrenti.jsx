import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// ESLint flat-config del repo non rileva l'uso di `motion` via JSX member.
void motion

/**
 * <FioreCorrenti /> — mini "fiore" delle 5 correnti, geometria condivisa.
 *
 * Componente unico riusato sia dalla miniatura di chiusura in `ParoleStatiAnimo`
 * sia dal loader full-screen del report (evita di duplicare la geometria del
 * fiore SVG in più punti). Self-contained: nessuna dipendenza da scoring/DB.
 *
 * Props:
 *   - size: number                     lato del quadrato SVG (px). Default 40.
 *   - correnti: Array<{ nome, colore }> elenco delle correnti (max 5 petali).
 *   - pulse: boolean                   se true, anima i petali con un pulse
 *                                       sequenziale (stagger) — usato dal loader.
 *   - ariaLabel: string
 */

function withAlpha(hex, alpha) {
  if (typeof hex !== 'string') return `rgba(148,163,184,${alpha})`
  let c = hex.trim().replace('#', '')
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('')
  if (c.length !== 6 || /[^0-9a-fA-F]/.test(c)) return `rgba(148,163,184,${alpha})`
  const num = parseInt(c, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const DEFAULT_PETALS = [
  { nome: 'Verde', colore: '#22c55e' },
  { nome: 'Rosso', colore: '#ef4444' },
  { nome: 'Blu', colore: '#3b82f6' },
  { nome: 'Giallo', colore: '#eab308' },
  { nome: 'Grigio', colore: '#6b7280' },
]

export default function FioreCorrenti({
  size = 40,
  correnti,
  pulse = false,
  ariaLabel = 'Fiore delle cinque correnti emotive',
}) {
  const reduceMotion = useReducedMotion()
  const source = correnti && correnti.length ? correnti : DEFAULT_PETALS
  const petali = source.slice(0, 5)
  const cx = size / 2
  const cy = size / 2
  const rPetalo = size * 0.17
  const distanza = size * 0.26
  const n = petali.length || 5
  const animate = pulse && !reduceMotion

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      {petali.map((c, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        const px = cx + Math.cos(angle) * distanza
        const py = cy + Math.sin(angle) * distanza
        return (
          <motion.circle
            key={`${c?.nome || 'corr'}-${i}`}
            cx={px}
            cy={py}
            r={rPetalo}
            fill={withAlpha(c?.colore || '#64748b', 0.85)}
            initial={animate ? { opacity: 0.35, scale: 0.85 } : false}
            animate={
              animate
                ? { opacity: [0.35, 1, 0.35], scale: [0.85, 1.05, 0.85] }
                : undefined
            }
            transition={
              animate
                ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
                : undefined
            }
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )
      })}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.1}
        fill="#0f172a"
        stroke="#334155"
        strokeWidth={size * 0.015}
      />
    </svg>
  )
}
