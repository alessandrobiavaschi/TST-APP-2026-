import React from 'react'

/**
 * Apertura unica delle stanze del report: occhiello numerico, titolo, sommario
 * e, se presente, il testo introduttivo della stanza (children).
 * Un solo asse di allineamento; su desktop, con un testo introduttivo,
 * titolo e testo si affiancano (vedi .report-room-opening in report-rooms.css).
 * Il sommario arriva da REPORT_GROUPS[].subtitle: è l'unico punto in cui è scritto.
 */
export default function RoomOpening({ step, title, lead, headingId, headingTabIndex, children }) {
  const hasIntro = React.Children.toArray(children).some(Boolean)
  return (
    <div className={`report-room-opening${hasIntro ? ' report-room-opening--with-intro' : ''}`}>
      <header className="report-room-header">
        {step ? <span className="report-room-badge">{String(step).padStart(2, '0')}</span> : null}
        <h2 id={headingId} className="report-room-title" tabIndex={headingTabIndex}>{title}</h2>
        {lead ? <p className="report-room-lead">{lead}</p> : null}
      </header>
      {hasIntro ? children : null}
    </div>
  )
}
