import { licenseService } from './license.service.js'
import { trialService } from './trial.service.js'
import { integrityService } from './integrity.service.js'
import { antiDebugService } from './anti-debug.service.js'
import { auditService } from './audit.service.js'
import { prisma } from '../database/prisma.js'

export interface StartupCheckResult {
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

class StartupService {
  /**
   * Perform all startup security checks
   */
  async performStartupChecks(): Promise<StartupCheckResult> {
    try {
      console.log('🚀 Starting comprehensive security checks...')
      
      // Step 1: Start anti-debugging monitoring
      console.log('🛡️  Starting anti-debug monitoring...')
      antiDebugService.startMonitoring(10000) // Check every 10 seconds
      
      // Step 2: Perform integrity checks
      console.log('🔍 Performing integrity checks...')
      const integrityReport = await integrityService.performIntegrityCheck()
      const integrityValid = integrityReport.overallStatus === 'VALID'
      
      if (!integrityValid) {
        console.error('🚨 System integrity check failed')
        await auditService.logAction({
          action: 'INTEGRITY_FAILURE',
          module: 'SECURITY',
          description: 'System integrity check failed during startup',
          metadata: { report: integrityReport }
        })
        
        return {
          canProceed: false,
          requiresActivation: false,
          requiresLogin: false,
          requiresTrial: false,
          error: 'System integrity check failed. Application may have been tampered with.',
          securityStatus: {
            integrityValid: false,
            debuggerDetected: integrityReport.debuggerDetected,
            antiDebugActive: antiDebugService.getStatus().isMonitoring
          }
        }
      }

      // Step 3: Check license status
      console.log('📄 Checking license status...')
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
            error: 'No users found in database',
            securityStatus: {
              integrityValid: true,
              debuggerDetected: integrityReport.debuggerDetected,
              antiDebugActive: antiDebugService.getStatus().isMonitoring
            }
          }
        }

        console.log('✅ Valid license found, proceeding to login')
        await auditService.logAction({
          action: 'STARTUP_SUCCESS',
          module: 'SYSTEM',
          description: 'Application startup completed with valid license',
          metadata: { licenseType: licenseStatus.licenseType }
        })

        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: true,
          requiresTrial: false,
          securityStatus: {
            integrityValid: true,
            debuggerDetected: integrityReport.debuggerDetected,
            antiDebugActive: antiDebugService.getStatus().isMonitoring
          }
        }
      }

      // Step 4: No valid license - check trial status
      console.log('⏱️  Checking trial status...')
      const trialStatus = await trialService.getTrialStatus()
      
      if (!trialStatus.hasTrialStarted && trialStatus.canStartTrial) {
        // Can start trial
        console.log('✅ Trial can be started')
        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: false,
          requiresTrial: true,
          trialInfo: trialStatus,
          securityStatus: {
            integrityValid: true,
            debuggerDetected: integrityReport.debuggerDetected,
            antiDebugActive: antiDebugService.getStatus().isMonitoring
          }
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
            error: 'No users found in database',
            securityStatus: {
              integrityValid: true,
              debuggerDetected: integrityReport.debuggerDetected,
              antiDebugActive: antiDebugService.getStatus().isMonitoring
            }
          }
        }

        console.log(`✅ Trial active: ${trialStatus.daysRemaining} days remaining`)
        await auditService.logAction({
          action: 'STARTUP_SUCCESS',
          module: 'SYSTEM',
          description: 'Application startup completed with active trial',
          metadata: { daysRemaining: trialStatus.daysRemaining }
        })

        return {
          canProceed: true,
          requiresActivation: false,
          requiresLogin: true,
          requiresTrial: false,
          trialInfo: trialStatus,
          securityStatus: {
            integrityValid: true,
            debuggerDetected: integrityReport.debuggerDetected,
            antiDebugActive: antiDebugService.getStatus().isMonitoring
          }
        }
      }

      if (trialStatus.isTrialExpired) {
        // Trial expired - require activation
        console.log('❌ Trial period has expired')
        await auditService.logAction({
          action: 'TRIAL_EXPIRED',
          module: 'SYSTEM',
          description: 'Trial period expired during startup',
          metadata: { trialStatus }
        })

        return {
          canProceed: false,
          requiresActivation: true,
          requiresLogin: false,
          requiresTrial: false,
          error: 'Trial period has expired. Please activate a license.',
          trialInfo: trialStatus,
          securityStatus: {
            integrityValid: true,
            debuggerDetected: integrityReport.debuggerDetected,
            antiDebugActive: antiDebugService.getStatus().isMonitoring
          }
        }
      }

      // Fallback - require activation
      console.log('❌ License activation required')
      return {
        canProceed: false,
        requiresActivation: true,
        requiresLogin: false,
        requiresTrial: false,
        error: 'License activation required',
        securityStatus: {
          integrityValid: true,
          debuggerDetected: integrityReport.debuggerDetected,
          antiDebugActive: antiDebugService.getStatus().isMonitoring
        }
      }
    } catch (error) {
      console.error('❌ Startup check failed:', error)
      await auditService.logAction({
        action: 'STARTUP_FAILURE',
        module: 'SYSTEM',
        description: 'Startup security checks failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })

      return {
        canProceed: false,
        requiresActivation: true,
        requiresLogin: false,
        requiresTrial: false,
        error: 'Startup check failed',
        securityStatus: {
          integrityValid: false,
          debuggerDetected: false,
          antiDebugActive: false
        }
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

  /**
   * Perform periodic security checks during runtime
   */
  async performPeriodicSecurityCheck(): Promise<boolean> {
    try {
      console.log('🔍 Performing periodic security check...')
      
      // Check integrity
      const integrityValid = await integrityService.performAntiTamperingCheck()
      if (!integrityValid) {
        console.error('🚨 Periodic security check failed - integrity compromised')
        await auditService.logAction({
          action: 'PERIODIC_SECURITY_FAILURE',
          module: 'SECURITY',
          description: 'Periodic integrity check failed'
        })
        return false
      }

      // Re-validate license if activated
      const licenseStatus = await licenseService.checkLicenseStatus()
      if (licenseStatus.isActivated && !licenseStatus.isValid) {
        console.error('🚨 Periodic security check failed - license invalid')
        await auditService.logAction({
          action: 'LICENSE_VALIDATION_FAILURE',
          module: 'SECURITY',
          description: 'License validation failed during periodic check'
        })
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Periodic security check error:', error)
      return false
    }
  }

  /**
   * Shutdown security monitoring
   */
  shutdown(): void {
    console.log('🛑 Shutting down security monitoring...')
    antiDebugService.stopMonitoring()
    
    auditService.logAction({
      action: 'APP_SHUTDOWN',
      module: 'SYSTEM',
      description: 'Application shutdown initiated'
    }).catch(error => {
      console.error('Failed to log shutdown:', error)
    })
  }
}

export const startupService = new StartupService()