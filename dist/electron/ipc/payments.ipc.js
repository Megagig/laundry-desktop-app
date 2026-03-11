import { ipcMain } from "electron";
import { paymentService } from "../services/payment.service.js";
import { auditService } from "../services/audit.service.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../shared/types/permissions.js";
import { serializeForIPC } from "./helpers.js";
export function registerPaymentHandlers() {
    ipcMain.handle("payment:record", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.PROCESS_PAYMENT);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await paymentService.recordPayment(data);
            // Log payment recording
            await auditService.logDataOperation('CREATE', 'PAYMENT', result.id, permissionCheck.userId, permissionCheck.user.username, {
                orderId: result.order_id,
                amount: result.amount,
                method: result.method
            });
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByOrderId", async (_event, sessionToken, orderId) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await paymentService.getPaymentsByOrderId(orderId);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getAll", async (_event, sessionToken, limit) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await paymentService.getAllPayments(limit);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getByDateRange", async (_event, sessionToken, startDate, endDate) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await paymentService.getPaymentsByDateRange(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("payment:getOutstanding", async (_event, sessionToken) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_OUTSTANDING_PAYMENTS);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await paymentService.getOutstandingPayments();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    console.log("✓ Payment handlers registered");
}
//# sourceMappingURL=payments.ipc.js.map