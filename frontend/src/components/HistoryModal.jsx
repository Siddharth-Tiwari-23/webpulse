import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function HistoryModal({ site, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchHistory = async () => {
      try {
        setLoading(true)

        const data = await api.getHistory(site.id)

        if (mounted) {
          setLogs(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)

        if (mounted) {
          setLogs([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchHistory()

    return () => {
      mounted = false
    }
  }, [site.id])

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Prevent background page from scrolling
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="history-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="history-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        {/* Modal Header */}
        <div className="history-header">
          <div>
            <h2 id="history-title">
              History — {site.name}
            </h2>

            <p className="history-subtitle">
              Recent health checks
            </p>
          </div>

          <button
            type="button"
            className="history-close"
            onClick={onClose}
            aria-label="Close history"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="history-content">
          {loading ? (
            <div className="modal-empty">
              Loading history…
            </div>
          ) : logs.length === 0 ? (
            <div className="modal-empty">
              No records yet.
            </div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Code</th>
                    <th>Response</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={
                        log.status === 'DOWN'
                          ? 'row-down'
                          : ''
                      }
                    >
                      <td>
                        {log.checked_at
                          ? new Date(
                              log.checked_at
                            ).toLocaleString()
                          : '—'}
                      </td>

                      <td>
                        <span
                          className={`badge badge-${
                            log.status
                              ? log.status.toLowerCase()
                              : 'unknown'
                          }`}
                        >
                          {log.status || 'UNKNOWN'}
                        </span>
                      </td>

                      <td>
                        {log.status_code ?? '—'}
                      </td>

                      <td>
                        {log.response_ms != null
                          ? `${log.response_ms} ms`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}