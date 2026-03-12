import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { AlertTriangle, Lock } from 'lucide-react'

interface RequirePermissionProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
  showError?: boolean
}

export default function RequirePermission({ 
  permission, 
  children, 
  fallback,
  showError = true 
}: RequirePermissionProps) {
  const { sessionToken, user } = useAuth()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    checkPermission()
  }, [permission, sessionToken])

  const checkPermission = async () => {
    if (!sessionToken) {
      setHasPermission(false)
      setIsChecking(false)
      return
    }

    try {
      setIsChecking(true)
      
      // Check if user has the required permission
      const result = await window.api.rbac.hasPermission(sessionToken, permission)
      setHasPermission(result.hasPermission)
      
    } catch (error) {
      console.error('Permission check error:', error)
      setHasPermission(false)
    } finally {
      setIsChecking(false)
    }
  }

  // Still checking permission
  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-gray-500">Checking permissions...</div>
      </div>
    )
  }

  // User has permission
  if (hasPermission) {
    return <>{children}</>
  }

  // User doesn't have permission - show fallback or error
  if (fallback) {
    return <>{fallback}</>
  }

  if (!showError) {
    return null
  }

  // Default permission denied message
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this feature.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Required Permission:</p>
              <p className="font-mono text-xs">{permission}</p>
              {user && (
                <p className="mt-1">Current Role: <span className="font-medium">{user.role?.name}</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}