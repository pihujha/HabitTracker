import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div>
      <nav style={styles.nav}>
        <span style={styles.brand}>Habit Tracker</span>
        <div style={styles.right}>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={signOut} style={styles.signOut}>Sign Out</button>
        </div>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fff',
  },
  brand: { fontWeight: 600, fontSize: '1.1rem', color: '#111' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  email: { fontSize: '0.875rem', color: '#666' },
  signOut: {
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  main: { padding: '2rem' },
}
