import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Nettoyage des JSON-LD injectés au build (prerender) pour éviter les doublons
// avec ceux que React injecte dynamiquement via useJsonLd.
document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => s.remove());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
