/**
 * Protected route wrapper
 * Ensures user is authenticated before accessing protected pages
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}