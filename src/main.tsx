import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/themes.css'
import './styles/global.css'
import './styles/animations.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RequestProvider } from './context/RequestContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RequestProvider>
        <App />
      </RequestProvider>
    </ErrorBoundary>
  </StrictMode>,
)
