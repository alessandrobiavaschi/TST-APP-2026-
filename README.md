## Test Temperamentale (TST 2026)

Applicazione React + Vite per la somministrazione del Test Temperamentale (TST), con:

- flusso di test audio guidato in 72 step
- profilazione iniziale della persona
- generazione di report visivi per utente e operatore
- archivio dei test per operatore con aree e esportazione CSV

### Stack tecnico

- React + Vite
- React Router
- Firebase (Auth + Firestore + Storage)
- Framer Motion per animazioni

### Guida UI/UX

Per mantenere la coerenza dell’interfaccia e dell’esperienza utente tra Landing, Test, Report e console operatore, fare riferimento a:

- `GUIDA_UI_UX.md`

Tutte le nuove schermate e le modifiche alla UI dovrebbero partire dai principi e dai pattern descritti in quella guida.
# TST 2026

## Audio locale

I 72 file sorgente restano in `audio/` con nomi descrittivi. `npm run dev` e
`npm run build` creano automaticamente in `public/audio/` gli alias numerici
`1.mp3` ... `72.mp3` usati dall'app. La cartella generata è ignorata da Git;
`VITE_AUDIO_BASE_URL` continua ad avere precedenza quando si usa una CDN.

## Regola metodologica per le parità

Lo schema storico salva una sola disposizione, sottodisposizione e portato
prevalente. In caso di massimo ex aequo viene applicato un criterio deterministico
di ordine dichiarato, non una differenza psicometrica: famiglie `blu, rosso,
verde, giallo, grigio`; sottocorrenti nell'ordine del codice; portato `Simpatia,
Antipatia, Indifferenza`. Nel report la distribuzione resta visibile e la parità
va letta come compresenza, anche se il campo legacy contiene un solo valore.

## Perimetro del report

Il TST descrive le risposte agli stimoli sonori nella singola somministrazione.
Non è uno strumento diagnostico, non sostituisce valutazioni cliniche e non
determina in modo fisso personalità o stato psicologico. Le formulazioni del
report sono ipotesi descrittive interne al modello TST.
