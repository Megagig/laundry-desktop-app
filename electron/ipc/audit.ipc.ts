import { ipcMain } from 'electron'
import { auditService, type AuditLogFilters } from '../services/audit.service.js'
import { checkPermission } from '../middleware/permission.middleware.js'
import { PERMISSIONS } from '../../shared/types/permissions.js'

export function registerAuditHandlers() {
  // Get audit logs (Admin/Manager only)
  ipcMain.handle('audit:getLogs', async (_event, sessionToken: string, filters: AuditLogFilters) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const logs = await auditService.getAuditLogs(filters)
      return { success: true, data: logs }
    } catch (error) {
      console.error('Get audit logs failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get audit logs' 
      }
    }
  })

  // Get audit log count (Admin/Manager only)
  ipcMain.handle('audit:getLogCount', async (_event, sessionToken: string, filters: AuditLogFilters) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const count = await auditService.getAuditLogCount(filters)
      return { success: true, data: count }
    } catch (error) {
      console.error('Get audit log count failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get audit log count' 
      }
    }
  })

  // Get logs by user (Admin/Manager only)
  ipcMain.handle('audit:getLogsByUser', async (_event, sessionToken: string, userId: number, limit?: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const logs = await auditService.getLogsByUser(userId, limit)
      return { success: true, data: logs }
    } catch (error) {
      console.error('Get logs by user failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get logs by user' 
      }
    }
  })

  // Get logs by module (Admin/Manager only)
  ipcMain.handle('audit:getLogsByModule', async (_event, sessionToken: string, module: string, limit?: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const logs = await auditService.getLogsByModule(module, limit)
      return { success: true, data: logs }
    } catch (error) {
      console.error('Get logs by module failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get logs by module' 
      }
    }
  })

  // Get logs by date range (Admin/Manager only)
  ipcMain.handle('audit:getLogsByDateRange', async (_event, sessionToken: string, startDate: string, endDate: string, limit?: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const logs = await auditService.getLogsByDateRange(new Date(startDate), new Date(endDate), limit)
      return { success: true, data: logs }
    } catch (error) {
      console.error('Get logs by date range failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get logs by date range' 
      }
    }
  })

  // Search audit logs (Admin/Manager only)
  ipcMain.handle('audit:searchLogs', async (_event, sessionToken: string, searchTerm: string, filters: AuditLogFilters) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const logs = await auditService.searchAuditLogs(searchTerm, filters)
      return { success: true, data: logs }
    } catch (error) {
      console.error('Search audit logs failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search audit logs' 
      }
    }
  })

  // Get audit statistics (Admin/Manager only)
  ipcMain.handle('audit:getStats', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const stats = await auditService.getAuditStats()
      return { success: true, data: stats }
    } catch (error) {
      console.error('Get audit stats failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get audit stats' 
      }
    }
  })

  // Export audit logs (Admin only)
  ipcMain.handle('audit:exportLogs', async (_event, sessionToken: string, filters: AuditLogFilters) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_BACKUP)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const filepath = await auditService.exportAuditLogs(filters)
      return { success: true, data: { filepath } }
    } catch (error) {
      console.error('Export audit logs failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to export audit logs' 
      }
    }
  })

  // Get unique modules (Admin/Manager only)
  ipcMain.handle('audit:getUniqueModules', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const modules = await auditService.getUniqueModules()
      return { success: true, data: modules }
    } catch (error) {
      console.error('Get unique modules failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get unique modules' 
      }
    }
  })

  // Get unique actions (Admin/Manager only)
  ipcMain.handle('audit:getUniqueActions', async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_AUDIT_LOGS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const actions = await auditService.getUniqueActions()
      return { success: true, data: actions }
    } catch (error) {
      console.error('Get unique actions failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get unique actions' 
      }
    }
  })

  // Clean up old logs (Admin only)
  ipcMain.handle('audit:cleanupOldLogs', async (_event, sessionToken: string, daysToKeep: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_USERS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const deletedCount = await auditService.deleteOldLogs(daysToKeep)
      
      // Log the cleanup action
      const user = permissionCheck.user
      await auditService.logAction({
        userId: user.id,
        username: user.username,
        action: 'AUDIT_CLEANUP',
        module: 'AUDIT',
        description: `Cleaned up ${deletedCount} audit logs older than ${daysToKeep} days`,
        metadata: { deletedCount, daysToKeep }
      })

      return { success: true, data: { deletedCount } }
    } catch (error) {
      console.error('Cleanup old logs failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cleanup old logs' 
      }
    }
  })
}

// Auto-register handlers
registerAuditHandlers()