// Definizione piatta delle 100 colonne del test TST
// Questa struttura non esegue logica: descrive in modo statico lo schema previsto in Firestore.

/** Collezione descrittiva legacy; i salvataggi reali usano `TEST_RESULTS_COLLECTION` in firestorePaths.js */
export const TEST_COLLECTION = 'tests'

export const testSchema = {
  // Blocco A: Profilazione (1–8)
  ID_Utente: 'string', // 1
  Data_Test: 'string', // 2 (Data somministrazione)
  Nome: 'string', // 3
  Cognome: 'string', // 4
  Data_Nascita: 'timestamp', // 5
  Titolo_Studio: 'string', // 6
  Pratica_Musicale: 'string', // 7 (SI/NO)
  Strumento_Suonato: 'string', // 8

  // Blocco B: Dati Grezzi – 72 risposte (8–79)
  File_01: 'string',
  File_02: 'string',
  File_03: 'string',
  File_04: 'string',
  File_05: 'string',
  File_06: 'string',
  File_07: 'string',
  File_08: 'string',
  File_09: 'string',
  File_10: 'string',
  File_11: 'string',
  File_12: 'string',
  File_13: 'string',
  File_14: 'string',
  File_15: 'string',
  File_16: 'string',
  File_17: 'string',
  File_18: 'string',
  File_19: 'string',
  File_20: 'string',
  File_21: 'string',
  File_22: 'string',
  File_23: 'string',
  File_24: 'string',
  File_25: 'string',
  File_26: 'string',
  File_27: 'string',
  File_28: 'string',
  File_29: 'string',
  File_30: 'string',
  File_31: 'string',
  File_32: 'string',
  File_33: 'string',
  File_34: 'string',
  File_35: 'string',
  File_36: 'string',
  File_37: 'string',
  File_38: 'string',
  File_39: 'string',
  File_40: 'string',
  File_41: 'string',
  File_42: 'string',
  File_43: 'string',
  File_44: 'string',
  File_45: 'string',
  File_46: 'string',
  File_47: 'string',
  File_48: 'string',
  File_49: 'string',
  File_50: 'string',
  File_51: 'string',
  File_52: 'string',
  File_53: 'string',
  File_54: 'string',
  File_55: 'string',
  File_56: 'string',
  File_57: 'string',
  File_58: 'string',
  File_59: 'string',
  File_60: 'string',
  File_61: 'string',
  File_62: 'string',
  File_63: 'string',
  File_64: 'string',
  File_65: 'string',
  File_66: 'string',
  File_67: 'string',
  File_68: 'string',
  File_69: 'string',
  File_70: 'string',
  File_71: 'string',
  File_72: 'string',

  // Blocco C: Portato Esperienziale (80–82)
  PE_Simpatia: 'number', // 80
  PE_Antipatia: 'number', // 81
  PE_Indifferenza: 'number', // 82

  // Blocco D: 12 nature (contatori; nomi e regole in src/config/tstSistema.js)
  BLU_1_Depressiva: 'number', // 83
  BLU_2_Lunare: 'number', // 84
  BLU_3_Nostalgia: 'number', // 85
  BLU_4_Solare: 'number', // 86
  ROSSO_1_Assertivita: 'number', // 87
  ROSSO_2_Dubbio_Collera: 'number', // 88
  VERDE_1_CalmaContemplativa: 'number', // 89
  VERDE_2_CalmaFisica: 'number', // 89b
  GIALLO_1_Gioia_Entusiasmo: 'number', // 90
  GIALLO_2_Volitivo_Passionale: 'number', // 91
  GRIGIO_1_Anaffettiva: 'number', // 92
  GRIGIO_2_Distaccata: 'number', // 92b

  // Blocco E: Feedback Finale allineato al test ufficiale
  Stato_Animo_Finale: 'string', // 94
  Difficolta_Test: 'string', // 95
  Difficolta_Dettaglio: 'string', // 96
  Area_Maggior_Agio: 'string', // 97 (multi-selezione CSV, max 3 codici A-E)
  Area_Minor_Agio: 'string', // 98 (multi-selezione CSV, max 3 codici A-E)
  Disposizione_Prevalente: 'string', // 99 (campo calcolato)
  Sottodisposizione_Prevalente: 'string', // 100 (campo calcolato)
  Portato_Esperienziale_Prevalente: 'string', // 101 (campo calcolato)
  Qualita_Suoni: 'string', // 102
  Osservazioni_Finali: 'string', // Legacy: mantenuto per retrocompatibilita'
  Data_Ora_Fine_Test: 'timestamp', // 103

  // Stato di archiviazione
  In_Cestino: 'boolean',
}

// Facoltativo: helper per inizializzare un documento "vuoto" con valori di default
export const createEmptyTestRecord = () => {
  const base = {}

  Object.keys(testSchema).forEach((key) => {
    const type = testSchema[key]
    if (type === 'number') base[key] = 0
    else if (type === 'boolean') base[key] = false
    else if (type === 'timestamp') base[key] = null
    else base[key] = ''
  })

  return base
}

