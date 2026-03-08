import type { Expense, CreateExpenseDTO, UpdateExpenseDTO, ExpenseCategory } from "../../shared/types/index.js";
export declare class ExpenseService {
    createExpense(data: CreateExpenseDTO): Promise<Expense>;
    getExpenseById(id: number): Promise<Expense | null>;
    getAllExpenses(limit?: number): Promise<Expense[]>;
    getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
    getExpensesByCategory(category: ExpenseCategory): Promise<Expense[]>;
    updateExpense(data: UpdateExpenseDTO): Promise<Expense | null>;
    deleteExpense(id: number): Promise<boolean>;
    getTotalExpensesByDateRange(startDate: string, endDate: string): Promise<number>;
    getExpensesGroupedByCategory(startDate: string, endDate: string): Promise<{
        category: string;
        count: number;
        total_amount: number;
    }[]>;
}
export declare const expenseService: ExpenseService;
//# sourceMappingURL=expense.service.d.ts.map