import { ipcMain } from "electron";
import { paymentService } from "../services/payment.service.js";
export function registerPaymentHandlers() {
    ipcMain.handle("payment:record", async (_event, data) => {
        try {
            return { success: true, data: paymentService.recordPayment(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByOrderId", async (_event, orderId) => {
        try {
            return { success: true, data: paymentService.getPaymentsByOrderId(orderId) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getAll", async (_event, limit) => {
        try {
            return { success: true, data: paymentService.getAllPayments(limit) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByDateRange", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: paymentService.getPaymentsByDateRange(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getOutstanding", async () => {
        try {
            return { success: true, data: paymentService.getOutstandingPayments() };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=payments.ipc.js.map