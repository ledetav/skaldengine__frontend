import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
  isDebug?: boolean
}

export default function ProtectedRoute({ children, isDebug }: ProtectedRouteProps) {
  const token = localStorage.getItem('token')
  
  if (!token) {
    const redirectPath = isDebug ? '/login/debug' : '/'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
