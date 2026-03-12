import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  // Auth APIs
  auth: {
    login: (credentials: any) => ipcRenderer.invoke("auth:login", credentials),
    logout: (sessionToken: string) => ipcRenderer.invoke("auth:logout", sessionToken),
    validateSession: (sessionToken: string) => ipcRenderer.invoke("auth:validate-session", sessionToken),
    getCurrentUser: (sessionToken: string) => ipcRenderer.invoke("auth:get-current-user", sessionToken),
    changePassword: (sessionToken: string, data: any) => ipcRenderer.invoke("auth:change-password", sessionToken, data),
    refreshSession: (sessionToken: string) => ipcRenderer.invoke("auth:refresh-session", sessionToken),
  },

  // User Management APIs
  user: {
    create: (sessionToken: string, data: any) => ipcRenderer.invoke("user:create", sessionToken, data),
    getAll: (sessionToken: string) => ipcRenderer.invoke("user:getAll", sessionToken),
    getById: (sessionToken: string, userId: number) => ipcRenderer.invoke("user:getById", sessionToken, userId),
    update: (sessionToken: string, userId: number, data: any) => ipcRenderer.invoke("user:update", sessionToken, userId, data),
    delete: (sessionToken: string, userId: number) => ipcRenderer.invoke("user:delete", sessionToken, userId),
    toggleActive: (sessionToken: string, userId: number) => ipcRenderer.invoke("user:toggle-active", sessionToken, userId),
    resetPassword: (sessionToken: string, userId: number, newPassword: string) => 
      ipcRenderer.invoke("user:reset-password", sessionToken, userId, newPassword),
  },

  // RBAC APIs
  rbac: {
    getUserPermissions: (sessionToken: string) => ipcRenderer.invoke("rbac:get-user-permissions", sessionToken),
    hasPermission: (sessionToken: string, permission: string) => ipcRenderer.invoke("rbac:has-permission", sessionToken, permission),
    getRoles: (sessionToken: string) => ipcRenderer.invoke("rbac:get-roles", sessionToken),
    getPermissions: (sessionToken: string) => ipcRenderer.invoke("rbac:get-permissions", sessionToken),
    getUserRole: (sessionToken: string) => ipcRenderer.invoke("rbac:get-user-role", sessionToken),
    updateRolePermissions: (sessionToken: string, roleId: number, permissionIds: number[]) => 
      ipcRenderer.invoke("rbac:update-role-permissions", sessionToken, roleId, permissionIds),
    createRole: (sessionToken: string, roleData: { name: string, description: string }) =>
      ipcRenderer.invoke("rbac:create-role", sessionToken, roleData),
    deleteRole: (sessionToken: string, roleId: number) =>
      ipcRenderer.invoke("rbac:delete-role", sessionToken, roleId),
    createPermission: (sessionToken: string, permissionData: { name: string, description: string, module: string }) =>
      ipcRenderer.invoke("rbac:create-permission", sessionToken, permissionData),
    deletePermission: (sessionToken: string, permissionId: number) =>
      ipcRenderer.invoke("rbac:delete-permission", sessionToken, permissionId),
  },

  // Customer APIs
  customer: {
    create: (data: any) => ipcRenderer.invoke("customer:create", data),
    getAll: () => ipcRenderer.invoke("customer:getAll"),
    getById: (id: number) => ipcRenderer.invoke("customer:getById", id),
    searchByPhone: (phone: string) => ipcRenderer.invoke("customer:searchByPhone", phone),
    searchByName: (name: string) => ipcRenderer.invoke("customer:searchByName", name),
    update: (data: any) => ipcRenderer.invoke("customer:update", data),
    delete: (id: number) => ipcRenderer.invoke("customer:delete", id),
    getWithStats: (id: number) => ipcRenderer.invoke("customer:getWithStats", id),
    getOrderHistory: (customerId: number, limit?: number) => 
      ipcRenderer.invoke("customer:getOrderHistory", customerId, limit),
  },

  // Order APIs
  order: {
    create: (data: any) => ipcRenderer.invoke("order:create", data),
    getById: (id: number) => ipcRenderer.invoke("order:getById", id),
    getByNumber: (orderNumber: string) => ipcRenderer.invoke("order:getByNumber", orderNumber),
    getWithDetails: (id: number) => ipcRenderer.invoke("order:getWithDetails", id),
    getAll: (limit?: number, offset?: number) => ipcRenderer.invoke("order:getAll", limit, offset),
    getByStatus: (status: string) => ipcRenderer.invoke("order:getByStatus", status),
    getByDateRange: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("order:getByDateRange", startDate, endDate),
    search: (query: string) => ipcRenderer.invoke("order:search", query),
    updateStatus: (orderId: number, status: string) => 
      ipcRenderer.invoke("order:updateStatus", orderId, status),
    update: (orderId: number, updates: any) => ipcRenderer.invoke("order:update", orderId, updates),
    delete: (id: number) => ipcRenderer.invoke("order:delete", id),
  },

  // Service APIs
  service: {
    create: (data: any) => ipcRenderer.invoke("service:create", data),
    getAll: () => ipcRenderer.invoke("service:getAll"),
    getById: (id: number) => ipcRenderer.invoke("service:getById", id),
    getByCategory: (category: string) => ipcRenderer.invoke("service:getByCategory", category),
    update: (data: any) => ipcRenderer.invoke("service:update", data),
    delete: (id: number) => ipcRenderer.invoke("service:delete", id),
  },

  // Payment APIs
  payment: {
    record: (data: any) => ipcRenderer.invoke("payment:record", data),
    getByOrderId: (orderId: number) => ipcRenderer.invoke("payment:getByOrderId", orderId),
    getAll: (limit?: number) => ipcRenderer.invoke("payment:getAll", limit),
    getByDateRange: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("payment:getByDateRange", startDate, endDate),
    getOutstanding: () => ipcRenderer.invoke("payment:getOutstanding"),
  },

  // Expense APIs
  expense: {
    create: (data: any) => ipcRenderer.invoke("expense:create", data),
    getAll: (limit?: number) => ipcRenderer.invoke("expense:getAll", limit),
    getById: (id: number) => ipcRenderer.invoke("expense:getById", id),
    getByDateRange: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("expense:getByDateRange", startDate, endDate),
    getByCategory: (category: string) => ipcRenderer.invoke("expense:getByCategory", category),
    update: (data: any) => ipcRenderer.invoke("expense:update", data),
    delete: (id: number) => ipcRenderer.invoke("expense:delete", id),
    getGroupedByCategory: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("expense:getGroupedByCategory", startDate, endDate),
  },

  // Report APIs
  report: {
    getDashboardMetrics: () => ipcRenderer.invoke("report:getDashboardMetrics"),
    getDailyRevenue: (date: string) => ipcRenderer.invoke("report:getDailyRevenue", date),
    getWeeklyRevenue: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("report:getWeeklyRevenue", startDate, endDate),
    getMonthlyRevenue: (year: number, month: number) => 
      ipcRenderer.invoke("report:getMonthlyRevenue", year, month),
    getOutstandingBalances: () => ipcRenderer.invoke("report:getOutstandingBalances"),
    getProfitLoss: (startDate: string, endDate: string) => 
      ipcRenderer.invoke("report:getProfitLoss", startDate, endDate),
    getTopCustomers: (limit?: number) => ipcRenderer.invoke("report:getTopCustomers", limit),
    getPopularServices: (startDate: string, endDate: string, limit?: number) => 
      ipcRenderer.invoke("report:getPopularServices", startDate, endDate, limit),
  },

  // Printer APIs
  printer: {
    getPrinters: () => ipcRenderer.invoke("printer:get-printers"),
    setDefault: (printerName: string) => ipcRenderer.invoke("printer:set-default", printerName),
    getDefault: () => ipcRenderer.invoke("printer:get-default"),
    printOrderReceipt: (orderId: number, options?: any) => 
      ipcRenderer.invoke("printer:print-order-receipt", orderId, options),
    printPaymentReceipt: (data: any, options?: any) => 
      ipcRenderer.invoke("printer:print-payment-receipt", data, options),
    testPrint: (printerName?: string) => ipcRenderer.invoke("printer:test-print", printerName),
  },

  // Settings APIs
  settings: {
    getAll: () => ipcRenderer.invoke("settings:get-all"),
    get: (key: string) => ipcRenderer.invoke("settings:get", key),
    upsert: (key: string, value: string) => ipcRenderer.invoke("settings:upsert", key, value),
    updateMultiple: (settings: Record<string, string>) => 
      ipcRenderer.invoke("settings:update-multiple", settings),
  },

  // Backup APIs
  backup: {
    create: (customPath?: string) => ipcRenderer.invoke("backup:create", customPath),
    restore: () => ipcRenderer.invoke("backup:restore"),
    list: () => ipcRenderer.invoke("backup:list"),
    delete: (backupPath: string) => ipcRenderer.invoke("backup:delete", backupPath),
    exportCSV: (tableName: string) => ipcRenderer.invoke("backup:export-csv", tableName),
    getStats: () => ipcRenderer.invoke("backup:get-stats"),
  },

  // Startup APIs
  startup: {
    check: () => ipcRenderer.invoke('startup:check'),
    isLicenseValid: () => ipcRenderer.invoke('startup:is-license-valid'),
    getTrialStatus: () => ipcRenderer.invoke('startup:get-trial-status'),
    shouldBlock: () => ipcRenderer.invoke('startup:should-block'),
  },

  // License APIs
  license: {
    // Public APIs (no authentication required)
    activate: (licenseKey: string) => 
      ipcRenderer.invoke("license:activate-public", licenseKey),
    deactivate: () => 
      ipcRenderer.invoke("license:deactivate-public"),
    getInfo: () => 
      ipcRenderer.invoke("license:getInfo"),
    getStatus: () => 
      ipcRenderer.invoke("license:getStatus"),
    validate: (licenseKey: string) => 
      ipcRenderer.invoke("license:validate", licenseKey),
    hasFeature: (feature: string) => 
      ipcRenderer.invoke("license:hasFeature", feature),
    getExpiryWarning: () => 
      ipcRenderer.invoke("license:getExpiryWarning"),
    
    // Authenticated APIs (require session token)
    activateWithAuth: (sessionToken: string, licenseKey: string) => 
      ipcRenderer.invoke("license:activate", sessionToken, licenseKey),
    deactivateWithAuth: (sessionToken: string) => 
      ipcRenderer.invoke("license:deactivate", sessionToken),
    getInfoWithAuth: (sessionToken: string) => 
      ipcRenderer.invoke("license:getInfo", sessionToken),
    getStatusWithAuth: (sessionToken: string) => 
      ipcRenderer.invoke("license:getStatus", sessionToken),
    validateWithAuth: (sessionToken: string, licenseKey: string) => 
      ipcRenderer.invoke("license:validate", sessionToken, licenseKey),
    getMachineInfo: () => 
      ipcRenderer.invoke("license:getMachineInfo"),
    
    // License Storage & Management APIs (Admin only)
    getAll: (sessionToken: string) => 
      ipcRenderer.invoke("license:getAll", sessionToken),
    getHistory: (sessionToken: string) => 
      ipcRenderer.invoke("license:getHistory", sessionToken),
    exportData: (sessionToken: string) => 
      ipcRenderer.invoke("license:exportData", sessionToken),
    createBackup: (sessionToken: string) => 
      ipcRenderer.invoke("license:createBackup", sessionToken),
    getStats: (sessionToken: string) => 
      ipcRenderer.invoke("license:getStats", sessionToken),
    validateStored: (sessionToken: string) => 
      ipcRenderer.invoke("license:validateStored", sessionToken),
    cleanupExpired: (sessionToken: string, daysOld: number) => 
      ipcRenderer.invoke("license:cleanupExpired", sessionToken, daysOld),
    migrateData: (sessionToken: string) => 
      ipcRenderer.invoke("license:migrateData", sessionToken),
    updateMetadata: (sessionToken: string, licenseId: number, updates: any) => 
      ipcRenderer.invoke("license:updateMetadata", sessionToken, licenseId, updates),
    archive: (sessionToken: string, licenseId: number) => 
      ipcRenderer.invoke("license:archive", sessionToken, licenseId),
    delete: (sessionToken: string, licenseId: number) => 
      ipcRenderer.invoke("license:delete", sessionToken, licenseId),
  },

  // Trial APIs
  trial: {
    start: () => ipcRenderer.invoke("trial:start"),
    getStatus: () => ipcRenderer.invoke("trial:getStatus"),
    isExpired: () => ipcRenderer.invoke("trial:isExpired"),
    isActive: () => ipcRenderer.invoke("trial:isActive"),
    getDaysRemaining: () => ipcRenderer.invoke("trial:getDaysRemaining"),
    getWarning: () => ipcRenderer.invoke("trial:getWarning"),
    canStart: () => ipcRenderer.invoke("trial:canStart"),
    getInfo: () => ipcRenderer.invoke("trial:getInfo"),
    shouldBlock: () => ipcRenderer.invoke("trial:shouldBlock"),
    
    // Admin-only APIs
    reset: (sessionToken: string) => ipcRenderer.invoke("trial:reset", sessionToken),
    getStats: (sessionToken: string) => ipcRenderer.invoke("trial:getStats", sessionToken),
  },

  // Audit APIs
  audit: {
    getLogs: (sessionToken: string, filters: any) => 
      ipcRenderer.invoke("audit:getLogs", sessionToken, filters),
    getLogCount: (sessionToken: string, filters: any) => 
      ipcRenderer.invoke("audit:getLogCount", sessionToken, filters),
    getLogsByUser: (sessionToken: string, userId: number, limit?: number) => 
      ipcRenderer.invoke("audit:getLogsByUser", sessionToken, userId, limit),
    getLogsByModule: (sessionToken: string, module: string, limit?: number) => 
      ipcRenderer.invoke("audit:getLogsByModule", sessionToken, module, limit),
    getLogsByDateRange: (sessionToken: string, startDate: string, endDate: string, limit?: number) => 
      ipcRenderer.invoke("audit:getLogsByDateRange", sessionToken, startDate, endDate, limit),
    searchLogs: (sessionToken: string, searchTerm: string, filters: any) => 
      ipcRenderer.invoke("audit:searchLogs", sessionToken, searchTerm, filters),
    getStats: (sessionToken: string) => 
      ipcRenderer.invoke("audit:getStats", sessionToken),
    exportLogs: (sessionToken: string, filters: any) => 
      ipcRenderer.invoke("audit:exportLogs", sessionToken, filters),
    getUniqueModules: (sessionToken: string) => 
      ipcRenderer.invoke("audit:getUniqueModules", sessionToken),
    getUniqueActions: (sessionToken: string) => 
      ipcRenderer.invoke("audit:getUniqueActions", sessionToken),
    cleanupOldLogs: (sessionToken: string, daysToKeep: number) => 
      ipcRenderer.invoke("audit:cleanupOldLogs", sessionToken, daysToKeep),
  },
})