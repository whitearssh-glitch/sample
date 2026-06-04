import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/page-header.css'
import './styles/page-dialogue.css'
import './styles/page-dialogue-reveal.css'
import './styles/page-dialogue-popup.css'
import './styles/page-transition.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
