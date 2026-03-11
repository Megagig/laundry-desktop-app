import { ipcMain } from "electron"
import { expenseService } from "../services/expense.service.js"
import { auditService } from "../services/audit.service.js"
import { checkPermission } from "../middleware/permission.middleware.js"
import { PERMISSIONS } from "../../shared/types/permissions.js"
import type { CreateExpenseDTO, UpdateExpenseDTO, ExpenseCategory } from "../../shared/types/index.js"
import { serializeForIPC } from "./helpers.js"

export function registerExpenseHandlers() {
  ipcMain.handle("expense:create", async (_event, sessionToken: string, data: CreateExpenseDTO) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.createExpense(data)
      
      // Log expense creation
      await auditService.logDataOperation(
        'CREATE',
        'EXPENSE',
        result.id,
        permissionCheck.userId!,
        permissionCheck.user.username,
        { 
          title: result.title,
          amount: result.amount,
          category: result.category,
          date: result.date
        }
      )
      
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getAll", async (_event, sessionToken: string, limit?: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.getAllExpenses(limit)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getById", async (_event, sessionToken: string, id: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.getExpenseById(id)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getByDateRange", async (_event, sessionToken: string, startDate: string, endDate: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.getExpensesByDateRange(startDate, endDate)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getByCategory", async (_event, sessionToken: string, category: ExpenseCategory) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.getExpensesByCategory(category)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:update", async (_event, sessionToken: string, data: UpdateExpenseDTO) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EDIT_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get original expense for audit log
      const originalExpense = await expenseService.getExpenseById(data.id)
      
      const result = await expenseService.updateExpense(data)
      
      // Log expense update
      if (result) {
        await auditService.logDataOperation(
          'UPDATE',
          'EXPENSE',
          result.id,
          permissionCheck.userId!,
          permissionCheck.user.username,
          { 
            original: originalExpense ? {
              title: originalExpense.title,
              amount: originalExpense.amount,
              category: originalExpense.category
            } : null,
            updated: {
              title: result.title,
              amount: result.amount,
              category: result.category
            }
          }
        )
      }
      
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:delete", async (_event, sessionToken: string, id: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.DELETE_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get expense data for audit log before deletion
      const expense = await expenseService.getExpenseById(id)
      
      const result = await expenseService.deleteExpense(id)
      
      // Log expense deletion
      if (expense) {
        await auditService.logDataOperation(
          'DELETE',
          'EXPENSE',
          id,
          permissionCheck.userId!,
          permissionCheck.user.username,
          { 
            title: expense.title,
            amount: expense.amount,
            category: expense.category
          }
        )
      }
      
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getGroupedByCategory", async (_event, sessionToken: string, startDate: string, endDate: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_EXPENSE)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const result = await expenseService.getExpensesGroupedByCategory(startDate, endDate)
      return { success: true, data: serializeForIPC(result) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  console.log("✓ Expense handlers registered")
}
