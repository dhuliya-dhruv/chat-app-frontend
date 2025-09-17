/**
 * Login page component
 * Handles user authentication
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()
  
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    
    try {
      const response = await authAPI.login(data.email, data.password)
      const { user, accessToken, refreshToken } = response.data.data
      
      // Store auth data
      login(user, accessToken, refreshToken)
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.username}`,
      })
      
      // Navigate to chat
      navigate('/chat')
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.error || 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-green-500 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to continue to your chats
          </p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              type="email"
              placeholder="john@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        {/* Demo Credentials */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Demo Credentials:
          </p>
          <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <p>Email: john@example.com</p>
            <p>Password: password123</p>
          </div>
        </div>
        
        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-green-500 hover:text-green-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}