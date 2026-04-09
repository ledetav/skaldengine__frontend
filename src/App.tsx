import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@/theme/global/index.css'
import LandingScreen from '@/features/Landing/LandingScreen'
import AuthScreen from '@/features/Auth/AuthScreen'
import DashboardScreen from '@/features/Dashboard/DashboardScreen'
import CreateChatScreen from '@/features/CreateChat/CreateChatScreen'
import ChatScreen from '@/features/Chat/ChatScreen'
import ProfileScreen from '@/features/Profile/ProfileScreen'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'))

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
    }
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingScreen />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        } />
        <Route path="/create-chat/:characterId" element={
          <ProtectedRoute>
            <CreateChatScreen />
          </ProtectedRoute>
        } />
        <Route path="/chat/:chatId" element={
          <ProtectedRoute>
            <ChatScreen />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileScreen />
          </ProtectedRoute>
        } />
        <Route path="/profile/:username" element={
          <ProfileScreen />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
