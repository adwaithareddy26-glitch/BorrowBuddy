
import { useState } from 'react'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Login failed')
        return
      }

      localStorage.setItem('borrowBuddyToken', data.token)

      localStorage.setItem(
        'borrowBuddyUser',
        JSON.stringify({
          userId: data.userId,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      )

      setMessage('Login successful!')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>BorrowBuddy</h1>
        <h2>Welcome Back</h2>
        <p className="subtitle">
          Login to your BorrowBuddy account
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <p id="message" role="status">{message}</p>

        <p className="switch-page">
          Don't have an account?{' '}
          <a href="/register">Create Account</a>
        </p>
      </div>
    </div>
  )
}

export default Login
