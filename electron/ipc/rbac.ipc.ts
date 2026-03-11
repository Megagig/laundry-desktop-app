import { ipcMain } from 'electron'
import { rbacService } from '../services/rbac.service.js'
import { authService } from '../services/auth.service.js'

/**
 * Get user permissions
 */
ipcMain.handle('rbac:get-user-permissions', async (event, sessionToken: string) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, error: 'Invalid session' }
    }

    const permissions = await rbacService.getUserPermissions(session.userId)
    return { success: true, permissions }
  } catch (error) {
    console.error('Error getting user permissions:', error)
    return { success: false, error: 'Failed to get permissions' }
  }
})

/**
 * Check if user has permission
 */
ipcMain.handle('rbac:has-permission', async (event, sessionToken: string, permission: string) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, hasPermission: false }
    }

    const hasPermission = await rbacService.hasPermission(session.userId, permission as any)
    return { success: true, hasPermission }
  } catch (error) {
    console.error('Error checking permission:', error)
    return { success: false, hasPermission: false }
  }
})

/**
 * Get all roles
 */
ipcMain.handle('rbac:get-roles', async (event, sessionToken: string) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, error: 'Invalid session' }
    }

    // Check if user has permission to view roles
    const hasPermission = await rbacService.hasPermission(session.userId, 'manage_roles')
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const roles = await rbacService.getAllRoles()
    return { success: true, roles }
  } catch (error) {
    console.error('Error getting roles:', error)
    return { success: false, error: 'Failed to get roles' }
  }
})

/**
 * Get all permissions
 */
ipcMain.handle('rbac:get-permissions', async (event, sessionToken: string) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, error: 'Invalid session' }
    }

    // Check if user has permission to view permissions
    const hasPermission = await rbacService.hasPermission(session.userId, 'manage_roles')
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const permissions = await rbacService.getAllPermissions()
    return { success: true, permissions }
  } catch (error) {
    console.error('Error getting permissions:', error)
    return { success: false, error: 'Failed to get permissions' }
  }
})

/**
 * Get user role
 */
ipcMain.handle('rbac:get-user-role', async (event, sessionToken: string) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, error: 'Invalid session' }
    }

    const role = await rbacService.getUserRole(session.userId)
    return { success: true, role }
  } catch (error) {
    console.error('Error getting user role:', error)
    return { success: false, error: 'Failed to get role' }
  }
})

/**
 * Update role permissions
 */
ipcMain.handle('rbac:update-role-permissions', async (event, sessionToken: string, roleId: number, permissionIds: number[]) => {
  try {
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return { success: false, error: 'Invalid session' }
    }

    // Check if user has permission to manage roles
    const hasPermission = await rbacService.hasPermission(session.userId, 'manage_roles')
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }

    await rbacService.updateRolePermissions(roleId, permissionIds)
    return { success: true }
  } catch (error) {
    console.error('Error updating role permissions:', error)
    return { success: false, error: 'Failed to update role permissions' }
  }
})
