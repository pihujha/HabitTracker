import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)
    if (error) setError(error.message)
    else if (isSignUp) setMessage('Check your email to confirm your account.')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Habit Tracker</h1>
        <h2 className="login-subtitle">{isSignUp ? 'Create account' : 'Sign in'}</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            className="form-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="form-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          {message && <p className="login-success">{message}</p>}
          <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="login-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="login-toggle-btn">
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  )
}
