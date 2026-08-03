import React from 'react'

const RADAR_FAMIGLIE = [
  { subject: 'Malinconica', key: 'blu', color: '#3b82f6' },
  { subject: 'Marziale', key: 'rosso', color: '#ef4444' },
  { subject: 'Entusiasta', key: 'giallo', color: '#eab308' },
  { subject: 'Flemmatica', key: 'verde', color: '#22c55e' },
  { subject: 'Razionale', key: 'grigio', color: '#6b7280' },
]

const MATRICE_HEADERS = [
  { key: 'blu', label: 'Malinconica' },
  { key: 'rosso', label: 'Marziale' },
  { key: 'verde', label: 'Flemmatica' },
  { key: 'giallo', label: 'Entusiasta' },
  { key: 'grigio', label: 'Razionale' },
]

/** Abbreviazioni leggibili nelle metriche delle card */
const MATRICE_SHORT = {
  blu: 'Mal',
  rosso: 'Mar',
  verde: 'Fle',
  giallo: 'Ent',
  grigio: 'Raz',
}

const FAMILY_DISPLAY_BY_STORED_DISPOSITION = {
  malinconia: 'Malinconica',
  volitivita: 'Marziale',
  calma: 'Flemmatica',
  entusiasmo: 'Entusiasta',
  anaffettivita: 'Razionale',
}

function displayFamilyFromStoredDisposition(value) {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return FAMILY_DISPLAY_BY_STORED_DISPOSITION[key] || String(value || '').trim()
}

/**
 * Vista archivio solo mobile: elenco schede, niente drag né tabella wide.
 * I colori delle famiglie seguono RADAR_FAMIGLIE (stesso modulo ResultsPage).
 */
