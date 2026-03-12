export {}

declare global {
  interface Window {
    api: {
      // Auth APIs
      auth: {
        login: (credentials: any) => Promise<any>
        logout: (sessionToken: string) => Promise<any>
        validateSession: (sessionToken: string) => Promise<any>
        getCurrentUser: (sessionToken: string) => Promise<any>
        changePassword: (sessionToken: string, data: any) => Promise<any>
        refreshSession: (sessionToken: string) => Promise<any>
      }
      // User Management APIs
      user: {
        create: (sessionToken: string, data: any) => Promise<any>
        getAll: (sessionToken: string) => Promise<any>
        getById: (sessionToken: string, userId: number) => Promise<any>
        update: (sessionToken: string, userId: number, data: any) => Promise<any>
        delete: (sessionToken: string, userId: number) => Promise<any>
        toggleActive: (sessionToken: string, userId: number) => Promise<any>
        resetPassword: (sessionToken: string, userId: number, newPassword: string) => Promise<any>
      }
      // RBAC APIs
      rbac: {
        getUserPermissions: (sessionToken: string) => Promise<any>
        hasPermission: (sessionToken: string, permission: string) => Promise<any>
        getRoles: (sessionToken: string) => Promise<any>
        getPermissions: (sessionToken: string) => Promise<any>
        getUserRole: (sessionToken: string) => Promise<any>
        updateRolePermissions: (sessionToken: string, roleId: number, permissionIds: number[]) => Promise<any>
        createRole: (sessionToken: string, roleData: { name: string, description: string }) => Promise<any>
        deleteRole: (sessionToken: string, roleId: number) => Promise<any>
        createPermission: (sessionToken: string, permissionData: { name: string, description: string, module: string }) => Promise<any>
        deletePermission: (sessionToken: string, permissionId: number) => Promise<any>
      }
      customer: {
        create: (data: any) => Promise<any>
        getAll: () => Promise<any>
        getById: (id: number) => Promise<any>
        searchByPhone: (phone: string) => Promise<any>
        searchByName: (name: string) => Promise<any>
        update: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
        getWithStats: (id: number) => Promise<any>
        getOrderHistory: (customerId: number, limit?: number) => Promise<any>
      }
      order: {
        create: (data: any) => Promise<any>
        getById: (id: number) => Promise<any>
        getByNumber: (orderNumber: string) => Promise<any>
        getWithDetails: (id: number) => Promise<any>
        getAll: (limit?: number, offset?: number) => Promise<any>
        getByStatus: (status: string) => Promise<any>
        getByDateRange: (startDate: string, endDate: string) => Promise<any>
        search: (query: string) => Promise<any>
        updateStatus: (orderId: number, status: string) => Promise<any>
        update: (orderId: number, updates: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      service: {
        create: (data: any) => Promise<any>
        getAll: () => Promise<any>
        getById: (id: number) => Promise<any>
        getByCategory: (category: string) => Promise<any>
        update: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
      }
      payment: {
        record: (data: any) => Promise<any>
        getByOrderId: (orderId: number) => Promise<any>
        getAll: (limit?: number) => Promise<any>
        getByDateRange: (startDate: string, endDate: string) => Promise<any>
        getOutstanding: () => Promise<any>
      }
      expense: {
        create: (data: any) => Promise<any>
        getAll: (limit?: number) => Promise<any>
        getById: (id: number) => Promise<any>
        getByDateRange: (startDate: string, endDate: string) => Promise<any>
        getByCategory: (category: string) => Promise<any>
        update: (data: any) => Promise<any>
        delete: (id: number) => Promise<any>
        getGroupedByCategory: (startDate: string, endDate: string) => Promise<any>
      }
      report: {
        getDashboardMetrics: () => Promise<any>
        getDailyRevenue: (date: string) => Promise<any>
        getWeeklyRevenue: (startDate: string, endDate: string) => Promise<any>
        getMonthlyRevenue: (year: number, month: number) => Promise<any>
        getOutstandingBalances: () => Promise<any>
        getProfitLoss: (startDate: string, endDate: string) => Promise<any>
        getTopCustomers: (limit?: number) => Promise<any>
        getPopularServices: (startDate: string, endDate: string, limit?: number) => Promise<any>
      }
      printer: {
        getPrinters: () => Promise<any>
        setDefault: (printerName: string) => Promise<any>
        getDefault: () => Promise<any>
        printOrderReceipt: (orderId: number, options?: any) => Promise<any>
        printPaymentReceipt: (data: any, options?: any) => Promise<any>
        testPrint: (printerName?: string) => Promise<any>
      }
      settings: {
        getAll: () => Promise<any>
        get: (key: string) => Promise<any>
        upsert: (key: string, value: string) => Promise<any>
        updateMultiple: (settings: Record<string, string>) => Promise<any>
      }
      backup: {
        create: (customPath?: string) => Promise<any>
        restore: () => Promise<any>
        list: () => Promise<any>
        delete: (backupPath: string) => Promise<any>
        exportCSV: (tableName: string) => Promise<any>
        getStats: () => Promise<any>
      }
      // License APIs
      startup: {
    check: () => Promise<{
      canProceed: boolean
      requiresActivation: boolean
      requiresLogin: boolean
      error?: string
    }>
    isLicenseValid: () => Promise<boolean>
    getTrialStatus: () => Promise<{
      isTrialActive: boolean
      startDate: Date
      endDate: Date
      daysRemaining: number
      isExpired: boolean
    }>
  }

  license: {
        // Public APIs (no authentication required)
        activate: (licenseKey: string) => Promise<any>
        deactivate: () => Promise<any>
        getInfo: () => Promise<any>
        getStatus: () => Promise<any>
        validate: (licenseKey: string) => Promise<any>
        getMachineInfo: () => Promise<any>
        hasFeature: (feature: string) => Promise<any>
        getExpiryWarning: () => Promise<any>
        
        // Authenticated APIs (require session token)
        activateWithAuth: (sessionToken: string, licenseKey: string) => Promise<any>
        deactivateWithAuth: (sessionToken: string) => Promise<any>
        getInfoWithAuth: (sessionToken: string) => Promise<any>
        getStatusWithAuth: (sessionToken: string) => Promise<any>
        validateWithAuth: (sessionToken: string, licenseKey: string) => Promise<any>
      }
    }
  }
}
