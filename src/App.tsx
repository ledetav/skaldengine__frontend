import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/theme/global/index.css'
import { ToastProvider } from '@/components/ui'
import { AuthProvider, useAuth } from '@/core/contexts/AuthContext'

// Screens
import LandingScreen from '@/features/Landing/LandingScreen'
import AuthScreen from '@/features/Auth/AuthScreen'
import DashboardScreen from '@/features/Dashboard/DashboardScreen'
import CreateChatScreen from '@/features/CreateChat/CreateChatScreen'
import ChatScreen from '@/features/Chat/ChatScreen'
import ChatsListScreen from '@/features/Chat/ChatsListScreen'
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

const AppRoutes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* ─── Guest Routes ─── */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingScreen />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthScreen />} />

      {/* ─── Protected Routes ─── */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />

      <Route path="/chat/create/:characterId" element={<ProtectedRoute><CreateChatScreen /></ProtectedRoute>} />

      <Route path="/chat/:chatId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><ChatsListScreen /></ProtectedRoute>} />

      <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
      <Route path="/profile/:username" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />

      {/* ─── Admin Routes (Protected — Admin/Moderator Only) ─── */}
      <Route path="/admin" element={<Navigate to="/admin/characters" replace />} />
      <Route path="/admin/characters" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/characters/:id" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/characters/:id/edit" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/characters/create" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users/:id" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/personas" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/personas/:id" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/lorebooks/fandom" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/lorebooks/characters" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/lorebooks/personas" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/lorebooks/:id" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/lorebooks/:id/edit" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/scenarios" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/scenarios/:id" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

      {/* ─── User (Persona & Lorebook) Routes (Protected) ─── */}
      <Route path="/personas" element={<ProtectedRoute><PersonasListScreen /></ProtectedRoute>} />
      <Route path="/personas/create" element={<ProtectedRoute><PersonaFormScreen /></ProtectedRoute>} />
      <Route path="/personas/:id/edit" element={<ProtectedRoute><PersonaFormScreen /></ProtectedRoute>} />

      <Route path="/lorebooks" element={<ProtectedRoute><LorebooksListScreen /></ProtectedRoute>} />
      <Route path="/lorebooks/create" element={<ProtectedRoute><LorebookFormScreen /></ProtectedRoute>} />
      <Route path="/lorebooks/:id" element={<ProtectedRoute><LorebookDetailScreen /></ProtectedRoute>} />
      <Route path="/lorebooks/:id/edit" element={<ProtectedRoute><LorebookFormScreen /></ProtectedRoute>} />

      {/* ─── Fallback ─── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}
