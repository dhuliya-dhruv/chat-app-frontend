/**
 * Typing indicator component
 * Shows when other users are typing
 */

import { useSocketStore } from '@/stores/socketStore'
import { useAuthStore } from '@/stores/authStore'

interface TypingIndicatorProps {
  chatId: string
}

export default function TypingIndicator({ chatId }: TypingIndicatorProps) {
  const { user } = useAuthStore()
  const { typingUsers } = useSocketStore()
  
  const chatTypingUsers = typingUsers.get(chatId)
  const typingUsersList = chatTypingUsers ? Array.from(chatTypingUsers) : []
  
  // Filter out current user
  const otherTypingUsers = typingUsersList.filter(userId => userId !== user?.id)
  
  if (otherTypingUsers.length === 0) {
    return null
  }
  
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {otherTypingUsers.length === 1 
          ? 'Someone is typing...'
          : `${otherTypingUsers.length} people are typing...`
        }
      </span>
    </div>
  )
}