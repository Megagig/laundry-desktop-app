import { PrismaClient } from '@prisma/client'
import { machineIdService } from './machine-id.service.js'

const prisma = new PrismaClient()

export interface TrialInfo {
  startDate: Date
  endDate: Date
  daysRemaining: number
  isExpired: boolean
  isActive: boolean
  machineId: string
}

export interface TrialStatus {
  hasTrialStarted: boolean
  isTrialActive: boolean
  isTrialExpired: boolean
  daysRemaining: number
  startDate: Date | null
  endDate: Date | null
  canStartTrial: boolean
  machineId: string
}

/**
 * Trial Mode Service
 * 
 * Manages 14-day trial period for the application.
 * Prevents trial reset attempts and tracks trial usage.
 */
export class TrialService {
  private readonly TRIAL_DURATION_DAYS = 14
  private readonly TRIAL_SETTING_KEY = 'trial_start_date'
  private readonly TRIAL_MACHINE_KEY = 'trial_machine_id'
  
  /**
   * Start a new trial period
   */
  async startTrial(): Promise<TrialInfo> {
    const machineId = await machineIdService.getMachineId()
    
    // Check if trial already exists for this machine
    const existingTrial = await this.getTrialStatus()
    if (existingTrial.hasTrialStarted) {
      throw new Error('Trial has already been started on this machine')
    }
    
    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)
    
    // Store trial start date
    await prisma.setting.upsert({
      where: { key: this.TRIAL_SETTING_KEY },
      update: { value: startDate.toISOString() },
      create: { key: this.TRIAL_SETTING_KEY, value: startDate.toISOString() }
    })
    
    // Store machine ID to prevent trial reset
    await prisma.setting.upsert({
      where: { key: this.TRIAL_MACHINE_KEY },
      update: { value: machineId },
      create: { key: this.TRIAL_MACHINE_KEY, value: machineId }
    })
    
    console.log(`Trial started for machine ${machineId}, expires on ${endDate.toLocaleDateString()}`)
    
