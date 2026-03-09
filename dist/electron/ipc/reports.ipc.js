import { ipcMain } from "electron";
import { reportService } from "../services/report.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerReportHandlers() {
    ipcMain.handle("report:getDashboardMetrics", async () => {
        try {
            const data = await reportService.getDashboardMetrics();
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getDailyRevenue", async (_event, date) => {
        try {
            const data = await reportService.getDailyRevenue(date);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getWeeklyRevenue", async (_event, startDate, endDate) => {
        try {
            const data = await reportService.getWeeklyRevenue(startDate, endDate);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getMonthlyRevenue", async (_event, year, month) => {
        try {
            const data = await reportService.getMonthlyRevenue(year, month);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getOutstandingBalances", async () => {
        try {
            const data = await reportService.getOutstandingBalances();
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getProfitLoss", async (_event, startDate, endDate) => {
        try {
            const data = await reportService.getProfitLossReport(startDate, endDate);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getTopCustomers", async (_event, limit) => {
        try {
            const data = await reportService.getTopCustomers(limit);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("report:getPopularServices", async (_event, startDate, endDate, limit) => {
        try {
            const data = await reportService.getPopularServices(startDate, endDate, limit);
            return { success: true, data: serializeForIPC(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=reports.ipc.js.map