
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('borrowBuddyUser')
    const token = localStorage.getItem('borrowBuddyToken')

    if (!token || !savedUser) {
      navigate('/login')
      return
    }

    try {
      setUser(JSON.parse(savedUser))
    } catch {
      localStorage.removeItem('borrowBuddyUser')
      localStorage.removeItem('borrowBuddyToken')
      navigate('/login')
    }
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('borrowBuddyToken')
    localStorage.removeItem('borrowBuddyUser')
    navigate('/login')
  }

  if (!user) {
    return <p className="dashboard-loading">Loading dashboard...</p>
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-navbar">
        <h2>BorrowBuddy</h2>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <section className="welcome-card">
          <p className="welcome-label">STUDENT DASHBOARD</p>
          <h1>Welcome, {user.name || 'Student'}! 👋</h1>
          <p>
            Borrow what you need. Share what you have.
          </p>
          <p className="user-email">{user.email}</p>
        </section>

        <h2 className="section-heading">Your BorrowBuddy</h2>

        <section className="dashboard-grid">
          <article className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>Browse Items</h3>
            <p>Explore items available to borrow from other students.</p>
            <button onClick={() => navigate('/items')}>
              Browse Items
            </button>
          </article>

          
<article className="feature-card">
  <span className="feature-icon">📦</span>
  <h3>My Items</h3>
  <p>View the items you have shared with other students.</p>
  <button onClick={() => navigate('/my-items')}>
    My Items
  </button>
</article>


          <article className="feature-card">
            <span className="feature-icon">➕</span>
            <h3>Add an Item</h3>
            <p>Share an item with other students on campus.</p>
            <button onClick={() => navigate('/add-item')}>
              Add Item
            </button>
          </article>

          <article className="feature-card">
            <span className="feature-icon">📨</span>
            <h3>My Requests</h3>
            <p>Check the status of your borrowing requests.</p>
            <button onClick={() => navigate('/my-requests')}>
              My Requests
            </button>
          </article>

          <article className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Received Requests</h3>
            <p>Review requests from students who want your items.</p>
            <button onClick={() => navigate('/received-requests')}>
              View Requests
            </button>
          </article>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
