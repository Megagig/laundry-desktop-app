import { ipcMain } from "electron";
import { serviceService } from "../services/service.service.js";
export function registerServiceHandlers() {
    ipcMain.handle("service:create", async (_event, data) => {
        try {
            return { success: true, data: serviceService.createService(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getAll", async () => {
        try {
            return { success: true, data: serviceService.getAllServices() };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getById", async (_event, id) => {
        try {
            return { success: true, data: serviceService.getServiceById(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:getByCategory", async (_event, category) => {
        try {
            return { success: true, data: serviceService.getServicesByCategory(category) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:update", async (_event, data) => {
        try {
            return { success: true, data: serviceService.updateService(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("service:delete", async (_event, id) => {
        try {
            return { success: true, data: serviceService.deleteService(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=services.ipc.js.map