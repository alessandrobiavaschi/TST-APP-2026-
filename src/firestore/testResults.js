import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { TEST_RESULTS_COLLECTION, TEST_RESULT_USER_ID_FIELD } from '../firestorePaths.js'

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
