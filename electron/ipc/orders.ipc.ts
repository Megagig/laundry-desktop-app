import { ipcMain } from "electron"
import { orderService } from "../services/order.service.js"
import type { CreateOrderDTO, OrderStatus } from "../../shared/types/index.js"
import { serializeForIPC } from "./helpers.js"

export function registerOrderHandlers() {
  ipcMain.handle("order:create", async (_event, data: CreateOrderDTO) => {
    try {
      const result = await orderService.createOrder(data)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getById", async (_event, id: number) => {
    try {
      const result = await orderService.getOrderById(id)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByNumber", async (_event, orderNumber: string) => {
    try {
      const result = await orderService.getOrderByNumber(orderNumber)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getWithDetails", async (_event, id: number) => {
    try {
      const result = await orderService.getOrderWithDetails(id)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getAll", async (_event, limit?: number, offset?: number) => {
    try {
      const result = await orderService.getAllOrders(limit, offset)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByStatus", async (_event, status: OrderStatus) => {
    try {
      const result = await orderService.getOrdersByStatus(status)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:getByDateRange", async (_event, startDate: string, endDate: string) => {
    try {
      const result = await orderService.getOrdersByDateRange(startDate, endDate)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:search", async (_event, query: string) => {
    try {
      const result = await orderService.searchOrders(query)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:updateStatus", async (_event, orderId: number, status: OrderStatus) => {
    try {
      const result = await orderService.updateOrderStatus(orderId, status)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:update", async (_event, orderId: number, updates: any) => {
    try {
      const result = await orderService.updateOrder(orderId, updates)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("order:delete", async (_event, id: number) => {
    try {
      const result = await orderService.deleteOrder(id)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
