import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.username || !form.email || !form.password) { setError('Please fill all required fields'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/login')
    } catch (e) {
      setError(e.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Goal<span>Forge</span></h1>
          <p>Start achieving your goals today</p>
        </div>

        <p className="auth-title">Create account</p>

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Your name" />
        </div>
        <div className="form-group">
          <label className="form-label">Username *</label>
          <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)} placeholder="choose a username" />
        </div>
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Password *</label>
          <input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)} placeholder="min. 6 characters" />
        </div>

        <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Create account →'}
        </button>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
