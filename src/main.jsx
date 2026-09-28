import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
// Self-hosted typefaces, only the weights the mockups use (ADR 0002).
// They load before index.css so its theme tokens name families that are already declared.
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import './index.css'
import App from './App.jsx'
import { computeBasename } from './basename.js'

const container = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter basename={computeBasename(import.meta.env.BASE_URL)}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// A prerendered page ships #root already full of markup (ADR 0001); hydrate it instead of
// discarding and re-rendering. npm run dev still serves the unrendered shell, so this mounts
// fresh there, same as before.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
