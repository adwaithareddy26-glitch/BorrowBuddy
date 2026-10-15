
import { useState } from 'react'
import './Login.css'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleRegister(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Registration failed')
        return
      }

      setMessage('Registration successful! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>BorrowBuddy</h1>
        <h2>Create Account</h2>
        <p className="subtitle">Register for your BorrowBuddy account</p>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input id="name" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your phone number" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password" required />
          </div>

          <button type="submit" className="auth-button">
            Register
          </button>
        </form>

        <p id="message" role="status">{message}</p>
        <p className="switch-page">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  )
}

export default Register
