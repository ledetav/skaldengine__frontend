import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean // Only admin/moderator can access
}

export default function ProtectedRoute({ children, adminOnly }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return <Navigate to="/" replace />
  }

  // Role-based access control for admin routes
  if (adminOnly) {
    let hasAccess = false
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role === 'admin' || payload.role === 'moderator') {
        hasAccess = true
        // Keep user_role in sync
        localStorage.setItem('user_role', payload.role)
      }
    } catch {
      // If token decoding fails, fallback to user_role in localStorage just in case, but prefer secure check
      const role = localStorage.getItem('user_role')
      if (role === 'admin' || role === 'moderator') {
        hasAccess = true
      }
    }

    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return <>{children}</>
}
