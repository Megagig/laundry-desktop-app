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
}

// Auto-register handlers
registerStartupHandlers()