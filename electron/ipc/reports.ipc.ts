import { ipcMain } from "electron"
import { reportService } from "../services/report.service.js"

export function registerReportHandlers() {
  ipcMain.handle("report:getDashboardMetrics", async () => {
    try {
      return { success: true, data: reportService.getDashboardMetrics() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getDailyRevenue", async (_event, date: string) => {
    try {
      return { success: true, data: reportService.getDailyRevenue(date) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getWeeklyRevenue", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: reportService.getWeeklyRevenue(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getMonthlyRevenue", async (_event, year: number, month: number) => {
    try {
      return { success: true, data: reportService.getMonthlyRevenue(year, month) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getOutstandingBalances", async () => {
    try {
      return { success: true, data: reportService.getOutstandingBalances() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getProfitLoss", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: reportService.getProfitLossReport(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getTopCustomers", async (_event, limit?: number) => {
    try {
      return { success: true, data: reportService.getTopCustomers(limit) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("report:getPopularServices", async (_event, startDate: string, endDate: string, limit?: number) => {
    try {
      return { success: true, data: reportService.getPopularServices(startDate, endDate, limit) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
