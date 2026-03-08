export interface DashboardMetrics {
  total_orders_today: number
  revenue_today: number
  outstanding_payments: number
  orders_ready_for_pickup: number
  total_customers: number
  orders_in_progress: number
}

export interface RevenueReport {
  date: string
  total_orders: number
  total_revenue: number
  total_paid: number
  total_balance: number
}

export interface OutstandingBalance {
  order_id: number
  order_number: string
  customer_name: string
  customer_phone: string
  total_amount: number
  amount_paid: number
  balance: number
  pickup_date: string
  days_overdue: number
}

export interface ExpenseReport {
  category: string
  total_amount: number
  count: number
}

export interface ProfitLossReport {
  period: string
  total_revenue: number
  total_expenses: number
  profit: number
  profit_margin: number
}
