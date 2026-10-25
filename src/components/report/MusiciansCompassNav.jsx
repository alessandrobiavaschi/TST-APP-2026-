import React from 'react'
import { MUSICIAN_ROOMS } from '../../config/musiciansConfig.js'

export default function MusiciansCompassNav({
  activeRoom = 'fm-impronta',
  onSelectRoom,
  onClose,
  backButtonRef,
  accentColor = '#4ade80',
}) {
  const handleClickRoom = (roomId) => {
    if (onSelectRoom) {
      onSelectRoom(roomId)
    } else {
      const el = document.getElementById(roomId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <nav
      className="fm-compass-nav"
      aria-label="Navigazione stanze musicali"
      style={{ '--compass-accent': accentColor }}
    >
      <div className="fm-compass-nav__inner">
        {onClose && (
          <button
            ref={backButtonRef}
            type="button"
            className="fm-compass-nav__back"
            onClick={onClose}
            aria-label="Torna al report principale"
          >
            <span aria-hidden="true">←</span>
            <span className="fm-compass-nav__back-label">Report</span>
          </button>
        )}

        <div className="fm-compass-nav__rooms" role="tablist">
          {MUSICIAN_ROOMS.map((room) => {
            const isActive = activeRoom === room.id
            return (
              <button
                key={room.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={room.id}
                className={`fm-compass-nav__tab ${isActive ? 'is-active' : ''}`}
                onClick={() => handleClickRoom(room.id)}
              >
                <span className="fm-compass-nav__label-full">{room.label}</span>
                <span className="fm-compass-nav__label-short">{room.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