    return {
      startDate,
      endDate,
      daysRemaining: this.TRIAL_DURATION_DAYS,
      isExpired: false,
      isActive: true,
      machineId
    }
  }
  
  /**
   * Get current trial status
   */
  async getTrialStatus(): Promise<TrialStatus> {
    const machineId = await machineIdService.getMachineId()
    
    const trialStartSetting = await prisma.setting.findUnique({
      where: { key: this.TRIAL_SETTING_KEY }
    })
    
    const trialMachineSetting = await prisma.setting.findUnique({
      where: { key: this.TRIAL_MACHINE_KEY }
    })
    
    // No trial has been started
    if (!trialStartSetting || !trialMachineSetting) {
      return {
        hasTrialStarted: false,
        isTrialActive: false,
        isTrialExpired: false,
        daysRemaining: this.TRIAL_DURATION_DAYS,
        startDate: null,
        endDate: null,
        canStartTrial: true,
        machineId
      }
    }
    
    // Check if trial was started on a different machine (prevent trial reset)
    if (trialMachineSetting.value !== machineId) {
      return {
        hasTrialStarted: true,
        isTrialActive: false,
        isTrialExpired: true,
        daysRemaining: 0,
        startDate: new Date(trialStartSetting.value),
        endDate: new Date(new Date(trialStartSetting.value).getTime() + this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000),
        canStartTrial: false,
        machineId
      }
    }
    
    const startDate = new Date(trialStartSetting.value)
    const endDate = new Date(startDate.getTime() + this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000)
    const now = new Date()
    
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    const isExpired = now > endDate
    
    return {
      hasTrialStarted: true,
      isTrialActive: !isExpired,
      isTrialExpired: isExpired,
      daysRemaining,
      startDate,
      endDate,
      canStartTrial: false,
      machineId
    }
  }
  
  /**
   * Check if trial is expired
   */
  async isTrialExpired(): Promise<boolean> {
    const status = await this.getTrialStatus()
    return status.isTrialExpired
  }
  
  /**
   * Check if trial is active (started and not expired)
   */
  async isTrialActive(): Promise<boolean> {
    const status = await this.getTrialStatus()
    return status.isTrialActive
  }
  
  /**
   * Get days remaining in trial
   */
  async getDaysRemaining(): Promise<number> {
    const status = await this.getTrialStatus()
    return status.daysRemaining
  }
  
  /**
   * Get trial expiry warning message
   */
  async getTrialWarning(): Promise<string | null> {
    const status = await this.getTrialStatus()
    
    if (!status.hasTrialStarted) {
      return null
    }
    
    if (status.isTrialExpired) {
      return 'Your 14-day trial has expired. Please activate a license to continue using the application.'
    }
    
    if (status.daysRemaining <= 1) {
      return `Your trial expires ${status.daysRemaining === 0 ? 'today' : 'tomorrow'}. Activate a license now to avoid interruption.`
    }
    
    if (status.daysRemaining <= 3) {
      return `Your trial expires in ${status.daysRemaining} days. Consider activating a license soon.`
    }
    
    if (status.daysRemaining <= 7) {
      return `Your trial expires in ${status.daysRemaining} days. Don't forget to activate your license.`
    }
    
    return null
  }
  
  /**
   * Check if user can start a trial
   */
  async canStartTrial(): Promise<boolean> {
    const status = await this.getTrialStatus()
    return status.canStartTrial
  }
  
  /**
   * Reset trial (Admin only - for testing purposes)
   */
  async resetTrial(): Promise<void> {
    await prisma.setting.deleteMany({
      where: {
        key: {
          in: [this.TRIAL_SETTING_KEY, this.TRIAL_MACHINE_KEY]
        }
      }
    })
    
    console.log('Trial reset completed')
  }
  
  /**
   * Get trial information for display
   */
  async getTrialInfo(): Promise<TrialInfo | null> {
    const status = await this.getTrialStatus()
    
    if (!status.hasTrialStarted || !status.startDate || !status.endDate) {
      return null
    }
    
    return {
      startDate: status.startDate,
      endDate: status.endDate,
      daysRemaining: status.daysRemaining,
      isExpired: status.isTrialExpired,
      isActive: status.isTrialActive,
      machineId: status.machineId
    }
  }
  
  /**
   * Check if application should be blocked due to expired trial
   */
  async shouldBlockApplication(): Promise<boolean> {
    // First check if there's a valid license
    const licenseStatus = await this.checkLicenseStatus()
    if (licenseStatus.hasValidLicense) {
      return false // Valid license overrides trial
    }
    
    // Check trial status
    const trialStatus = await this.getTrialStatus()
    
    // If no trial started and no license, allow trial to start
    if (!trialStatus.hasTrialStarted) {
      return false
    }
    
    // Block if trial is expired
    return trialStatus.isTrialExpired
  }
  
  /**
   * Check license status (simplified check)
   */
  private async checkLicenseStatus(): Promise<{ hasValidLicense: boolean }> {
    try {
      const license = await prisma.license.findFirst({
        where: { isActive: true }
      })
      
      if (!license) {
        return { hasValidLicense: false }
      }
      
      // Check if license is expired
      if (license.expiresAt && new Date() > license.expiresAt) {
        return { hasValidLicense: false }
      }
      
      return { hasValidLicense: true }
    } catch (error) {
      return { hasValidLicense: false }
    }
  }
  
  /**
   * Get trial statistics for admin
   */
  async getTrialStats(): Promise<{
    trialStarted: boolean
    startDate: Date | null
    endDate: Date | null
    daysUsed: number
    daysRemaining: number
    machineId: string
    status: 'not_started' | 'active' | 'expired'
  }> {
    const status = await this.getTrialStatus()
    
    let daysUsed = 0
    if (status.startDate) {
      const now = new Date()
      const startDate = status.startDate
      daysUsed = Math.max(0, Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
    }
    
    let trialStatus: 'not_started' | 'active' | 'expired' = 'not_started'
    if (status.hasTrialStarted) {
      trialStatus = status.isTrialExpired ? 'expired' : 'active'
    }
    
    return {
      trialStarted: status.hasTrialStarted,
      startDate: status.startDate,
      endDate: status.endDate,
      daysUsed,
      daysRemaining: status.daysRemaining,
      machineId: status.machineId,
      status: trialStatus
    }
  }
}

export const trialService = new TrialService()