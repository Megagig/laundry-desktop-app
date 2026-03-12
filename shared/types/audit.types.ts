// Audit Log Types

export interface AuditLog {
  id: number
  userId: number | null
  username: string | null
  action: string
  module: string
  description: string | null
  metadata: string | null
  ipAddress: string | null
  createdAt: Date
}

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

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'EXPORT'
  | 'PRINT'
  | 'PERMISSION_DENIED'
  | 'LICENSE_ACTIVATED'
  | 'LICENSE_DEACTIVATED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET'
  | 'BACKUP_CREATED'
  | 'BACKUP_RESTORED'

export type AuditModule =
  | 'AUTH'
  | 'USER'
  | 'CUSTOMER'
  | 'ORDER'
  | 'SERVICE'
  | 'PAYMENT'
  | 'EXPENSE'
  | 'REPORT'
  | 'SETTINGS'
  | 'BACKUP'
  | 'PRINTER'
  | 'LICENSE'
  | 'AUDIT'
