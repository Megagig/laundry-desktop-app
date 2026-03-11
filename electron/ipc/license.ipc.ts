import { ipcMain } from 'electron'
import { licenseService } from '../services/license.service.js'
import { machineIdService } from '../services/machine-id.service.js'
import { checkPermission } from '../middleware/permission.middleware.js'
import { PERMISSIONS } from '../../shared/types/permissions.js'

export function registerLicenseHandlers() {
  // Activate license (Admin only)
  ipcMain.handle('license:activate', async (_event, sessionToken: string, licenseKey: string) => {
    try {
      // Check permission
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await licenseService.activateLicense(licenseKey)
      return { success: true, data: result }
    } catch (error) {
      console.error('License activation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'License activation failed' 
      }
    }
  })

  // Deactivate license (Admin only)
  ipcMain.handle('license:deactivate', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await licenseService.deactivateLicense()
      return { success: true }
    } catch (error) {
      console.error('License deactivation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'License deactivation failed' 
      }
    }
  })

  // Get license info (All users can view)
  ipcMain.handle('license:getInfo', async (_event, sessionToken?: string) => {
    try {
      // If session token provided, validate it, otherwise allow public access
      if (sessionToken) {
        const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_DASHBOARD)
        if (!permissionCheck.success) {
          return { success: false, error: permissionCheck.error }
        }
      }

      const license = await licenseService.getLicenseInfo()
      return { success: true, data: license }
    } catch (error) {
      console.error('Get license info failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get license info' 
      }
    }
  })

  // Get license status (All users can view)
  ipcMain.handle('license:getStatus', async (_event, sessionToken?: string) => {
    try {
      if (sessionToken) {
        const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_DASHBOARD)
        if (!permissionCheck.success) {
          return { success: false, error: permissionCheck.error }
        }
      }

      const status = await licenseService.checkLicenseStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Get license status failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get license status' 
      }
    }
  })

  // Validate license (Public access for activation)
  ipcMain.handle('license:validate', async (_event, licenseKey: string) => {
    try {
      const machineId = await machineIdService.getMachineId()
      const result = await licenseService.validateLicense(licenseKey, machineId)
      return { success: true, data: result }
    } catch (error) {
      console.error('License validation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'License validation failed' 
      }
    }
  })

  // Get machine info (Public access for activation)
  ipcMain.handle('license:getMachineInfo', async (_event) => {
    try {
      const machineInfo = await machineIdService.getMachineInfo()
      return { success: true, data: machineInfo }
    } catch (error) {
      console.error('Get machine info failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get machine info' 
      }
    }
  })

  // Check if feature is enabled (Public access)
  ipcMain.handle('license:hasFeature', async (_event, feature: string) => {
    try {
      const hasFeature = await licenseService.hasFeature(feature)
      return { success: true, data: hasFeature }
    } catch (error) {
      console.error('Failed to check feature:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check feature' 
      }
    }
  })

  // Get expiry warning (Public access)
  ipcMain.handle('license:getExpiryWarning', async (_event) => {
    try {
      const warning = await licenseService.getExpiryWarning()
      return { success: true, data: warning }
    } catch (error) {
      console.error('Failed to get expiry warning:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get expiry warning' 
      }
    }
  })

  // License management handlers (Admin only)
  ipcMain.handle('license:getAll', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const licenses = await licenseService.getAllLicenses()
      return { success: true, data: licenses }
    } catch (error) {
      console.error('Failed to get all licenses:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get licenses' 
      }
    }
  })
  
  ipcMain.handle('license:getHistory', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const history = await licenseService.getLicenseHistory()
      return { success: true, data: history }
    } catch (error) {
      console.error('Failed to get license history:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get license history' 
      }
    }
  })
  
  ipcMain.handle('license:exportData', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_BACKUP)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const exportData = await licenseService.exportLicenseData()
      return { success: true, data: exportData }
    } catch (error) {
      console.error('Failed to export license data:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to export license data' 
      }
    }
  })
  
  ipcMain.handle('license:createBackup', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_BACKUP)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const backupPath = await licenseService.createLicenseBackup()
      return { success: true, data: { backupPath } }
    } catch (error) {
      console.error('Failed to create license backup:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create license backup' 
      }
    }
  })
  
  ipcMain.handle('license:getStats', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_REPORTS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const stats = await licenseService.getLicenseStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Failed to get license stats:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get license stats' 
      }
    }
  })
  
  ipcMain.handle('license:validateStored', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const validation = await licenseService.validateStoredLicenses()
      return { success: true, data: validation }
    } catch (error) {
      console.error('Failed to validate stored licenses:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to validate stored licenses' 
      }
    }
  })
  
  ipcMain.handle('license:cleanupExpired', async (_event, sessionToken: string, daysOld: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const deletedCount = await licenseService.cleanupExpiredLicenses(daysOld)
      return { success: true, data: { deletedCount } }
    } catch (error) {
      console.error('Failed to cleanup expired licenses:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup expired licenses' 
      }
    }
  })
  
  ipcMain.handle('license:migrateData', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await licenseService.migrateLicenseData()
      return { success: true }
    } catch (error) {
      console.error('Failed to migrate license data:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to migrate license data' 
      }
    }
  })
  
  ipcMain.handle('license:updateMetadata', async (_event, sessionToken: string, licenseId: number, updates: any) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await licenseService.updateLicenseMetadata(licenseId, updates)
      return { success: true }
    } catch (error) {
      console.error('Failed to update license metadata:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update license metadata' 
      }
    }
  })
  
  ipcMain.handle('license:archive', async (_event, sessionToken: string, licenseId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await licenseService.archiveLicense(licenseId)
      return { success: true }
    } catch (error) {
      console.error('Failed to archive license:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to archive license' 
      }
    }
  })
  
  ipcMain.handle('license:delete', async (_event, sessionToken: string, licenseId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await licenseService.deleteLicense(licenseId)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete license:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete license' 
      }
    }
  })
}

// Auto-register handlers
registerLicenseHandlers()