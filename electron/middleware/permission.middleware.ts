import type { IpcMainInvokeEvent } from 'electron'
import { rbacService } from '../services/rbac.service.js'
import { authService } from '../services/auth.service.js'
import type { PermissionName } from '../../shared/types/permissions.js'

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permission: PermissionName) {
  return async (_event: IpcMainInvokeEvent, ...args: any[]) => {
    // Extract session token from first argument
    const sessionToken = args[0]?.sessionToken || args[0]

    if (!sessionToken || typeof sessionToken !== 'string') {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    // Validate session
    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return {
        success: false,
        error: 'Invalid or expired session'
      }
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(session.userId, permission)
    if (!hasPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    // Permission granted
    return {
      success: true,
      userId: session.userId
    }
  }
}

/**
 * Middleware to check if user has any of the required permissions
 */
export function requireAnyPermission(permissions: PermissionName[]) {
  return async (_event: IpcMainInvokeEvent, ...args: any[]) => {
    const sessionToken = args[0]?.sessionToken || args[0]

    if (!sessionToken || typeof sessionToken !== 'string') {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return {
        success: false,
        error: 'Invalid or expired session'
      }
    }

    const hasAnyPermission = await rbacService.hasAnyPermission(session.userId, permissions)
    if (!hasAnyPermission) {
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    return {
      success: true,
      userId: session.userId
    }
  }
}

/**
 * Middleware to check if user has all required permissions
 */
export function requireAllPermissions(permissions: PermissionName[]) {
  return async (_event: IpcMainInvokeEvent, ...args: any[]) => {
    const sessionToken = args[0]?.sessionToken || args[0]

    if (!sessionToken || typeof sessionToken !== 'string') {
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    const session = await authService.validateSession(sessionToken)
    if (!session) {
      return {
        success: false,
        error: 'Invalid or expired session'
      }
    }

    const hasAllPermissions = await rbacService.hasAllPermissions(session.userId, permissions)
    if (!hasAllPermissions) {
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    return {
      success: true,
      userId: session.userId
    }
  }
}

/**
 * Helper to check permission in IPC handler
 */
export async function checkPermission(
  sessionToken: string,
  permission: PermissionName
): Promise<{ success: boolean; userId?: number; error?: string }> {
  if (!sessionToken) {
    return { success: false, error: 'Authentication required' }
  }

  const session = await authService.validateSession(sessionToken)
  if (!session) {
    return { success: false, error: 'Invalid or expired session' }
  }

  const hasPermission = await rbacService.hasPermission(session.userId, permission)
  if (!hasPermission) {
    return { success: false, error: 'Insufficient permissions' }
  }

  return { success: true, userId: session.userId }
}
