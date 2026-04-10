import { createContext, useState, useCallback } from 'react'
import styles from './Toast.module.css'

/* ─── Types ─────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
  exiting?: boolean
}

export interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

/* ─── Context ───────────────────────────────── */
export const ToastContext = createContext<ToastContextValue | null>(null)

/* ─── Icons ─────────────────────────────────── */
function SuccessIcon() {
  return (
    <svg className={styles.toastIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className={styles.toastIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className={styles.toastIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  )
}

/* ─── Provider ──────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 260)
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const value: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast(m, 'success'),
    error: (m) => addToast(m, 'error'),
    info: (m) => addToast(m, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toastContainer}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={`${styles.toast} ${styles[`toast--${t.type}`]} ${t.exiting ? styles.exiting : ''}`}
          >
            {t.type === 'success' && <SuccessIcon />}
            {t.type === 'error' && <ErrorIcon />}
            {t.type === 'info' && <InfoIcon />}
            <span>{t.message}</span>
            <button className={styles.toastClose} onClick={() => remove(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}


