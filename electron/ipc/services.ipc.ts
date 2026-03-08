import { ipcMain } from "electron"
import { serviceService } from "../services/service.service.js"
import type { CreateServiceDTO, UpdateServiceDTO } from "../../shared/types/index.js"

export function registerServiceHandlers() {
  ipcMain.handle("service:create", async (_event, data: CreateServiceDTO) => {
    try {
      return { success: true, data: serviceService.createService(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("service:getAll", async () => {
    try {
      return { success: true, data: serviceService.getAllServices() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("service:getById", async (_event, id: number) => {
    try {
      return { success: true, data: serviceService.getServiceById(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("service:getByCategory", async (_event, category: string) => {
    try {
      return { success: true, data: serviceService.getServicesByCategory(category) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("service:update", async (_event, data: UpdateServiceDTO) => {
    try {
      return { success: true, data: serviceService.updateService(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("service:delete", async (_event, id: number) => {
    try {
      return { success: true, data: serviceService.deleteService(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
