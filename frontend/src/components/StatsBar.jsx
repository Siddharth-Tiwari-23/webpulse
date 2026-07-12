export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <StatCard label="Total" value={stats.total} color="var(--clr-muted)" />
      <StatCard label="Online" value={stats.online} color="var(--clr-up)" />
      <StatCard label="Offline" value={stats.offline} color="var(--clr-down)" />
      <StatCard label="Unknown" value={stats.unknown} color="var(--clr-unknown)" />
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <span className="stat-value" style={{ color }}>{value ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
