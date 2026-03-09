import { ipcMain } from "electron";
import { expenseService } from "../services/expense.service.js";
import { serializeForIPC } from "./helpers.js";
export function registerExpenseHandlers() {
    ipcMain.handle("expense:create", async (_event, data) => {
        try {
            const result = await expenseService.createExpense(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getAll", async (_event, limit) => {
        try {
            const result = await expenseService.getAllExpenses(limit);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getById", async (_event, id) => {
        try {
            const result = await expenseService.getExpenseById(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getByDateRange", async (_event, startDate, endDate) => {
        try {
            const result = await expenseService.getExpensesByDateRange(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getByCategory", async (_event, category) => {
        try {
            const result = await expenseService.getExpensesByCategory(category);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:update", async (_event, data) => {
        try {
            const result = await expenseService.updateExpense(data);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:delete", async (_event, id) => {
        try {
            const result = await expenseService.deleteExpense(id);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
    ipcMain.handle("expense:getGroupedByCategory", async (_event, startDate, endDate) => {
        try {
            const result = await expenseService.getExpensesGroupedByCategory(startDate, endDate);
            return { success: true, data: serializeForIPC(result) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    });
}
//# sourceMappingURL=expenses.ipc.js.map