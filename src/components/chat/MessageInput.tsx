/**
 * Message input component
 * Handles message composition and sending
 */

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MessageInputProps {
  onSendMessage: (content: string) => void
  onTyping: (isTyping: boolean) => void
  disabled?: boolean
}

export default function MessageInput({ 
  onSendMessage, 
  onTyping, 
  disabled 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Handle typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true)
      onTyping(true)
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
    }, 1000)
  }
  
  // Handle send message
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false)
        onTyping(false)
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Focus input
      inputRef.current?.focus()
    }
  }
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [message])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTyping) {
        onTyping(false)
      }
    }
  }, [isTyping, onTyping])
  
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-600 dark:text-gray-400 flex-shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-700 rounded-full resize-none outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 scrollbar-thin"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          
          {/* Emoji button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 bottom-1 h-8 w-8 text-gray-600 dark:text-gray-400"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-green-500 hover:bg-green-600 text-white flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}