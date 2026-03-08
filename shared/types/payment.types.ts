export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  TRANSFER = "TRANSFER",
  MOBILE_MONEY = "MOBILE_MONEY"
}

export interface Payment {
  id: number
  order_id: number
  amount: number
  method: PaymentMethod
  notes?: string | null
  created_at: Date
}

export interface CreatePaymentDTO {
  order_id: number
  amount: number
  method: PaymentMethod
  notes?: string | null
}

export interface PaymentWithOrder extends Payment {
  order_number: string
  customer_name: string
}
