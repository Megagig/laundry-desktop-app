import { ipcMain } from "electron"
import { orderService } from "../services/order.service.js"
import type { CreateOrderDTO, OrderStatus } from "../../shared/types/index.js"

export function registerOrderHandlers() {
  ipcMain.handle("order:create", async (_event, data: CreateOrderDTO) => {
    try {
      return { success: true, data: orderService.createOrder(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getById", async (_event, id: number) => {
    try {
      return { success: true, data: orderService.getOrderById(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByNumber", async (_event, orderNumber: string) => {
    try {
      return { success: true, data: orderService.getOrderByNumber(orderNumber) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getWithDetails", async (_event, id: number) => {
    try {
      return { success: true, data: orderService.getOrderWithDetails(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getAll", async (_event, limit?: number, offset?: number) => {
    try {
      return { success: true, data: orderService.getAllOrders(limit, offset) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByStatus", async (_event, status: OrderStatus) => {
    try {
      return { success: true, data: orderService.getOrdersByStatus(status) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByDateRange", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: orderService.getOrdersByDateRange(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:search", async (_event, query: string) => {
    try {
      return { success: true, data: orderService.searchOrders(query) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:updateStatus", async (_event, orderId: number, status: OrderStatus) => {
    try {
      return { success: true, data: orderService.updateOrderStatus(orderId, status) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:update", async (_event, orderId: number, updates: any) => {
    try {
      return { success: true, data: orderService.updateOrder(orderId, updates) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:delete", async (_event, id: number) => {
    try {
      return { success: true, data: orderService.deleteOrder(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
