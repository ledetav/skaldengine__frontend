import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  isDebug?: boolean
  adminOnly?: boolean // Only admin/moderator can access
}

export default function ProtectedRoute({ children, isDebug, adminOnly }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    const redirectPath = isDebug ? '/login/debug' : '/'
    return <Navigate to={redirectPath} replace />
  }

  // Role-based access control for admin routes
  if (adminOnly) {
    const role = localStorage.getItem('user_role')
    // In non-debug mode we rely on the decoded role from server
    // In debug mode we use the mock role stored in localStorage
    if (role !== 'admin' && role !== 'moderator') {
      // Try to decode JWT token role as fallback (for real logins)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'admin' && payload.role !== 'moderator') {
          return <Navigate to={isDebug ? '/dashboard/debug' : '/dashboard'} replace />
        }
        // If JWT says admin/mod, store it to sync with debug checks
        localStorage.setItem('user_role', payload.role)
      } catch {
        // If token is a mock token (debug) or can't be decoded, rely on user_role
        if (role !== 'admin' && role !== 'moderator') {
          return <Navigate to={isDebug ? '/dashboard/debug' : '/dashboard'} replace />
        }
      }
    }
  }

  return <>{children}</>
}
