import { ipcMain, dialog } from "electron"
import { backupService } from "../services/backup.service.js"

// Create backup
ipcMain.handle("backup:create", async (event, customPath?: string) => {
  try {
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

    return await backupService.createBackup(targetPath)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Restore backup
ipcMain.handle("backup:restore", async () => {
  try {
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
    
    return await backupService.restoreBackup(backupPath)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// List backups
ipcMain.handle("backup:list", async () => {
  try {
    return await backupService.listBackups()
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Delete backup
ipcMain.handle("backup:delete", async (event, backupPath: string) => {
  try {
    return await backupService.deleteBackup(backupPath)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Export to CSV
ipcMain.handle("backup:export-csv", async (event, tableName: string) => {
  try {
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

    return await backupService.exportToCSV(tableName, result.filePath)
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Get database stats
ipcMain.handle("backup:get-stats", async () => {
  try {
    return await backupService.getDatabaseStats()
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

console.log("✓ Backup IPC handlers registered")
