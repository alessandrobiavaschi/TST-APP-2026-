import React from 'react'

const MUSICIAN_ROOMS = [
  { id: 'fm-impronta', label: '1. La tua Impronta', shortLabel: 'Impronta', icon: '✦' },
  { id: 'fm-distanze', label: '2. Le 13 Distanze', shortLabel: '13 Distanze', icon: '𝄞' },
  { id: 'fm-passi', label: '3. I 72 Passi', shortLabel: '72 Passi', icon: '𝄢' },
  { id: 'fm-atlante', label: '4. Atlante Mussida', shortLabel: 'Atlante', icon: '𝄡' },
]

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
                <span className="fm-compass-nav__icon" aria-hidden="true">
                  {room.icon}
                </span>
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
