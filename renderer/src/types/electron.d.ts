export {}

declare global {
  interface Window {
    api: {
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
    }
  }
}
