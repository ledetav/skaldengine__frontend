import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    // Redirect to Landing if not authenticated
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
