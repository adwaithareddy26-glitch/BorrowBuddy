
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Items.css'

function MyRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadRequests() {
    const token = localStorage.getItem('borrowBuddyToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requests/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to load requests (${response.status})`)
      }

      setRequests(await response.json())
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function returnItem(requestId) {
    const token = localStorage.getItem('borrowBuddyToken')
    setMessage('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requests/${requestId}/return`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setMessage(
          typeof data === 'string'
            ? data
            : data?.message || `Could not return item (${response.status})`
        )
        return
      }

      setMessage('Item returned successfully!')
      await loadRequests()
    } catch (err) {
      setMessage('Unable to connect to server.')
    }
  }

  return (
    <div className="items-page">
      <header className="items-navbar">
        <h2>BorrowBuddy</h2>
        <button onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </header>

      <main className="items-main">
        <h1>My Requests 📩</h1>
        <p>Track your borrowing requests and return dates.</p>

        {loading && <p>Loading requests...</p>}
        {error && <p className="items-error">{error}</p>}
        {message && <p role="status">{message}</p>}

        {!loading && !error && requests.length === 0 && (
          <p>You haven't made any borrowing requests yet.</p>
        )}

        <div className="items-grid">
          {requests.map(request => {
            const item = request.item || {}

            return (
              <article className="item-card" key={request.id}>
                <h3>{item.name || 'Borrowed item'}</h3>
                <p>{item.description || 'No description available'}</p>
                <p>
                  <strong>Status:</strong> {request.status}
                </p>
                <p>
                  <strong>Borrow date:</strong>{' '}
                  {request.borrowDate || 'Not specified'}
                </p>
                <p>
                  <strong>Return date:</strong>{' '}
                  {request.returnDate || 'Not specified'}
                </p>
                <p>
                  <strong>Borrowing days:</strong>{' '}
                  {request.borrowDays ?? '—'}
                </p>
                <p>
                  <strong>Late penalty:</strong> ₹{request.penalty ?? 0}
                </p>

                {request.status === 'APPROVED' && (
                  <button onClick={() => returnItem(request.id)}>
                    Return Item
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default MyRequests
