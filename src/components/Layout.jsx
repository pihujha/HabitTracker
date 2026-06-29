import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <nav className="nav">
        <a href="#today" className="nav-brand">Habit Tracker</a>
        <div className="nav-links">
          <a href="#today" className="nav-link">Today</a>
          <a href="#insights" className="nav-link">Insights</a>
          <a href="#habits" className="nav-link">Habits</a>
        </div>
        <div className="nav-right">
          <span className="nav-email">{user?.email}</span>
          <button onClick={toggleTheme} className="theme-btn">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={signOut} className="sign-out-btn">Sign Out</button>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
