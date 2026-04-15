# Setup database e account TST

L’app usa **Firebase** come “database”: **Firestore** per salvare i risultati dei test e **Authentication** per gli account operatori. Non serve installare o costruire un altro database.

---

## 1. Creare il progetto Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/) e accedi con Google.
2. **Crea un progetto** (es. “TST 2026”) e segui i passi (Google Analytics opzionale).
3. Nel progetto, apri **Build** → **Authentication** e clicca **Inizia**.
4. Nella scheda **Sign-in method** abilita:
   - **Email/Password** (primo metodo)
   - **Google** (aggiungi e salva)
5. **Domini autorizzati (importante per Google):** Vai in **Authentication** → **Impostazioni** (scheda) → **Domini autorizzati**. Assicurati che ci siano:
   - `localhost` (per sviluppo in locale)
   - Il dominio su cui pubblichi l’app (es. `tuosito.it` o `tuoprogetto.vercel.app`)
   Senza questi, l’accesso con Google darà errore “dominio non autorizzato”.
6. Apri **Build** → **Firestore Database** e clicca **Crea database**:
   - Scegli **Avvia in modalità test** (per sviluppo) oppure **modalità produzione** e poi configura le regole (vedi sotto).
   - Scegli una località (es. `europe-west1`).

---

## 2. Copiare la configurazione nell’app

1. In Firebase Console: **Impostazioni progetto** (icona ingranaggio) → **Le tue app**.
2. Aggiungi un’app **Web** (icona `</>`), registra l’app (nome a piacere).
3. Copia l’oggetto `firebaseConfig` (apiKey, authDomain, projectId, ecc.).
4. Nella cartella del progetto TST apri il file **`.env`** (nella root, accanto a `package.json`).
5. Sostituisci i placeholder con i valori veri, **senza virgolette**:

```env
VITE_FIREBASE_API_KEY=la_tua_api_key
VITE_FIREBASE_AUTH_DOMAIN=tuo-progetto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tuo-progetto
VITE_FIREBASE_STORAGE_BUCKET=tuo-progetto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

6. Riavvia il server di sviluppo (`npm run dev`) dopo aver modificato `.env`.

---

## 3. Regole Firestore (per salvare i test)

In Firebase Console → **Firestore** → **Regole**, puoi usare per sviluppo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /test_risultati/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Così solo utenti **loggati** possono leggere e scrivere nella collezione `test_risultati`. In produzione puoi restringere (es. solo lettura per alcuni ruoli).

---

## 4. Come si crea un account e come si salvano i risultati

- **Creare un account**
  - Dall’app: **Home** → **Area Operatore (Login)** → **Non hai un account? Registrati**.
  - Inserisci email e password: i dati restano su Firebase Authentication.
  - Oppure **Accedi con Google** (se hai abilitato Google in Authentication).

- **Salvataggio risultati**
  - Se sei **loggato** (Area Operatore) e completi un test da **Nuovo Test** (senza usare “Test Libero (Ospite)” come unico accesso), il pulsante **Consegna** salva il test nella collezione Firestore **test_risultati**.
  - Se fai **Test Libero (Ospite)**, la **Consegna** mostra solo il report visivo e **non** salva nulla su Firestore (nessun account, nessun database).

Quindi: per avere risultati salvati e vedere la tabella/matrice in **I Miei Risultati**, devi:
1. Aver configurato Firebase (`.env` con i valori veri).
2. Essere loggato (account operatore).
3. Avere compilato un test (profilazione + 72 step + eventuale Blocco E) e cliccato **Consegna**.

---

## 5. Perché non vedi la matrice (tabella risultati)

La schermata **I Miei Risultati** mostra la tabella (matrice) dei test **solo** se:

1. Firebase è configurato correttamente (`.env` con le chiavi del tuo progetto).
2. In Firestore esiste almeno un documento nella collezione **test_risultati**.

Se vedi **“Nessun risultato trovato con i filtri correnti”** significa di solito che:
- non ci sono ancora test salvati (fai un test da operatore loggato e clicca Consegna), oppure
- i filtri (nome, età, area) escludono tutti i risultati, oppure
- l’app non riesce a connettersi a Firestore (controlla la console del browser e le chiavi in `.env`).

Dopo il primo test salvato, la tabella si popola e puoi cliccare su una riga per aprire il report (fiore, radar, ecc.).

---

## 6. Riepilogo

| Cosa vuoi fare              | Cosa fare |
|----------------------------|-----------|
| “Costruire il database”     | Usare Firestore: crea progetto Firebase, crea database Firestore, compila `.env`. |
| Creare un account          | Area Operatore → Registrati (email/password) o Accedi con Google. |
| Salvare i risultati        | Fai il test da operatore loggato e clicca **Consegna** (non usare solo Test Libero). |
| Vedere la matrice          | Configura Firebase, salva almeno un test da operatore, apri I Miei Risultati. |
