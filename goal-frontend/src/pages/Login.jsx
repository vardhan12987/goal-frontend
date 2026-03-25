import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError('')
    if (!form.username || !form.password) { setError('Please fill all fields'); return }
    setLoading(true)
    try {
      const { data } = await login(form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email, id: data.id }))
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Goal<span>Forge</span></h1>
          <p>Track what matters most to you</p>
        </div>

        <p className="auth-title">Sign in</p>

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" value={form.username} onChange={e => set('username', e.target.value)}
            placeholder="your username" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" value={form.password} onChange={e => set('password', e.target.value)}
            placeholder="••••••" onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
