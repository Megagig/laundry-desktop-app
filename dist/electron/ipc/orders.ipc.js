import { ipcMain } from "electron";
import { orderService } from "../services/order.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerOrderHandlers() {
    ipcMain.handle("order:create", async (_event, data) => {
        try {
            const result = await orderService.createOrder(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getById", async (_event, id) => {
        try {
            const result = await orderService.getOrderById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByNumber", async (_event, orderNumber) => {
        try {
            const result = await orderService.getOrderByNumber(orderNumber);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getWithDetails", async (_event, id) => {
        try {
            const result = await orderService.getOrderWithDetails(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getAll", async (_event, limit, offset) => {
        try {
            const result = await orderService.getAllOrders(limit, offset);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByStatus", async (_event, status) => {
        try {
            const result = await orderService.getOrdersByStatus(status);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByDateRange", async (_event, startDate, endDate) => {
        try {
            const result = await orderService.getOrdersByDateRange(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:search", async (_event, query) => {
        try {
            const result = await orderService.searchOrders(query);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:updateStatus", async (_event, orderId, status) => {
        try {
            const result = await orderService.updateOrderStatus(orderId, status);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:update", async (_event, orderId, updates) => {
        try {
            const result = await orderService.updateOrder(orderId, updates);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:delete", async (_event, id) => {
        try {
            const result = await orderService.deleteOrder(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=orders.ipc.js.map