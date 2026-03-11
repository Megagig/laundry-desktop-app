import { licenseService } from './license.service.js'
import { prisma } from '../database/prisma.js'

export interface StartupCheckResult {
  canProceed: boolean
  requiresActivation: boolean
  requiresLogin: boolean
  error?: string
}

class StartupService {
  /**
   * Perform all startup security checks
   */
  async performStartupChecks(): Promise<StartupCheckResult> {
    try {
      // Check license status
      const licenseStatus = await licenseService.checkLicenseStatus()
      
      if (!licenseStatus.isActivated) {
        return {
          canProceed: false,
          requiresActivation: true,
          requiresLogin: false
        }
      }

      if (licenseStatus.isExpired) {
        return {
          canProceed: false,
          requiresActivation: true,
          requiresLogin: false,
          error: 'License has expired'
        }
      }

      if (!licenseStatus.isValid) {
        return {
          canProceed: false,
          requiresActivation: true,
          requiresLogin: false,
          error: 'License is invalid'
        }
      }

      // License is valid, check if we have any users
      const userCount = await prisma.user.count()
      
      if (userCount === 0) {
        return {
          canProceed: false,
          requiresActivation: false,
          requiresLogin: false,
          error: 'No users found in database'
        }
      }

      // All checks passed
      return {
        canProceed: true,
        requiresActivation: false,
        requiresLogin: true
      }
    } catch (error) {
      console.error('Startup check failed:', error)
      return {
        canProceed: false,
        requiresActivation: true,
        requiresLogin: false,
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
   * Get trial status if no license is activated
   */
  async getTrialStatus() {
    try {
      // Check if trial has been started
      const trialSetting = await prisma.setting.findUnique({
        where: { key: 'trial_start_date' }
      })

      if (!trialSetting) {
        // Start trial
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days

        await prisma.setting.create({
          data: {
            key: 'trial_start_date',
            value: startDate.toISOString()
          }
        })

        return {
          isTrialActive: true,
          startDate,
          endDate,
          daysRemaining: 14,
          isExpired: false
        }
      }

      const startDate = new Date(trialSetting.value)
      const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000)
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
      const isExpired = now > endDate

      return {
        isTrialActive: !isExpired,
        startDate,
        endDate,
        daysRemaining,
        isExpired
      }
    } catch (error) {
      console.error('Trial status check failed:', error)
      return {
        isTrialActive: false,
        startDate: new Date(),
        endDate: new Date(),
        daysRemaining: 0,
        isExpired: true
      }
    }
  }
}

export const startupService = new StartupService()