import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MoneyProvider } from './contexts/MoneyContext.jsx'
import { OverlayProvider } from './contexts/OverlayContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <OverlayProvider>
  <MoneyProvider>
    <App />
  </MoneyProvider>
  </OverlayProvider>
  </StrictMode>,
)
