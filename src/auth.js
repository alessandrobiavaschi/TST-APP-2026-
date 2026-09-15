/**
 * Logica di autenticazione condivisa (Firebase).
 * Usata dalla landing (AuthBox) e da HomePage per evitare duplicazione.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  reload,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebaseConfig.js'
import { USERS_COLLECTION } from './firestorePaths.js'

const GOOGLE_REDIRECT_PENDING_KEY = 'tst_google_redirect_pending'
const GOOGLE_AUTH_DIAGNOSTIC_EVENT = 'tst:google-auth-diagnostic'
const GOOGLE_REDIRECT_HINT_PARAM = 'tst_google_auth'
const DEFAULT_HOME_ROUTE = '/home'

/** Una sola chiamata per caricamento pagina: evita che React StrictMode consumi il risultato due volte. */
let redirectResultPromise = null
let redirectConsumePromise = null

function getRedirectResultOnce() {
  if (!auth) return Promise.resolve(null)
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth)
  }
  return redirectResultPromise
}

async function waitForCurrentAuthUser(maxWaitMs = 2500) {
  if (!auth || typeof window === 'undefined') return null
  if (auth.currentUser) return auth.currentUser

  const deadline = Date.now() + maxWaitMs
  while (Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, 120))
    if (auth.currentUser) return auth.currentUser
  }
  return auth.currentUser || null
}

function clearStaleGoogleRedirectPending() {
  if (typeof window === 'undefined') return
  try {
    const sessionPending = window.sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1'
    const urlHint = hasGoogleRedirectHintInUrl()
    if (!sessionPending) {
      window.localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
      if (urlHint) clearGoogleRedirectHintInUrl()
    }
  } catch {
    // Ignore storage errors.
  }
}

function waitForAuthUserViaObserver(maxWaitMs = 8000) {
  if (!auth) return Promise.resolve(null)
  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise((resolve) => {
    let settled = false
    const finish = (user) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      unsubscribe()
      resolve(user || null)
    }

    const timer = window.setTimeout(() => finish(auth.currentUser || null), maxWaitMs)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) finish(user)
    })
  })
}

function getCanonicalLocalGoogleAuthUrl() {
  if (typeof window === 'undefined') return ''
  try {
    const url = new URL(window.location.href)
    if (url.hostname !== '127.0.0.1' && url.hostname !== '::1') return ''
    url.hostname = 'localhost'
    if (url.pathname === '/') {
      url.searchParams.set('accesso', '1')
    }
    return url.toString()
  } catch {
    return ''
  }
}

function buildAuthResult({
  success,
  user = null,
  message = '',
  code = '',
  needsRedirect = false,
  nextRoute = '',
  emailSent = false,
  requiresEmailVerification = false,
  emailForVerification = '',
}) {
  return {
    success,
    user,
    message,
    code,
    needsRedirect,
    nextRoute,
    emailSent,
    requiresEmailVerification,
    emailForVerification,
  }
}

function buildEmailVerificationMessage(emailAddress, { resent = false } = {}) {
  const normalizedEmail = (emailAddress || '').trim()
  const inboxLine = normalizedEmail
    ? `Controlla la casella di ${normalizedEmail} (anche Spam/Promozioni).`
    : 'Controlla la tua casella email (anche Spam/Promozioni).'

  const firstStep = resent
    ? "Ti abbiamo inviato un nuovo link di conferma: senza verifica email l'accesso non puo essere completato."
    : "Per completare la registrazione devi confermare l'indirizzo email."

  return `${firstStep} ${inboxLine} Dopo il click sul link, torna qui ed esegui il login con le stesse credenziali.`
}

function markGoogleRedirectHintInUrl() {
  if (typeof window === 'undefined') return
  try {
    const nextUrl = new URL(window.location.href)
    nextUrl.searchParams.set(GOOGLE_REDIRECT_HINT_PARAM, '1')
    window.history.replaceState(window.history.state, '', nextUrl.toString())
  } catch {
    // Ignore URL parsing/update failures.
  }
}

function hasGoogleRedirectHintInUrl() {
  if (typeof window === 'undefined') return false
  try {
    const currentUrl = new URL(window.location.href)
    return currentUrl.searchParams.get(GOOGLE_REDIRECT_HINT_PARAM) === '1'
  } catch {
    return false
  }
}

