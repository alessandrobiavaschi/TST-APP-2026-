import React from 'react'

function SubBlock({ titolo, children }) {
  if (!titolo && !children) return null
  return (
    <div className="tst-faq-reading-notes-block">
      {titolo ? <p className="nuovo-test-section-subtitle">{titolo}</p> : null}
      {children}
    </div>
  )
}

/** Contenuto «Note di lettura» da `content_report.json` — usato dalla FAQ (/tst). */
export default function ReadingNotesBlocks({ notaLettura, impianto }) {
  const titoloNota = notaLettura?.titolo
  const bullets = Array.isArray(notaLettura?.bullets) ? notaLettura.bullets : []

  const mv = impianto?.metodo_validita
  const proto = impianto?.protocollo_somministrazione
  const limiti = impianto?.limiti_interpretativi
  const raz = impianto?.razionale_teorico
  const map = impianto?.mapping_correnti
  const hasTechnical = Boolean(mv || proto || limiti || raz || map)

  if (!hasTechnical && !titoloNota && bullets.length === 0) return null

  const wrapIntro =
    bullets.length === 0 && !titoloNota ? null : (
      <SubBlock titolo={titoloNota || undefined}>
        {bullets.length > 0 ? (
          <ul className="tst-faq-reading-notes-ul">
            {bullets.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : null}
      </SubBlock>
    )

  const leadForFaq = hasTechnical ? (
    <SubBlock titolo="Premesse, limiti e schema interpretativo">
      <p>
        Distingue ciò che è dato osservabile (risposte ai file sonori) da ciò che è ipotesi del modello TST e da
        contenuto divulgativo-metaforico nelle sezioni narrative.
      </p>
    </SubBlock>
  ) : null

  const gridBlocks = hasTechnical ? (
    <>
      {mv ? (
        <SubBlock titolo={mv.titolo}>
          {mv.contenuto ? <p>{mv.contenuto}</p> : null}
          {Array.isArray(mv.evidenze) && mv.evidenze.length > 0 ? (
            <ul className="tst-faq-reading-notes-ul">
              {mv.evidenze.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
        </SubBlock>
      ) : null}

      {proto ? (
        <SubBlock titolo={proto.titolo}>
          {proto.contenuto ? <p>{proto.contenuto}</p> : null}
          {Array.isArray(proto.step) && proto.step.length > 0 ? (
            <ol className="nuovo-test-faq-tutorial-steps">
              {proto.step.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          ) : null}
        </SubBlock>
      ) : null}

      {limiti ? (
        <SubBlock titolo={limiti.titolo}>
          {limiti.contenuto ? <p>{limiti.contenuto}</p> : null}
          {Array.isArray(limiti.punti) && limiti.punti.length > 0 ? (
            <ul className="tst-faq-reading-notes-ul">
              {limiti.punti.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : null}
        </SubBlock>
      ) : null}

      {raz ? (
        <SubBlock titolo={raz.titolo}>
          {raz.contenuto ? <p>{raz.contenuto}</p> : null}
          {Array.isArray(raz.assi) && raz.assi.length > 0 ? (
            <ul className="tst-faq-reading-notes-ul">
              {raz.assi.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : null}
        </SubBlock>
      ) : null}

      {map ? (
        <SubBlock titolo={map.titolo}>
          {map.prefazione ? <p>{map.prefazione}</p> : null}
          {Array.isArray(map.voci) && map.voci.length > 0 ? (
            <ul className="tst-faq-reading-notes-ul tst-faq-reading-notes-ul--compact">
              {map.voci.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          ) : null}
        </SubBlock>
      ) : null}
    </>
  ) : null

  return (
    <div className="tst-faq-reading-notes">
      {wrapIntro}
      {leadForFaq}
      {gridBlocks}
    </div>
  )
}
