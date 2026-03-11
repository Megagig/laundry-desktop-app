// Permission Constants

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  
  // Customer Management
  VIEW_CUSTOMER: 'view_customer',
  CREATE_CUSTOMER: 'create_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  
  // Order Management
  VIEW_ORDER: 'view_order',
  CREATE_ORDER: 'create_order',
  EDIT_ORDER: 'edit_order',
  CANCEL_ORDER: 'cancel_order',
  UPDATE_ORDER_STATUS: 'update_order_status',
  DELETE_ORDER: 'delete_order',
  
  // Service Management
  VIEW_SERVICES: 'view_services',
  MANAGE_SERVICES: 'manage_services',
  
  // Payment Management
  VIEW_PAYMENT: 'view_payment',
  PROCESS_PAYMENT: 'process_payment',
  REFUND_PAYMENT: 'refund_payment',
  VIEW_OUTSTANDING_PAYMENTS: 'view_outstanding_payments',
  
  // Expense Management
  VIEW_EXPENSE: 'view_expense',
  CREATE_EXPENSE: 'create_expense',
  EDIT_EXPENSE: 'edit_expense',
  DELETE_EXPENSE: 'delete_expense',
  
  // Reports & Analytics
  VIEW_REPORTS: 'view_reports',
  VIEW_REVENUE: 'view_revenue',
  VIEW_PROFIT_LOSS: 'view_profit_loss',
  EXPORT_REPORTS: 'export_reports',
  
  // Printing
  PRINT_RECEIPT: 'print_receipt',
  REPRINT_RECEIPT: 'reprint_receipt',
  MANAGE_PRINTERS: 'manage_printers',
  
  // Settings & Configuration
  VIEW_SETTINGS: 'view_settings',
  MANAGE_SETTINGS: 'manage_settings',
  
  // Backup & Data Management
  CREATE_BACKUP: 'create_backup',
  RESTORE_BACKUP: 'restore_backup',
  EXPORT_DATA: 'export_data',
  
  // User Management
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  RESET_USER_PASSWORD: 'reset_user_password',
  MANAGE_ROLES: 'manage_roles',
  
  // Audit & Security
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  EXPORT_AUDIT_LOGS: 'export_audit_logs',
  MANAGE_LICENSE: 'manage_license',
} as const

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role names
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  CASHIER: 'CASHIER',
  ATTENDANT: 'ATTENDANT',
} as const

export type RoleName = typeof ROLES[keyof typeof ROLES]
