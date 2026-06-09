/**
 * @deprecated Importare da reportRestitution.js. Re-export per compatibilità.
 */
import {
  GLOSSARY,
  GLOSSARY_UI,
  GALASSIA_INTRO,
  getGlossaryEntry,
  searchGlossary,
  getInPraticaHint,
  getIntegrativeClosing,
  getExploreHintsForFamily,
  LEGAL_FOOTER,
} from './reportRestitution.js'

export {
  GLOSSARY,
  GLOSSARY_UI,
  getGlossaryEntry,
  searchGlossary,
  getInPraticaHint,
  getIntegrativeClosing,
  getExploreHintsForFamily,
  LEGAL_FOOTER,
}

export const GALASSIA_PLAIN_INTRO = GALASSIA_INTRO

/** @deprecated Usare getIntegrativeClosing */
export function getActionHintsForFamily(famiglia) {
  const closing = getIntegrativeClosing(famiglia)
  return {
    title: 'Lettura integrativa',
    intro: closing.paragraph,
    bullets: [],
  }
}
