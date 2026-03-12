import { ipcMain } from "electron";
import { serviceService } from "../services/service.service.js";
import { auditService } from "../services/audit.service.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../shared/types/permissions.js";
import { serializeForIPC } from "./helpers.js";
export function registerServiceHandlers() {
    ipcMain.handle("service:create", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await serviceService.createService(data);
            // Log service creation
            await auditService.logDataOperation('CREATE', 'SERVICE', result.id, permissionCheck.userId, permissionCheck.user.username, {
                name: result.name,
                price: result.price,
                category: result.category
            });
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getAll", async (_event, sessionToken) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await serviceService.getAllServices();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getById", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await serviceService.getServiceById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getByCategory", async (_event, sessionToken, category) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            const result = await serviceService.getServicesByCategory(category);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:update", async (_event, sessionToken, data) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get original service for audit log
            const originalService = await serviceService.getServiceById(data.id);
            const result = await serviceService.updateService(data);
            // Log service update
            if (result) {
                await auditService.logDataOperation('UPDATE', 'SERVICE', result.id, permissionCheck.userId, permissionCheck.user.username, {
                    original: originalService ? {
                        name: originalService.name,
                        price: originalService.price,
                        category: originalService.category
                    } : null,
                    updated: {
                        name: result.name,
                        price: result.price,
                        category: result.category
                    }
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:delete", async (_event, sessionToken, id) => {
        try {
            const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.MANAGE_SERVICES);
            if (!permissionCheck.success) {
                return { success: false, error: permissionCheck.error };
            }
            // Get service data for audit log before deletion
            const service = await serviceService.getServiceById(id);
            const result = await serviceService.deleteService(id);
            // Log service deletion
            if (service) {
                await auditService.logDataOperation('DELETE', 'SERVICE', id, permissionCheck.userId, permissionCheck.user.username, {
                    name: service.name,
                    price: service.price,
                    category: service.category
                });
            }
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    console.log("✓ Service handlers registered");
}
//# sourceMappingURL=services.ipc.js.map