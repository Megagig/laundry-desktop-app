import { ipcMain } from "electron"
import { paymentService } from "../services/payment.service.js"
import { auditService } from "../services/audit.service.js"
import { checkPermission } from "../middleware/permission.middleware.js"
import { PERMISSIONS } from "../../shared/types/permissions.js"
import type { CreatePaymentDTO } from "../../shared/types/index.js"
import { serializeForIPC } from "./helpers.js"

export function registerPaymentHandlers() {
  ipcMain.handle("payment:record", async (_event, sessionToken: string, data: CreatePaymentDTO) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.PROCESS_PAYMENT)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await paymentService.recordPayment(data)
      
      // Log payment recording
      await auditService.logDataOperation(
        'CREATE',
        'PAYMENT',
        result.id,
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          orderId: result.order_id,
          amount: result.amount,
          method: result.method
        }
      )
      
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByOrderId", async (_event, sessionToken: string, orderId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await paymentService.getPaymentsByOrderId(orderId)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getAll", async (_event, sessionToken: string, limit?: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await paymentService.getAllPayments(limit)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getByDateRange", async (_event, sessionToken: string, startDate: string, endDate: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_PAYMENT)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await paymentService.getPaymentsByDateRange(startDate, endDate)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("payment:getOutstanding", async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_OUTSTANDING_PAYMENTS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await paymentService.getOutstandingPayments()
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  console.log("✓ Payment handlers registered")
}
