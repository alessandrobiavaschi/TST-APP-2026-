import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { TEST_RESULTS_COLLECTION, TEST_RESULT_USER_ID_FIELD, SHARED_TESTS_COLLECTION } from '../firestorePaths.js'

/**
 * Salva un risultato TST: nessuna email operatore; solo userId (uid Auth) come riferimento.
 */
export async function saveTestResultForUser({ db, user, payload, overrideTimestamp = true }) {
  if (!db || !user) {
    throw new Error('Impossibile salvare il test: utente o database non disponibili.')
  }

  const docPayload = {
    ...payload,
    ...(overrideTimestamp ? { Data_Ora_Fine_Test: serverTimestamp() } : {}),
    [TEST_RESULT_USER_ID_FIELD]: user.uid,
  }

  return addDoc(collection(db, TEST_RESULTS_COLLECTION), docPayload)
}

function generateShortCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function sanitizeForFirestore(value) {
  if (value === undefined) return null
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForFirestore(entry))
  }
  if (value && typeof value === 'object') {
    const out = {}
    Object.entries(value).forEach(([key, entry]) => {
      out[key] = sanitizeForFirestore(entry)
    })
    return out
  }
  return value
}

export async function shareTestResult({ db, payload }) {
  if (!db) {
    throw new Error('Database non disponibile.')
  }

  const cleanPayload = sanitizeForFirestore(payload || {})
  const maxAttempts = 8

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const code = generateShortCode()
    const docPayload = {
      ...cleanPayload,
      sharedAt: serverTimestamp(),
      shareVersion: 1,
    }

    const docRef = doc(db, SHARED_TESTS_COLLECTION, code)
    const existing = await getDoc(docRef)
    if (existing.exists()) continue

    await setDoc(docRef, docPayload)
    return code
  }

  throw new Error('Impossibile generare un codice univoco. Riprova tra qualche secondo.')
}

export async function getSharedTestResult({ db, code }) {
  if (!db || !code) {
    throw new Error('Database o codice mancanti.')
  }
  
  const docRef = doc(db, SHARED_TESTS_COLLECTION, code.toUpperCase())
  const snap = await getDoc(docRef)
  
  if (!snap.exists()) {
    throw new Error('Codice non trovato o scaduto.')
  }
  
  const data = snap.data()
  // Rimuovi i campi aggiunti durante la condivisione se necessario
  delete data.sharedAt
  return data
}
