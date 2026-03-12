import { ipcMain } from "electron";
import { orderService } from "../services/order.service.js";
import { auditService } from "../services/audit.service.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../shared/types/permissions.js";
import { serializeForIPC } from "./helpers.js";
export function registerOrderHandlers() {
    ipcMain.handle("order:create", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.createOrder(data);
            // Log order creation
            await auditService.logDataOperation('CREATE', 'ORDER', result.id, permissionCheck.userId, permissionCheck.user.username, {
                orderNumber: result.order_number,
                customerId: result.customer_id,
                totalAmount: result.total_amount,
                status: result.status
            });
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getById", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getOrderById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByNumber", async (_event, sessionToken, orderNumber) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getOrderByNumber(orderNumber);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getWithDetails", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getOrderWithDetails(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getAll", async (_event, sessionToken, limit, offset) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getAllOrders(limit, offset);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByStatus", async (_event, sessionToken, status) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getOrdersByStatus(status);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByDateRange", async (_event, sessionToken, startDate, endDate) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.getOrdersByDateRange(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:search", async (_event, sessionToken, query) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await orderService.searchOrders(query);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:updateStatus", async (_event, sessionToken, orderId, status) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.UPDATE_ORDER_STATUS);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get original order for audit log
            const originalOrder = await orderService.getOrderById(orderId);
            const result = await orderService.updateOrderStatus(orderId, status);
            // Log order status update
            if (result) {
                await auditService.logDataOperation('UPDATE', 'ORDER', orderId, permissionCheck.userId, permissionCheck.user.username, {
                    orderNumber: result.order_number,
                    statusChange: { from: originalOrder?.status, to: status }
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:update", async (_event, sessionToken, orderId, updates) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EDIT_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get original order for audit log
            const originalOrder = await orderService.getOrderById(orderId);
            const result = await orderService.updateOrder(orderId, updates);
            // Log order update
            if (result) {
                await auditService.logDataOperation('UPDATE', 'ORDER', orderId, permissionCheck.userId, permissionCheck.user.username, {
                    orderNumber: result.order_number,
                    updates
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:delete", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.DELETE_ORDER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get order data for audit log before deletion
            const order = await orderService.getOrderById(id);
            const result = await orderService.deleteOrder(id);
            // Log order deletion
            if (order) {
                await auditService.logDataOperation('DELETE', 'ORDER', id, permissionCheck.userId, permissionCheck.user.username, {
                    orderNumber: order.order_number,
                    customerId: order.customer_id,
                    totalAmount: order.total_amount
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    console.log("✓ Order handlers registered");
}
//# sourceMappingURL=orders.ipc.js.map