import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'

interface StartupCheckProps {
  children: React.ReactNode
}

interface StartupStatus {
  isChecking: boolean
  canProceed: boolean
  requiresActivation: boolean
  requiresLogin: boolean
  error?: string
}

export default function StartupCheck({ children }: StartupCheckProps) {
  const [status, setStatus] = useState<StartupStatus>({
    isChecking: true,
    canProceed: false,
    requiresActivation: false,
    requiresLogin: false
  })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only perform startup check if we're not already on login or activation pages
    if (location.pathname !== '/login' && location.pathname !== '/activation') {
      performStartupCheck()
    } else {
      // If we're already on login/activation, just show the children
      setStatus({
        isChecking: false,
        canProceed: true,
        requiresActivation: false,
        requiresLogin: false
      })
    }
  }, [location.pathname])

  const performStartupCheck = async () => {
    try {
      setStatus(prev => ({ ...prev, isChecking: true }))
      
      // For now, let's bypass the license check and go directly to login
      // This will allow us to test the application without license activation
      console.log('Performing startup check...')
      
      // Simulate a brief delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStatus({
        isChecking: false,
        canProceed: false,
        requiresActivation: false,
        requiresLogin: true,
        error: undefined
      })

      // Navigate to login only if we're not already there
      if (location.pathname !== '/login') {
        console.log('Navigating to login...')
        navigate('/login', { replace: true })
      }
      
    } catch (error) {
      console.error('Startup check failed:', error)
      setStatus({
        isChecking: false,
        canProceed: false,
        requiresActivation: false,
        requiresLogin: true,
        error: 'Failed to perform startup checks'
      })
      
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true })
      }
    }
  }

  if (status.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Starting Laundry Management System
          </h2>
          <p className="text-gray-600">
            Initializing application...
          </p>
        </div>
      </div>
    )
  }

  if (status.error && !status.canProceed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Startup Error
          </h2>
          <p className="text-gray-600 mb-4">
            {status.error}
          </p>
          <button
            onClick={performStartupCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Always show children - let the router handle navigation
  return <>{children}</>
}