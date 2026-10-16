import React from 'react'
import { createPortal } from 'react-dom'
import { useLoaderVisibility } from '../../hooks/useLoaderVisibility.js'
import '../../styles/tst-loader.css'

/**
 * Loader standard dell'app (tre barre animate).
 *
 * - variant="overlay": copre l'intera area visibile e blocca le interazioni
 *   da subito; l'animazione compare solo se l'attesa supera la soglia comune.
 * - variant="inline": occupa solo l'area della sezione che sta caricando.
 * - tone="light" | "dark": si adatta a pagine chiare o al cielo notturno.
 * - onRetry: se presente, dopo un'attesa insolita mostra il pulsante "Riprova".
 *   Non passarlo dove ricaricare farebbe perdere dati (es. salvataggio test).
 */
function TstLoader({
  active = true,
  variant = 'overlay',
  tone = 'light',
  label = 'Caricamento in corso',
  color,
  slowMessage = 'Sta impiegando più del previsto.',
  onRetry,
  retryLabel = 'Riprova',
  timing,
  className = '',
}) {
  const { visible, slow, pending } = useLoaderVisibility(active, timing)
  if (!pending) return null

  const classes = [
    'tst-loader',
    `tst-loader--${variant === 'inline' ? 'inline' : 'overlay'}`,
    `tst-loader--${tone === 'dark' ? 'dark' : 'light'}`,
    visible ? 'is-visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const node = (
    <div
      className={classes}
      style={color ? { '--tst-loader-color': color } : undefined}
      role="status"
      aria-live="polite"
      aria-busy={active ? 'true' : 'false'}
    >
      <span className="tst-loader__bars" aria-hidden="true" />
      <span className="tst-loader__sr">{label}</span>
      {visible && slow ? (
        <div className="tst-loader__slow">
          <p className="tst-loader__slow-text">{slowMessage}</p>
          {onRetry ? (
            <button type="button" className="nav-button secondary" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (variant !== 'inline' && typeof document !== 'undefined') {
    return createPortal(node, document.body)
  }
  return node
}

export default TstLoader
