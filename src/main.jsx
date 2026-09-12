import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Self-hosted typefaces, weights 400 to 700 only; nothing renders 300 or italic (ADR 0007).
// They load before index.css so its theme tokens name families that are already declared.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/jetbrains-mono/700.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import './index.css'
import App from './App.jsx'
import { computeBasename } from './basename.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={computeBasename(import.meta.env.BASE_URL)}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
