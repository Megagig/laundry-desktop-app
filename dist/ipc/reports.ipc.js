import { ipcMain } from "electron";
import { reportService } from "../services/report.service.js";
export function registerReportHandlers() {
    ipcMain.handle("report:getDashboardMetrics", async () => {
        try {
            return { success: true, data: reportService.getDashboardMetrics() };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getDailyRevenue", async (_event, date) => {
        try {
            return { success: true, data: reportService.getDailyRevenue(date) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getWeeklyRevenue", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: reportService.getWeeklyRevenue(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getMonthlyRevenue", async (_event, year, month) => {
        try {
            return { success: true, data: reportService.getMonthlyRevenue(year, month) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getOutstandingBalances", async () => {
        try {
            return { success: true, data: reportService.getOutstandingBalances() };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getProfitLoss", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: reportService.getProfitLossReport(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getTopCustomers", async (_event, limit) => {
        try {
            return { success: true, data: reportService.getTopCustomers(limit) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getPopularServices", async (_event, startDate, endDate, limit) => {
        try {
            return { success: true, data: reportService.getPopularServices(startDate, endDate, limit) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=reports.ipc.js.map