function clearGoogleRedirectHintInUrl() {
  if (typeof window === 'undefined') return
  try {
    const nextUrl = new URL(window.location.href)
    if (!nextUrl.searchParams.has(GOOGLE_REDIRECT_HINT_PARAM)) return
    nextUrl.searchParams.delete(GOOGLE_REDIRECT_HINT_PARAM)
    const normalizedSearch = nextUrl.searchParams.toString()
    const normalizedUrl = `${nextUrl.pathname}${normalizedSearch ? `?${normalizedSearch}` : ''}${nextUrl.hash}`
    window.history.replaceState(window.history.state, '', normalizedUrl)
  } catch {
    // Ignore URL parsing/update failures.
  }
}

function markGoogleRedirectPending() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
  try {
    window.sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
  markGoogleRedirectHintInUrl()
}

export function hasGoogleRedirectPending() {
  if (hasGoogleRedirectHintInUrl()) return true
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1') return true
  } catch {
    // Ignore storage errors.
  }
  return false
}

export function clearGoogleRedirectPending() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
  try {
    window.sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
  clearGoogleRedirectHintInUrl()
}

function getEmailPasswordErrorMessage(err) {
  const code = err?.code || ''
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Credenziali non corrette. Controlla email e password e riprova.'
  }
  if (code === 'auth/invalid-credential') {
    return 'Accesso non riuscito. Le credenziali fornite non sono più valide: effettua nuovamente il login con email e password.'
  }
  if (code === 'auth/email-already-in-use') {
    return 'Esiste già un account con questa email. Prova ad accedere oppure usa un indirizzo diverso.'
  }
  if (code === 'auth/weak-password') {
    return 'La password è troppo debole. Scegli una password di almeno 6 caratteri, meglio se complessa.'
  }
  if (code === 'auth/invalid-email') {
    return 'L\'indirizzo email non è valido. Controlla che sia scritto correttamente (es. nome@esempio.it).'
  }
  return err?.message || 'Si è verificato un errore durante l\'operazione. Riprova più tardi.'
}

async function setSafeAuthPersistence() {
  if (!auth) return
  try {
    await setPersistence(auth, browserLocalPersistence)
  } catch (localErr) {
    const code = localErr?.code || ''
    if (code === 'auth/argument-error') return
    console.warn('setPersistence(browserLocalPersistence) non disponibile:', localErr)
  }

  try {
    await setPersistence(auth, browserSessionPersistence)
  } catch (sessionErr) {
    const code = sessionErr?.code || ''
    if (code === 'auth/argument-error') return
    console.warn('setPersistence(browserSessionPersistence) non disponibile:', sessionErr)
  }
}

/** Dopo signInWithRedirect: chiama all'avvio app prima di onAuthStateChanged. */
export async function consumeGoogleRedirectResult() {
  if (!auth) return null
  if (!redirectConsumePromise) {
    redirectConsumePromise = consumeGoogleRedirectResultImpl()
  }
  return redirectConsumePromise
}

async function consumeGoogleRedirectResultImpl() {
  if (!auth) return null
  const hadPendingRedirect = hasGoogleRedirectPending()
  if (!hadPendingRedirect) {
    clearStaleGoogleRedirectPending()
  }
  try {
    const result = await getRedirectResultOnce()
    if (result?.user) {
      await ensureUserProfile(result.user)
      clearGoogleRedirectPending()
      return result
    }

    if (hadPendingRedirect) {
      const currentUser =
        (await waitForAuthUserViaObserver()) ||
        (await waitForCurrentAuthUser()) ||
        auth.currentUser ||
        null
      if (currentUser) {
        await ensureUserProfile(currentUser)
        clearGoogleRedirectPending()
        return { user: currentUser }
      }

      clearGoogleRedirectPending()
      const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === '::1')
      const redirectErrorMessage = isLocal
        ? "Non siamo riusciti a confermare l'accesso Google dopo il reindirizzamento. Prova di nuovo con «Accedi con Google», oppure apri http://localhost:5173 in Chrome/Safari (non nel pannello interno dell'editor). In Firebase Console verifica che localhost sia tra i domini autorizzati."
        : "Non siamo riusciti a confermare l'accesso Google dopo il reindirizzamento. Safari o le impostazioni del browser potrebbero bloccare lo scambio tra domini: riprova con «Accedi con Google», oppure accedi con email e password."
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(GOOGLE_AUTH_DIAGNOSTIC_EVENT, {
            detail: {
              stage: 'redirect-result-empty',
              code: 'auth/redirect-result-empty',
              message: redirectErrorMessage,
              rawMessage: '',
            },
          }),
        )
      }
    }
    return result
  } catch (err) {
    clearGoogleRedirectPending()
    console.warn('getRedirectResult:', err)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(GOOGLE_AUTH_DIAGNOSTIC_EVENT, {
          detail: {
            stage: 'redirect-result',
            code: err?.code || '',
            message: getGoogleLoginErrorMessage(err),
            rawMessage: err?.message || '',
          },
        }),
      )
    }
    return null
  }
}

