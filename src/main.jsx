import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/App/index.jsx'
import Post from './pages/PostDetail/index.jsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Category from './pages/AllCategores/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/category/:categoryId" element={<Category />} />
      </Routes>
    </Router>
  </StrictMode>,
)
