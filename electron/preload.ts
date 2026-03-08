import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
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
})