/**
 * Main chat page component
 * Contains chat list sidebar and message area
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { chatAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useSocketStore } from '@/stores/socketStore'
import ChatList from '@/components/chat/ChatList'
import MessageArea from '@/components/chat/MessageArea'
import EmptyState from '@/components/chat/EmptyState'

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuthStore()
  const { joinChat, leaveChat } = useSocketStore()
  const [selectedChat, setSelectedChat] = useState<any>(null)
  
  // Fetch user's chats
  const { data: chats, refetch: refetchChats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await chatAPI.getUserChats()
      return response.data.data
    },
    enabled: !!user,
  })
  
  // Join/leave chat room when selection changes
  useEffect(() => {
    if (chatId) {
      // Find and set selected chat
      const chat = chats?.find((c: any) => c.id === chatId)
      if (chat) {
        setSelectedChat(chat)
        joinChat(chatId)
      }
    } else {
      setSelectedChat(null)
    }
    
    return () => {
      if (chatId) {
        leaveChat(chatId)
      }
    }
  }, [chatId, chats, joinChat, leaveChat])
  
  // Listen for new messages to update chat list
  useEffect(() => {
    const handleNewMessage = () => {
      refetchChats()
    }
    
    window.addEventListener('newMessage', handleNewMessage)
    return () => {
      window.removeEventListener('newMessage', handleNewMessage)
    }
  }, [refetchChats])
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Chat List Sidebar */}
      <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <ChatList 
          chats={chats || []} 
          selectedChatId={chatId}
          onRefresh={refetchChats}
        />
      </div>
      
      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <MessageArea 
            chat={selectedChat} 
            onChatUpdate={refetchChats}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}