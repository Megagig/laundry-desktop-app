import { ipcMain } from 'electron'
import { trialService } from '../services/trial.service.js'
import { checkPermission } from '../middleware/permission.middleware.js'
import { PERMISSIONS } from '../../shared/types/permissions.js'

export function registerTrialHandlers() {
  // Start trial (Public access for new users)
  ipcMain.handle('trial:start', async (_event) => {
    try {
      const result = await trialService.startTrial()
      return { success: true, data: result }
    } catch (error) {
      console.error('Trial start failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start trial' 
      }
    }
  })

  // Get trial status (Public access)
  ipcMain.handle('trial:getStatus', async (_event) => {
    try {
      const status = await trialService.getTrialStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Get trial status failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get trial status' 
      }
    }
  })

  // Check if trial is expired (Public access)
  ipcMain.handle('trial:isExpired', async (_event) => {
    try {
      const isExpired = await trialService.isTrialExpired()
      return { success: true, data: isExpired }
    } catch (error) {
      console.error('Check trial expiry failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check trial expiry' 
      }
    }
  })

  // Check if trial is active (Public access)
  ipcMain.handle('trial:isActive', async (_event) => {
    try {
      const isActive = await trialService.isTrialActive()
      return { success: true, data: isActive }
    } catch (error) {
      console.error('Check trial active failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check trial active' 
      }
    }
  })

  // Get days remaining (Public access)
  ipcMain.handle('trial:getDaysRemaining', async (_event) => {
    try {
      const daysRemaining = await trialService.getDaysRemaining()
      return { success: true, data: daysRemaining }
    } catch (error) {
      console.error('Get days remaining failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get days remaining' 
      }
    }
  })

  // Get trial warning message (Public access)
  ipcMain.handle('trial:getWarning', async (_event) => {
    try {
      const warning = await trialService.getTrialWarning()
      return { success: true, data: warning }
    } catch (error) {
      console.error('Get trial warning failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get trial warning' 
      }
    }
  })

  // Check if user can start trial (Public access)
  ipcMain.handle('trial:canStart', async (_event) => {
    try {
      const canStart = await trialService.canStartTrial()
      return { success: true, data: canStart }
    } catch (error) {
      console.error('Check can start trial failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check can start trial' 
      }
    }
  })

  // Get trial info (Public access)
  ipcMain.handle('trial:getInfo', async (_event) => {
    try {
      const info = await trialService.getTrialInfo()
      return { success: true, data: info }
    } catch (error) {
      console.error('Get trial info failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get trial info' 
      }
    }
  })

  // Check if application should be blocked (Public access)
  ipcMain.handle('trial:shouldBlock', async (_event) => {
    try {
      const shouldBlock = await trialService.shouldBlockApplication()
      return { success: true, data: shouldBlock }
    } catch (error) {
      console.error('Check should block failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check should block' 
      }
    }
  })

  // Admin-only handlers
  
  // Reset trial (Admin only - for testing)
  ipcMain.handle('trial:reset', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_LICENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await trialService.resetTrial()
      return { success: true }
    } catch (error) {
      console.error('Trial reset failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset trial' 
      }
    }
  })

  // Get trial statistics (Admin only)
  ipcMain.handle('trial:getStats', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_REPORTS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const stats = await trialService.getTrialStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Get trial stats failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get trial stats' 
      }
    }
  })
}

// Auto-register handlers
registerTrialHandlers()