import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("api", {
    // Customer APIs
    customer: {
        create: (data) => ipcRenderer.invoke("customer:create", data),
        getAll: () => ipcRenderer.invoke("customer:getAll"),
        getById: (id) => ipcRenderer.invoke("customer:getById", id),
        searchByPhone: (phone) => ipcRenderer.invoke("customer:searchByPhone", phone),
        searchByName: (name) => ipcRenderer.invoke("customer:searchByName", name),
        update: (data) => ipcRenderer.invoke("customer:update", data),
        delete: (id) => ipcRenderer.invoke("customer:delete", id),
        getWithStats: (id) => ipcRenderer.invoke("customer:getWithStats", id),
        getOrderHistory: (customerId, limit) => ipcRenderer.invoke("customer:getOrderHistory", customerId, limit),
    },
    // Order APIs
    order: {
        create: (data) => ipcRenderer.invoke("order:create", data),
        getById: (id) => ipcRenderer.invoke("order:getById", id),
        getByNumber: (orderNumber) => ipcRenderer.invoke("order:getByNumber", orderNumber),
        getWithDetails: (id) => ipcRenderer.invoke("order:getWithDetails", id),
        getAll: (limit, offset) => ipcRenderer.invoke("order:getAll", limit, offset),
        getByStatus: (status) => ipcRenderer.invoke("order:getByStatus", status),
        getByDateRange: (startDate, endDate) => ipcRenderer.invoke("order:getByDateRange", startDate, endDate),
        search: (query) => ipcRenderer.invoke("order:search", query),
        updateStatus: (orderId, status) => ipcRenderer.invoke("order:updateStatus", orderId, status),
        update: (orderId, updates) => ipcRenderer.invoke("order:update", orderId, updates),
        delete: (id) => ipcRenderer.invoke("order:delete", id),
    },
    // Service APIs
    service: {
        create: (data) => ipcRenderer.invoke("service:create", data),
        getAll: () => ipcRenderer.invoke("service:getAll"),
        getById: (id) => ipcRenderer.invoke("service:getById", id),
        getByCategory: (category) => ipcRenderer.invoke("service:getByCategory", category),
        update: (data) => ipcRenderer.invoke("service:update", data),
        delete: (id) => ipcRenderer.invoke("service:delete", id),
    },
    // Payment APIs
    payment: {
        record: (data) => ipcRenderer.invoke("payment:record", data),
        getByOrderId: (orderId) => ipcRenderer.invoke("payment:getByOrderId", orderId),
        getAll: (limit) => ipcRenderer.invoke("payment:getAll", limit),
        getByDateRange: (startDate, endDate) => ipcRenderer.invoke("payment:getByDateRange", startDate, endDate),
        getOutstanding: () => ipcRenderer.invoke("payment:getOutstanding"),
    },
    // Expense APIs
    expense: {
        create: (data) => ipcRenderer.invoke("expense:create", data),
        getAll: (limit) => ipcRenderer.invoke("expense:getAll", limit),
        getById: (id) => ipcRenderer.invoke("expense:getById", id),
        getByDateRange: (startDate, endDate) => ipcRenderer.invoke("expense:getByDateRange", startDate, endDate),
        getByCategory: (category) => ipcRenderer.invoke("expense:getByCategory", category),
        update: (data) => ipcRenderer.invoke("expense:update", data),
        delete: (id) => ipcRenderer.invoke("expense:delete", id),
        getGroupedByCategory: (startDate, endDate) => ipcRenderer.invoke("expense:getGroupedByCategory", startDate, endDate),
    },
    // Report APIs
    report: {
        getDashboardMetrics: () => ipcRenderer.invoke("report:getDashboardMetrics"),
        getDailyRevenue: (date) => ipcRenderer.invoke("report:getDailyRevenue", date),
        getWeeklyRevenue: (startDate, endDate) => ipcRenderer.invoke("report:getWeeklyRevenue", startDate, endDate),
        getMonthlyRevenue: (year, month) => ipcRenderer.invoke("report:getMonthlyRevenue", year, month),
        getOutstandingBalances: () => ipcRenderer.invoke("report:getOutstandingBalances"),
        getProfitLoss: (startDate, endDate) => ipcRenderer.invoke("report:getProfitLoss", startDate, endDate),
        getTopCustomers: (limit) => ipcRenderer.invoke("report:getTopCustomers", limit),
        getPopularServices: (startDate, endDate, limit) => ipcRenderer.invoke("report:getPopularServices", startDate, endDate, limit),
    },
});
//# sourceMappingURL=preload.js.map