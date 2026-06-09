import reportContent from './content_report.json'
import { PROFILE_PDF_BLOCKS } from './reportProfiloPdf.js'

/** Blocco report per colore dominante: JSON base + testi profilo dal PDF CPM. */
export function getMergedReportBlock(colorName) {
  const base = reportContent[colorName]
  if (!base || typeof base !== 'object') return base
  const extra = PROFILE_PDF_BLOCKS[colorName]
  return extra ? { ...base, ...extra } : { ...base }
}

export { reportContent }