function ResultsArchiveMobile({
  records,
  aree,
  filteredRecords,
  filterOptions,
  nameFilter,
  setNameFilter,
  ageMin,
  setAgeMin,
  ageMax,
  setAgeMax,
  dispFilter,
  setDispFilter,
  sottodispFilter,
  setSottodispFilter,
  portatoEspFilter,
  setPortatoEspFilter,
  resultsMobileFilterCount,
  mobileLocusSelectValue,
  onMobileLocusChange,
  mobileLocusSelectId,
  showTrash,
  selectedAreaId,
  selectedAreaName,
  editingAreaId,
  setEditingAreaId,
  editingAreaName,
  setEditingAreaName,
  loading,
  loadError,
  openReport,
  getPortatoDominant,
  formatDateShort,
  handleAssignTestToArea,
  assigningAreaId,
  handleMoveToTrash,
  handleRestoreFromTrash,
  handleDeleteRecord,
  handleAddArea,
  handleRenameArea,
  handleDeleteArea,
  setSelectedAreaId,
  setShowTrash,
  downloadCsvFromRecords,
  downloadJsonFromRecords,
  downloadFilename,
  downloadJsonFilename,
  setShowImportModal,
}) {
  const familyColor = (key) => RADAR_FAMIGLIE.find((f) => f.key === key)?.color || '#64748b'

  return (
    <section className="results-archive-mobile" aria-label="Archivio risultati, vista mobile">
      <div className="results-archive-mobile-locus">
        <label className="results-archive-mobile-label" htmlFor={mobileLocusSelectId}>
          Vista corrente
        </label>
        <select
          id={mobileLocusSelectId}
          className="results-archive-mobile-select results-archive-mobile-select--locus"
          value={mobileLocusSelectValue}
          onChange={onMobileLocusChange}
        >
          <option value="__archive__">
            Archivio totale ({records.filter((r) => !r.raw.In_Cestino).length})
          </option>
          {aree.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}{' '}
              (
              {records.filter((r) => (r.raw.areaId || null) === area.id && !r.raw.In_Cestino).length}
              )
            </option>
          ))}
          <option value="__trash__">Cestino ({records.filter((r) => r.raw.In_Cestino).length})</option>
        </select>
        <p className="results-archive-mobile-locus-caption">
          {showTrash
            ? 'Dal cestino puoi ripristinare o eliminare.'
            : selectedAreaId
              ? `Stai vedendo solo i test nella cartella «${selectedAreaName || 'area'}».`
              : 'Archivio con tutti i protocolli non nel cestino.'}
        </p>
      </div>

      <details className="results-archive-mobile-details">
        <summary className="results-archive-mobile-details-summary">
          Gestisci cartelle
          <span className="results-archive-mobile-details-hint">aree · rinomina</span>
        </summary>
        <div className="results-archive-mobile-folders-panel">
          <p className="results-archive-mobile-folders-lede">
            Su mobile usa il menu Cartella su ogni scheda per spostare un protocollo.
            Riordino trascinando le cartelle è pensato per desktop.
          </p>
          <button type="button" className="nav-button secondary results-archive-mobile-new-area" onClick={handleAddArea}>
            + Nuova area
          </button>
          <ul className="results-archive-mobile-area-list" aria-label="Aree personalizzate">
            {aree.map((area) => {
              const count = records.filter(
                (r) => (r.raw.areaId || null) === area.id && !r.raw.In_Cestino,
              ).length
              const isEditing = editingAreaId === area.id
              return (
                <li
                  key={area.id}
                  className={`results-archive-mobile-area-row ${selectedAreaId === area.id && !showTrash ? 'is-active' : ''}`}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      className="results-archive-mobile-rename-input"
                      value={editingAreaName}
                      onChange={(e) => setEditingAreaName(e.target.value)}
                      onBlur={() => {
                        if (editingAreaName.trim()) handleRenameArea(area.id, editingAreaName)
                        setEditingAreaId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingAreaName.trim()) handleRenameArea(area.id, editingAreaName)
                          setEditingAreaId(null)
                        }
                        if (e.key === 'Escape') {
                          setEditingAreaName(area.name)
                          setEditingAreaId(null)
                        }
                      }}
                      aria-label={`Rinomina ${area.name}`}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="results-archive-mobile-area-select"
                      onClick={() => {
                        setSelectedAreaId(area.id)
                        setShowTrash(false)
                      }}
                    >
                      <span className="results-archive-mobile-area-name">{area.name}</span>
                      <span className="results-archive-mobile-area-count">{count}</span>
                    </button>
                  )}
                  <div className="results-archive-mobile-area-actions">
                    <button
                      type="button"
                      className="results-archive-mobile-icon-btn"
                      onClick={() => {
                        setEditingAreaId(area.id)
                        setEditingAreaName(area.name)
                      }}
                      aria-label={`Rinomina ${area.name}`}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="results-archive-mobile-icon-btn results-archive-mobile-icon-btn--danger"
                      onClick={() => handleDeleteArea(area.id)}
                      aria-label={`Elimina area ${area.name}`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </details>

      <details className="results-archive-mobile-details">
        <summary className="results-archive-mobile-details-summary">
          Filtri
          {resultsMobileFilterCount > 0 && (
            <span className="results-archive-mobile-filter-badge">{resultsMobileFilterCount}</span>
          )}
        </summary>
        <div className="results-archive-mobile-filters-panel">
          <div className="results-archive-mobile-field">
            <label htmlFor="results-mob-name">Nome / Cognome</label>
            <input
              id="results-mob-name"
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Cerca…"
              autoComplete="off"
            />
          </div>
          <div className="results-archive-mobile-field results-archive-mobile-field--age">
            <span className="results-archive-mobile-label-inline">Età</span>
            <div className="results-archive-mobile-age-row">
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="Min"
                min="0"
                aria-label="Età minima"
              />
              <span className="results-archive-mobile-age-dash">–</span>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="Max"
                min="0"
                aria-label="Età massima"
              />
            </div>
          </div>
          <div className="results-archive-mobile-field">
            <label htmlFor="results-mob-disp">Famiglia prevalente</label>
            <select
              id="results-mob-disp"
              value={dispFilter}
              onChange={(e) => setDispFilter(e.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.disposizioni.map((option) => (
                <option key={option} value={option}>
                  {displayFamilyFromStoredDisposition(option)}
                </option>
              ))}
            </select>
          </div>
          <div className="results-archive-mobile-field">
            <label htmlFor="results-mob-sotto">Sfumatura prevalente</label>
            <select
              id="results-mob-sotto"
              value={sottodispFilter}
              onChange={(e) => setSottodispFilter(e.target.value)}
            >
              <option value="">Tutte</option>
              {filterOptions.sottodisposizioni.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="results-archive-mobile-field">
            <label htmlFor="results-mob-pe">Portato esperienziale prevalente</label>
            <select
              id="results-mob-pe"
              value={portatoEspFilter}
              onChange={(e) => setPortatoEspFilter(e.target.value)}
            >
              <option value="">Tutti</option>
              {filterOptions.portati.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>

      <div className="results-archive-mobile-toolbar">
        <button
          type="button"
          className="nav-button secondary"
          onClick={() => downloadCsvFromRecords(filteredRecords, downloadFilename)}
          disabled={!filteredRecords.length}
        >
          Scarica CSV
        </button>
        <button
          type="button"
          className="nav-button secondary"
          onClick={() => downloadJsonFromRecords(filteredRecords, downloadJsonFilename)}
          disabled={!filteredRecords.length}
          title="Stessi dati del CSV in JSON (re-import)"
        >
          Esporta JSON
        </button>
        <button type="button" className="nav-button primary" onClick={() => setShowImportModal(true)}>
          Importa
        </button>
      </div>

      <div className="results-archive-mobile-list-wrap">
        {loading ? (
          <p className="results-archive-mobile-status">Caricamento risultati…</p>
        ) : loadError ? (
          <p className="results-error results-archive-mobile-status">{loadError}</p>
        ) : !filteredRecords.length ? (
          <p className="results-empty-message results-archive-mobile-status">
            {showTrash ? 'Nessun risultato nel cestino.' : 'Nessun protocollo corrisponde ai filtri o la vista è vuota.'}
          </p>
        ) : (
          <ul className="results-archive-mobile-card-list">
            {filteredRecords.map((r) => {
              const portato = getPortatoDominant(r.raw)
              const portatoLabel =
                portato === 'simpatia'
                  ? 'Simpatia'
                  : portato === 'antipatia'
                    ? 'Antipatia'
                    : portato === 'indifferenza'
                      ? 'Indifferenza'
                      : '—'
              const inTrash = !!r.raw.In_Cestino

              return (
                <li key={r.id}>
                  <article
                    className="results-archive-mobile-card"
                    onClick={() => openReport(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        openReport(r)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Apri report per ${r.raw.Nome || ''} ${r.raw.Cognome || ''}`}
                  >
                    <div className="results-archive-mobile-card-top">
                      <div className="results-archive-mobile-card-identity">
                        <h3 className="results-archive-mobile-card-name">
                          {(r.raw.Nome || '').trim()} {(r.raw.Cognome || '').trim()}
                        </h3>
                        <div className="results-archive-mobile-card-meta">
                          <span>{r.age != null ? `${r.age} anni` : 'Età —'}</span>
                          <span aria-hidden="true">
                            ·
                          </span>
                          <span>{formatDateShort(r.raw.Data_Ora_Fine_Test)}</span>
                          <span
                            className={`results-archive-mobile-pill ${r.raw.Bozza_Test ? 'is-draft' : 'is-done'}`}
                          >
                            {r.raw.Bozza_Test ? 'Bozza' : 'Consegnato'}
                          </span>
                        </div>
                        {!!(r.raw.Strumento_Suonato || '').trim() && (
                          <p className="results-archive-mobile-card-instrument">
                            Strumento: {r.raw.Strumento_Suonato}
                          </p>
                        )}
                      </div>
                    </div>

                    <dl className="results-archive-mobile-dl">
                      <div>
                        <dt>Famiglia</dt>
                        <dd>{displayFamilyFromStoredDisposition(r.raw.Disposizione_Prevalente) || '—'}</dd>
                      </div>
                      <div>
                        <dt>Sfumatura</dt>
                        <dd>{r.raw.Sottodisposizione_Prevalente || '—'}</dd>
                      </div>
                      <div>
                        <dt>Portato esp.</dt>
                        <dd>{r.raw.Portato_Esperienziale_Prevalente || '—'}</dd>
                      </div>
                      <div>
                        <dt>PE (score)</dt>
                        <dd>{portatoLabel}</dd>
                      </div>
                    </dl>

                    <div className="results-archive-mobile-matrix" aria-label="Punteggi per famiglia colore">
                      {MATRICE_HEADERS.map((h) => (
                        <div
                          key={h.key}
                          className="results-archive-mobile-matrix-cell"
                          style={{ borderColor: familyColor(h.key) }}
                        >
                          <span className="results-archive-mobile-matrix-abbr">{MATRICE_SHORT[h.key]}</span>
                          <span className="results-archive-mobile-matrix-val">{r.totals[h.key]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="results-archive-mobile-card-footer" onClick={(e) => e.stopPropagation()}>
                      <label className="results-archive-mobile-folder-label">
                        <span className="results-archive-mobile-folder-label-text">Cartella</span>
                        <select
                          className="results-area-select results-archive-mobile-folder-select"
                          value={r.raw.areaId || ''}
                          onChange={(e) => handleAssignTestToArea(r.id, e.target.value || null)}
                          disabled={assigningAreaId === r.id || inTrash}
                          aria-label="Assegna a cartella"
                        >
                          <option value="">Archivio (nessuna)</option>
                          {aree.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="results-archive-mobile-card-actions">
                        <button
                          type="button"
                          className="nav-button primary results-archive-mobile-open-btn"
                          onClick={() => openReport(r)}
                        >
                          Apri report
                        </button>
                        <IconEdit compact onClick={() => openReport(r)} />
                        {inTrash ? (
                          <button
                            type="button"
                            className="results-table-icon-btn results-table-icon-btn--edit"
                            onClick={(e) => handleRestoreFromTrash(r.id, e)}
                            title="Ripristina"
                            aria-label="Ripristina dal cestino"
                          >
                            ↩
                          </button>
                        ) : null}
                        <IconDelete
                          compact
                          title={inTrash ? 'Elimina definitivamente' : 'Metti nel cestino'}
                          onClick={(e) =>
                            inTrash ? handleDeleteRecord(r.id, e) : handleMoveToTrash(r.id, e)
                          }
                        />
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function IconEdit({ compact, onClick }) {
  return (
    <button
      type="button"
      className={`results-table-icon-btn results-table-icon-btn--edit ${compact ? 'results-archive-mobile-tap-target' : ''}`.trim()}
      onClick={onClick}
      title="Report"
      aria-label="Apri report"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  )
}

function IconDelete({ compact, title, onClick }) {
  return (
    <button
      type="button"
      className={`results-table-icon-btn results-table-icon-btn--delete ${compact ? 'results-archive-mobile-tap-target' : ''}`.trim()}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  )
}

export default ResultsArchiveMobile
