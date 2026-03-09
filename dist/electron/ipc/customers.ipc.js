import { ipcMain } from "electron";
import { customerService } from "../services/customer.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerCustomerHandlers() {
    ipcMain.handle("customer:create", async (_event, data) => {
        try {
            const result = await customerService.createCustomer(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getAll", async () => {
        try {
            const result = await customerService.getAllCustomers();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getById", async (_event, id) => {
        try {
            const result = await customerService.getCustomerById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByPhone", async (_event, phone) => {
        try {
            const result = await customerService.searchCustomerByPhone(phone);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByName", async (_event, name) => {
        try {
            const result = await customerService.searchCustomerByName(name);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:update", async (_event, data) => {
        try {
            const result = await customerService.updateCustomer(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:delete", async (_event, id) => {
        try {
            const result = await customerService.deleteCustomer(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getWithStats", async (_event, id) => {
        try {
            const result = await customerService.getCustomerWithStats(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getOrderHistory", async (_event, customerId, limit) => {
        try {
            const result = await customerService.getCustomerOrderHistory(customerId, limit);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=customers.ipc.js.map