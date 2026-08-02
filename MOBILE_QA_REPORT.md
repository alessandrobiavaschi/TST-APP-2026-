# Mobile QA report — Report TST

## Configurazione verificata

- Worktree: `/Users/alessandrobiavaschi/Downloads/TST 2026 cursor-codex`
- Branch: `ai/codex`
- Pagina: `/risultati/report?qa-mobile=1`
- Browser: browser integrato, ispezione responsive e screenshot durante la sessione
- Dati: fixture DEV deterministica; nessuna route o azione di produzione aggiunta

## Matrice viewport

| Viewport | Overflow documento | Testo mobile | Grafici | Navigazione | Layout/spazi | Esito |
| --- | --- | --- | --- | --- | --- | --- |
| 320x568 | Nessuno, 320/320px | PASS | 340px, non tagliati | 4 azioni | Una colonna | PASS |
| 375x667 | Nessuno, 375/375px | PASS | 340px, non tagliati | 4 azioni | Una colonna | PASS |
| 390x844 | Nessuno, 390/390px | PASS | 340px, non tagliati | 4 azioni | Natura leggibile | PASS |
| 430x932 | Nessuno, 430/430px | PASS | 340px, non tagliati | 4 azioni | Nessun vuoto rigido | PASS |
| 768x1024 | Nessuno, 768/768px | PASS | 340px, fluidi | 4 azioni | Griglie impilate | PASS |
| 1440x900 | Nessuno, 1440/1440px | Desktop invariato | Dimensioni desktop | Rail desktop | Layout desktop | PASS |

## Controlli funzionali e visivi

- Nessun overflow orizzontale del documento.
- Nessun titolo o testo tagliato dal viewport.
- Corpo mobile minimo 16px con line-height almeno 1.5.
- Nessun testo mobile sotto 12px.
- Container strutturali comprimibili e griglie mobile a una colonna.
- Metriche impilate e leggibili.
- Hero mobile ridotta e CTA raggiungibile.
- Bottom navigation non sovrapposta al contenuto e limitata a quattro azioni.
- Scarica e Aiuto disponibili nel menu secondario.
- Tab della sezione Natura leggibili, con etichette complete.
- Nessuno spazio vuoto anomalo nella Natura; rimossi vincoli rigidi.
- Grafici Recharts/SVG adattivi, altezza mobile 340px e valori visibili senza hover.
- Istruzioni mobile espresse in termini di tocco, senza copy basato sul cursore.
- Quattro Rapporti utilizzabile a 320px e su tablet.
- Desktop a 1440x900 senza regressioni rilevate.
- Console pulita: nessun errore, warning React o warning Recharts.

Nota: gli elementi di menu chiusi tramite transform e alcuni nodi interni SVG possono avere coordinate geometriche fuori dal viewport, ma il documento mantiene sempre `scrollWidth === clientWidth`; non costituiscono overflow navigabile.

## Verifiche automatiche

```text
npm run lint   PASS
npm test       PASS (37/37)
npm run build  PASS (1225 moduli)
```

## Esito complessivo

PASS. Nessun problema residuo bloccante rilevato nei viewport richiesti.
