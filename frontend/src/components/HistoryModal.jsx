import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function HistoryModal({ site, onClose }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getHistory(site.id)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [site.id])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>History — {site.name}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p className="modal-empty">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="modal-empty">No records yet.</p>
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
                {logs.map((l) => (
                  <tr key={l.id} className={l.status === 'DOWN' ? 'row-down' : ''}>
                    <td>{new Date(l.checked_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${l.status.toLowerCase()}`}>
                        {l.status}
                      </span>
                    </td>
                    <td>{l.status_code ?? '—'}</td>
                    <td>{l.response_ms != null ? `${l.response_ms} ms` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
