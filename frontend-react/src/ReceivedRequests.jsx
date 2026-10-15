
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Items.css'

function ReceivedRequests() {
  const navigate = useNavigate()

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  async function loadRequests() {
    const token = localStorage.getItem('borrowBuddyToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requests/received`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          errorText || `Failed to load requests (${response.status})`
        )
      }

      const data = await response.json()
      setRequests(data)
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  async function updateStatus(requestId, status) {
    const token = localStorage.getItem('borrowBuddyToken')

    if (!token || updatingId !== null) return

    setUpdatingId(requestId)
    setMessage('')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requests/${requestId}/status?status=${status}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const responseText = await response.text()

      if (!response.ok) {
        throw new Error(
          responseText || `Request failed (${response.status})`
        )
      }

      setMessage(
        status === 'APPROVED'
          ? 'Request approved successfully!'
          : 'Request rejected successfully!'
      )

      await loadRequests()
    } catch (err) {
      setMessage(err.message || 'Unable to update request.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="items-page">
      <div className="items-header">
        <h1>Received Requests</h1>
        <p>Manage requests from people who want to borrow your items.</p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      {message && (
        <p
          role="status"
          aria-live="polite"
          style={{
            padding: '12px',
            margin: '15px 0',
            borderRadius: '8px',
            overflowWrap: 'anywhere',
            color: /successfully/i.test(message) ? '#15803d' : '#b91c1c',
            backgroundColor: '#ffffff',
          }}
        >
          {message}
        </p>
      )}

      {loading && <p>Loading requests...</p>}

      {error && (
        <p className="items-error">
          {error}
          <button type="button" onClick={loadRequests}>
            Try Again
          </button>
        </p>
      )}

      {!loading && !error && requests.length === 0 && (
        <p>No borrowing requests received yet.</p>
      )}

      <div className="items-grid">
        {requests.map((request) => (
          <div className="item-card" key={request.id}>
            <h2>{request.item?.name || 'Item'}</h2>

            <p>
              <strong>Borrower:</strong>{' '}
              {request.requester?.name ||
                request.requester?.email ||
                'Borrower'}
            </p>

            <p>
              <strong>Borrow Date:</strong>{' '}
              {request.borrowDate || 'Not specified'}
            </p>

            <p>
              <strong>Return Date:</strong>{' '}
              {request.returnDate || 'Not specified'}
            </p>

            <p>
              <strong>Duration:</strong>{' '}
              {request.borrowDays ?? 'N/A'} days
            </p>

            <p>
              <strong>Status:</strong> {request.status}
            </p>

            {request.status === 'PENDING' && (
              <div>
                <button
                  type="button"
                  disabled={updatingId !== null}
                  onClick={() =>
                    updateStatus(request.id, 'APPROVED')
                  }
                >
                  {updatingId === request.id
                    ? 'Updating...'
                    : 'Approve'}
                </button>

                <button
                  type="button"
                  disabled={updatingId !== null}
                  onClick={() =>
                    updateStatus(request.id, 'REJECTED')
                  }
                >
                  {updatingId === request.id
                    ? 'Updating...'
                    : 'Reject'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReceivedRequests
