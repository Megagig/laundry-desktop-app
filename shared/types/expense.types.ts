export enum ExpenseCategory {
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
  id: number
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  notes?: string | null
  created_at: Date
}

export interface CreateExpenseDTO {
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  notes?: string | null
}

export interface UpdateExpenseDTO {
  id: number
  title?: string
  amount?: number
  category?: ExpenseCategory
  date?: string
  notes?: string | null
}
