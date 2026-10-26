import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/core/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean // Доступ разрешен только администраторам и модераторам
}

/**
 * Компонент обертки для защиты маршрутов, требующих авторизации.
 * При отсутствии токена перенаправляет на экран логина.
 * При флаге adminOnly проверяет наличие роли 'admin' или 'moderator'.
 */
export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Контроль доступа на основе ролей для административных маршрутов
  if (adminOnly) {
    const role = user?.role
    if (role !== 'admin' && role !== 'moderator') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
