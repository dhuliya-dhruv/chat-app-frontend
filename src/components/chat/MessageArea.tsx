/**
 * Message area component
 * Displays messages and handles sending new messages
 */

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { messageAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useSocketStore } from '@/stores/socketStore'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import TypingIndicator from './TypingIndicator'

interface MessageAreaProps {
  chat: any
  onChatUpdate: () => void
}

export default function MessageArea({ chat, onChatUpdate }: MessageAreaProps) {
  const { user } = useAuthStore()
  const { sendTyping, markMessageRead } = useSocketStore()
  const [messages, setMessages] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Fetch messages
  const { data, refetch } = useQuery({
    queryKey: ['messages', chat.id],
    queryFn: async () => {
      const response = await messageAPI.getChatMessages(chat.id)
      return response.data.data
    },
    enabled: !!chat.id,
  })
  
  // Update messages when data changes
  useEffect(() => {
    if (data) {
      setMessages(data)
    }
  }, [data])
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return messageAPI.sendMessage(chat.id, content)
    },
    onSuccess: () => {
      refetch()
      onChatUpdate()
    },
  })
  
  // Handle sending message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return
    await sendMessageMutation.mutateAsync(content)
  }
  
  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    sendTyping(chat.id, isTyping)
  }
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Listen for real-time message updates
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail
      if (message.chatId === chat.id) {
        setMessages((prev) => [...prev, message])
        
        // Mark as read if not own message
        if (message.senderId !== user?.id) {
          markMessageRead(message.id)
        }
      }
    }
    
    const handleMessageEdited = (event: CustomEvent) => {
      const { messageId, content, editedAt } = event.detail
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content, editedAt }
            : msg
        )
      )
    }
    
    const handleMessageDeleted = (event: CustomEvent) => {
      const { messageId } = event.detail
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
    }
    
    window.addEventListener('newMessage', handleNewMessage as EventListener)
    window.addEventListener('messageEdited', handleMessageEdited as EventListener)
    window.addEventListener('messageDeleted', handleMessageDeleted as EventListener)
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage as EventListener)
      window.removeEventListener('messageEdited', handleMessageEdited as EventListener)
      window.removeEventListener('messageDeleted', handleMessageDeleted as EventListener)
    }
  }, [chat.id, user?.id, markMessageRead])
  
  // Mark all messages as read when opening chat
  useEffect(() => {
    messageAPI.markAllAsRead(chat.id)
  }, [chat.id])
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <ChatHeader chat={chat} />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <MessageList messages={messages} currentUserId={user?.id || ''} />
        <TypingIndicator chatId={chat.id} />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={sendMessageMutation.isPending}
      />
    </div>
  )
}