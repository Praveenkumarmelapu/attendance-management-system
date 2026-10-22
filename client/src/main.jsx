/**
 * main.jsx — Application Entry Point
 *
 * This is the very first file React runs.
 * It mounts the <App /> component into the <div id="root"> in index.html.
 *
 * StrictMode: In development, React runs each component twice to catch bugs.
 * It doesn't affect production.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
