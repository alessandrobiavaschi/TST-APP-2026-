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
  signOut,
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

function isSafariBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const isSafari = /Safari/i.test(ua)
  const isOtherWebkitBrowser = /(Chrome|CriOS|Chromium|Edg|OPR|Firefox|FxiOS)/i.test(ua)
  return isSafari && !isOtherWebkitBrowser
}

function isLocalhostRuntime() {
  if (typeof window === 'undefined') return false
  const hostname = window.location?.hostname || ''
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

function isGoogleAuthHardFailure(code) {
  return (
    code === 'auth/operation-not-allowed' ||
    code === 'auth/unauthorized-domain' ||
    code === 'auth/configuration-not-found' ||
    code === 'auth/invalid-api-key'
  )
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
    if (window.localStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1') return true
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
  try {
    return window.sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY) === '1'
  } catch {
    return false
  }
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
  try {
    await setPersistence(auth, browserLocalPersistence)
    return
  } catch (localErr) {
    // On iOS/private mode local persistence may fail (storage restrictions).
    console.warn('setPersistence(browserLocalPersistence) non disponibile:', localErr)
  }

  try {
    await setPersistence(auth, browserSessionPersistence)
  } catch (sessionErr) {
    // Last resort is SDK default in-memory session.
    console.warn('setPersistence(browserSessionPersistence) non disponibile:', sessionErr)
  }
}

/** Dopo signInWithRedirect: chiama all'avvio app per completare il profilo (onAuthStateChanged aggiorna già la sessione). */
export async function consumeGoogleRedirectResult() {
  if (!auth) return null
  const hadPendingRedirect = hasGoogleRedirectPending()
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      await ensureUserProfile(result.user)
      clearGoogleRedirectPending()
    } else if (hadPendingRedirect) {
      const currentUser = auth.currentUser || null
      if (currentUser) {
        await ensureUserProfile(currentUser)
        clearGoogleRedirectPending()
        return { user: currentUser }
      }
      // Safari ITP o restrizioni di storage hanno impedito a Firebase di recuperare
      // le credenziali OAuth dopo il redirect — getRedirectResult torna null senza
      // lanciare eccezioni. Puliamo il pending per consentire un nuovo tentativo.
      clearGoogleRedirectPending()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent(GOOGLE_AUTH_DIAGNOSTIC_EVENT, {
            detail: {
              stage: 'redirect-result-empty',
              code: 'auth/redirect-result-empty',
              message:
                "Non siamo riusciti a confermare automaticamente l'accesso Google. Riprova una volta. Se sei in locale, verifica che localhost sia tra i domini autorizzati in Firebase Authentication.",
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
  try {
    // Non awaiting setSafeAuthPersistence prima di signInWithPopup: su iOS Safari (e tutti
    // i browser iOS basati su WebKit) qualsiasi await prima di window.open() invalida il
    // "user gesture context", causando il blocco del popup. La persistence viene impostata
    // in background; l'utente impiega almeno qualche secondo a completare il login nel popup,
    // quindi la promise si risolve sempre prima che Firebase abbia bisogno di salvare la sessione.
    setSafeAuthPersistence().catch(() => {})

    // Safari (desktop + iOS WebKit) ha più probabilità di bloccare/invalidare il popup OAuth.
    // In locale però il popup tende a essere più affidabile del redirect: forziamo redirect
    // solo fuori da localhost.
    if (isSafariBrowser() && !isLocalhostRuntime()) {
      markGoogleRedirectPending()
      await signInWithRedirect(auth, googleProvider)
      return buildAuthResult({
        success: true,
        needsRedirect: true,
        message: 'Reindirizzamento al login Google in corso...',
      })
    }

    // Preferiamo popup: su mobile riduce i casi in cui il redirect fallisce per limitazioni
    // di storage/cookie (es. iOS Safari). Se il popup non è disponibile, facciamo fallback a redirect.
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await ensureUserProfile(cred.user)
      return buildAuthResult({
        success: true,
        user: cred.user,
        nextRoute: DEFAULT_HOME_ROUTE,
      })
    } catch (err) {
      const code = err?.code || ''
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        markGoogleRedirectPending()
        await signInWithRedirect(auth, googleProvider)
        return buildAuthResult({
          success: true,
          needsRedirect: true,
          message: 'Reindirizzamento al login Google in corso...',
        })
      }
      // In Safari capita che il popup fallisca con codici non standardizzati (es. internal-error).
      // Se non è un errore di configurazione hard, tentiamo comunque il redirect.
      if (isSafariBrowser() && !isGoogleAuthHardFailure(code)) {
        markGoogleRedirectPending()
        await signInWithRedirect(auth, googleProvider)
        return buildAuthResult({
          success: true,
          needsRedirect: true,
          message: 'Reindirizzamento al login Google in corso...',
        })
      }
      return buildAuthResult({
        success: false,
        message: getGoogleLoginErrorMessage(err),
        code,
      })
    }
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
  if (!cred.user.emailVerified) {
    try {
      await sendEmailVerification(cred.user)
    } catch (verifyErr) {
      console.error('Errore nel reinvio email di verifica:', verifyErr)
    }
    await signOut(auth)
    return buildAuthResult({
      success: false,
      message: buildEmailVerificationMessage(cred.user.email, { resent: true }),
      code: 'auth/email-not-verified',
      requiresEmailVerification: true,
      emailForVerification: cred.user.email || '',
    })
  }
  await ensureUserProfile(cred.user)
  return buildAuthResult({
    success: true,
    user: cred.user,
    nextRoute: DEFAULT_HOME_ROUTE,
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
      'Questo dominio non è autorizzato. In Firebase Console: Authentication -> Impostazioni -> Domini autorizzati -> aggiungi questo sito (es. localhost o il tuo dominio) e salva.',
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
