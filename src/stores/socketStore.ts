/**
 * Socket store using Zustand
 * Manages WebSocket connection and real-time events
 */

import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  typingUsers: Map<string, Set<string>> // chatId -> Set of userIds
  
  // Actions
  connect: (token: string) => void
  disconnect: () => void
  joinChat: (chatId: string) => void
  leaveChat: (chatId: string) => void
  sendTyping: (chatId: string, isTyping: boolean) => void
  markMessageDelivered: (messageId: string) => void
  markMessageRead: (messageId: string) => void
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  typingUsers: new Map(),
  
  connect: (token: string) => {
    const currentSocket = get().socket
    
    // Disconnect existing socket if any
    if (currentSocket) {
      currentSocket.disconnect()
    }
    
    // Create new socket connection
    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    })
    
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      set({ isConnected: true })
    })
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      set({ isConnected: false })
    })
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
    })
    
    // User status events
    socket.on('userOnline', ({ userId, timestamp }) => {
      console.log('User online:', userId, timestamp)
      // Handle user online status update
    })
    
    socket.on('userOffline', ({ userId, lastSeen }) => {
      console.log('User offline:', userId, lastSeen)
      // Handle user offline status update
    })
    
    // Typing events
    socket.on('userTyping', ({ userId, chatId, isTyping }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers)
        
        if (!newTypingUsers.has(chatId)) {
          newTypingUsers.set(chatId, new Set())
        }
        
        const chatTypingUsers = newTypingUsers.get(chatId)!
        
        if (isTyping) {
          chatTypingUsers.add(userId)
        } else {
          chatTypingUsers.delete(userId)
        }
        
        return { typingUsers: newTypingUsers }
      })
    })
    
    // Message events
    socket.on('newMessage', (message) => {
      console.log('New message received:', message)
      // Handle new message - will be handled by message store/component
      window.dispatchEvent(new CustomEvent('newMessage', { detail: message }))
    })
    
    socket.on('messageEdited', ({ messageId, content, editedAt }) => {
      console.log('Message edited:', messageId)
      // Handle message edit
      window.dispatchEvent(new CustomEvent('messageEdited', { 
        detail: { messageId, content, editedAt } 
      }))
    })
    
    socket.on('messageDeleted', ({ messageId }) => {
      console.log('Message deleted:', messageId)
      // Handle message deletion
      window.dispatchEvent(new CustomEvent('messageDeleted', { detail: { messageId } }))
    })
    
    // Delivery/Read receipts
    socket.on('deliveryUpdate', ({ messageId, userId, status, deliveredAt }) => {
      console.log('Delivery update:', messageId, status)
      window.dispatchEvent(new CustomEvent('deliveryUpdate', { 
        detail: { messageId, userId, status, deliveredAt } 
      }))
    })
    
    socket.on('readUpdate', ({ messageId, userId, status, readAt }) => {
      console.log('Read update:', messageId, status)
      window.dispatchEvent(new CustomEvent('readUpdate', { 
        detail: { messageId, userId, status, readAt } 
      }))
    })
    
    set({ socket })
  },
  
  disconnect: () => {
    const socket = get().socket
    if (socket) {
      socket.disconnect()
      set({ socket: null, isConnected: false, typingUsers: new Map() })
    }
  },
  
  joinChat: (chatId: string) => {
    const socket = get().socket
    if (socket) {
      socket.emit('joinChat', chatId)
    }
  },
  
  leaveChat: (chatId: string) => {
    const socket = get().socket
    if (socket) {
      socket.emit('leaveChat', chatId)
    }
  },
  
  sendTyping: (chatId: string, isTyping: boolean) => {
    const socket = get().socket
    if (socket) {
      socket.emit('typing', { chatId, isTyping })
    }
  },
  
  markMessageDelivered: (messageId: string) => {
    const socket = get().socket
    if (socket) {
      socket.emit('messageDelivered', { messageId })
    }
  },
  
  markMessageRead: (messageId: string) => {
    const socket = get().socket
    if (socket) {
      socket.emit('messageRead', { messageId })
    }
  },
}))