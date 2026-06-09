// Configurazione Firebase.
// Usa VITE_FIREBASE_* o FIREBASE_* in .env / Netlify, oppure NEXT_PUBLIC_* / REACT_APP_* (merge in vite.config).
// __TST_FIREBASE_BUILD__ è iniettato da vite.config.js al build.

import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// eslint-disable-next-line no-undef
const TST_FB_BUILD = typeof __TST_FIREBASE_BUILD__ !== 'undefined' ? __TST_FIREBASE_BUILD__ : {}

let app
let db
let storage
let auth
let googleProvider
let firebaseInitError = ''

function normEnv(v) {
  if (v == null) return ''
  const s = String(v).trim()
  if (!s || /^undefined$/i.test(s) || /^null$/i.test(s)) return ''
  return s
}

function readFirebaseEnv() {
  const env = import.meta.env
  const b = TST_FB_BUILD && typeof TST_FB_BUILD === 'object' ? TST_FB_BUILD : {}
  // authDomain deve essere sempre quello canonico di Firebase (<project>.firebaseapp.com),
  // perché è l'unico redirect URI registrato automaticamente nel client OAuth di Google.
  // Forzarlo all'hostname corrente (es. *.web.app) provoca redirect_uri_mismatch
  // durante l'accesso con Google.
  const configuredAuthDomain = normEnv(
    env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || b.authDomain,
  )
  return {
    apiKey: normEnv(env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || b.apiKey),
    authDomain: configuredAuthDomain,
    projectId: normEnv(env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || b.projectId),
    storageBucket: normEnv(
      env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || b.storageBucket,
    ),
    messagingSenderId: normEnv(
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
        env.FIREBASE_MESSAGING_SENDER_ID ||
        b.messagingSenderId,
    ),
    appId: normEnv(env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || b.appId),
  }
}

const resolvedEnv = readFirebaseEnv()

try {
  const { apiKey, projectId, authDomain, storageBucket, messagingSenderId, appId } = resolvedEnv

  if (apiKey && projectId && authDomain) {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    }
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

    try {
      auth = getAuth(app)
      googleProvider = new GoogleAuthProvider()
    } catch (authErr) {
      firebaseInitError = authErr?.message || String(authErr)
      console.warn('Errore inizializzazione Firebase Auth:', authErr)
    }

    try {
      db = getFirestore(app)
    } catch (dbErr) {
      console.warn('Errore inizializzazione Firestore:', dbErr)
    }

    try {
      storage = getStorage(app)
    } catch (storageErr) {
      console.warn('Errore inizializzazione Firebase Storage:', storageErr)
    }
  } else if (apiKey && projectId && !authDomain) {
    firebaseInitError =
      'VITE_FIREBASE_AUTH_DOMAIN mancante o vuoto: deve essere tipo tuo-progetto.firebaseapp.com'
  }
} catch (err) {
  firebaseInitError = err?.message || String(err)
  console.warn('Firebase non configurato o errore di inizializzazione:', err)
}

const isFirebaseAuthConfigured = Boolean(auth && googleProvider)

export { db, storage, auth, googleProvider, firebaseInitError, isFirebaseAuthConfigured }
