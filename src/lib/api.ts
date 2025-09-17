/**
 * API client configuration
 * Handles all HTTP requests to the backend
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Create axios instance
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Prevent infinite loop - don't retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          // Create a new axios instance without interceptors to avoid loops
          const refreshResponse = await axios.post(
            `${API_URL}/api/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
          
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
          
          // Update tokens in store
          useAuthStore.getState().setToken(accessToken)
          if (newRefreshToken) {
            useAuthStore.getState().setRefreshToken(newRefreshToken)
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } else {
          // No refresh token, logout
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error('Token refresh failed:', refreshError)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
    
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
    
  logout: () => api.post('/auth/logout'),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
}

// User API
export const userAPI = {
  searchUsers: (query: string) =>
    api.get('/users/search', { params: { q: query } }),
    
  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),
    
  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
    api.put('/users/profile', data),
    
  updateOnlineStatus: (isOnline: boolean) =>
    api.post('/users/status', { isOnline }),
}

// Chat API
export const chatAPI = {
  getUserChats: () => api.get('/chats'),
  
  createDirectChat: (recipientId: string) =>
    api.post('/chats/direct', { recipientId }),
    
  createGroupChat: (name: string, participantIds: string[]) =>
    api.post('/chats/group', { name, participantIds }),
    
  getChatById: (chatId: string) =>
    api.get(`/chats/${chatId}`),
    
  updateChat: (chatId: string, data: { name?: string; avatar?: string }) =>
    api.put(`/chats/${chatId}`, data),
    
  addParticipants: (chatId: string, userIds: string[]) =>
    api.post(`/chats/${chatId}/participants`, { userIds }),
    
  removeParticipant: (chatId: string, userId: string) =>
    api.delete(`/chats/${chatId}/participants/${userId}`),
    
  deleteChat: (chatId: string) =>
    api.delete(`/chats/${chatId}`),
}

// Message API
export const messageAPI = {
  sendMessage: (chatId: string, content: string, type = 'TEXT') =>
    api.post('/messages', { chatId, content, type }),
    
  getChatMessages: (chatId: string, limit = 50, before?: string) =>
    api.get(`/messages/chat/${chatId}`, { params: { limit, before } }),
    
  editMessage: (messageId: string, content: string) =>
    api.put(`/messages/${messageId}`, { content }),
    
  deleteMessage: (messageId: string) =>
    api.delete(`/messages/${messageId}`),
    
  markAsRead: (messageId: string) =>
    api.post(`/messages/${messageId}/read`),
    
  markAllAsRead: (chatId: string) =>
    api.post(`/messages/chat/${chatId}/read`),
}