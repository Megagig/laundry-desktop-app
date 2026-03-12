import { ipcMain } from "electron"
import {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  updateSettings
} from "../services/settings.service.js"
import { auditService } from "../services/audit.service.js"
import { checkPermission } from "../middleware/permission.middleware.js"
import { PERMISSIONS } from "../../shared/types/permissions.js"

/**
 * Get all settings
 */
ipcMain.handle("settings:get-all", async (_event, sessionToken: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    const settings = await getAllSettings()
    return { success: true, data: settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Get setting by key
 */
ipcMain.handle("settings:get", async (_event, sessionToken: string, key: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    const value = await getSettingByKey(key)
    return { success: true, data: value }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Update or create setting
 */
ipcMain.handle("settings:upsert", async (_event, sessionToken: string, key: string, value: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    // Get original value for audit log
    const originalValue = await getSettingByKey(key)
    
    const success = await upsertSetting(key, value)
    
    // Log settings change
    await auditService.logDataOperation(
      originalValue ? 'UPDATE' : 'CREATE',
      'SETTINGS',
      key,
      permissionCheck.userId!,
      permissionCheck.user.username,
      { 
        key,
        originalValue,
        newValue: value
      }
    )
    
    return { success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

/**
 * Update multiple settings
 */
ipcMain.handle("settings:update-multiple", async (_event, sessionToken: string, settings: Record<string, string>) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    const success = await updateSettings(settings)
    
    // Log bulk settings update
    await auditService.logDataOperation(
      'UPDATE',
      'SETTINGS',
      'bulk_update',
      permissionCheck.userId!,
      permissionCheck.user.username,
      { 
        updatedSettings: Object.keys(settings),
        settingsCount: Object.keys(settings).length
      }
    )
    
    return { success }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

console.log("✓ Settings handlers registered")
