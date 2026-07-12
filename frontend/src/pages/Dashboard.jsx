import { useCallback, useEffect, useRef, useState } from 'react'
import AddWebsiteForm from '../components/AddWebsiteForm'
import StatsBar from '../components/StatsBar'
import WebsiteCard from '../components/WebsiteCard'
import { api } from '../services/api'
import { checkAndNotify, requestNotificationPermission } from '../services/notifications'

const POLL_INTERVAL = 15_000 // 15 s UI refresh

export default function Dashboard() {
  const [websites, setWebsites] = useState([])
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, unknown: 0 })
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const timerRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const [sites, st] = await Promise.all([api.getWebsites(), api.getStatus()])
      setWebsites(sites)
      setStats(st)
      checkAndNotify(sites)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    requestNotificationPermission()
    fetchData()
    timerRef.current = setInterval(fetchData, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetchData])

  async function handleAdd(data) {
    const site = await api.addWebsite(data)
    setWebsites((prev) => [site, ...prev])
    fetchData() // refresh stats
  }

  async function handleDelete(id) {
    await api.deleteWebsite(id)
    setWebsites((prev) => prev.filter((s) => s.id !== id))
    fetchData()
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">WebPulse</span>
        </div>
        {lastRefresh && (
          <span className="refresh-label">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </header>

      <main className="main">
        <StatsBar stats={stats} />
        <AddWebsiteForm onAdd={handleAdd} />

        <section className="site-list">
          {loading ? (
            <div className="empty-state">
              <span className="pulse-ring" />
              <p>Connecting to monitor…</p>
            </div>
          ) : websites.length === 0 ? (
            <div className="empty-state">
              <p>No websites added yet. Add one above to start monitoring.</p>
            </div>
          ) : (
            websites.map((site) => (
              <WebsiteCard key={site.id} site={site} onDelete={handleDelete} />
            ))
          )}
        </section>
      </main>
    </div>
  )
}
