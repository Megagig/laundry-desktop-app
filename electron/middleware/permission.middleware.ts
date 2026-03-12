import type { IpcMainInvokeEvent } from 'electron'
import { rbacService } from '../services/rbac.service.js'
import { authService } from '../services/auth.service.js'
import { auditService } from '../services/audit.service.js'
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

    // Get user info
    const user = await authService.getCurrentUser(sessionToken)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(session.userId, permission)
    if (!hasPermission) {
      // Log permission denied
      await auditService.logPermissionDenied(
        session.userId,
        user.username,
        permission,
        'UNKNOWN'
      )
      
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    // Permission granted
    return {
      success: true,
      userId: session.userId,
      user
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

    const user = await authService.getCurrentUser(sessionToken)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    const hasAnyPermission = await rbacService.hasAnyPermission(session.userId, permissions)
    if (!hasAnyPermission) {
      // Log permission denied
      await auditService.logPermissionDenied(
        session.userId,
        user.username,
        permissions.join(', '),
        'UNKNOWN'
      )
      
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    return {
      success: true,
      userId: session.userId,
      user
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

    const user = await authService.getCurrentUser(sessionToken)
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    const hasAllPermissions = await rbacService.hasAllPermissions(session.userId, permissions)
    if (!hasAllPermissions) {
      // Log permission denied
      await auditService.logPermissionDenied(
        session.userId,
        user.username,
        permissions.join(', '),
        'UNKNOWN'
      )
      
      return {
        success: false,
        error: 'Insufficient permissions'
      }
    }

    return {
      success: true,
      userId: session.userId,
      user
    }
  }
}

/**
 * Helper to check permission in IPC handler
 */
export async function checkPermission(
  sessionToken: string,
  permission: PermissionName
): Promise<{ success: boolean; userId?: number; user?: any; error?: string }> {
  if (!sessionToken) {
    return { success: false, error: 'Authentication required' }
  }

  const session = await authService.validateSession(sessionToken)
  if (!session) {
    return { success: false, error: 'Invalid or expired session' }
  }

  const user = await authService.getCurrentUser(sessionToken)
  if (!user) {
    return { success: false, error: 'User not found' }
  }

  const hasPermission = await rbacService.hasPermission(session.userId, permission)
  if (!hasPermission) {
    // Log permission denied
    await auditService.logPermissionDenied(
      session.userId,
      user.username,
      permission,
      'UNKNOWN'
    )
    
    return { success: false, error: 'Insufficient permissions' }
  }

  return { success: true, userId: session.userId, user }
}
