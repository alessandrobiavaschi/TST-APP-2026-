import { testSchema } from '../dbSchema.js'

/**
 * Parser CSV minimale (RFC4180): virgolette, virgole interne, CRLF.
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let i = 0
  let inQuotes = false
  const len = text.length

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    rows.push(row)
    row = []
  }

  while (i < len) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += c
      i += 1
      continue
    }
    if (c === '"') {
      inQuotes = true
      i += 1
      continue
    }
    if (c === ',') {
      pushField()
      i += 1
      continue
    }
    if (c === '\r') {
      i += 1
      continue
    }
    if (c === '\n') {
      pushField()
      pushRow()
      i += 1
      continue
    }
    field += c
    i += 1
  }
  pushField()
  if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
    rows.push(row)
  }
  return rows
}

function stripBom(str) {
  if (!str) return ''
  return str.charCodeAt(0) === 0xfeff ? str.slice(1) : str
}

function coerceSchemaField(key, rawStr) {
  const t = testSchema[key]
  const s = rawStr == null ? '' : String(rawStr)
  if (t === 'number') {
    const n = Number(s.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }
  if (t === 'boolean') {
    const low = s.trim().toLowerCase()
    return low === 'true' || low === '1' || low === 'si' || low === 'sì'
  }
  if (t === 'timestamp') {
    if (!s.trim()) return null
    return s
  }
  return s
}

/**
 * Converte una riga CSV (con header noto) in payload Firestore-compatibile.
 * Ignora la colonna `id` (etichetta export). Gestisce `areaId` se presente.
 */
export function matriceDataRowToPayload(header, row) {
  const idx = {}
  header.forEach((h, j) => {
    const name = stripBom(String(h || '').trim())
    if (name) idx[name] = j
  })

  const payload = {}

  if (idx.areaId != null) {
    const v = row[idx.areaId]
    if (v != null && String(v).trim() !== '') {
      payload.areaId = String(v).trim()
    }
  }

  for (const key of Object.keys(testSchema)) {
    if (idx[key] == null) {
      continue
    }
    const cell = row[idx[key]]
    const str = cell == null ? '' : String(cell)
    payload[key] = coerceSchemaField(key, str)
  }

  return payload
}

/**
 * Valida header minimi per import matrice (colonne schema + prima colonna id).
 * @param {string[]} header
 */
export function assertMatriceHeaderLooksValid(header) {
  const names = header.map((h) => stripBom(String(h || '').trim()))
  if (!names.length || names[0] !== 'id') {
    throw new Error(
      'CSV non riconosciuto: la prima colonna deve essere "id" (export matrice TST).',
    )
  }
  const hasFile01 = names.includes('File_01')
  if (!hasFile01) {
    throw new Error(
      'CSV non riconosciuto: manca la colonna File_01 (usa il file generato da "Scarica matrice" o "Scarica dati").',
    )
  }
}

/**
 * Parse testuale completo CSV matrice → uno o più payload da salvare.
 * @param {string} text
 * @returns {{ payloads: object[], rowCount: number }}
 */
export function parseMatriceCsv(text) {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('File CSV vuoto.')
  }
  const rows = parseCsvRows(trimmed)
  if (rows.length < 2) {
    throw new Error('Il CSV deve contenere intestazione e almeno una riga dati.')
  }
  const header = rows[0].map((c) => stripBom(String(c ?? '').trim()))
  assertMatriceHeaderLooksValid(header)

  const payloads = []
  for (let r = 1; r < rows.length; r += 1) {
    const row = rows[r]
    if (!row || row.every((c) => String(c ?? '').trim() === '')) {
      continue
    }
    payloads.push(matriceDataRowToPayload(header, row))
  }
  if (!payloads.length) {
    throw new Error('Nessuna riga dati valida nel CSV.')
  }
  return { payloads, rowCount: payloads.length }
}
