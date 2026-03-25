import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGoals, createGoal, updateGoal, deleteGoal, updateProgress, getStats, getOverdueGoals } from '../services/api'
import GoalModal from '../components/GoalModal'
import { useToast } from '../components/Toast'

const FILTERS = ['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']

export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [stats, setStats] = useState(null)
  const [overdue, setOverdue] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [g, s, o] = await Promise.all([getGoals(), getStats(), getOverdueGoals()])
      setGoals(g.data)
      setStats(s.data)
      setOverdue(o.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = goals.filter(g => {
    const matchFilter = filter === 'ALL' || g.status === filter
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleCreate = async (form) => {
    try {
      await createGoal(form)
      toast('Goal created! 🎯')
      setShowModal(false)
      load()
    } catch (e) { toast(e.response?.data?.message || 'Failed to create', 'error') }
  }

  const handleEdit = async (form) => {
    try {
      await updateGoal(editGoal.id, form)
      toast('Goal updated!')
      setEditGoal(null)
      load()
    } catch (e) { toast(e.response?.data?.message || 'Failed to update', 'error') }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this goal?')) return
    try {
      await deleteGoal(id)
      toast('Goal deleted')
      load()
    } catch { toast('Failed to delete', 'error') }
  }

  const handleProgress = async (id, progress, e) => {
    e.stopPropagation()
    try {
      await updateProgress(id, progress)
      load()
    } catch {}
  }

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ animationDelay: '0.05s' }}>
          <div className="stat-card accent">
            <div className="stat-label">Total Goals</div>
            <div className="stat-value">{stats.totalGoals}</div>
            <div className="stat-sub">all time</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-sub">active now</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-sub">achieved</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-sub">need attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Progress</div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{Math.round(stats.avgProgress)}%</div>
            <div className="stat-sub">across all goals</div>
          </div>
        </div>
      )}

      {/* Overdue banner */}
      {overdue.length > 0 && (
        <div className="overdue-banner">
          ⚠ {overdue.length} goal{overdue.length > 1 ? 's are' : ' is'} overdue — update your progress!
        </div>
      )}

      {/* Header */}
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>My Goals</h2>
          <p>{filtered.length} goal{filtered.length !== 1 ? 's' : ''} {filter !== 'ALL' ? `· ${filter.replace('_',' ')}` : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Goal</button>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginTop: 20 }}>
        {FILTERS.map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.replace('_', ' ')}
          </button>
        ))}
        <input className="form-input search-input" placeholder="Search goals..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div style={{ color: 'var(--muted)', padding: '40px 0', textAlign: 'center' }}>Loading goals...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◎</div>
          <h3>No goals found</h3>
          <p style={{ marginBottom: 20 }}>{search ? 'Try a different search.' : 'Create your first goal to get started.'}</p>
          {!search && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Goal</button>}
        </div>
      ) : (
        <div className="goals-grid">
          {filtered.map((g, i) => (
            <div key={g.id} className="goal-card" style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/goals/${g.id}`)}>

              <div className="goal-card-top">
                <div className="goal-title">{g.title}</div>
                {g.overdue && <span className="tag" style={{ background: 'var(--red-dim)', color: 'var(--red)', fontSize: 10, flexShrink: 0 }}>OVERDUE</span>}
              </div>

              {g.description && <p className="goal-desc">{g.description}</p>}

              <div className="goal-tags">
                <span className={`tag tag-${g.category}`}>{g.category}</span>
                <span className={`tag tag-${g.priority}`}>{g.priority}</span>
                <span className={`tag tag-${g.status}`}>{g.status.replace('_', ' ')}</span>
              </div>

              <div className="progress-wrap">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-pct">{g.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${g.progress === 100 ? 'full' : ''}`} style={{ width: `${g.progress}%` }} />
                </div>
              </div>

              {g.targetDate && (
                <div className={`date-badge ${g.overdue ? 'overdue' : ''}`}>
                  🗓 {g.overdue ? 'Was due' : 'Due'} {new Date(g.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}

              <div className="goal-actions" onClick={e => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setEditGoal(g) }}>Edit</button>
                {g.progress < 100 && (
                  <button className="btn btn-ghost btn-sm" onClick={e => handleProgress(g.id, Math.min(100, g.progress + 10), e)}>+10%</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={e => handleDelete(g.id, e)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <GoalModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      {editGoal && <GoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEdit} />}
    </div>
  )
}
