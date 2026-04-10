import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@/theme/global/index.css'
import { ToastProvider } from '@/components/ui/Toast'

// Screens
import LandingScreen from '@/features/Landing/LandingScreen'
import AuthScreen from '@/features/Auth/AuthScreen'
import DashboardScreen from '@/features/Dashboard/DashboardScreen'
import CreateChatScreen from '@/features/CreateChat/CreateChatScreen'
import ChatScreen from '@/features/Chat/ChatScreen'
import ProfileScreen from '@/features/Profile/ProfileScreen'

// Admin
import AdminDashboard from '@/features/Admin/AdminDashboard'
import CharacterFormScreen from '@/features/Admin/CharacterFormScreen'

// Personas
import PersonasListScreen from '@/features/Personas/PersonasListScreen'
import PersonaFormScreen from '@/features/Personas/PersonaFormScreen'

// Lorebooks
import LorebooksListScreen from '@/features/Lorebooks/LorebooksListScreen'
import LorebookDetailScreen from '@/features/Lorebooks/LorebookDetailScreen'
import LorebookFormScreen from '@/features/Lorebooks/LorebookFormScreen'

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
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Guest Routes ─── */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingScreen />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />

          {/* ─── Protected Routes ─── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardScreen /></ProtectedRoute>
          } />
          <Route path="/create-chat/:characterId" element={
            <ProtectedRoute><CreateChatScreen /></ProtectedRoute>
          } />
          <Route path="/chat/:chatId" element={
            <ProtectedRoute><ChatScreen /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><ProfileScreen /></ProtectedRoute>
          } />
          <Route path="/profile/:username" element={<ProfileScreen />} />

          {/* ─── Admin Debug Routes ─── */}
          <Route path="/admin" element={<Navigate to="/admin/debug" replace />} />
          <Route path="/admin/debug" element={<AdminDashboard />} />
          <Route path="/admin/characters/create/debug" element={<CharacterFormScreen />} />
          <Route path="/admin/:characterId/edit/debug" element={<CharacterFormScreen />} />

          {/* ─── Persona Debug Routes ─── */}
          <Route path="/personas/debug" element={<PersonasListScreen />} />
          <Route path="/personas/create/debug" element={<PersonaFormScreen />} />
          <Route path="/personas/:id/edit/debug" element={<PersonaFormScreen />} />

          {/* ─── Lorebook Debug Routes ─── */}
          <Route path="/lorebooks/debug" element={<LorebooksListScreen />} />
          <Route path="/lorebooks/create/debug" element={<LorebookFormScreen />} />
          <Route path="/lorebooks/:id/debug" element={<LorebookDetailScreen />} />
          <Route path="/lorebooks/:id/edit/debug" element={<LorebookFormScreen />} />

          {/* ─── Fallback ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
