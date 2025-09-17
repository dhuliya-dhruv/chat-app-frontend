/**
 * New Chat Modal Component
 * Allows users to start a new chat with existing users or create a group
 */

import { useState, useEffect } from 'react'
import { X, Search, Users, User, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { chatAPI, userAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onChatCreated: () => void
}

export default function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([])
        return
      }

      setSearching(true)
      try {
        const response = await userAPI.searchUsers(searchQuery)
        console.log('Search response:', response.data) // Debug log
        
        // The API returns { success: true, data: users[] }
        const usersData = response.data.data || []
        // Filter out current user (already done in backend, but double-check)
        const filteredUsers = usersData.filter((u: any) => u.id !== user?.id)
        setUsers(filteredUsers)
      } catch (error: any) {
        console.error('Error searching users:', error)
        console.error('Error response:', error.response?.data) // Debug log
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to search users',
          variant: 'destructive',
        })
      } finally {
        setSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, user?.id, toast])

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      }
      return [...prev, userId]
    })
  }

  // Create chat
  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user',
        variant: 'destructive',
      })
      return
    }

    if (isGroup && !groupName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a group name',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      let response
      
      if (isGroup || selectedUsers.length > 1) {
        // Create group chat
        response = await chatAPI.createGroupChat(
          groupName || 'New Group',
          selectedUsers
        )
      } else {
        // Create direct chat
        response = await chatAPI.createDirectChat(selectedUsers[0])
      }

      toast({
        title: 'Success',
        description: isGroup ? 'Group created successfully' : 'Chat created successfully',
      })

      // Navigate to the new chat
      navigate(`/chat/${response.data.id}`)
      
      // Reset and close
      handleClose()
      onChatCreated()
    } catch (error: any) {
      console.error('Error creating chat:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create chat',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset and close modal
  const handleClose = () => {
    setSearchQuery('')
    setUsers([])
    setSelectedUsers([])
    setIsGroup(false)
    setGroupName('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Chat
          </h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Chat Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={!isGroup ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setIsGroup(false)
                setSelectedUsers([])
              }}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Direct Chat
            </Button>
            <Button
              variant={isGroup ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsGroup(true)}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Group Chat
            </Button>
          </div>

          {/* Group Name (if group) */}
          {isGroup && (
            <Input
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
            />
          )}

          {/* User Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = users.find(u => u.id === userId)
                if (!user) return null
                return (
                  <div
                    key={userId}
                    className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => toggleUserSelection(userId)}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* User List */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {searching ? (
              <div className="text-center py-4 text-gray-500">
                Searching...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchQuery.length < 2 
                  ? 'Type at least 2 characters to search'
                  : 'No users found'
                }
              </div>
            ) : (
              users.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    if (!isGroup && selectedUsers.length === 1 && !selectedUsers.includes(user.id)) {
                      setSelectedUsers([user.id])
                    } else {
                      toggleUserSelection(user.id)
                    }
                  }}
                  className={`
                    flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors
                    ${selectedUsers.includes(user.id)
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateChat}
            disabled={loading || selectedUsers.length === 0}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Chat'}
          </Button>
        </div>
      </div>
    </div>
  )
}