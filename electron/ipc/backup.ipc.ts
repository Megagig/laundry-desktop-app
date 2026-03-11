import { ipcMain, dialog } from "electron"
import { backupService } from "../services/backup.service.js"
import { auditService } from "../services/audit.service.js"
import { checkPermission } from "../middleware/permission.middleware.js"
import { PERMISSIONS } from "../../shared/types/permissions.js"

// Create backup
ipcMain.handle("backup:create", async (event, sessionToken: string, customPath?: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_BACKUP)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    let targetPath = customPath

    // If no custom path, ask user
    if (!customPath) {
      const result = await dialog.showSaveDialog({
        title: "Save Backup",
        defaultPath: `laundry_backup_${new Date().toISOString().split("T")[0]}.db`,
        filters: [
          { name: "Database Files", extensions: ["db"] },
          { name: "All Files", extensions: ["*"] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { success: false, error: "Backup cancelled" }
      }

      targetPath = result.filePath
    }

    const result = await backupService.createBackup(targetPath)
    
    // Log backup creation
    if (result.success) {
      await auditService.logDataOperation(
        'CREATE',
        'BACKUP',
        targetPath || 'unknown',
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          backupPath: targetPath
        }
      )
    }
    
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Restore backup
ipcMain.handle("backup:restore", async (_event, sessionToken: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.RESTORE_BACKUP)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    // Ask user to select backup file
    const result = await dialog.showOpenDialog({
      title: "Select Backup File",
      filters: [
        { name: "Database Files", extensions: ["db"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: "Restore cancelled" }
    }

    const backupPath = result.filePaths[0]
    if (!backupPath) {
      return { success: false, error: "No backup file selected" }
    }
    
    const restoreResult = await backupService.restoreBackup(backupPath)
    
    // Log backup restoration
    if (restoreResult.success) {
      await auditService.logDataOperation(
        'UPDATE',
        'BACKUP',
        'restore',
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          backupPath,
          action: 'restore'
        }
      )
    }
    
    return restoreResult
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// List backups
ipcMain.handle("backup:list", async (_event, sessionToken: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    return await backupService.listBackups()
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Delete backup
ipcMain.handle("backup:delete", async (event, sessionToken: string, backupPath: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.RESTORE_BACKUP)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    const result = await backupService.deleteBackup(backupPath)
    
    // Log backup deletion
    if (result.success) {
      await auditService.logDataOperation(
        'DELETE',
        'BACKUP',
        backupPath,
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          backupPath,
          action: 'delete'
        }
      )
    }
    
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Export to CSV
ipcMain.handle("backup:export-csv", async (event, sessionToken: string, tableName: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EXPORT_DATA)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    // Ask user where to save
    const result = await dialog.showSaveDialog({
      title: "Export to CSV",
      defaultPath: `${tableName}_${new Date().toISOString().split("T")[0]}.csv`,
      filters: [
        { name: "CSV Files", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, error: "Export cancelled" }
    }

    const exportResult = await backupService.exportToCSV(tableName, result.filePath)
    
    // Log data export
    if (exportResult.success) {
      await auditService.logDataOperation(
        'READ',
        'EXPORT',
        tableName,
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          tableName,
          exportPath: result.filePath
        }
      )
    }
    
    return exportResult
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Get database stats
ipcMain.handle("backup:get-stats", async (_event, sessionToken: string) => {
  try {
    const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SETTINGS)
    if (!permissionCheck.success) {
      return { success: false, error: permissionCheck.error }
    }

    return await backupService.getDatabaseStats()
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

console.log("✓ Backup IPC handlers registered")
