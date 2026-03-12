import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui"
import { AlertTriangle, Clock, RefreshCw, LogOut } from "lucide-react"

interface SessionExpiredModalProps {
  isOpen: boolean
  onClose: () => void
  onExtendSession?: () => void
  timeRemaining?: number
}

export default function SessionExpiredModal({ 
  isOpen, 
  onClose, 
  onExtendSession,
  timeRemaining = 0 
}: SessionExpiredModalProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [countdown, setCountdown] = useState(timeRemaining)
  const [isExtending, setIsExtending] = useState(false)

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            handleLogout()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isOpen, countdown])

  const handleExtendSession = async () => {
    if (!onExtendSession) return

    setIsExtending(true)
    try {
      await onExtendSession()
      onClose()
    } catch (error) {
      console.error('Failed to extend session:', error)
      handleLogout()
    } finally {
      setIsExtending(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {countdown > 0 ? (
              <Clock className="w-8 h-8 text-orange-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>

          {/* Title and Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {countdown > 0 ? "Session Expiring Soon" : "Session Expired"}
          </h2>
          
          {countdown > 0 ? (
            <div className="space-y-3">
              <p className="text-gray-600">
                Your session will expire in:
              </p>
              <div className="text-3xl font-bold text-orange-600 font-mono">
                {formatTime(countdown)}
              </div>
              <p className="text-sm text-gray-500">
                Extend your session to continue working, or you'll be automatically logged out.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">
                Your session has expired for security reasons.
              </p>
              <p className="text-sm text-gray-500">
                Please log in again to continue using the application.
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {countdown > 0 && timeRemaining > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / timeRemaining) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {countdown > 0 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Now
                </Button>
                {onExtendSession && (
                  <Button
                    onClick={handleExtendSession}
                    disabled={isExtending}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {isExtending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Extending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Extend Session
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Go to Login
              </Button>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Security Notice:</strong> Sessions expire automatically to protect your account. 
              This helps prevent unauthorized access if you leave your computer unattended.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}