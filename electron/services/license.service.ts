import { PrismaClient } from '@prisma/client'
import { machineIdService } from './machine-id.service.js'
import { cryptoService } from './crypto.service.js'
import type { LicensePayload, LicenseValidationResult, LicenseStatus } from '../../shared/types/license.types.js'

const prisma = new PrismaClient()

export class LicenseService {
  /**
   * Validate a license key against machine ID and signature
   */
  async validateLicense(licenseKey: string, machineId?: string): Promise<LicenseValidationResult> {
    try {
      // Get machine ID if not provided
      const currentMachineId = machineId || await machineIdService.getMachineId()
      
      // Verify cryptographic signature using crypto service
      const verification = await cryptoService.verifyLicenseKey(licenseKey)
      
      if (!verification.valid) {
        return { 
          valid: false, 
          error: verification.error || 'Invalid license signature'
        }
      }
      
      const payload: LicensePayload = verification.payload
      
      // Validate machine ID match
      if (payload.machineId !== currentMachineId) {
        return { 
          valid: false, 
          error: 'License is not valid for this machine',
          details: `Expected: ${payload.machineId}, Got: ${currentMachineId}`
        }
      }
      
      // Check license expiry
      if (payload.expiresAt) {
        const expiryDate = new Date(payload.expiresAt)
        const now = new Date()
        
        if (now > expiryDate) {
          return { 
            valid: false, 
            error: 'License has expired',
            details: `Expired on: ${expiryDate.toLocaleDateString()}`
          }
        }
      }
      
      // Validate product and version compatibility
      if (payload.product !== 'LaundryPro') {
        return { valid: false, error: 'License is not for this product' }
      }
      
      // License is valid
      return {
        valid: true,
        license: {
          licenseKey,
          machineId: payload.machineId,
          issuedTo: payload.issuedTo,
          email: payload.email || '',
          licenseType: payload.licenseType,
          features: payload.features?.join(',') || '',
          maxUsers: payload.maxUsers || 1,
          issuedAt: new Date(payload.issuedAt),
          expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
          signature: verification.payload ? 
            Buffer.from(JSON.stringify({
              payload: JSON.stringify(verification.payload),
              signature: 'verified'
            })).toString('base64').substring(0, 100) : 
            'unknown',
          isActive: true
        }
      }
      
    } catch (error) {
      console.error('License validation error:', error)
      return { 
        valid: false, 
        error: 'License validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Activate a license by storing it in the database
   */
  async activateLicense(licenseKey: string): Promise<void> {
    const validation = await this.validateLicense(licenseKey)
    
    if (!validation.valid || !validation.license) {
      throw new Error(validation.error || 'Invalid license')
    }
    
    // Deactivate any existing licenses
    await prisma.license.updateMany({
      data: { isActive: false }
    })
    
    // Store the new license
    await prisma.license.create({
      data: {
        ...validation.license,
        activatedAt: new Date()
      }
    })
    
    console.log('License activated successfully for:', validation.license.issuedTo)
  }
  
  /**
   * Deactivate the current license
   */
  async deactivateLicense(): Promise<void> {
    await prisma.license.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    
    console.log('License deactivated')
  }
  
  /**
   * Get current license information
   */
  async getLicenseInfo(): Promise<any> {
    const license = await prisma.license.findFirst({
      where: { isActive: true }
    })
    
    if (!license) {
      return null
    }
    
    return {
      issuedTo: license.issuedTo,
      email: license.email,
      licenseType: license.licenseType,
      features: license.features?.split(',') || [],
      maxUsers: license.maxUsers,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      activatedAt: license.activatedAt,
      daysRemaining: license.expiresAt ? 
        Math.max(0, Math.ceil((license.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 
        null
    }
  }
  
  /**
   * Check current license status
   */
  async checkLicenseStatus(): Promise<LicenseStatus> {
    const license = await prisma.license.findFirst({
      where: { isActive: true }
    })
    
    if (!license) {
      return {
        isActivated: false,
        isValid: false,
        isExpired: false,
        licenseType: 'NONE',
        expiresAt: null,
        daysRemaining: null,
        features: [],
        issuedTo: '',
        maxUsers: 1
      }
    }
    
    const now = new Date()
    const isExpired = license.expiresAt ? now > license.expiresAt : false
    const daysRemaining = license.expiresAt ? 
      Math.max(0, Math.ceil((license.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))) : 
      null
    
    // Re-validate license to ensure it's still valid
    const validation = await this.validateLicense(license.licenseKey)
    
    return {
      isActivated: true,
      isValid: validation.valid && !isExpired,
      isExpired,
      licenseType: license.licenseType,
      expiresAt: license.expiresAt,
      daysRemaining,
      features: license.features?.split(',') || [],
      issuedTo: license.issuedTo,
      maxUsers: license.maxUsers
    }
  }
  
  /**
   * Check if license is valid
   */
  async isLicenseValid(): Promise<boolean> {
    const status = await this.checkLicenseStatus()
    return status.isValid
  }
  
  /**
   * Check if license is expired
   */
  async isLicenseExpired(): Promise<boolean> {
    const status = await this.checkLicenseStatus()
    return status.isExpired
  }
  
  /**
   * Get days until license expiry
   */
  async getDaysUntilExpiry(): Promise<number | null> {
    const status = await this.checkLicenseStatus()
    return status.daysRemaining
  }
  
  /**
   * Check if a specific feature is enabled
   */
  async hasFeature(feature: string): Promise<boolean> {
    const info = await this.getLicenseInfo()
    if (!info) return false
    
    return info.features.includes(feature) || info.features.includes('all')
  }
  
  /**
   * Get maximum number of users allowed
   */
  async getMaxUsers(): Promise<number> {
    const info = await this.getLicenseInfo()
    return info?.maxUsers || 1
  }
  
  /**
   * Parse license key format
   */
  private parseLicenseKey(licenseKey: string): { payload: string; signature: string } | null {
    try {
      // License key is base64 encoded JSON containing payload and signature
      const decoded = JSON.parse(Buffer.from(licenseKey, 'base64').toString())
      
      if (!decoded.payload || !decoded.signature) {
        return null
      }
      
      return {
        payload: decoded.payload,
        signature: decoded.signature
      }
    } catch (error) {
      return null
    }
  }
  
  /**
   * Get license expiry warning message
   */
  async getExpiryWarning(): Promise<string | null> {
    const daysRemaining = await this.getDaysUntilExpiry()
    
    if (daysRemaining === null) {
      return null // Lifetime license
    }
    
    if (daysRemaining <= 0) {
      return 'Your license has expired. Please renew to continue using the application.'
    }
    
    if (daysRemaining <= 7) {
      return `Your license expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Please renew soon.`
    }
    
    if (daysRemaining <= 30) {
      return `Your license expires in ${daysRemaining} days. Consider renewing soon.`
    }
    
    return null
  }
}

export const licenseService = new LicenseService()