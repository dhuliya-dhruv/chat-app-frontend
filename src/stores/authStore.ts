/**
 * Authentication store using Zustand
 * Manages user authentication state
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  isOnline: boolean
  lastSeen: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  setRefreshToken: (refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },
      
      setUser: (user) => {
        set({ user })
      },
      
      setToken: (token) => {
        set({ token })
      },
      
      setRefreshToken: (refreshToken) => {
        set({ refreshToken })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)