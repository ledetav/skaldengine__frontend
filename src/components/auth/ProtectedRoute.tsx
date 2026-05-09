import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/core/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean // Only admin/moderator can access
}

export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Role-based access control for admin routes
  if (adminOnly) {
    const role = user?.role
    if (role !== 'admin' && role !== 'moderator') {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
