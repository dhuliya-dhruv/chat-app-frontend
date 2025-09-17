/**
 * Main App component
 * Handles routing and authentication state
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { useAuthStore } from '@/stores/authStore'
import { useSocketStore } from '@/stores/socketStore'

// Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ChatPage from '@/pages/ChatPage'

// Layout
import ProtectedRoute from '@/components/layout/ProtectedRoute'

function App() {
  const { token, user } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  // Connect to socket when authenticated
  useEffect(() => {
    if (token && user) {
      connect(token)
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [token, user, connect, disconnect])

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Route>
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
      
      <Toaster />
    </>
  )
}

export default App