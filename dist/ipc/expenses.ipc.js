import { ipcMain } from "electron";
import { expenseService } from "../services/expense.service.js";
export function registerExpenseHandlers() {
    ipcMain.handle("expense:create", async (_event, data) => {
        try {
            return { success: true, data: expenseService.createExpense(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getAll", async (_event, limit) => {
        try {
            return { success: true, data: expenseService.getAllExpenses(limit) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getById", async (_event, id) => {
        try {
            return { success: true, data: expenseService.getExpenseById(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getByDateRange", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: expenseService.getExpensesByDateRange(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getByCategory", async (_event, category) => {
        try {
            return { success: true, data: expenseService.getExpensesByCategory(category) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:update", async (_event, data) => {
        try {
            return { success: true, data: expenseService.updateExpense(data) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:delete", async (_event, id) => {
        try {
            return { success: true, data: expenseService.deleteExpense(id) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getGroupedByCategory", async (_event, startDate, endDate) => {
        try {
            return { success: true, data: expenseService.getExpensesGroupedByCategory(startDate, endDate) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=expenses.ipc.js.map