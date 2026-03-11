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
}

// Auto-register handlers
registerLicenseHandlers()