/**
 * Chat list component
 * Displays list of user's chats in sidebar
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/authStore'
import { Search, Plus, LogOut, Users, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import NewChatModal from './NewChatModal'

interface ChatListProps {
  chats: any[]
  selectedChatId?: string
  onRefresh: () => void
}

export default function ChatList({ chats, selectedChatId, onRefresh }: ChatListProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)
  
  // Filter chats based on search
  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true
    
    if (chat.isGroup) {
      return chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    } else {
      const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id)
      return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase())
    }
  })
  
  // Get chat display name
  const getChatName = (chat: any) => {
    if (chat.isGroup) {
      return chat.name || 'Unnamed Group'
    }
    const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id)
    return otherParticipant?.username || 'Unknown User'
  }
  
  // Get last message preview
  const getLastMessage = (chat: any) => {
    const lastMessage = chat.messages?.[0]
    if (!lastMessage) return 'No messages yet'
    
    const isOwnMessage = lastMessage.senderId === user?.id
    const prefix = isOwnMessage ? 'You: ' : `${lastMessage.sender?.username}: `
    return prefix + lastMessage.content
  }
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout()
      logout()
      navigate('/login')
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  return (
    <>
      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chats
          </h1>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-600 dark:text-gray-400"
              onClick={() => setIsNewChatModalOpen(true)}
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-600 dark:text-gray-400"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = chat.id === selectedChatId
            const otherParticipant = !chat.isGroup && 
              chat.participants?.find((p: any) => p.id !== user?.id)
            
            return (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className={`
                  flex items-center gap-3 p-4 cursor-pointer transition-colors
                  ${isSelected 
                    ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    {chat.isGroup ? (
                      <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  {/* Online indicator */}
                  {otherParticipant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                
                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {getChatName(chat)}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {chat.messages?.[0] && 
                        format(new Date(chat.messages[0].createdAt), 'HH:mm')
                      }
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
    
    {/* New Chat Modal */}
    <NewChatModal
      isOpen={isNewChatModalOpen}
      onClose={() => setIsNewChatModalOpen(false)}
      onChatCreated={onRefresh}
    />
    </>
  )
}