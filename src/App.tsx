import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@/theme/global/index.css'
import { ToastProvider } from '@/components/ui'
import { AuthProvider, useAuth } from '@/core/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// --- Lazy loaded screens ---

// Guest
const LandingScreen = lazy(() => import('@/features/Landing/LandingScreen'))
const AuthScreen = lazy(() => import('@/features/Auth/AuthScreen'))

// Main
const DashboardScreen = lazy(() => import('@/features/Dashboard/DashboardScreen'))
const ProfileScreen = lazy(() => import('@/features/Profile/ProfileScreen'))

// Chat
const CreateChatScreen = lazy(() => import('@/features/CreateChat/CreateChatScreen'))
const ChatScreen = lazy(() => import('@/features/Chat/ChatScreen'))
const ChatsListScreen = lazy(() => import('@/features/Chat/ChatsListScreen'))

// Personas
const PersonasListScreen = lazy(() => import('@/features/Personas/PersonasListScreen'))
const PersonaFormScreen = lazy(() => import('@/features/Personas/PersonaFormScreen'))

// Lorebooks
const LorebooksListScreen = lazy(() => import('@/features/Lorebooks/LorebooksListScreen'))
const LorebookDetailScreen = lazy(() => import('@/features/Lorebooks/LorebookDetailScreen'))
const LorebookFormScreen = lazy(() => import('@/features/Lorebooks/LorebookFormScreen'))

// Admin
const AdminDashboard = lazy(() => import('@/features/Admin/AdminDashboard'))

// Simple fallback loader
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: 'system-ui, sans-serif' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <span>Загрузка...</span>
    </div>
  </div>
)

const AppRoutes = () => {
  const { isAuthenticated } = useAuth()

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
