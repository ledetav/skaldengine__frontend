import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@/theme/global/index.css'
import { ToastProvider } from '@/components/ui'

// Screens
import LandingScreen from '@/features/Landing/LandingScreen'
import AuthScreen from '@/features/Auth/AuthScreen'
import DashboardScreen from '@/features/Dashboard/DashboardScreen'
import CreateChatScreen from '@/features/CreateChat/CreateChatScreen'
import ChatScreen from '@/features/Chat/ChatScreen'
import ProfileScreen from '@/features/Profile/ProfileScreen'

// Admin
import AdminDashboard from '@/features/Admin/AdminDashboard'

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
          <Route path="/login/debug" element={isAuthenticated ? <Navigate to="/dashboard/debug" replace /> : <AuthScreen isDebug />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />
          <Route path="/register/debug" element={isAuthenticated ? <Navigate to="/dashboard/debug" replace /> : <AuthScreen isDebug />} />

          {/* ─── Protected Routes ─── */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
          <Route path="/dashboard/debug" element={<ProtectedRoute isDebug><DashboardScreen isDebug /></ProtectedRoute>} />

          <Route path="/chat/create/:characterId" element={<ProtectedRoute><CreateChatScreen /></ProtectedRoute>} />
          <Route path="/chat/create/:characterId/debug" element={<ProtectedRoute isDebug><CreateChatScreen isDebug /></ProtectedRoute>} />

          <Route path="/chat/:chatId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
          <Route path="/chat/:chatId/debug" element={<ProtectedRoute isDebug><ChatScreen isDebug /></ProtectedRoute>} />

          <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
          <Route path="/profile/debug" element={<ProtectedRoute isDebug><ProfileScreen isDebug /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />

          {/* ─── Admin Debug Routes (Protected — Admin/Moderator Only) ─── */}
          <Route path="/admin" element={<Navigate to="/admin/characters/debug" replace />} />
          <Route path="/admin/debug" element={<Navigate to="/admin/characters/debug" replace />} />
          <Route path="/admin/characters/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/characters/:id/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/characters/:id/edit/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/characters/create/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users/:id/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/personas/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/personas/:id/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lorebooks/fandom/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lorebooks/characters/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lorebooks/personas/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lorebooks/:id/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/lorebooks/:id/edit/debug" element={<ProtectedRoute isDebug adminOnly><AdminDashboard /></ProtectedRoute>} />

          {/* ─── User (Persona & Lorebook) Debug Routes (Protected) ─── */}
          <Route path="/user/personas/debug" element={<ProtectedRoute isDebug><PersonasListScreen /></ProtectedRoute>} />
          <Route path="/user/personas/create/debug" element={<ProtectedRoute isDebug><PersonaFormScreen /></ProtectedRoute>} />
          <Route path="/user/personas/:id/edit/debug" element={<ProtectedRoute isDebug><PersonaFormScreen /></ProtectedRoute>} />

          <Route path="/user/lorebooks/debug" element={<ProtectedRoute isDebug><LorebooksListScreen /></ProtectedRoute>} />
          <Route path="/user/lorebooks/create/debug" element={<ProtectedRoute isDebug><LorebookFormScreen /></ProtectedRoute>} />
          <Route path="/user/lorebooks/:id/debug" element={<ProtectedRoute isDebug><LorebookDetailScreen /></ProtectedRoute>} />
          <Route path="/user/lorebooks/:id/edit/debug" element={<ProtectedRoute isDebug><LorebookFormScreen /></ProtectedRoute>} />

          {/* ─── Fallback ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
