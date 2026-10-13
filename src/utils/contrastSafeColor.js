function parseHex(h) {
  let s = h.replace('#', '')
  if (s.length === 3) s = s.split('').map((c) => c + c).join('')
  const n = parseInt(s, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex(rgb) {
  return '#' + rgb.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}

function srgbToLin(v) {
  v /= 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function relativeLuminance(rgb) {
  return 0.2126 * srgbToLin(rgb[0]) + 0.7152 * srgbToLin(rgb[1]) + 0.0722 * srgbToLin(rgb[2])
}

export function getContrastRatio(hex1, hex2 = '#08090d') {
  const l1 = relativeLuminance(parseHex(hex1))
  const l2 = relativeLuminance(parseHex(hex2))
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

export function ensureContrast(hex, background = '#08090d', minRatio = 3) {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex
  const rgb = parseHex(hex)
  const bg = parseHex(background)
  const bgLum = relativeLuminance(bg)

  const initialLum = relativeLuminance(rgb)
  const [initLight, initDark] = initialLum > bgLum ? [initialLum, bgLum] : [bgLum, initialLum]
  if ((initLight + 0.05) / (initDark + 0.05) >= minRatio) {
    return hex
  }

  for (let step = 1; step <= 100; step++) {
    const t = step / 100
    const lightened = [
      rgb[0] + (255 - rgb[0]) * t,
      rgb[1] + (255 - rgb[1]) * t,
      rgb[2] + (255 - rgb[2]) * t,
    ]
    const curLum = relativeLuminance(lightened)
    const [light, dark] = curLum > bgLum ? [curLum, bgLum] : [bgLum, curLum]
    if ((light + 0.05) / (dark + 0.05) >= minRatio) {
      return toHex(lightened)
    }
  }
  return '#ffffff'
}

export default ensureContrast
