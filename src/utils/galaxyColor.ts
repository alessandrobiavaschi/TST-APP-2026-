/** Conversioni HSL per tint PE sulla galassia (Canvas). */

export type Rgb = { r: number; g: number; b: number }

export function hexToRgb(hex: string): Rgb {
  const h = (hex || '#888888').replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((x) => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0')).join('')}`
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
    }
    h /= 6
  }
  return { h, s, l }
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  let r = 0
  let g = 0
  let b = 0
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tt = t
      if (tt < 0) tt += 1
      if (tt > 1) tt -= 1
      if (tt < 1 / 6) return p + (q - p) * 6 * tt
      if (tt < 1 / 2) return q
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return { r: r * 255, g: g * 255, b: b * 255 }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

export function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(hslToRgb(h, s, l))
}

export type PeTintInput = {
  simpatia: number
  antipatia: number
  indifferenzaDominante: boolean
}

/**
 * Colore base invariato in hue; +15% L se simpatia>0.6; -25% S se antipatia>0.4;
 * alpha 0.65 se indifferenza prevalente (legacy: PE_Indifferenza >= Simpatia e >= Antipatia).
 */
export function applyGalaxyPeTint(hex: string, pe: PeTintInput): { fillHex: string; fillAlpha: number } {
  const { h, s, l } = hexToHsl(hex)
  let L = l
  let S = s
  if (pe.simpatia > 0.6) L = Math.min(1, L + 0.15)
  if (pe.antipatia > 0.4) S = Math.max(0, S * 0.75)
  return {
    fillHex: hslToHex(h, S, L),
    fillAlpha: pe.indifferenzaDominante ? 0.65 : 1,
  }
}
