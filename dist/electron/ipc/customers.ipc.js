import { ipcMain } from "electron";
import { customerService } from "../services/customer.service.js";
import { auditService } from "../services/audit.service.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../shared/types/permissions.js";
import { serializeForIPC } from "./helpers.js";
export function registerCustomerHandlers() {
    ipcMain.handle("customer:create", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.createCustomer(data);
            // Log customer creation
            await auditService.logDataOperation('CREATE', 'CUSTOMER', result.id, permissionCheck.userId, permissionCheck.user.username, { name: result.name, phone: result.phone, address: result.address });
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getAll", async (_event, sessionToken) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.getAllCustomers();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getById", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.getCustomerById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByPhone", async (_event, sessionToken, phone) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.searchCustomerByPhone(phone);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:searchByName", async (_event, sessionToken, name) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.searchCustomerByName(name);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:update", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EDIT_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get original customer data for audit log
            const originalCustomer = await customerService.getCustomerById(data.id);
            const result = await customerService.updateCustomer(data);
            // Log customer update
            if (result) {
                await auditService.logDataOperation('UPDATE', 'CUSTOMER', result.id, permissionCheck.userId, permissionCheck.user.username, {
                    original: originalCustomer ? { name: originalCustomer.name, phone: originalCustomer.phone, address: originalCustomer.address } : null,
                    updated: { name: result.name, phone: result.phone, address: result.address }
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:delete", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.DELETE_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get customer data for audit log before deletion
            const customer = await customerService.getCustomerById(id);
            const result = await customerService.deleteCustomer(id);
            // Log customer deletion
            if (customer) {
                await auditService.logDataOperation('DELETE', 'CUSTOMER', id, permissionCheck.userId, permissionCheck.user.username, { name: customer.name, phone: customer.phone });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getWithStats", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.getCustomerWithStats(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("customer:getOrderHistory", async (_event, sessionToken, customerId, limit) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_CUSTOMER);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await customerService.getCustomerOrderHistory(customerId, limit);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    console.log("✓ Customer handlers registered");
}
//# sourceMappingURL=customers.ipc.js.map