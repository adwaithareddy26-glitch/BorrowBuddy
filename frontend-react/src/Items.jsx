
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Items.css'

function Items() {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [selectedItem, setSelectedItem] = useState(null)
  const [borrowDate, setBorrowDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Search and category filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const today = (() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })()

  async function loadItems() {
    const token = localStorage.getItem('borrowBuddyToken')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/items`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to load items (${response.status})`)
      }

      const data = await response.json()
      setItems(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to load items.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  // Build category options from the items returned by the backend
  const categories = [
    'All',
    ...new Set(
      items
        .map((item) => item.category?.trim())
        .filter(Boolean)
    ),
  ]

  // Filter by item name, description, owner, and category
  const filteredItems = items.filter((item) => {
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      !search ||
      [
        item.name,
        item.description,
        item.category,
        item.owner?.name,
        item.owner?.fullName,
        item.owner?.email,
        item.ownerName,
      ].some((value) =>
        String(value || '').toLowerCase().includes(search)
      )

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category?.trim() === selectedCategory

    return matchesSearch && matchesCategory
  })

  function clearFilters() {
    setSearchTerm('')
    setSelectedCategory('All')
  }

  function openRequestForm(item) {
    setSelectedItem(item)
    setBorrowDate('')
    setReturnDate('')
    setMessage('')
    setMessageType('info')
  }

  function closeRequestForm() {
    if (submitting) return

    setSelectedItem(null)
    setBorrowDate('')
    setReturnDate('')
    setMessage('')
    setMessageType('info')
  }

  async function submitRequest(event) {
    event.preventDefault()

    if (submitting) return

    setMessage('')
    setMessageType('info')

    if (!selectedItem) {
      setMessage('Please select an item.')
      setMessageType('error')
      return
    }

    if (!borrowDate || !returnDate) {
      setMessage('Please select both dates.')
      setMessageType('error')
      return
    }

    if (borrowDate < today) {
      setMessage('Borrow date cannot be in the past.')
      setMessageType('error')
      return
    }

    if (returnDate <= borrowDate) {
      setMessage('Return date must be after the borrow date.')
      setMessageType('error')
      return
    }

    const token = localStorage.getItem('borrowBuddyToken')

    if (!token) {
      navigate('/login')
      return
    }

    setSubmitting(true)
    setMessage('Submitting your request...')
    setMessageType('info')

    try {
      const params = new URLSearchParams({
        itemId: String(selectedItem.id),
        borrowDate,
        returnDate,
      })

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/requests?${params.toString()}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const responseText = await response.text()
      let serverMessage = responseText

      try {
        const data = JSON.parse(responseText)

        if (typeof data === 'string') {
          serverMessage = data
        } else if (data.message) {
          serverMessage = data.message
        }
      } catch {
        // The backend may return plain text.
      }

      if (!response.ok) {
        const lowerMessage = serverMessage.toLowerCase()

        if (lowerMessage.includes('already requested')) {
          setMessage('Item already requested!')
        } else if (
          lowerMessage.includes('cannot request your own item')
        ) {
          setMessage("You can't request your own item!")
        } else {
          setMessage(
            serverMessage || `Request failed (${response.status})`
          )
        }

        setMessageType('error')
        return
      }

      setMessage('Request submitted successfully!')
      setMessageType('success')
    } catch (err) {
      console.error('Request error:', err)
      setMessage('Unable to connect to the server.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="items-page">
      <header className="items-navbar">
        <h2>BorrowBuddy</h2>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
      </header>

      <main className="items-main">
        <h1>Browse Items 📦</h1>
        <p>Discover items shared by students on campus.</p>

        {/* Search and category filters */}
        <section className="items-filters">
          <div className="filter-field search-field">
            <label htmlFor="item-search">Search items</label>

            <input
              id="item-search"
              type="search"
              placeholder="Search name, description, owner..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="item-category">Category</label>

            <select
              id="item-category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </section>

        {!loading && !error && (
          <p className="results-count">
            Showing {filteredItems.length} of {items.length} items
          </p>
        )}

        {loading && <p>Loading items...</p>}

        {error && (
          <p className="items-error">{error}</p>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="empty-message">No items available yet.</p>
        )}

        {!loading &&
          !error &&
          items.length > 0 &&
          filteredItems.length === 0 && (
            <div className="empty-message">
              <h3>No matching items found 🔍</h3>
              <p>Try another search or category.</p>
              <button
                type="button"
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}

        <div className="items-grid">
          {filteredItems.map((item) => (
            <article className="item-card" key={item.id}>
              <h3>{item.name}</h3>

              <p>{item.description}</p>

              <p>
                <strong>Owner:</strong>{' '}
                {item.owner?.name ||
                  item.owner?.fullName ||
                  item.owner?.email ||
                  item.ownerName ||
                  'Unknown'}
              </p>

              <p>
                <strong>Category:</strong>{' '}
                {item.category || 'Uncategorized'}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                {item.available ? 'Available' : 'Unavailable'}
              </p>

              <button
                type="button"
                disabled={!item.available || submitting}
                onClick={() => openRequestForm(item)}
              >
                {item.available
                  ? 'Request to Borrow'
                  : 'Unavailable'}
              </button>

              {selectedItem?.id === item.id && (
                <section className="borrow-form">
                  <h2>Request: {selectedItem.name}</h2>

                  <form onSubmit={submitRequest}>
                    <label htmlFor={`borrowDate-${item.id}`}>
                      Borrow Date
                    </label>

                    <input
                      id={`borrowDate-${item.id}`}
                      type="date"
                      min={today}
                      value={borrowDate}
                      onChange={(event) =>
                        setBorrowDate(event.target.value)
                      }
                      required
                      disabled={submitting}
                    />

                    <label htmlFor={`returnDate-${item.id}`}>
                      Return Date
                    </label>

                    <input
                      id={`returnDate-${item.id}`}
                      type="date"
                      min={borrowDate || today}
                      value={returnDate}
                      onChange={(event) =>
                        setReturnDate(event.target.value)
                      }
                      required
                      disabled={submitting}
                    />

                    <button type="submit" disabled={submitting}>
                      {submitting
                        ? 'Submitting...'
                        : 'Submit Request'}
                    </button>

                    {message && (
                      <p
                        role="status"
                        aria-live="polite"
                        className={`request-message ${messageType}`}
                      >
                        {message}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={closeRequestForm}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </form>
                </section>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Items
