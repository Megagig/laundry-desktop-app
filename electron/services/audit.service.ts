import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

export interface AuditLogParams {
  userId?: number
  username?: string
  action: string
  module: string
  description?: string
  metadata?: Record<string, any>
  ipAddress?: string
}

export interface AuditLogFilters {
  userId?: number
  module?: string
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface AuditLogEntry {
  id: number
  userId: number | null
  username: string | null
  action: string
  module: string
  description: string | null
  metadata: string | null
  ipAddress: string | null
  createdAt: Date
  user?: {
    id: number
    fullName: string
    email: string
    username: string
  } | null
}

export interface AuditLogStats {
  totalLogs: number
  todayLogs: number
  weekLogs: number
  monthLogs: number
  topUsers: Array<{
    userId: number
    username: string
    fullName: string
    actionCount: number
  }>
  topModules: Array<{
    module: string
    actionCount: number
  }>
  topActions: Array<{
    action: string
    actionCount: number
  }>
}

/**
 * Audit Logging Service
 * 
 * Provides comprehensive audit logging functionality for tracking
 * all critical user actions in the application for compliance
 * and security monitoring purposes.
 */
export class AuditService {
  /**
   * Log a user action
   */
  async logAction(params: AuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          username: params.username || null,
          action: params.action,
          module: params.module,
          description: params.description || null,
          metadata: params.metadata ? JSON.stringify(params.metadata) : null,
          ipAddress: params.ipAddress || null,
          createdAt: new Date()
        }
      })
    } catch (error) {
      // Don't throw errors for audit logging to avoid breaking main functionality
      console.error('Failed to log audit action:', error)
    }
  }

  /**
   * Log user login attempt
   */
  async logLogin(userId: number, username: string, success: boolean, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId: success ? userId : undefined,
      username,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      module: 'AUTH',
      description: success 
        ? `User ${username} logged in successfully`
        : `Failed login attempt for user ${username}`,
      ipAddress
    })
  }

  /**
   * Log user logout
   */
  async logLogout(userId: number, username: string, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId,
      username,
      action: 'LOGOUT',
      module: 'AUTH',
      description: `User ${username} logged out`,
      ipAddress
    })
  }

  /**
   * Log permission denied attempt
   */
  async logPermissionDenied(userId: number, username: string, permission: string, module: string, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId,
      username,
      action: 'PERMISSION_DENIED',
      module: module.toUpperCase(),
      description: `User ${username} attempted to access ${permission} but was denied`,
      metadata: { permission, deniedModule: module },
      ipAddress
    })
  }

  /**
   * Log password change
   */
  async logPasswordChange(userId: number, username: string, changedByUserId?: number, ipAddress?: string): Promise<void> {
    const isPasswordReset = changedByUserId && changedByUserId !== userId
    
    await this.logAction({
      userId: changedByUserId || userId,
      username,
      action: isPasswordReset ? 'PASSWORD_RESET' : 'PASSWORD_CHANGE',
      module: 'AUTH',
      description: isPasswordReset 
        ? `Password reset for user ${username}`
        : `User ${username} changed their password`,
      metadata: isPasswordReset ? { targetUserId: userId, targetUsername: username } : undefined,
      ipAddress
    })
  }

  /**
   * Log user management actions
   */
  async logUserManagement(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTIVATE' | 'DEACTIVATE', 
                          performedByUserId: number, performedByUsername: string,
                          targetUserId: number, targetUsername: string, 
                          changes?: Record<string, any>, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId: performedByUserId,
      username: performedByUsername,
      action: `USER_${action}`,
      module: 'USER_MANAGEMENT',
      description: `User ${performedByUsername} ${action.toLowerCase()}d user ${targetUsername}`,
      metadata: {
        targetUserId,
        targetUsername,
        changes
      },
      ipAddress
    })
  }

  /**
   * Log license actions
   */
  async logLicenseAction(action: 'ACTIVATE' | 'DEACTIVATE' | 'VALIDATE' | 'EXPIRE', 
                        userId?: number, username?: string,
                        licenseInfo?: Record<string, any>, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId,
      username,
      action: `LICENSE_${action}`,
      module: 'LICENSE',
      description: `License ${action.toLowerCase()}${action === 'ACTIVATE' ? 'd' : action === 'DEACTIVATE' ? 'd' : action === 'VALIDATE' ? 'd' : 'd'}`,
      metadata: licenseInfo,
      ipAddress
    })
  }

  /**
   * Log data operations (CRUD)
   */
  async logDataOperation(action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
                        module: string, recordId: number | string,
                        userId: number, username: string,
                        changes?: Record<string, any>, ipAddress?: string): Promise<void> {
    await this.logAction({
      userId,
      username,
      action: `${module.toUpperCase()}_${action}`,
      module: module.toUpperCase(),
      description: `User ${username} ${action.toLowerCase()}d ${module.toLowerCase()} record ${recordId}`,
      metadata: {
        recordId,
        changes
      },
      ipAddress
    })
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    const where: any = {}

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.module) {
      where.module = filters.module
    }

    if (filters.action) {
      where.action = filters.action
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters.limit || 100,
      skip: filters.offset || 0
    })

    return logs as AuditLogEntry[]
  }

  /**
   * Get audit logs by user
   */
  async getLogsByUser(userId: number, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ userId, limit })
  }

  /**
   * Get audit logs by module
   */
  async getLogsByModule(module: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ module, limit })
  }

  /**
   * Get audit logs by date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date, limit: number = 100): Promise<AuditLogEntry[]> {
    return this.getAuditLogs({ startDate, endDate, limit })
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(): Promise<AuditLogStats> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total logs
    const totalLogs = await prisma.auditLog.count()

    // Today's logs
    const todayLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    })

    // Week's logs
    const weekLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: weekStart
        }
      }
    })

    // Month's logs
    const monthLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    })

    // Top users (last 30 days)
    const topUsersRaw = await prisma.auditLog.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null },
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    const topUsers = await Promise.all(
      topUsersRaw.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId! },
          select: { username: true, fullName: true }
        })
        return {
          userId: item.userId!,
          username: user?.username || 'Unknown',
          fullName: user?.fullName || 'Unknown',
          actionCount: item._count.id
        }
      })
    )

    // Top modules (last 30 days)
    const topModules = await prisma.auditLog.groupBy({
      by: ['module'],
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    // Top actions (last 30 days)
    const topActions = await prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    return {
      totalLogs,
      todayLogs,
      weekLogs,
      monthLogs,
      topUsers,
      topModules: topModules.map(item => ({
        module: item.module,
        actionCount: item._count.id
      })),
      topActions: topActions.map(item => ({
        action: item.action,
        actionCount: item._count.id
      }))
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const logs = await this.getAuditLogs({ ...filters, limit: 10000 }) // Export up to 10k records

    // Create CSV content
    const headers = [
      'ID',
      'Date/Time',
      'User ID',
      'Username',
      'Full Name',
      'Action',
      'Module',
      'Description',
      'IP Address',
      'Metadata'
    ]

    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.createdAt.toISOString(),
        log.userId || '',
        log.username || '',
        log.user?.fullName || '',
        log.action,
        log.module,
        `"${(log.description || '').replace(/"/g, '""')}"`, // Escape quotes
        log.ipAddress || '',
        `"${(log.metadata || '').replace(/"/g, '""')}"` // Escape quotes
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), 'exports')
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `audit-logs-${timestamp}.csv`
    const filepath = path.join(exportsDir, filename)

    // Write CSV file
    fs.writeFileSync(filepath, csvContent, 'utf8')

    return filepath
  }

  /**
   * Clean up old audit logs
   */
  async deleteOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    })

    console.log(`Deleted ${result.count} audit logs older than ${daysToKeep} days`)
    return result.count
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(searchTerm: string, filters: AuditLogFilters = {}): Promise<AuditLogEntry[]> {
    const where: any = {
      OR: [
        { username: { contains: searchTerm } },
        { action: { contains: searchTerm } },
        { module: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { user: { fullName: { contains: searchTerm } } }
      ]
    }

    // Apply additional filters
    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.module) {
      where.module = filters.module
    }

    if (filters.action) {
      where.action = filters.action
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: filters.limit || 100,
      skip: filters.offset || 0
    })

    return logs as AuditLogEntry[]
  }

  /**
   * Get unique modules for filtering
   */
  async getUniqueModules(): Promise<string[]> {
    const result = await prisma.auditLog.findMany({
      select: { module: true },
      distinct: ['module'],
      orderBy: { module: 'asc' }
    })

    return result.map(item => item.module)
  }

  /**
   * Get unique actions for filtering
   */
  async getUniqueActions(): Promise<string[]> {
    const result = await prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' }
    })

    return result.map(item => item.action)
  }

  /**
   * Get audit log count with filters
   */
  async getAuditLogCount(filters: AuditLogFilters = {}): Promise<number> {
    const where: any = {}

    if (filters.userId) {
      where.userId = filters.userId
    }

    if (filters.module) {
      where.module = filters.module
    }

    if (filters.action) {
      where.action = filters.action
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate
      }
    }

    return await prisma.auditLog.count({ where })
  }
}

export const auditService = new AuditService()