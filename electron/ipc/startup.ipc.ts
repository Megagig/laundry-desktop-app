import { ipcMain } from 'electron'
import { startupService } from '../services/startup.service.js'

export function registerStartupHandlers() {
  // Perform startup security checks
  ipcMain.handle('startup:check', async () => {
    return await startupService.performStartupChecks()
  })

  // Check if license is valid
  ipcMain.handle('startup:is-license-valid', async () => {
    return await startupService.isLicenseValid()
  })

  // Get trial status
  ipcMain.handle('startup:get-trial-status', async () => {
    return await startupService.getTrialStatus()
  })

  // Check if application should be blocked
  ipcMain.handle('startup:should-block', async () => {
    return await startupService.shouldBlockApplication()
  })
}

// Auto-register handlers
registerStartupHandlers()