export async function ensureUserProfile(user, extra = {}) {
  if (!db || !user) return
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, user.uid),
      {
        email: user.email || '',
        nome: user.displayName || '',
        emailVerified: !!user.emailVerified,
        ...extra,
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (err) {
    console.error('Errore nel salvataggio profilo utente:', err)
  }
}

async function startGoogleRedirectSignIn() {
  await setSafeAuthPersistence()
  markGoogleRedirectPending()
  try {
    await signInWithRedirect(auth, googleProvider)
  } catch (err) {
    clearGoogleRedirectPending()
    throw err
  }
  return buildAuthResult({
    success: true,
    needsRedirect: true,
    message: 'Reindirizzamento al login Google in corso...',
  })
}

export async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    return buildAuthResult({
      success: false,
      message: !auth
        ? 'Firebase non configurato. Aggiungi un file .env con le credenziali (VITE_FIREBASE_* o FIREBASE_*).'
        : 'Provider Google non disponibile. Verifica la configurazione Firebase.',
      code: 'auth/configuration-missing',
    })
  }
  const canonicalLocalUrl = getCanonicalLocalGoogleAuthUrl()
  if (canonicalLocalUrl) {
    window.location.assign(canonicalLocalUrl)
    return buildAuthResult({
      success: true,
      needsRedirect: true,
      message: 'Apro la versione localhost autorizzata per completare l\'accesso Google...',
    })
  }
  // Non fare await prima di signInWithPopup: qualsiasi await invalida il contesto
  // del click utente ("user gesture context") su Safari, causando il blocco del popup.
  setSafeAuthPersistence().catch(() => {})

  // 1. Prova prima con signInWithPopup (risolve i blocchi ITP/cookie cross-origin di Safari e browser WebKit)
  try {
    const cred = await signInWithPopup(auth, googleProvider)
    if (cred?.user) {
      await ensureUserProfile(cred.user)
      clearGoogleRedirectPending()
      return buildAuthResult({
        success: true,
        user: cred.user,
        nextRoute: DEFAULT_HOME_ROUTE,
      })
    }
  } catch (popupErr) {
    const code = popupErr?.code || ''
    // Utente ha chiuso il popup di proposito: non forzare redirect
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return buildAuthResult({
        success: false,
        message: 'Accesso con Google annullato.',
        code,
      })
    }
    // Errori di configurazione / domini: inutile fare redirect
    if (
      code === 'auth/unauthorized-domain' ||
      code === 'auth/operation-not-allowed' ||
      code === 'auth/configuration-not-found'
    ) {
      return buildAuthResult({
        success: false,
        message: getGoogleLoginErrorMessage(popupErr),
        code,
      })
    }
    console.warn('signInWithPopup non riuscito, tento il fallback con signInWithRedirect:', popupErr)
  }

  // 2. Fallback a signInWithRedirect
  try {
    return await startGoogleRedirectSignIn()
  } catch (err) {
    return buildAuthResult({
      success: false,
      message: getGoogleLoginErrorMessage(err),
      code: err?.code || '',
    })
  }
}

export async function signInWithEmail(email, password) {
  if (!auth) {
    return buildAuthResult({
      success: false,
      message: 'Firebase non configurato. Aggiungi un file .env con le credenziali.',
      code: 'auth/configuration-missing',
    })
  }
  await setSafeAuthPersistence()
  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    return buildAuthResult({
      success: false,
      message: getEmailPasswordErrorMessage(err),
      code: err?.code || '',
    })
  }
  let verificationMessage = ''
  if (!cred.user.emailVerified) {
    try {
      await sendEmailVerification(cred.user)
      verificationMessage = buildEmailVerificationMessage(cred.user.email, { resent: true })
    } catch (verifyErr) {
      console.error('Errore nel reinvio email di verifica:', verifyErr)
      verificationMessage = buildEmailVerificationMessage(cred.user.email)
    }
  }
  await ensureUserProfile(cred.user)
  return buildAuthResult({
    success: true,
    user: cred.user,
    nextRoute: DEFAULT_HOME_ROUTE,
    requiresEmailVerification: !cred.user.emailVerified,
    emailForVerification: cred.user.email || '',
    message: verificationMessage,
  })
}

