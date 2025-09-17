/**
 * Message list component
 * Renders list of messages with proper formatting
 */

import { format } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageListProps {
  messages: any[]
  currentUserId: string
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  // Group messages by date
  const groupedMessages = messages.reduce((groups: any, message: any) => {
    const date = format(new Date(message.createdAt), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})
  
  // Format date label
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today'
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday'
    } else {
      return format(date, 'MMMM d, yyyy')
    }
  }
  
  // Get message status icon
  const getStatusIcon = (message: any) => {
    if (message.senderId !== currentUserId) return null
    
    // Check if all recipients have read
    const allRead = message.statuses?.every((s: any) => s.status === 'READ')
    const allDelivered = message.statuses?.every((s: any) => 
      s.status === 'DELIVERED' || s.status === 'READ'
    )
    
    if (allRead) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (allDelivered) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]: [string, any]) => (
        <div key={date} className="space-y-4">
          {/* Date separator */}
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              {getDateLabel(date)}
            </span>
          </div>
          
          {/* Messages */}
          {dateMessages.map((message: any) => {
            const isOwnMessage = message.senderId === currentUserId
            
            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-2',
                  isOwnMessage ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Avatar for other users */}
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                )}
                
                {/* Message bubble */}
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2 break-words',
                    isOwnMessage
                      ? 'bg-green-500 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                  )}
                >
                  {/* Sender name (for group chats) */}
                  {!isOwnMessage && message.sender && (
                    <p className="text-xs font-semibold mb-1 text-green-600 dark:text-green-400">
                      {message.sender.username}
                    </p>
                  )}
                  
                  {/* Message content */}
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Time and status */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className={cn(
                      'text-xs',
                      isOwnMessage 
                        ? 'text-green-100' 
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                    {message.editedAt && (
                      <span className={cn(
                        'text-xs',
                        isOwnMessage 
                          ? 'text-green-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      )}>
                        (edited)
                      </span>
                    )}
                    {getStatusIcon(message)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}