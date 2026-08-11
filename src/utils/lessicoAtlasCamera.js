export const ATLAS_WORD_MIN_SIZE = 9
export const ATLAS_WORD_MAX_SIZE = 72
export const ATLAS_SELECTED_WORD_MIN_SIZE = 24
export const ATLAS_SELECTED_WORD_MAX_SIZE = 42

export function projectAtlasPoint(point, camera, viewport) {
  const width = Math.max(0, Number(viewport?.width) || 0)
  const height = Math.max(0, Number(viewport?.height) || 0)
  const scale = Math.max(0, Number(camera?.scale) || 1)

  return {
    x: (Number(camera?.x) || 0) + (Number(point?.x) || 0) * width * scale / 100,
    y: (Number(camera?.y) || 0) + (Number(point?.y) || 0) * height * scale / 100,
  }
}

export function getAtlasWordFontSize(baseSize, scale, isSelected = false) {
  const safeBaseSize = Math.max(ATLAS_WORD_MIN_SIZE, Number(baseSize) || ATLAS_WORD_MIN_SIZE)
  const safeScale = Math.max(0.1, Number(scale) || 1)
  const scaledSize = safeBaseSize * Math.pow(safeScale, 0.72)

  if (isSelected) {
    return Math.min(
      ATLAS_SELECTED_WORD_MAX_SIZE,
      Math.max(ATLAS_SELECTED_WORD_MIN_SIZE, scaledSize),
    )
  }

  return Math.min(ATLAS_WORD_MAX_SIZE, Math.max(ATLAS_WORD_MIN_SIZE, scaledSize))
}
