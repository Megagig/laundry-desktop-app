import { licenseService } from './license.service.js'
import { trialService } from './trial.service.js'
import { prisma } from '../database/prisma.js'

export interface StartupCheckResult {
  canProceed: boolean
  requiresActivation: boolean
  requiresLogin: boolean
  requiresTrial: boolean
  error?: string
  trialInfo?: any
}

class StartupService {
  /**
   * Perform all startup security checks
   */
  async performStartupChecks(): Promise<StartupCheckResult> {
    try {
      // First check if license is valid
      const licenseStatus = await licenseService.checkLicenseStatus()
      
      if (licenseStatus.isActivated && licenseStatus.isValid && !licenseStatus.isExpired) {
        // Valid license - check if we have users
        const userCount = await prisma.user.count()
        
        if (userCount === 0) {
          return {
            canProceed: false,
            requiresActivation: false,
            requiresLogin: false,
            requiresTrial: false,
            error: 'No users found in database'
          }
        }

        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: true,
          requiresTrial: false
        }
      }

      // No valid license - check trial status
      const trialStatus = await trialService.getTrialStatus()
      
      if (!trialStatus.hasTrialStarted && trialStatus.canStartTrial) {
        // Can start trial
        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: false,
          requiresTrial: true,
          trialInfo: trialStatus
        }
      }

      if (trialStatus.isTrialActive) {
        // Trial is active - check if we have users
        const userCount = await prisma.user.count()
        
        if (userCount === 0) {
          return {
            canProceed: false,
            requiresActivation: false,
            requiresLogin: false,
            requiresTrial: false,
            error: 'No users found in database'
          }
        }

        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: true,
          requiresTrial: false,
          trialInfo: trialStatus
        }
      }

      if (trialStatus.isTrialExpired) {
        // Trial expired - require activation
        return {
          canProceed: false,
          requiresActivation: true,
          requiresLogin: false,
          requiresTrial: false,
          error: 'Trial period has expired. Please activate a license.',
          trialInfo: trialStatus
        }
      }

      // Fallback - require activation
      return {
        canProceed: false,
        requiresActivation: true,
        requiresLogin: false,
        requiresTrial: false,
        error: 'License activation required'
      }
    } catch (error) {
      console.error('Startup check failed:', error)
      return {
        canProceed: false,
        requiresActivation: true,
        requiresLogin: false,
        requiresTrial: false,
        error: 'Startup check failed'
      }
    }
  }

  /**
   * Check if license is valid without throwing errors
   */
  async isLicenseValid(): Promise<boolean> {
    try {
      const status = await licenseService.checkLicenseStatus()
      return status.isActivated && status.isValid && !status.isExpired
    } catch (error) {
      console.error('License check failed:', error)
      return false
    }
  }

  /**
   * Get trial status using the trial service
   */
  async getTrialStatus() {
    try {
      return await trialService.getTrialStatus()
    } catch (error) {
      console.error('Trial status check failed:', error)
      return {
        hasTrialStarted: false,
        isTrialActive: false,
        isTrialExpired: true,
        daysRemaining: 0,
        startDate: null,
        endDate: null,
        canStartTrial: false,
        machineId: ''
      }
    }
  }

  /**
   * Check if application should be blocked
   */
  async shouldBlockApplication(): Promise<boolean> {
    try {
      return await trialService.shouldBlockApplication()
    } catch (error) {
      console.error('Block check failed:', error)
      return true // Block on error for security
    }
  }
}

export const startupService = new StartupService()