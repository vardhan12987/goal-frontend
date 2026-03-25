import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGoal, updateGoal, deleteGoal, updateProgress } from '../services/api'
import GoalModal from '../components/GoalModal'
import { useToast } from '../components/Toast'

export default function GoalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [goal, setGoal] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [localProgress, setLocalProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data } = await getGoal(id)
      setGoal(data)
      setLocalProgress(data.progress)
    } catch { navigate('/dashboard') }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleEdit = async (form) => {
    try {
      await updateGoal(id, form)
      toast('Goal updated!')
      setShowEdit(false)
      load()
    } catch (e) { toast(e.response?.data?.message || 'Failed', 'error') }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this goal permanently?')) return
    try {
      await deleteGoal(id)
      toast('Goal deleted')
      navigate('/dashboard')
    } catch { toast('Failed to delete', 'error') }
  }

  const handleProgressSave = async () => {
    try {
      await updateProgress(id, localProgress)
      toast('Progress updated!')
      load()
    } catch { toast('Failed', 'error') }
  }

  if (loading) return <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading...</div>
  if (!goal) return null

  const daysLeft = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: 24 }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>{goal.title}</h2>
            {goal.overdue && <span className="tag" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>OVERDUE</span>}
          </div>
          <div className="goal-tags">
            <span className={`tag tag-${goal.category}`}>{goal.category}</span>
            <span className={`tag tag-${goal.priority}`}>{goal.priority} PRIORITY</span>
            <span className={`tag tag-${goal.status}`}>{goal.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {goal.targetDate && (
          <div className="stat-card" style={{ padding: '14px 16px' }}>
            <div className="stat-label">Target Date</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginTop: 4 }}>
              {new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            {daysLeft !== null && (
              <div className="stat-sub" style={{ color: daysLeft < 0 ? 'var(--red)' : daysLeft <= 7 ? '#fbbf24' : 'var(--muted)' }}>
                {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
              </div>
            )}
          </div>
        )}
        {goal.completedAt && (
          <div className="stat-card green" style={{ padding: '14px 16px' }}>
            <div className="stat-label">Completed</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--green)', marginTop: 4 }}>
              {new Date(goal.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        )}
        <div className="stat-card accent" style={{ padding: '14px 16px' }}>
          <div className="stat-label">Progress</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginTop: 4 }}>{goal.progress}%</div>
        </div>
      </div>

      {/* Description */}
      {goal.description && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
          <div className="section-title">Description</div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 14 }}>{goal.description}</p>
        </div>
      )}

      {/* Progress updater */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
        <div className="section-title">Update Progress</div>
        <div className="progress-slider-wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Drag to update</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{localProgress}%</span>
          </div>
          <input type="range" min={0} max={100} className="slider" value={localProgress} onChange={e => setLocalProgress(Number(e.target.value))} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[0, 25, 50, 75, 100].map(v => (
              <button key={v} className={`filter-btn ${localProgress === v ? 'active' : ''}`} style={{ flex: 1 }} onClick={() => setLocalProgress(v)}>{v}%</button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleProgressSave} disabled={localProgress === goal.progress}>
            Save Progress
          </button>
        </div>
      </div>

      {/* Notes */}
      {goal.notes && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
          <div className="section-title">Notes</div>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap' }}>{goal.notes}</p>
        </div>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)' }}>
        <span>Created: {new Date(goal.createdAt).toLocaleDateString('en-IN')}</span>
        <span>Updated: {new Date(goal.updatedAt).toLocaleDateString('en-IN')}</span>
      </div>

      {showEdit && <GoalModal goal={goal} onClose={() => setShowEdit(false)} onSave={handleEdit} />}
    </div>
  )
}
