## Test di sicurezza: separazione archivi per account

Questa checklist serve per verificare che gli archivi dei risultati TST
restino separati per ogni account operatore, come una cassaforte personale.

### 1. Preparazione

- Crea **due account distinti** nello stesso progetto Firebase:
  - Account A (es. `operatore-a@example.com`)
  - Account B (es. `operatore-b@example.com`)
- Assicurati che siano **account diversi**, non alias collegati allo stesso UID.

### 2. Verifica con l’account A

1. Accedi all’app con l’account A.
2. Vai in `Nuovo Test` e completa almeno un test fino alla consegna.
3. Vai in `Risultati`:
   - Verifica che nella tabella compaiano solo i test fatti con l’account A.
   - (Opzionale) Scarica la matrice CSV:
     - Il file deve contenere solo le righe relative ai test dell’account A.

### 3. Verifica con l’account B

1. Esegui il **logout** dall’account A.
2. Accedi con l’account B.
3. Vai in `Risultati`:
   - Se non hai ancora fatto test con B, l’archivio deve risultare **vuoto**.
4. Esegui uno o più test con l’account B e consegnali.
5. Torna in `Risultati` con l’account B:
   - Devono comparire solo i test fatti con B.
   - I test creati dall’account A **non devono mai comparire**.
6. Scarica la matrice CSV dall’account B:
   - Anche qui devono comparire solo le righe dei test dell’account B.

### 4. Verifiche aggiuntive

- Prova a cambiare area/archivio nelle sidebar di `Risultati`:
  - Le aree create con A non devono essere visibili quando sei loggato come B e viceversa.
- Controlla sulla console Firestore che:
  - Ogni documento di `test_risultati` abbia il campo `operatoreUid` impostato all’UID dell’account corretto.
  - Le regole siano allineate all’esempio in `FIRESTORE_RULES_EXAMPLE.md`.

