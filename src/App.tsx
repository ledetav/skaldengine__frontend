import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '@/theme/global/index.css'
import LandingScreen from '@/features/Landing/LandingScreen'
import AuthScreen from '@/features/Auth/AuthScreen'
import DashboardScreen from '@/features/Dashboard/DashboardScreen'
import CreateChatScreen from '@/features/CreateChat/CreateChatScreen'
import ChatScreen from '@/features/Chat/ChatScreen'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'))

  useEffect(() => {
    // Listen for changes (e.g. login/logout)
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
    }
    window.addEventListener('storage', handleAuthChange)
    // Custom event for same-tab updates if needed
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingScreen />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/register" element={<AuthScreen />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardScreen /> : <Navigate to="/login" replace />} />
        <Route path="/create-chat/:characterId" element={isAuthenticated ? <CreateChatScreen /> : <Navigate to="/login" replace />} />
        <Route path="/chat/:chatId" element={isAuthenticated ? <ChatScreen /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