export async function registerWithEmail(email, password, nome, cognome) {
  if (!auth) {
    return buildAuthResult({
      success: false,
      message: 'Firebase non configurato. Aggiungi un file .env con le credenziali.',
      code: 'auth/configuration-missing',
    })
  }
  await setSafeAuthPersistence()
  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    return buildAuthResult({
      success: false,
      message: getEmailPasswordErrorMessage(err),
      code: err?.code || '',
    })
  }
  try {
    await sendEmailVerification(cred.user)
  } catch (verifyErr) {
    console.error('Errore invio email di verifica:', verifyErr)
  }
  await ensureUserProfile(cred.user, {
    nome: (nome || '').trim(),
    cognome: (cognome || '').trim(),
    createdAt: serverTimestamp(),
  })
  return buildAuthResult({
    success: true,
    user: cred.user,
    emailSent: true,
    message: buildEmailVerificationMessage(cred.user.email),
    requiresEmailVerification: true,
    emailForVerification: cred.user.email || '',
  })
}

export async function requestPasswordReset(email) {
  if (!auth) {
    return buildAuthResult({
      success: false,
      message: 'Firebase non configurato. Aggiungi un file .env con le credenziali.',
      code: 'auth/configuration-missing',
    })
  }
  try {
    await sendPasswordResetEmail(auth, email)
    return buildAuthResult({
      success: true,
      message:
        'Se esiste un account con questa email, e stata inviata una mail per reimpostare la password.',
    })
  } catch (err) {
    return buildAuthResult({
      success: false,
      message: err?.message || 'Errore durante la richiesta di reset password.',
      code: err?.code || '',
    })
  }
}

export function getGoogleLoginErrorMessage(err) {
  const code = err?.code || ''
  const withCode = (msg) => (code ? `${msg} [codice: ${code}]` : msg)
  if (code === 'auth/popup-blocked') {
    return withCode(
      'Popup bloccato dal browser. Consenti le finestre popup per questo sito e riprova, oppure riprova da smartphone (accesso con reindirizzamento).',
    )
  }
  if (code === 'auth/popup-closed-by-user') {
    return withCode('Accesso annullato. Riprova se desideri accedere con Google.')
  }
  if (code === 'auth/operation-not-allowed') {
    return withCode(
      'Accesso con Google non abilitato. Nella console Firebase: Authentication -> Sign-in method -> abilita "Google" e salva.',
    )
  }
  if (code === 'auth/unauthorized-domain') {
    return withCode(
      'Questo dominio non è autorizzato. In Firebase Console: Authentication -> Impostazioni -> Domini autorizzati -> aggiungi questo sito (es. localhost, 127.0.0.1 o il tuo dominio) e salva.',
    )
  }
  if (code === 'auth/configuration-not-found' || code === 'auth/invalid-api-key') {
    return withCode(
      'Configurazione Firebase non valida. Controlla il file .env (VITE_FIREBASE_AUTH_DOMAIN deve essere tipo tuo-progetto.firebaseapp.com).',
    )
  }
  if (code === 'auth/web-storage-unsupported') {
    return withCode(
      "Il browser non consente l'accesso allo storage locale. Se sei in modalità privata, prova a uscirne e ripetere il login.",
    )
  }
  if (code === 'auth/operation-not-supported-in-this-environment') {
    return withCode(
      'Questo browser non supporta il popup Google in modo affidabile. Apri il sito in Chrome/Safari esterno oppure abilita i popup per questo sito.',
    )
  }
  if (code === 'auth/network-request-failed') {
    return withCode(
      'Firebase non riesce a contattare i servizi Google Auth. Controlla connessione, VPN/ad-blocker e le eventuali restrizioni della API key Google Cloud per localhost.',
    )
  }
  if (code === 'auth/argument-error') {
    return withCode(
      'Configurazione Auth non valida. Riavvia il dev server dopo aver verificato .env (VITE_FIREBASE_AUTH_DOMAIN deve essere tipo tuo-progetto.firebaseapp.com). Se persiste, prova in Chrome/Safari esterno.',
    )
  }
  return withCode(err?.message || 'Errore durante l\'accesso con Google.')
}

export function getGoogleAuthDiagnosticEventName() {
  return GOOGLE_AUTH_DIAGNOSTIC_EVENT
}

