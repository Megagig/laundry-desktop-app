import { ipcMain } from "electron";
import { customerService } from "../services/customer.service.js";
export function registerCustomerHandlers() {
    ipcMain.handle("customer:create", async (_event, data) => {
        try {
            return { success: true, data: customerService.createCustomer(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getAll", async () => {
        try {
            return { success: true, data: customerService.getAllCustomers() };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getById", async (_event, id) => {
        try {
            return { success: true, data: customerService.getCustomerById(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByPhone", async (_event, phone) => {
        try {
            return { success: true, data: customerService.searchCustomerByPhone(phone) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByName", async (_event, name) => {
        try {
            return { success: true, data: customerService.searchCustomerByName(name) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:update", async (_event, data) => {
        try {
            return { success: true, data: customerService.updateCustomer(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:delete", async (_event, id) => {
        try {
            return { success: true, data: customerService.deleteCustomer(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getWithStats", async (_event, id) => {
        try {
            return { success: true, data: customerService.getCustomerWithStats(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getOrderHistory", async (_event, customerId, limit) => {
        try {
            return { success: true, data: customerService.getCustomerOrderHistory(customerId, limit) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=customers.ipc.js.map