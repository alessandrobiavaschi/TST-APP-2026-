## Esempio di regole Firestore per TST

Queste regole vanno copiate e adattate nella console Firebase del tuo progetto
(`Firestore Database → Regole`) oppure in un file di regole versionato, se lo usi.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Collezione con i risultati dei test (report TST per operatore)
    match /test_risultati/{testId} {
      allow read, update, delete: if isOwner();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.operatoreUid;
    }

    // Collezione con le aree/archivi personali dell'operatore
    match /aree/{areaId} {
      allow read, update, delete: if isAreaOwner();
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.operatoreUid;
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    // Un test può essere letto/modificato solo dal suo proprietario (operatoreUid)
    function isOwner() {
      return isAuthenticated()
        && resource.data.operatoreUid == request.auth.uid;
    }

    // Un'area può essere letta/modificata solo dal suo proprietario (operatoreUid)
    function isAreaOwner() {
      return isAuthenticated()
        && resource.data.operatoreUid == request.auth.uid;
    }
  }
}
```

### Note operative

- Ogni documento della collezione `test_risultati` **deve** contenere il campo
  `operatoreUid` impostato all'`uid` Firebase dell'operatore che ha eseguito o gestisce il test.
- Ogni documento della collezione `aree` **deve** contenere il campo
  `operatoreUid` con lo stesso valore.
- Le query nel codice usano già il filtro:
  - `where('operatoreUid', '==', currentUser.uid)` per caricare solo l'archivio
    dell'account autenticato.

