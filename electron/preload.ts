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
})