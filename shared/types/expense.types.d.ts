export declare enum ExpenseCategory {
    DETERGENT = "DETERGENT",
    ELECTRICITY = "ELECTRICITY",
    FUEL = "FUEL",
    STAFF_SALARY = "STAFF_SALARY",
    MACHINE_REPAIR = "MACHINE_REPAIR",
    RENT = "RENT",
    WATER = "WATER",
    OTHER = "OTHER"
}
export interface Expense {
    id: number;
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
    created_at: string;
}
export interface CreateExpenseDTO {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string;
    notes?: string;
}
export interface UpdateExpenseDTO {
    id: number;
    title?: string;
    amount?: number;
    category?: ExpenseCategory;
    date?: string;
    notes?: string;
}
//# sourceMappingURL=expense.types.d.ts.map