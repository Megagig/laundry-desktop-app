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
  
  /**
   * Get all stored licenses (including inactive ones)
   */
  async getAllLicenses(): Promise<any[]> {
    const licenses = await prisma.license.findMany({
      orderBy: { activatedAt: 'desc' }
    })
    
    return licenses.map(license => ({
      id: license.id,
      issuedTo: license.issuedTo,
      email: license.email,
      licenseType: license.licenseType,
      features: license.features?.split(',') || [],
      maxUsers: license.maxUsers,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      activatedAt: license.activatedAt,
      isActive: license.isActive,
      machineId: license.machineId,
      daysRemaining: license.expiresAt ? 
        Math.max(0, Math.ceil((license.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 
        null,
      isExpired: license.expiresAt ? new Date() > license.expiresAt : false
    }))
  }
  
  /**
   * Get license history for audit purposes
   */
  async getLicenseHistory(): Promise<any[]> {
    const licenses = await prisma.license.findMany({
      orderBy: { activatedAt: 'desc' }
    })
    
    return licenses.map(license => ({
      id: license.id,
      issuedTo: license.issuedTo,
      licenseType: license.licenseType,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      isActive: license.isActive,
      status: license.isActive ? 'Active' : 
              (license.expiresAt && new Date() > license.expiresAt) ? 'Expired' : 'Inactive'
    }))
  }
  
  /**
   * Export license data for backup purposes
   */
  async exportLicenseData(): Promise<string> {
    const licenses = await this.getAllLicenses()
    
    const exportData = {
      exportDate: new Date().toISOString(),
      machineId: await machineIdService.getMachineId(),
      licenses: licenses.map(license => ({
        issuedTo: license.issuedTo,
        email: license.email,
        licenseType: license.licenseType,
        features: license.features,
        maxUsers: license.maxUsers,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        activatedAt: license.activatedAt,
        isActive: license.isActive
        // Note: licenseKey and signature are excluded for security
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  /**
   * Create a backup of license data
   */
  async createLicenseBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `license-backup-${timestamp}.json`
    const fs = await import('fs')
    const path = await import('path')
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(process.cwd(), 'backups', 'licenses')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }
    
    const exportData = await this.exportLicenseData()
    const filePath = path.join(backupsDir, filename)
    
    fs.writeFileSync(filePath, exportData)
    
    console.log(`License backup created: ${filePath}`)
    return filePath
  }
  
  /**
   * Clean up expired licenses (optional maintenance)
   */
  async cleanupExpiredLicenses(daysOld: number = 365): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    const result = await prisma.license.deleteMany({
      where: {
        AND: [
          { isActive: false },
          { expiresAt: { lt: cutoffDate } }
        ]
      }
    })
    
    console.log(`Cleaned up ${result.count} expired licenses older than ${daysOld} days`)
    return result.count
  }
  
  /**
   * Get license storage statistics
   */
  async getLicenseStats(): Promise<{
    total: number
    active: number
    expired: number
    inactive: number
    byType: Record<string, number>
  }> {
    const licenses = await prisma.license.findMany()
    const now = new Date()
    
    const stats = {
      total: licenses.length,
      active: 0,
      expired: 0,
      inactive: 0,
      byType: {} as Record<string, number>
    }
    
    licenses.forEach(license => {
      // Count by status
      if (license.isActive) {
        stats.active++
      } else if (license.expiresAt && now > license.expiresAt) {
        stats.expired++
      } else {
        stats.inactive++
      }
      
      // Count by type
      stats.byType[license.licenseType] = (stats.byType[license.licenseType] || 0) + 1
    })
    
    return stats
  }
  
  /**
   * Validate stored license integrity
   */
  async validateStoredLicenses(): Promise<{
    valid: number
    invalid: number
    details: Array<{ id: number; issuedTo: string; error: string }>
  }> {
    const licenses = await prisma.license.findMany()
    const results = {
      valid: 0,
      invalid: 0,
      details: [] as Array<{ id: number; issuedTo: string; error: string }>
    }
    
    for (const license of licenses) {
      try {
        const validation = await this.validateLicense(license.licenseKey)
        
        if (validation.valid) {
          results.valid++
        } else {
          results.invalid++
          results.details.push({
            id: license.id,
            issuedTo: license.issuedTo,
            error: validation.error || 'Unknown validation error'
          })
        }
      } catch (error) {
        results.invalid++
        results.details.push({
          id: license.id,
          issuedTo: license.issuedTo,
          error: error instanceof Error ? error.message : 'Validation failed'
        })
      }
    }
    
    return results
  }
  
  /**
   * Migrate license data (for version updates)
   */
  async migrateLicenseData(): Promise<void> {
    console.log('Starting license data migration...')
    
    const licenses = await prisma.license.findMany()
    
    for (const license of licenses) {
      try {
        // Re-validate and update license data if needed
        const validation = await this.validateLicense(license.licenseKey)
        
        if (validation.valid && validation.license) {
          // Update license data with latest validation results
          await prisma.license.update({
            where: { id: license.id },
            data: {
              // Update any fields that might have changed
              features: validation.license.features,
              maxUsers: validation.license.maxUsers
            }
          })
        }
      } catch (error) {
        console.error(`Migration failed for license ${license.id}:`, error)
      }
    }
    
    console.log('License data migration complete')
  }
  
  /**
   * Update license metadata (for renewals or changes)
   */
  async updateLicenseMetadata(licenseId: number, updates: {
    expiresAt?: Date | null
    maxUsers?: number
    features?: string[]
    isActive?: boolean
  }): Promise<void> {
    const license = await prisma.license.findUnique({
      where: { id: licenseId }
    })
    
    if (!license) {
      throw new Error('License not found')
    }
    
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        expiresAt: updates.expiresAt,
        maxUsers: updates.maxUsers,
        features: updates.features?.join(','),
        isActive: updates.isActive
      }
    })
    
    console.log(`License metadata updated for: ${license.issuedTo}`)
  }
  
  /**
   * Archive old license (soft delete)
   */
  async archiveLicense(licenseId: number): Promise<void> {
    await prisma.license.update({
      where: { id: licenseId },
      data: { isActive: false }
    })
    
    console.log(`License ${licenseId} archived`)
  }
  
  /**
   * Permanently delete license (hard delete)
   */
  async deleteLicense(licenseId: number): Promise<void> {
    const license = await prisma.license.findUnique({
      where: { id: licenseId }
    })
    
    if (!license) {
      throw new Error('License not found')
    }
    
    await prisma.license.delete({
      where: { id: licenseId }
    })
    
    console.log(`License permanently deleted for: ${license.issuedTo}`)
  }
}

export const licenseService = new LicenseService()