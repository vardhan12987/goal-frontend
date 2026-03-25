import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { ToastProvider } from './Toast'

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const initials = (user.username || 'U').slice(0, 2).toUpperCase()

  return (
    <ToastProvider>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Goal<span>Forge</span></h1>
            <p>Track What Matters</p>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">◎</span> Dashboard
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="icon">◈</span> Analytics
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <div className="user-pill">
              <div className="user-avatar">{initials}</div>
              <div className="user-info">
                <strong>{user.username || 'User'}</strong>
                <span>{user.email || ''}</span>
              </div>
              <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
