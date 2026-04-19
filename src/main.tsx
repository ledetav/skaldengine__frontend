import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/theme/global/index.css'
import App from './App.tsx'
import { logger } from './core/utils/logger'

window.addEventListener('error', (event) => {
  logger.error('Global Error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise Rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
