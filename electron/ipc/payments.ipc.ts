import { ipcMain } from "electron"
import { paymentService } from "../services/payment.service.js"
import type { CreatePaymentDTO } from "../../shared/types/index.js"
import { serializeForIPC } from "./helpers.js"

export function registerPaymentHandlers() {
  ipcMain.handle("payment:record", async (_event, data: CreatePaymentDTO) => {
    try {
      const result = await paymentService.recordPayment(data)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByOrderId", async (_event, orderId: number) => {
    try {
      const result = await paymentService.getPaymentsByOrderId(orderId)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getAll", async (_event, limit?: number) => {
    try {
      const result = await paymentService.getAllPayments(limit)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByDateRange", async (_event, startDate: string, endDate: string) => {
    try {
      const result = await paymentService.getPaymentsByDateRange(startDate, endDate)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getOutstanding", async () => {
    try {
      const result = await paymentService.getOutstandingPayments()
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
