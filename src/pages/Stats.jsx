import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoals, getStats, getOverdueGoals, getUpcomingGoals } from '../services/api'

export default function Stats() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState([])
  const [stats, setStats] = useState(null)
  const [overdue, setOverdue] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [g, s, o, u] = await Promise.all([getGoals(), getStats(), getOverdueGoals(), getUpcomingGoals()])
        setGoals(g.data)
        setStats(s.data)
        setOverdue(o.data)
        setUpcoming(u.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading analytics...</div>

  const categoryMap = {}
  goals.forEach(g => { categoryMap[g.category] = (categoryMap[g.category] || 0) + 1 })
  const totalGoals = stats?.totalGoals || 1
  const completionRate = totalGoals > 0 ? Math.round(((stats?.completed || 0) / totalGoals) * 100) : 0

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>A full picture of your goal progress</p>
      </div>

      {/* Top stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card accent">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-sub">{stats.completed} of {stats.totalGoals}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Not Started</div>
            <div className="stat-value">{stats.notStarted}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{stats.overdue}</div>
          </div>
        </div>
      )}

      {/* Avg progress bar */}
      {stats && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <div className="section-title">Average Progress</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${stats.avgProgress}%` }} />
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--accent)', minWidth: 50 }}>{Math.round(stats.avgProgress)}%</span>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryMap).length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <div className="section-title">Goals by Category</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`tag tag-${cat}`} style={{ minWidth: 90, textAlign: 'center' }}>{cat}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${(count / totalGoals) * 100}%`, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ minWidth: 20, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming goals */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title">Due This Week</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(g => (
                  <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/goals/${g.id}`)}>
                    <td style={{ fontWeight: 600 }}>{g.title}</td>
                    <td><span className={`tag tag-${g.category}`}>{g.category}</span></td>
                    <td><span className={`tag tag-${g.priority}`}>{g.priority}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--accent)' }}>{g.progress}%</span>
                      </div>
                    </td>
                    <td><span className="date-badge">{new Date(g.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overdue table */}
      {overdue.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-title" style={{ color: 'var(--red)' }}>Overdue Goals ⚠</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Was Due</th>
                </tr>
              </thead>
              <tbody>
                {overdue.map(g => (
                  <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/goals/${g.id}`)}>
                    <td style={{ fontWeight: 600 }}>{g.title}</td>
                    <td><span className={`tag tag-${g.status}`}>{g.status.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${g.progress}%`, height: '100%', background: 'var(--red)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--red)' }}>{g.progress}%</span>
                      </div>
                    </td>
                    <td><span className="date-badge overdue">{new Date(g.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All goals table */}
      <div className="section-title">All Goals</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No goals yet</td></tr>
            ) : goals.map(g => (
              <tr key={g.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/goals/${g.id}`)}>
                <td style={{ fontWeight: 600, maxWidth: 200 }}>{g.title}</td>
                <td><span className={`tag tag-${g.category}`}>{g.category}</span></td>
                <td><span className={`tag tag-${g.priority}`}>{g.priority}</span></td>
                <td><span className={`tag tag-${g.status}`}>{g.status.replace(/_/g,' ')}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 70, height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${g.progress}%`, height: '100%', background: g.progress === 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{g.progress}%</span>
                  </div>
                </td>
                <td><span className={`date-badge ${g.overdue ? 'overdue' : ''}`}>{g.targetDate ? new Date(g.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
