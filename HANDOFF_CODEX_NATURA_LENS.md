# Handoff Codex — Formula narrativa Natura di Base

## Obiettivo

La prima sezione dei Quattro Rapporti racconta ora famiglia, natura, prevalenza,
compresenza e sfumature con regole verificabili. Non modifica lo scoring: usa i
punti, le percentuali e i livelli 1–7 già calcolati dal report.

## Formula

1. Conferma la famiglia prevalente nella lente Natura.
2. Esplicita la natura canonica associata alla famiglia.
3. Misura la prevalenza come distanza percentuale tra prima e seconda famiglia:
   - fino a 10 punti: `certa`;
   - fino a 20: `discreta`;
   - fino a 30: `chiara`;
   - fino a 40: `marcata`;
   - oltre 40: `netta`.
4. Verifica la relazione teorica tra famiglia prevalente e ogni secondaria prima
   di parlare di tensione.
5. Se esiste una coppia in tensione, usa la percentuale della componente opposta
   più presente per graduarla: `leggera`, `moderata`, `significativa`, `marcata`,
   `molto intensa`, con soglie 10/20/30/40.
6. Racconta le componenti 7/6/5 e le sottocorrenti misurabili senza far credere
   che le percentuali delle sottocorrenti debbano sommare a 100.
7. In caso di vero pari punti non assegna arbitrariamente una sola famiglia:
   restituisce un'appartenenza e una natura di base condivise.

## Matrice teorica rilevante

- Flemmatica–Malinconica: modulazione, non opposizione.
- Flemmatica–Marziale: tensione tra pausa e azione.
- Flemmatica–Entusiasta: tensione tra quiete e movimento.
- Marziale–Entusiasta: affinità dinamica.
- Marziale–Malinconica: modulazione tra azione e riflessione.
- Razionale–Marziale e Razionale–Entusiasta: tensione caldo/freddo o slancio/distacco.
- Razionale–Malinconica e Razionale–Flemmatica: attenuazione.

Le regole derivano dai testi canonici in `src/content/famigliaApprofondimento.js`
e `src/content_report.json`. Le coppie non descritte come oppositive non vengono
trasformate automaticamente in tensioni.

La matrice vale per la restituzione della Natura. La Galassia conserva la propria
nozione più ampia di contrasto lessicale, che ha una funzione differente.

## File della modifica

- `src/utils/buildNaturaNarrative.js`
- `src/components/report/QuattroRapporti.jsx`
- `src/styles/quattro-rapporti.css`
- `test/buildNaturaNarrative.test.js`
- `test/reportGraphDataContract.test.js`

## Verifica

- Test specifici per tutte le cinque famiglie e le relative nature.
- Casi 31/23 (`certa`) e 50/15 (`marcata`).
- Flemmatica su Malinconica: modulazione.
- Flemmatica su Marziale: tensione graduata.
- Pari punti distinto dal pari livello grafico dovuto all'arrotondamento.

## Limiti

Questa consegna applica la formula soltanto alla Natura di Base. Le altre tre
lenti potranno riusare le stesse soglie, ma richiedono testi e matrici coerenti
con il significato specifico di ciascun rapporto.
