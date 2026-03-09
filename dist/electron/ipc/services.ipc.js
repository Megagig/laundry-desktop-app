import { ipcMain } from "electron";
import { serviceService } from "../services/service.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerServiceHandlers() {
    ipcMain.handle("service:create", async (_event, data) => {
        try {
            const result = await serviceService.createService(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getAll", async () => {
        try {
            const result = await serviceService.getAllServices();
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getById", async (_event, id) => {
        try {
            const result = await serviceService.getServiceById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getByCategory", async (_event, category) => {
        try {
            const result = await serviceService.getServicesByCategory(category);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:update", async (_event, data) => {
        try {
            const result = await serviceService.updateService(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:delete", async (_event, id) => {
        try {
            const result = await serviceService.deleteService(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=services.ipc.js.map