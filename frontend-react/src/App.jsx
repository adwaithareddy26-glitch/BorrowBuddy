import './chatbot.js'
import ReceivedRequests from './ReceivedRequests'
import MyRequests from './MyRequests'
import MyItems from './MyItems'
import AddItem from './AddItem'
import Items from './Items'
import Dashboard from './Dashboard'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import './Items.css'
import Login from './Login'
import Register from './Register'

function Home() {
  return (
    <>
      <header className="navbar">
        <div className="logo">BorrowBuddy</div>
        <div className="nav-buttons">
          <a href="/login" className="btn btn-outline">Login</a>
          <a href="/register" className="btn btn-primary">Register</a>
        </div>
      </header>

      <main className="hero">
        <div className="hero-content">
          <h1>
            Borrow What You Need.
            <span>Share What You Have.</span>
          </h1>
          <p>
            BorrowBuddy is a campus lending platform where students can
            lend and borrow useful academic and personal items.
          </p>
          <div className="hero-buttons">
            <a href="/register" className="btn btn-primary">Get Started</a>
            <a href="/login" className="btn btn-outline">Login</a>
          </div>
        </div>
      </main>
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
  path="/received-requests"
  element={<ReceivedRequests />}
/>
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/my-items" element={<MyItems />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/items" element={<Items />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
