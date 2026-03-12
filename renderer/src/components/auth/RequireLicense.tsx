import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

interface LicenseStatus {
  isActivated: boolean
  isValid: boolean
  isExpired: boolean
  licenseType: string
  expiresAt: Date | null
  daysRemaining: number | null
  features: string[]
  issuedTo: string
  maxUsers: number
}

interface TrialStatus {
  hasTrialStarted: boolean
  isTrialActive: boolean
  isTrialExpired: boolean
  daysRemaining: number
  startDate: Date | null
  endDate: Date | null
  canStartTrial: boolean
  machineId: string
}

interface RequireLicenseProps {
  children: React.ReactNode
}

export default function RequireLicense({ children }: RequireLicenseProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkLicenseAndTrial()
  }, [])

  const checkLicenseAndTrial = async () => {
    try {
      setIsChecking(true)
      setError(null)

      // Use startup API to check license status (doesn't require session token)
      const isLicenseValid = await window.api.startup.isLicenseValid()
      
      if (isLicenseValid) {
        setIsChecking(false)
        return
      }

      // Check trial status using startup API
      const trial = await window.api.startup.getTrialStatus()
      setTrialStatus(trial)

      // If trial is active, allow access
      if (trial.isTrialActive && !trial.isTrialExpired) {
        setIsChecking(false)
        return
      }

      // Neither license nor trial is valid
      setError('License or trial required')
      setIsChecking(false)

    } catch (err) {
      console.error('License check error:', err)
      setError('Failed to check license status')
      setIsChecking(false)
    }
  }

  // Show loading screen during check
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying license...</p>
        </div>
      </div>
    )
  }

  // Check if license is valid using startup API result
  const shouldBlock = error || trialStatus?.isTrialExpired

  if (shouldBlock) {
    return <Navigate to="/activation" replace />
  }

  // License or trial is valid
  return <>{children}</>
}