import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/theme/global/index.css'
import App from './App.tsx'
import { logger } from './core/utils/logger'

// Глобальный перехват ошибок JavaScript в окне браузера
window.addEventListener('error', (event) => {
  logger.error('Глобальная ошибка приложения:', event.error || event.message)
})

// Глобальный перехват необработанных отклонений Promise
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Необработанное отклонение Promise:', event.reason)
})

// Инициализация и монтирование корневого React-компонента
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
