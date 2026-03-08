import { ipcMain } from "electron"
import { expenseService } from "../services/expense.service.js"
import type { CreateExpenseDTO, UpdateExpenseDTO, ExpenseCategory } from "../../shared/types/index.js"

export function registerExpenseHandlers() {
  ipcMain.handle("expense:create", async (_event, data: CreateExpenseDTO) => {
    try {
      return { success: true, data: expenseService.createExpense(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getAll", async (_event, limit?: number) => {
    try {
      return { success: true, data: expenseService.getAllExpenses(limit) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getById", async (_event, id: number) => {
    try {
      return { success: true, data: expenseService.getExpenseById(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getByDateRange", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: expenseService.getExpensesByDateRange(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getByCategory", async (_event, category: ExpenseCategory) => {
    try {
      return { success: true, data: expenseService.getExpensesByCategory(category) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:update", async (_event, data: UpdateExpenseDTO) => {
    try {
      return { success: true, data: expenseService.updateExpense(data) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:delete", async (_event, id: number) => {
    try {
      return { success: true, data: expenseService.deleteExpense(id) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("expense:getGroupedByCategory", async (_event, startDate: string, endDate: string) => {
    try {
      return { success: true, data: expenseService.getExpensesGroupedByCategory(startDate, endDate) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
