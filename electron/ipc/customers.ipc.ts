import { ipcMain } from "electron"
import { customerService } from "../services/customer.service.js"
import type { CreateCustomerDTO, UpdateCustomerDTO } from "../../shared/types/index.js"

export function registerCustomerHandlers() {
  ipcMain.handle("customer:create", async (_event, data: CreateCustomerDTO) => {
    try {
      return { success: true, data: customerService.createCustomer(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:getAll", async () => {
    try {
      return { success: true, data: customerService.getAllCustomers() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:getById", async (_event, id: number) => {
    try {
      return { success: true, data: customerService.getCustomerById(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:searchByPhone", async (_event, phone: string) => {
    try {
      return { success: true, data: customerService.searchCustomerByPhone(phone) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:searchByName", async (_event, name: string) => {
    try {
      return { success: true, data: customerService.searchCustomerByName(name) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:update", async (_event, data: UpdateCustomerDTO) => {
    try {
      return { success: true, data: customerService.updateCustomer(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:delete", async (_event, id: number) => {
    try {
      return { success: true, data: customerService.deleteCustomer(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:getWithStats", async (_event, id: number) => {
    try {
      return { success: true, data: customerService.getCustomerWithStats(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("customer:getOrderHistory", async (_event, customerId: number, limit?: number) => {
    try {
      return { success: true, data: customerService.getCustomerOrderHistory(customerId, limit) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