function getPasswordChangeErrorMessage(err) {
  const code = err?.code || ''
  if (code === 'auth/requires-recent-login') {
    return 'Per sicurezza devi confermare la password attuale, poi riprova.'
  }
  if (code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements') {
    return 'La nuova password non rispetta i requisiti di sicurezza. Usa almeno 8 caratteri con una combinazione di maiuscole, minuscole, numeri e almeno un carattere speciale.'
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Password attuale non corretta.'
  }
  if (code === 'auth/user-mismatch') {
    return 'Le credenziali inserite non corrispondono all\'utente attualmente autenticato.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Troppi tentativi falliti. Attendi qualche minuto e riprova.'
  }
  if (code === 'auth/network-request-failed') {
    return 'Problema di rete durante l\'aggiornamento della password. Controlla la connessione e riprova.'
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Operazione non abilitata nel progetto Firebase.'
  }
  if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
    return 'Esiste già un altro account con questa email. Contatta il supporto per unire gli account.'
  }
  if (code === 'auth/provider-already-linked') {
    return 'Questo account ha già una password collegata. Prova con "Aggiorna password".'
  }
  // Codice non mappato: mostra codice + messaggio originale per facilitare la diagnosi.
  const rawCode = code || 'sconosciuto'
  const rawMessage = err?.message || ''
  return `Impossibile aggiornare la password (codice: ${rawCode}). ${rawMessage}`.trim()
}

/**
 * Imposta una password per un account che non ha il provider "password"
 * (es. creato accedendo con Google). Dopo questa operazione si potrà
 * accedere sia con Google sia con email+password, e usare changeAccountPassword.
 */
export async function setAccountPassword(user, newPassword) {
  if (!auth) {
    throw new Error('Operazione non disponibile.')
  }
  await setSafeAuthPersistence()
  const liveUser = auth.currentUser || user
  if (!liveUser?.email) {
    throw new Error('Sessione non valida. Effettua nuovamente il login e riprova.')
  }
  if (userHasPasswordProvider(liveUser)) {
    throw new Error(
      'Questo account ha già una password impostata. Usa "Aggiorna password" per cambiarla.',
    )
  }
  try {
    try {
      await reload(liveUser)
    } catch (reloadErr) {
      console.warn('[setAccountPassword] reload fallito:', reloadErr)
    }
    const credential = EmailAuthProvider.credential(liveUser.email, newPassword)
    await linkWithCredential(liveUser, credential)
    await reload(liveUser)
  } catch (err) {
    console.error('[setAccountPassword] errore Firebase:', {
      code: err?.code,
      message: err?.message,
      customData: err?.customData,
      raw: err,
    })
    throw new Error(getPasswordChangeErrorMessage(err))
  }
}

export function userHasPasswordProvider(user) {
  if (!user?.providerData?.length) return false
  return user.providerData.some((p) => p.providerId === 'password')
}

/**
 * Riautentica con email/password e imposta la nuova password.
 * Usa auth.currentUser come fonte di verità: su iOS Safari l'oggetto user
 * propagato via React context può diventare stantio dopo eventi di refresh token.
 */
export async function changeAccountPassword(user, currentPassword, newPassword) {
  if (!auth) {
    throw new Error('Operazione non disponibile.')
  }
  await setSafeAuthPersistence()
  const liveUser = auth.currentUser || user
  if (!liveUser?.email) {
    throw new Error('Sessione non valida. Effettua nuovamente il login e riprova.')
  }
  if (!userHasPasswordProvider(liveUser)) {
    throw new Error(
      'Questo account non usa una password (es. solo Google). Imposta una password dalla console Firebase o usa il reset via email.',
    )
  }
  try {
    try {
      await reload(liveUser)
    } catch (reloadErr) {
      console.warn('[changeAccountPassword] reload prima della reauth fallita:', reloadErr)
    }
    const credential = EmailAuthProvider.credential(liveUser.email, currentPassword)
    await reauthenticateWithCredential(liveUser, credential)
    await updatePassword(liveUser, newPassword)
    await reload(liveUser)
  } catch (err) {
    console.error('[changeAccountPassword] errore Firebase:', {
      code: err?.code,
      message: err?.message,
      customData: err?.customData,
      raw: err,
    })
    throw new Error(getPasswordChangeErrorMessage(err))
  }
}

/**
 * Aggiorna displayName su Firebase Auth e allinea il documento users.
 */
export async function updateUserDisplayName(user, displayName) {
  if (!user) throw new Error('Nessun utente autenticato.')
  const trimmed = (displayName || '').trim()
  try {
    await updateProfile(user, { displayName: trimmed || null })
    await reload(user)
  } catch (err) {
    throw new Error(err?.message || 'Impossibile aggiornare il nome visualizzato.')
  }
  await ensureUserProfile(user, { nome: trimmed })
}

if (typeof window !== 'undefined') {
  clearStaleGoogleRedirectPending()
}
