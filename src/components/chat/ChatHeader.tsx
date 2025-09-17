/**
 * Chat header component
 * Displays chat information and actions
 */

import { useAuthStore } from '@/stores/authStore'
import { MoreVertical, Users, User, Phone, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface ChatHeaderProps {
  chat: any
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
  const { user } = useAuthStore()
  
  // Get chat display name
  const getChatName = () => {
    if (chat.isGroup) {
      return chat.name || 'Unnamed Group'
    }
    const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id)
    return otherParticipant?.username || 'Unknown User'
  }
  
  // Get chat status
  const getChatStatus = () => {
    if (chat.isGroup) {
      const participantCount = chat.participants?.length || 0
      return `${participantCount} participants`
    }
    
    const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id)
    if (otherParticipant?.isOnline) {
      return 'Online'
    }
    
    if (otherParticipant?.lastSeen) {
      return `Last seen ${format(new Date(otherParticipant.lastSeen), 'HH:mm')}`
    }
    
    return 'Offline'
  }
  
  const otherParticipant = !chat.isGroup && 
    chat.participants?.find((p: any) => p.id !== user?.id)
  
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            {chat.isGroup ? (
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </div>
          {/* Online indicator */}
          {otherParticipant?.isOnline && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </div>
        
        {/* Chat Info */}
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {getChatName()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getChatStatus()}
          </p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-600 dark:text-gray-400"
        >
          <Phone className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-600 dark:text-gray-400"
        >
          <Video className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-600 dark:text-gray-400"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}