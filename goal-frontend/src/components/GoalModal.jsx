import { useState, useEffect } from 'react'

const CATEGORIES = ['PERSONAL','HEALTH','CAREER','EDUCATION','FINANCE','FITNESS','SOCIAL','OTHER']
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL']
const STATUSES = ['NOT_STARTED','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED']

export default function GoalModal({ goal, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'PERSONAL',
    priority: 'MEDIUM', status: 'NOT_STARTED',
    progress: 0, targetDate: '', notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'PERSONAL',
        priority: goal.priority || 'MEDIUM',
        status: goal.status || 'NOT_STARTED',
        progress: goal.progress ?? 0,
        targetDate: goal.targetDate || '',
        notes: goal.notes || ''
      })
    }
  }, [goal])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{goal ? 'Edit Goal' : 'New Goal'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What do you want to achieve?" />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Details about this goal..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
              {PRIORITIES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {goal && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Progress: {form.progress}%</label>
              <input type="range" min={0} max={100} className="slider" value={form.progress} onChange={e => set('progress', Number(e.target.value))} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Target Date</label>
            <input type="date" className="form-input" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes..." style={{ resize: 'vertical' }} />
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !form.title.trim()}>
            {loading ? 'Saving...' : goal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  )
}
