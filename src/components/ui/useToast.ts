import { useContext } from 'react'
import { ToastContext, type ToastContextValue } from './Toast'

/**
 * Пользовательский хук доступа к контексту всплывающих уведомлений Toast.
 * 
 * @returns Методы вызова уведомлений (addToast, success, error, info)
 * @throws Error если вызывается вне дерева ToastProvider
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
