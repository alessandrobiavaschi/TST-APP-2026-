/**
 * Testi profilo emotivo — estratti trimmati da PROFILE_PDF_BLOCKS / content_report.
 * Priorità al testo grezzo dalle fonti scientifiche; DISPLAY_BY_FAMILY solo se assente.
 */

import { FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { PANEL_READING, PROFILO_UI } from '../content/reportRestitution.js'

const FAMILIES = ['Blu', 'Rosso', 'Verde', 'Giallo', 'Grigio']

/**
 * @typedef {{ type: 'p', text: string } | { type: 'ul', items: string[] }} ProfiloBlock
 */

/**
 * @param {string} text
 * @param {{ enableList?: boolean }} [opts]
 * @returns {ProfiloBlock[]}
 */
export function chunkProfiloText(text, { enableList = true } = {}) {
  if (!text || typeof text !== 'string') return []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const blocks = []
  let currentList = []

  lines.forEach((line) => {
    const isListItem = enableList && line.startsWith('- ')
    if (isListItem) {
      currentList.push(line.slice(2).trim())
    } else {
      if (currentList.length > 0) {
        blocks.push({ type: 'ul', items: currentList })
        currentList = []
      }
      blocks.push({ type: 'p', text: line })
    }
  })
  if (currentList.length > 0) {
    blocks.push({ type: 'ul', items: currentList })
  }
  return blocks
}

/**
 * @param {string} famiglia
 * @returns {string}
 */
export function normalizeFamigliaName(famiglia) {
  const raw = String(famiglia || '').trim()
  if (FAMILIES.includes(raw)) return raw
  const hit = FAMILIES.find((f) => raw.toLowerCase().includes(f.toLowerCase()))
  return hit || 'Verde'
}

/** @deprecated Usare chunkProfiloText */
export function extractBulletLines(raw) {
  return chunkProfiloText(raw)
    .filter((b) => b.type === 'ul')
    .flatMap((b) => b.items)
}

/** @deprecated Non condensa più — restituisce tutti i paragrafi */
export function condenseRawParagraphs(raw, max = 99) {
  return chunkProfiloText(raw, { enableList: false })
    .filter((b) => b.type === 'p' && b.text.length > 40)
    .map((b) => b.text)
    .slice(0, max)
}

const TRIM_LIMITS = {
  natura: { maxParagraphs: 4, maxListItems: 0 },
  racconto: { maxParagraphs: 4, maxListItems: 0 },
  risorse: { maxParagraphs: 2, maxListItems: 5 },
  ombre: { maxParagraphs: 4, maxListItems: 5 },
}

/**
 * Seleziona estratti dal testo integrale (stessa sostanza, meno testo).
 * @param {'natura'|'racconto'|'risorse'|'ombre'} panelId
 * @param {string} text
 * @returns {string}
 */
export function trimProfiloChapterText(panelId, text) {
  const limits = TRIM_LIMITS[panelId]
  if (!limits || !text) return text || ''
  const enableList = panelId === 'risorse' || panelId === 'ombre'
  const blocks = chunkProfiloText(text, { enableList })
  if (!blocks.length) return text

  const out = []
  let paraCount = 0
  let listCount = 0

  for (const block of blocks) {
    if (block.type === 'p') {
      if (paraCount >= limits.maxParagraphs) continue
      out.push(block.text)
      paraCount += 1
    } else if (block.type === 'ul' && limits.maxListItems > 0) {
      const items = block.items.slice(0, limits.maxListItems - listCount)
      if (!items.length) continue
      listCount += items.length
      out.push(items.map((item) => `- ${item}`).join('\n'))
    }
  }

  return out.join('\n').trim() || text
}

/**
 * @param {string} famiglia
 * @param {{ natura?: string, disposizione?: string, fraseChiave?: string }} [profilo]
 */
export function buildInSintesiFallback(famiglia, profilo = {}) {
  const theme = FAMILY_THEME[normalizeFamigliaName(famiglia)]
  const tag = (profilo.fraseChiave || theme?.tagline || '').trim()
  const natura = (profilo.natura || theme?.nature || '').replace(/^NATURA\s+/i, '').trim()
  if (tag && natura) {
    return `${tag.charAt(0).toUpperCase()}${tag.slice(1)}`
  }
  if (tag) return tag
  return `Prevalenza emersa dal test: natura ${theme?.corrente || famiglia}.`
}

/**
 * @type {Record<string, Record<string, { inSintesi: string, corpo: string[] }>>}
 */
const DISPLAY_BY_FAMILY = {
  Verde: {
    natura: {
      inSintesi:
        'Nella famiglia Flemmatica, la natura Contemplativa esprime il piacere della lentezza, del silenzio, della calma, del riposo e della contemplazione.',
      corpo: [],
    },
  },
  Blu: {
    natura: {
      inSintesi:
        'Nella famiglia Malinconica, la natura Lunare esprime il piacere di stare con sé stessi, di osservarsi interiormente e di riflettere su ciò che si è vissuto.',
      corpo: [],
    },
  },
  Rosso: {
    natura: {
      inSintesi:
        'Nella famiglia Marziale emerge il piacere del fare, di realizzare ciò che si desidera, di governarsi e mettersi alla prova. Le nature Volitiva e Collerica prediligono assertività, costanza, sincerità e impegno nel qui e ora, con orientamento al presente.',
      corpo: [],
    },
  },
  Giallo: {
    natura: {
      inSintesi:
        'Nella famiglia Entusiasta, la natura Gioioso-Sanguinico esprime il piacere del movimento, della curiosità, della scoperta del nuovo e dell’estroversione.',
      corpo: [],
    },
  },
  Grigio: {
    natura: {
      inSintesi:
        'Nella famiglia Razionale, la natura Intellettuale-Razionale esprime il piacere del calcolo, della dubbiosità di origine intellettuale e dell’oggettività fisica.',
      corpo: [],
    },
  },
}

/**
 * @param {object} params
 * @param {'natura'|'racconto'|'risorse'|'ombre'} params.panelId
 * @param {string} params.famiglia
 * @param {string} [params.rawTesto]
 * @param {object} [params.profilo]
 * @returns {{
 *   hook: string,
 *   blocks: ProfiloBlock[],
 *   panelIntro: string,
 * }}
 */
export function getProfiloPanelDisplay({ panelId, famiglia, rawTesto = '', profilo = {} }) {
  const fam = normalizeFamigliaName(famiglia)
  const raw = trimProfiloChapterText(panelId, String(rawTesto || '').trim())
  const enableList = panelId === 'risorse' || panelId === 'ombre' || panelId === 'racconto'
  const blocks = chunkProfiloText(raw, { enableList })

  const hook = ''

  if (blocks.length > 0) {
    return {
      hook,
      blocks,
      panelIntro: PANEL_READING[panelId] || '',
    }
  }

  const curated = DISPLAY_BY_FAMILY[fam]?.[panelId]
  const fallbackBlocks = []
  if (curated?.inSintesi) {
    fallbackBlocks.push({ type: 'p', text: curated.inSintesi })
  }
  ;(curated?.corpo || []).forEach((p) => fallbackBlocks.push({ type: 'p', text: p }))

  if (!fallbackBlocks.length && panelId === 'natura') {
    const line = buildInSintesiFallback(fam, profilo)
    if (line) fallbackBlocks.push({ type: 'p', text: line })
  }

  return {
    hook: panelId === 'natura' ? hook : '',
    blocks: fallbackBlocks,
    panelIntro: PANEL_READING[panelId] || '',
  }
}

export const PROFILO_DISPLAY_UI = PROFILO_UI
