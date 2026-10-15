
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './AddItem.css'

function AddItem() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const token = localStorage.getItem('borrowBuddyToken')

    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/items`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            category,
          }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setMessage(data.message || `Failed to add item (${response.status})`)
        return
      }

      setMessage('Item added successfully!')
      setName('')
      setDescription('')
      setCategory('')
    } catch (error) {
      console.error(error)
      setMessage('Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-item-page">
      <header className="add-item-navbar">
        <h2>BorrowBuddy</h2>
        <button type="button" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </header>

      <main className="add-item-main">
        <section className="add-item-card">
          <h1>Add an Item 📦</h1>
          <p>Share something useful with other students.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="item-name">Item Name</label>
            <input
              id="item-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Scientific Calculator"
              required
            />

            <label htmlFor="item-description">Description</label>
            <textarea
              id="item-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your item"
              rows="4"
              required
            />

            <label htmlFor="item-category">Category</label>
            <select
              id="item-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Stationery">Stationery</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </form>

          <p role="status">{message}</p>
        </section>
      </main>
    </div>
  )
}

export default AddItem
