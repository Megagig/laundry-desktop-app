import { ipcMain } from "electron"
import { paymentService } from "../services/payment.service.js"
import type { CreatePaymentDTO } from "../../shared/types/index.js"

export function registerPaymentHandlers() {
  ipcMain.handle("payment:record", async (_event, data: CreatePaymentDTO) => {
    try {
      return { success: true, data: paymentService.recordPayment(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByOrderId", async (_event, orderId: number) => {
    try {
      return { success: true, data: paymentService.getPaymentsByOrderId(orderId) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getAll", async (_event, limit?: number) => {
    try {
      return { success: true, data: paymentService.getAllPayments(limit) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByDateRange", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: paymentService.getPaymentsByDateRange(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getOutstanding", async () => {
    try {
      return { success: true, data: paymentService.getOutstandingPayments() }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
