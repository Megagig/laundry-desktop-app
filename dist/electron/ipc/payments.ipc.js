import { ipcMain } from "electron";
import { paymentService } from "../services/payment.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerPaymentHandlers() {
    ipcMain.handle("payment:record", async (_event, data) => {
        try {
            const result = await paymentService.recordPayment(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByOrderId", async (_event, orderId) => {
        try {
            const result = await paymentService.getPaymentsByOrderId(orderId);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getAll", async (_event, limit) => {
        try {
            const result = await paymentService.getAllPayments(limit);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByDateRange", async (_event, startDate, endDate) => {
        try {
            const result = await paymentService.getPaymentsByDateRange(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getOutstanding", async () => {
        try {
            const result = await paymentService.getOutstandingPayments();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=payments.ipc.js.map