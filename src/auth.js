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
  sendPasswordResetEmail,
  signOut,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  reload,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebaseConfig.js'
import { USERS_COLLECTION } from './firestorePaths.js'

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

function shouldUseGoogleRedirect() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/** Dopo signInWithRedirect: chiama all’avvio app per completare il profilo (onAuthStateChanged aggiorna già la sessione). */
export async function consumeGoogleRedirectResult() {
  if (!auth) return null
  try {
    const result = await getRedirectResult(auth)
    if (result?.user) {
      await ensureUserProfile(result.user)
    }
    return result
  } catch (err) {
    console.warn('getRedirectResult:', err)
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
    throw new Error(
      !auth
        ? 'Firebase non configurato. Aggiungi un file .env con le credenziali (VITE_FIREBASE_* o FIREBASE_*).'
        : 'Provider Google non disponibile. Verifica la configurazione Firebase.',
    )
  }
  if (shouldUseGoogleRedirect()) {
    await signInWithRedirect(auth, googleProvider)
    return null
  }
  const cred = await signInWithPopup(auth, googleProvider)
  await ensureUserProfile(cred.user)
  return cred.user
}

export async function signInWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase non configurato. Aggiungi un file .env con le credenziali.')
  }
  let cred
  try {
    cred = await signInWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw new Error(getEmailPasswordErrorMessage(err))
  }
  if (!cred.user.emailVerified) {
    try {
      await sendEmailVerification(cred.user)
    } catch (verifyErr) {
      console.error('Errore nel reinvio email di verifica:', verifyErr)
    }
    await signOut(auth)
    throw new Error(
      'Per accedere devi prima confermare la tua email. Ti abbiamo appena inviato (o reinviato) il link di verifica.',
    )
  }
  await ensureUserProfile(cred.user)
  return cred.user
}

export async function registerWithEmail(email, password, nome, cognome) {
  if (!auth) {
    throw new Error('Firebase non configurato. Aggiungi un file .env con le credenziali.')
  }
  let cred
  try {
    cred = await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    throw new Error(getEmailPasswordErrorMessage(err))
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
  return { user: cred.user, emailSent: true }
}

export async function requestPasswordReset(email) {
  if (!auth) {
    throw new Error('Firebase non configurato. Aggiungi un file .env con le credenziali.')
  }
  await sendPasswordResetEmail(auth, email)
}

export function getGoogleLoginErrorMessage(err) {
  const code = err?.code || ''
  if (code === 'auth/popup-blocked') {
    return 'Popup bloccato dal browser. Consenti le finestre popup per questo sito e riprova, oppure riprova da smartphone (accesso con reindirizzamento).'
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Accesso annullato. Riprova se desideri accedere con Google.'
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Accesso con Google non abilitato. Nella console Firebase: Authentication → Sign-in method → abilita "Google" e salva.'
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Questo dominio non è autorizzato. In Firebase Console: Authentication → Impostazioni → Domini autorizzati → aggiungi questo sito (es. localhost o il tuo dominio) e salva.'
  }
  if (code === 'auth/configuration-not-found' || code === 'auth/invalid-api-key') {
    return 'Configurazione Firebase non valida. Controlla il file .env (VITE_FIREBASE_AUTH_DOMAIN deve essere tipo tuo-progetto.firebaseapp.com).'
  }
  return err?.message || "Errore durante l'accesso con Google."
}

function getPasswordChangeErrorMessage(err) {
  const code = err?.code || ''
  if (code === 'auth/requires-recent-login') {
    return 'Per sicurezza devi confermare la password attuale, poi riprova.'
  }
  if (code === 'auth/weak-password') {
    return 'La nuova password è troppo debole. Usa almeno 6 caratteri, meglio se complessa.'
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Password attuale non corretta.'
  }
  return err?.message || 'Impossibile aggiornare la password. Riprova.'
}

export function userHasPasswordProvider(user) {
  if (!user?.providerData?.length) return false
  return user.providerData.some((p) => p.providerId === 'password')
}

/**
 * Riautentica con email/password e imposta la nuova password.
 */
export async function changeAccountPassword(user, currentPassword, newPassword) {
  if (!auth || !user?.email) {
    throw new Error('Operazione non disponibile.')
  }
  if (!userHasPasswordProvider(user)) {
    throw new Error(
      'Questo account non usa una password (es. solo Google). Imposta una password dalla console Firebase o usa il reset via email.',
    )
  }
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, newPassword)
    await reload(user)
  } catch (err) {
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
