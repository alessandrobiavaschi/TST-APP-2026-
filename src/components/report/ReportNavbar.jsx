import React from 'react'

/**
 * Navbar sticky del report.
 * Appare solo dopo lo scroll oltre la hero (controllata via prop `visible`).
 *
 * - Sinistra: logo "TST".
 * - Centro: switch [Report] [Galassia] (cambia la modalità di visualizzazione).
 * - Destra: nome utente, bottone "Scarica" e "?" (apre il modal "Come leggere").
 */
export default function ReportNavbar({
  visible,
  viewMode,
  onViewModeChange,
  userName,
  onDownload,
  onOpenHelp,
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-[90] border-b border-white/10 bg-slate-950/80 backdrop-blur-md transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <span className="select-none text-lg font-extrabold tracking-tight text-white">TST</span>

        <div
          role="tablist"
          aria-label="Modalità di visualizzazione"
          className="flex items-center rounded-full bg-white/10 p-1"
        >
          {[
            { id: 'report', label: 'Report' },
            { id: 'galassia', label: 'Galassia' },
          ].map((tab) => {
            const active = viewMode === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onViewModeChange(tab.id)}
                className={`min-h-[36px] rounded-full px-4 text-sm font-semibold transition ${
                  active
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {userName && (
            <span className="hidden max-w-[10rem] truncate text-sm text-white/80 sm:inline">
              {userName}
            </span>
          )}
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            Scarica
          </button>
          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="Come leggere questo report"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-base font-bold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            ?
          </button>
        </div>
      </div>
    </header>
  )
}
