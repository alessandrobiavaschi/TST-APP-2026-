/**
 * Testi «Il tuo profilo» tracciati alle fonti CPM in docs/fonti-scientifiche/.
 * Ogni campo sostituisce o si fonde col corrispondente in content_report.json.
 * Il campo `lessico` di ogni famiglia deriva dai sostantivi di src/content/paroleTst.js
 * (fonte: PAROLE PER TST — Franco Mussida, 29/08/2026), unica fonte del lessico TST.
 */

import { getSostantiviForFamiglia } from './content/paroleTst.js'

export const PROFILE_PDF_BLOCKS = {
  Grigio: {
    restituzione_caratteri_estesi:
      'Nella famiglia Razionale, le nature Anaffettiva e Distaccata esprimono il piacere del calcolo, della dubbiosità di origine intellettuale e dell’oggettività fisica. Agisce in modo trasversale sulle altre quattro famiglie: può raffreddare l’affetto o, nel versante evoluto, orientare l’intelletto verso saggezza e dedizione.',
    natura_paragrafi: [
      'Da Nord verso Sud si muove un’energia gelida: sul piano emotivo diventa la corrente razionale anaffettiva — colore Grigio scuro — che raffredda e raggela affettivamente.',
      'Nell’Energia Emotiva questa corrente è trasversale: getta la sua ombra sulle quattro macro-aree, sulla linea orizzontale del presente ma con distacco polare — osservazione, non passione. Accanto al polo anaffettivo esiste il versante agnostico-intellettuale evolutivo: saggezza, devozione, dedizione.',
      'È una natura che può abitare il mondo guardandolo da una quota alta e separata: misura, analizza, scompone, ma rischia di non lasciarsi toccare. Nel profilo non va letta solo come freddezza: segnala anche la forza del pensiero quando cerca un ordine davanti alla complessità affettiva.',
      'Quando il pensiero resta collegato al sentire, questa corrente diventa capacità di osservare senza essere travolti. Quando si separa troppo, invece, il dubbio si trasforma in distanza e il mondo emotivo appare banale, eccessivo o poco degno di coinvolgimento.',
    ].join('\n'),
    descrizione_estesa: [
      'La famiglia Razionale si è sedimentata come area autonoma dagli anni Settanta, tra visione religiosa profonda e laicismo che evita di farsi toccare in profondità.',
      'Gli stati d’animo collegati oscillano dall’anaffettivo, apatico, lucido, indifferente fino a saggio, dedito, devoto, beato e illuminato — distanza prudenziale da un lato e possibile saggezza etica dall’altro.',
      'Nel rapporto con sé stesso questo temperamento può produrre una specie di cometa scura: energia dell’Io, ma non luminosa, capace di raggelare invece di alimentare le altre aree affettive. La persona può continuare ad agire, capire, organizzare, ma con minor piacere intimo.',
      'La via evolutiva non è spegnere l’intelletto, bensì orientarlo eticamente: il pensiero diventa allora strumento di dedizione, compassione e cura del vivente. In questa prospettiva la Musica aiuta a ricucire sentire e pensare, riportando temperatura dove il calcolo aveva preso tutto lo spazio.',
    ].join('\n'),
    risorse: [
      'In questa corrente la lucidità e il calcolo possono diventare risorse quando non congelano l’umanità.',
      'Il suo valore più alto sta nella capacità di fare spazio, non solo distanza: sospendere la reazione immediata, guardare i fatti, scegliere con precisione e orientare l’intelletto verso un fine umano.',
      '- Analisi e oggettivazione permettono di vedere fatti al di là delle reazioni emotive immediate.',
      '- Nel versante evolutivo affiorano saggezza, devozione e dedizione costruite con pazienza interiore.',
      '- La Musica può promuovere un’«ecologia dei sentimenti», insegnando alla ragione a custodire la varietà delle nature temperamentali.',
      '- Il dubbio, se resta vivo e non cinico, diventa domanda etica prima dell’azione.',
      '- La distanza può proteggere dall’impulsività e offrire una lettura più ampia dei conflitti.',
    ].join('\n'),
    ombre: [
      'Quando questa corrente si irrigidisce, il distacco emotivo riduce ogni esperienza a calcolo o curiosità superficiale.',
      'Il rischio principale è confondere il controllo con la libertà: si osserva tutto da fuori, ma si perde il contatto con la propria natura senziente e con le conseguenze affettive del proprio agire.',
      '- Un velo di grigio può attenuare Entusiasmo, Flemma e Malinconia, lasciando distacco nichilista.',
      '- Il piacere astratto e intellettuale può indurre ad operare in modo asettico, escludendo le conseguenze affettive dell’agire.',
      '- Diffidenza e «tempo della distrazione» impediscono sedimentazioni affettive profonde.',
      '- La neutralità può diventare svalutazione: nulla sembra abbastanza vivo da meritare presenza.',
      '- La tecnologia o il ragionamento continuo possono alimentare una distrazione che evita l’incontro reale.',
    ].join('\n'),
    lessico: getSostantiviForFamiglia('grigio'),
  },
  Rosso: {
    restituzione_caratteri_estesi:
      'Nella famiglia Marziale emerge il piacere del fare, di realizzare ciò che si desidera, di governarsi e mettersi alla prova. Le nature Volitiva e Collerica prediligono costanza, sincerità e impegno nel qui e ora, con orientamento al presente.',
    natura_paragrafi: [
      'Da Est verso Ovest si muove l’energia che segue l’azione vitale sul percorso del Sole. Sul piano emotivo diventa il flusso Volitivo — colore Rosso —: il piacere del fare, impulso che agisce nel presente.',
      'Nel rapporto con te stesso, chi ama agire sente l’Io come alleato: responsabilità, prove da superare, sicurezza nel qui e ora. Sport e Musica condividono la sincerità dell’emozione autentica; dopo l’adolescenza quel finalizzatore sei tu, governatore di te stesso.',
      'Questa corrente ha una direzione orizzontale e concreta: vuole misurarsi con ostacoli, decisioni, risultati. Non cerca prima di tutto il riparo o l’introspezione, ma il punto in cui l’energia emotiva può diventare gesto efficace.',
      'Nel carattere il Rosso non vive da solo: ha bisogno dei «gregari» interiori — calma, entusiasmo, riflessività — per non trasformare il governo di sé in dominio. Quando dialoga con le altre correnti, la volontà diventa forza organizzatrice e non semplice durezza.',
    ].join('\n'),
    descrizione_estesa: [
      'L’energia dell’Io matura e si mostra pienamente intorno al ventesimo anno: governatore di sé e delle disposizioni diventate carattere. I «gregari» — le altre correnti — contano sulla saldezza e sulla volontà di realizzare il futuro desiderato.',
      'Nella famiglia Marziale convivono due nature: la fermezza volitiva (Rosso) con stabilità, schiettezza, coraggio; la collera (Amaranto) con rabbia e reattività quando il dialogo si inceppa.',
      'Sul piano dell’esperienza emotiva questa natura cerca concretezza, incisività e decisione: stimoli che svegliano, incidono e dichiarano una presenza autentica.',
      'La Musica viene vissuta come campo di prova: ritmo stabile, melodie memorabili, testi chiari, improvvisazione osservata con interesse ma anche bisogno di struttura. Quando l’energia è equilibrata, il Rosso trova nel suono una disciplina vitale; quando si irrigidisce, fatica a lasciarsi andare.',
    ].join('\n'),
    risorse: [
      'In questa corrente l’Io maturo diventa finalizzatore: costanza e responsabilità possono nutrire i «gregari» affettivi senza schiacciarli.',
      'La sua forza migliore non è l’imposizione, ma la capacità di dare direzione: mettere in fila energie diverse, assumersi la responsabilità del passo successivo e trasformare l’intenzione in presenza.',
      '- Stabilità, saldezza, schiettezza e coraggio sostengono un agire chiaro nel presente.',
      '- La saggezza nasce quando non si prende troppo sul serio il «gran governatore»: un po’ di ironia etica evita che la volontà irrigidisca il sentire.',
      '- La Volontà come energia primaria si lega al Rosso e al coraggio di mettersi alla prova.',
      '- Il rapporto con il ritmo può aiutare a ordinare l’impulso senza spegnerlo.',
      '- La sincerità emotiva dello sport e della musica sostiene decisioni più autentiche.',
    ].join('\n'),
    ombre: [
      'Quando questa corrente si irrigidisce, l’Io può «egoizzarsi» e smettere di nutrire i gregari interiori.',
      'Il rischio non è avere forza, ma usarla senza ascolto: la volontà diventa martello, la prova diventa sfida continua e la relazione viene letta solo come ostacolo o conferma.',
      '- La volontà deformata diventa rigidità e ostinazione cieca, incapace di adattarsi o cedere.',
      '- Rabbia e ira esplodono là dove il dialogo è impossibile e l’antipatia è stata a lungo covata.',
      '- Nella fase del «deserto» emotivo si può sentire vuoto dentro pur mantenendo attività esterna intensa.',
      '- La ripetitività o la lentezza possono essere vissute come intralcio invece che come maturazione.',
      '- Il bisogno di governare può far perdere il contributo delle parti più delicate del profilo.',
    ].join('\n'),
    lessico: getSostantiviForFamiglia('rosso'),
  },
  Verde: {
    restituzione_caratteri_estesi:
      'Nella famiglia Flemmatica, le nature Calma Contemplativa e Calma Fisica esprimono il piacere della lentezza, del silenzio, della calma, del riposo e della contemplazione. Predilige il certo, la ripetitività e l’assenza di eccitazione, con orientamento all’«oblio sospeso», il tempo della bonaccia interiore.',
    natura_paragrafi: [
      'Al centro dell’Energia Emotiva domina una qualità calma e contemplativa — come l’occhio del ciclone, bonaccia silenziosa. Sul piano emotivo è la corrente flemmatica, colore Verde, orientata all’«oblio sospeso».',
      'La flemmaticità si forma nel periodo neonatale: riposo, nutrimento, sognare e assaporare sedimentano moderazione, prudenza e gentilezza gratuita. Chi ha propensioni flemmatiche orienta l’energia verso calma ed equilibrio affettivo.',
      'Questa natura non corre verso un altrove: custodisce il tempo, lo rallenta, lo rende abitabile. Nel carattere può apparire come amore per il certo, per la ripetizione buona, per i climi in cui non serve difendersi.',
      'La Flemma ha anche una funzione regolatrice: smussa l’eccesso di collera, raffredda l’agitazione dell’entusiasmo, protegge l’interiorità malinconica quando diventa troppo intensa. È una qualità di riposo, ma anche di cura dello spazio emotivo.',
    ].join('\n'),
    descrizione_estesa: [
      'Il primo periodo d’esistenza lascia la traccia di un piacere impresso nel carattere: tranquillità e moderazione «come il pane» nella vita quotidiana.',
      'La Calma flemmatica si manifesta nella distensione e nel respiro. Gli stati d’animo vanno dal rilassato, calmo, contemplativo fino ad annoiato, pigro, oziante — due versanti della stessa qualità di riposo. La Flemma smussa eccessi di collera, entusiasmo o introspezione troppo intensa.',
      'Nel sentire tende a preferire climi quieti, accoglienti e non aggressivi: atmosfere morbide, pulite e capaci di avvolgere senza ferire, dando forma al suo bisogno di serenità.',
      'Il piacere flemmatico passa spesso dalla continuità più che dalla prestazione: stare dentro un insieme delicato, lasciarsi sostenere dal respiro e dalla calma costante. L’esposizione improvvisa può invece creare imbarazzo perché chiede di uscire dalla discrezione.',
    ].join('\n'),
    risorse: [
      'In questa corrente la calma regola il ritmo interno ed esterno e offre spazio per recuperare stabilità.',
      'La sua ricchezza è rendere il mondo meno urgente: crea un campo protetto in cui il sentire può depositarsi, maturare e non essere costretto a reagire subito.',
      '- Predisposizione a creare climi di protezione e silenzio in cui le cose maturano senza fretta.',
      '- Moderazione, prudenza e gentilezza gratuita nella ricerca di armonia relazionale.',
      '- Funzione equilibratrice che smussa gli eccessi delle altre correnti emotive.',
      '- Sensibilità per atmosfere ampie, spazi distesi e climi interiori che favoriscono il respiro.',
      '- Capacità di stare nel gruppo con discrezione, continuità e cura dell’insieme.',
    ].join('\n'),
    ombre: [
      'Quando questa corrente si irrigidisce, la calma può scivolare in pigrizia o inerzia.',
      'L’ombra nasce quando il riposo smette di rigenerare e diventa difesa da ogni esposizione: il conflitto viene evitato, la scelta rimandata, il desiderio anestetizzato sotto un clima troppo ovattato.',
      '- Il piacere del riposo può diventare ritiro cronico da impegno e confronto.',
      '- L’evitamento eccessivo dei contrasti può portare a rinunciare alla propria volontà.',
      '- Climi armonici troppo ovattati possono diventare anestesia rispetto a emozioni intense da elaborare.',
      '- La discrezione può trasformarsi in difficoltà a esporsi o improvvisare quando serve presenza.',
      '- La ricerca di quiete può diventare fastidio verso ogni suono, ritmo o relazione troppo viva.',
    ].join('\n'),
    lessico: getSostantiviForFamiglia('verde'),
  },
  Giallo: {
    restituzione_caratteri_estesi:
      'Nella famiglia Entusiasta, le nature Gioiosa Solare e Sanguigna Operosa esprimono il piacere del movimento, della curiosità, della scoperta del nuovo e dell’estroversione. Guarda al futuro attraverso slancio vitale, partecipazione e ricerca di bagliori di bellezza.',
    natura_paragrafi: [
      'Da Sud verso Nord si muove un’energia calda: interiormente diventa il flusso dell’Entusiasmo — colore Giallo, continente dell’Entusiasmo — con orientamento al futuro.',
      'Nel pre-infantile il bambino accumula energia da spendere; ritmo e ripetizione guidano un apprendimento rapidissimo. La soddisfazione per i successi, anche piccoli, accende l’Entusiasmo come area affettiva strutturata.',
      'Questa corrente muove l’energia verso fuori: persone, natura, oggetti, attività, novità. Il suo piacere è uscire da sé, fiutare possibilità, provare, associare gesto ed effetto, sentire il mondo come campo aperto.',
      'Nel profilo il Giallo segnala una forza centrifuga: non vuole restare troppo a lungo nel chiuso dell’interiorità, cerca bagliori, movimento e conferme vitali. Quando è ben regolato porta luce anche alle zone più fredde o spente del carattere.',
    ].join('\n'),
    descrizione_estesa: [
      'Nel pre-infantile la curiosità è piacere da esercitare: registra gesti e li associa agli effetti, guidato dal ritmo. La soddisfazione per ciò che si è riusciti a fare accende l’Entusiasmo come continente interiore.',
      'Convivono la Gioia e l’Entusiasmo (stati da Gioioso a Irrefrenabile) e l’Entusiasmo volitivo passionale (Innamorato, Appassionato, Ardente). I climi dell’Entusiasmo sono antidoto all’apatia e al gelo intellettuale.',
      'Nel sentire questa natura tende verso sfumature chiare, luminose e solari: slancio positivo, vivacità e desiderio di muoversi e partecipare con spontaneità.',
      'L’energia è vissuta in azione: il corpo risponde, l’espressione viene naturale, il coinvolgimento non spaventa. Il rischio è annoiarsi quando l’esperienza resta troppo ferma o quando la situazione chiede una riflessione lenta e continuativa.',
    ].join('\n'),
    risorse: [
      'In questa corrente la gioia del movimento spinge a esplorare il mondo con slancio diretto.',
      'Il suo dono è riaccendere il desiderio di contatto: porta calore, curiosità e una fiducia pratica nel fatto che qualcosa di nuovo possa ancora accadere.',
      '- Capacità di contagiare gli altri con entusiasmo, facilitando aggregazione e creatività condivisa.',
      '- Predisposizione a percepire e valorizzare ciò che è nuovo, brillante e vitale.',
      '- Antidoto contro apatia, gelo intellettuale e indifferenza, portando luce e calore.',
      '- Rapporto naturale con ritmo, canto e movimento come canali di espressione immediata.',
      '- Facilità a trasformare un piccolo successo in energia per continuare.',
    ].join('\n'),
    ombre: [
      'Quando questa corrente si irrigidisce, il movimento può diventare dispersione continua di stimoli.',
      'L’ombra compare quando la luce deve restare sempre accesa: il profilo cerca eccitazione continua, evita soste e fatica a dare valore ai tempi lenti in cui dolore, lutto o pensiero chiedono presenza.',
      '- La ricerca di gioia permanente può evitare il contatto con malinconia, lutto o dolore.',
      '- Entusiasmi brevi e intensi possono lasciare momenti di vuoto e disorientamento.',
      '- Divertimento e movimento possono diventare anestetici rispetto a domande più profonde.',
      '- La novità può diventare bisogno di cambiare stimolo prima che l’esperienza maturi.',
      '- Il desiderio di partecipare può spingere a occupare troppo spazio nel gruppo o nel tempo musicale.',
    ].join('\n'),
    lessico: getSostantiviForFamiglia('giallo'),
  },
  Blu: {
    restituzione_caratteri_estesi:
      'Nella famiglia Malinconica, le nature Lunare Introspettiva, Lunare Depressiva, Solare e Nostalgica esprimono il piacere di stare con sé stessi, di osservarsi interiormente e di riflettere su ciò che si è vissuto, con orientamento al passato.',
    natura_paragrafi: [
      'Da Ovest verso Est si fa sentire l’azione riflessa della Luna: sul piano emotivo diventa il flusso Malinconia — continente della Malinconia — con orientamento al passato.',
      'Chi ha propensioni malinconiche orienta l’energia dentro di sé: piacere di riflettere, stare in disparte, non temere la solitudine scelta. La tristezza è un volto della Malinconia, non l’intera corrente: forza riflessiva che illumina l’interno.',
      'Questa natura è centripeta: riporta l’esperienza verso l’atollo interiore, dove ciò che è accaduto può essere rivisto, sentito, rispecchiato. La quantità e qualità di questa energia configurano il modo di abitare memoria, solitudine e profondità.',
      'La Malinconia non va ridotta al dolore: è una luce riflessa che rende percepibile la vita interna. Può far riconoscere ipocrisie, sfumature, risonanze affettive e trasformare la solitudine in luogo di ascolto, non soltanto in chiusura.',
    ].join('\n'),
    descrizione_estesa: [
      'Il sorgere della malinconia si avverte nell’adolescenza: attorno ai nove-dieci anni una «seconda nascita» affettiva, luce riflessa della Luna rispetto al Sole dell’età adulta.',
      'Le correnti BLU articolano la famiglia nelle nature Lunare Introspettiva, Lunare Depressiva, Solare e Nostalgica.',
      'Nel sentire questa natura è sensibile alle sfumature più intime e raccolte: chiaroscuri, profondità emotiva e delicatezza favoriscono un contatto autentico con il mondo interiore.',
      'Il suo sentire si nutre di risonanze interiori capaci di muovere memoria e sentimento: cerca profondità, riflessione e spazi che permettano di sostare con sé stessi senza essere spinti fuori.',
    ].join('\n'),
    risorse: [
      'In questa corrente il piacere dell’introspezione orienta l’energia verso senso, profondità e autenticità.',
      'La sua ricchezza è dare parola e forma al sentire: non accontentarsi della superficie, ma lasciare che memoria, nostalgia e delicatezza diventino strumenti di comprensione.',
      '- La solitudine scelta può essere spazio di ascolto interiore, non punizione.',
      '- La nostalgia, nella forma di saudade, può trasformare la perdita in ricordo e riconoscenza.',
      '- La malinconia solare apre una breccia verso fiducia e compassione mantenendo la delicatezza lunare.',
      '- La sensibilità interiore aiuta a riconoscere identità, sincerità e qualità espressiva.',
      '- La riflessione può restituire senso alle esperienze senza cancellarne la complessità emotiva.',
    ].join('\n'),
    ombre: [
      'Quando questa corrente si irrigidisce, il chiuso dell’interiorità può generare paura dell’inconosciuto e blocco relazionale.',
      'L’ombra nasce quando il rispecchiamento non torna più al mondo: la stanza interiore diventa troppo buia, il passato prende tutto il campo e la solitudine smette di nutrire.',
      '- La tristezza può restare al rimpianto senza passare alla gratitudine.',
      '- Il piacere dell’introspezione può trasformarsi in isolamento eccessivo.',
      '- Si può confondere l’identità con il dolore, fino a sentire la malinconia come unica autenticità affettiva.',
      '- L’eccesso di profondità può rendere faticoso il movimento, la danza o l’esposizione sociale.',
      '- Il giudizio sulla sincerità altrui può diventare chiusura preventiva verso il contatto.',
    ].join('\n'),
    lessico: getSostantiviForFamiglia('blu'),
  },
}
