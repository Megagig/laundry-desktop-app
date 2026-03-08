import { create } from "zustand"

interface DashboardMetrics {
  total_orders_today: number
  revenue_today: number
  outstanding_payments: number
  orders_ready_for_pickup: number
  total_customers: number
  orders_in_progress: number
}

interface RevenueReport {
  date: string
  total_orders: number
  total_revenue: number
  total_paid: number
  total_balance: number
}

interface ReportState {
  // Dashboard metrics
  dashboardMetrics: DashboardMetrics | null
  
  // Reports
  dailyRevenue: RevenueReport | null
  weeklyRevenue: RevenueReport[]
  monthlyRevenue: RevenueReport | null
  outstandingBalances: any[]
  profitLoss: any | null
  topCustomers: any[]
  popularServices: any[]

  // Date range filters
  startDate: string
  endDate: string
  selectedMonth: number
  selectedYear: number

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  setStartDate: (date: string) => void
  setEndDate: (date: string) => void
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API actions
  fetchDashboardMetrics: () => Promise<void>
  fetchDailyRevenue: (date: string) => Promise<void>
  fetchWeeklyRevenue: (startDate: string, endDate: string) => Promise<void>
  fetchMonthlyRevenue: (year: number, month: number) => Promise<void>
  fetchOutstandingBalances: () => Promise<void>
  fetchProfitLoss: (startDate: string, endDate: string) => Promise<void>
  fetchTopCustomers: (limit?: number) => Promise<void>
  fetchPopularServices: (startDate: string, endDate: string, limit?: number) => Promise<void>

  // Refresh all
  refreshDashboard: () => Promise<void>
}

export const useReportStore = create<ReportState>((set, get) => ({
  // Initial state
  dashboardMetrics: null,
  dailyRevenue: null,
  weeklyRevenue: [],
  monthlyRevenue: null,
  outstandingBalances: [],
  profitLoss: null,
  topCustomers: [],
  popularServices: [],
  
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  
  isLoading: false,
  error: null,

  // Actions
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // API actions
  fetchDashboardMetrics: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getDashboardMetrics()
      if (result.success) {
        set({ dashboardMetrics: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchDailyRevenue: async (date) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getDailyRevenue(date)
      if (result.success) {
        set({ dailyRevenue: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchWeeklyRevenue: async (startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getWeeklyRevenue(startDate, endDate)
      if (result.success) {
        set({ weeklyRevenue: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchMonthlyRevenue: async (year, month) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getMonthlyRevenue(year, month)
      if (result.success) {
        set({ monthlyRevenue: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchOutstandingBalances: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getOutstandingBalances()
      if (result.success) {
        set({ outstandingBalances: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchProfitLoss: async (startDate, endDate) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getProfitLoss(startDate, endDate)
      if (result.success) {
        set({ profitLoss: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchTopCustomers: async (limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getTopCustomers(limit)
      if (result.success) {
        set({ topCustomers: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchPopularServices: async (startDate, endDate, limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const result = await window.api.report.getPopularServices(startDate, endDate, limit)
      if (result.success) {
        set({ popularServices: result.data, isLoading: false })
      } else {
        set({ error: result.error, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Refresh all dashboard data
  refreshDashboard: async () => {
    await Promise.all([
      get().fetchDashboardMetrics(),
      get().fetchOutstandingBalances(),
      get().fetchTopCustomers(5)
    ])
  }
}))
