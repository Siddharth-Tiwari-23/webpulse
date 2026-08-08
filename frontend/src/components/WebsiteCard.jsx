import { useState } from 'react'
import HistoryModal from './HistoryModal'

const STATUS_COLOR = {
  UP: 'var(--clr-up)',
  DOWN: 'var(--clr-down)',
  UNKNOWN: 'var(--clr-unknown)',
}

const STATUS_DOT = {
  UP: '●',
  DOWN: '●',
  UNKNOWN: '○',
}

export default function WebsiteCard({ site, onDelete }) {
  const [showHistory, setShowHistory] = useState(false)

  const color = STATUS_COLOR[site.status] || STATUS_COLOR.UNKNOWN

  return (
    <>
      <div className="site-card">
        {/* Status indicator */}
        <div
          className={`site-status ${site.status?.toLowerCase() || 'unknown'}`}
          style={{ color }}
          title={site.status}
        >
          {STATUS_DOT[site.status] || '○'}
        </div>

        {/* Website information */}
        <div className="site-info">
          <span className="site-name">
            {site.name}
          </span>

          <a
            className="site-url"
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {site.url}
          </a>
        </div>

        {/* Website metadata */}
        <div className="site-meta">
          <span className="meta-chip">
            {site.response_ms != null
              ? `${site.response_ms} ms`
              : '—'}
          </span>

          <span className="meta-chip code">
            {site.status_code ?? '—'}
          </span>

          <span className="meta-time">
            {site.last_checked
              ? new Date(site.last_checked).toLocaleTimeString()
              : 'Not yet checked'}
          </span>
        </div>

        {/* Actions */}
        <div className="site-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowHistory(true)}
          >
            History
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={() => onDelete(site.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          site={site}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  )
}