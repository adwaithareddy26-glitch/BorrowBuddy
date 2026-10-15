
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Items.css'

function MyItems() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMyItems() {
      const token = localStorage.getItem('borrowBuddyToken')

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/items/my-items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to load your items (${response.status})`)
        }

        const data = await response.json()
        setItems(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadMyItems()
  }, [navigate])

  return (
    <div className="items-page">
      <header className="items-navbar">
        <h2>BorrowBuddy</h2>
        <button onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </header>

      <main className="items-main">
        <h1>My Items 📦</h1>
        <p>Manage and view the items you have shared.</p>

        {loading && <p>Loading your items...</p>}
        {error && <p className="items-error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p>You haven't added any items yet.</p>
        )}

        <div className="items-grid">
          {items.map(item => (
            <article className="item-card" key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p>
                <strong>Status:</strong>{' '}
                {item.available ? 'Available' : 'Unavailable'}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default MyItems
