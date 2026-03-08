import { ipcMain } from "electron";
import { orderService } from "../services/order.service.js";
export function registerOrderHandlers() {
    ipcMain.handle("order:create", async (_event, data) => {
        try {
            return { success: true, data: orderService.createOrder(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getById", async (_event, id) => {
        try {
            return { success: true, data: orderService.getOrderById(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByNumber", async (_event, orderNumber) => {
        try {
            return { success: true, data: orderService.getOrderByNumber(orderNumber) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getWithDetails", async (_event, id) => {
        try {
            return { success: true, data: orderService.getOrderWithDetails(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getAll", async (_event, limit, offset) => {
        try {
            return { success: true, data: orderService.getAllOrders(limit, offset) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByStatus", async (_event, status) => {
        try {
            return { success: true, data: orderService.getOrdersByStatus(status) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:getByDateRange", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: orderService.getOrdersByDateRange(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:search", async (_event, query) => {
        try {
            return { success: true, data: orderService.searchOrders(query) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:updateStatus", async (_event, orderId, status) => {
        try {
            return { success: true, data: orderService.updateOrderStatus(orderId, status) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:update", async (_event, orderId, updates) => {
        try {
            return { success: true, data: orderService.updateOrder(orderId, updates) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("order:delete", async (_event, id) => {
        try {
            return { success: true, data: orderService.deleteOrder(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=orders.ipc.js.map