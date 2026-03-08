export declare enum PaymentMethod {
    CASH = "CASH",
    CARD = "CARD",
    TRANSFER = "TRANSFER",
    MOBILE_MONEY = "MOBILE_MONEY"
}
export interface Payment {
    id: number;
    order_id: number;
    amount: number;
    method: PaymentMethod;
    notes?: string;
    created_at: string;
}
export interface CreatePaymentDTO {
    order_id: number;
    amount: number;
    method: PaymentMethod;
    notes?: string;
}
export interface PaymentWithOrder extends Payment {
    order_number: string;
    customer_name: string;
}
//# sourceMappingURL=payment.types.d.ts.map