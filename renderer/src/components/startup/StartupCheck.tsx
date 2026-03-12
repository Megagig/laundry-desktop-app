import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

interface StartupCheckResult {
  canProceed: boolean
  requiresActivation: boolean
  requiresLogin: boolean
  requiresTrial: boolean
  error?: string
  trialInfo?: any
  securityStatus?: {
    integrityValid: boolean
    debuggerDetected: boolean
    antiDebugActive: boolean
  }
}

interface StartupCheckProps {
  children: React.ReactNode
}

export default function StartupCheck({ children }: StartupCheckProps) {
  const navigate = useNavigate()
  const [isChecking, setIsChecking] = useState(true)
  const [checkResult, setCheckResult] = useState<StartupCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasPerformedCheck, setHasPerformedCheck] = useState(false)

  useEffect(() => {
    // Only perform checks once
    if (!hasPerformedCheck) {
      performStartupChecks()
    }
  }, [hasPerformedCheck])

  const performStartupChecks = async () => {
    try {
      setIsChecking(true)
      setError(null)
      setHasPerformedCheck(true)

      console.log('🔐 Performing startup security checks...')
      
      // Call the startup check API
      const result = await window.api.startup.check()
      setCheckResult(result)

      if (!result.canProceed) {
        // Handle different failure scenarios
        if (result.securityStatus && !result.securityStatus.integrityValid) {
          setError('Security integrity check failed. Application may have been tampered with.')
          return
        }

        if (result.requiresActivation) {
          console.log('📄 License activation required')
          navigate('/activation', { replace: true })
          return
        }

        if (result.requiresTrial) {
          console.log('⏱️ Trial setup required')
          // Start trial and then proceed to login
          try {
            await window.api.trial.startTrial()
            navigate('/login', { replace: true })
          } catch (trialError) {
            console.error('Failed to start trial:', trialError)
            setError('Failed to start trial period')
          }
          return
        }

        // Other errors
        setError(result.error || 'Startup check failed')
        return
      }

      // Checks passed - proceed based on requirements
      if (result.requiresLogin) {
        console.log('🔑 Login required')
        navigate('/login', { replace: true })
      } else {
        console.log('✅ All checks passed - proceeding to dashboard')
        navigate('/dashboard', { replace: true })
      }

    } catch (err) {
      console.error('Startup check error:', err)
      setError('Failed to perform startup security checks')
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading screen during checks
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="mb-6">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">LaundryPro</h1>
            <p className="text-gray-600">Initializing secure environment...</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Performing security checks</span>
            </div>
            
            {checkResult?.securityStatus && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">System Integrity</span>
                  {checkResult.securityStatus.integrityValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Anti-Debug Protection</span>
                  {checkResult.securityStatus.antiDebugActive ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show error screen if checks failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setHasPerformedCheck(false)
                performStartupChecks()
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Security Checks
            </button>
            
            <button
              onClick={() => window.close?.()}
              className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Exit Application
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              If this error persists, please contact support or reinstall the application from a trusted source.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If we get here, checks passed and navigation should have occurred
  // This is a fallback that shouldn't normally be reached
  return <>{children}</>
}