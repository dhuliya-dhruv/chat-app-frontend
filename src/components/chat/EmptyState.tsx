/**
 * Empty state component
 * Shown when no chat is selected
 */

import { MessageCircle } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
            <MessageCircle className="h-12 w-12 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome to Chat App
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Select a chat from the sidebar to start messaging, or create a new chat to begin a conversation.
          </p>
        </div>
      </div>
    </div>
  )
}