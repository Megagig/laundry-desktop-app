export declare enum OrderStatus {
    RECEIVED = "RECEIVED",
    WASHING = "WASHING",
    DRYING = "DRYING",
    IRONING = "IRONING",
    READY = "READY",
    COLLECTED = "COLLECTED"
}
export declare enum PaymentType {
    FULL_PAYMENT = "FULL_PAYMENT",
    ADVANCE_PAYMENT = "ADVANCE_PAYMENT",
    PAY_ON_COLLECTION = "PAY_ON_COLLECTION"
}
export interface Order {
    id: number;
    order_number: string;
    customer_id: number;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: OrderStatus;
    payment_type: PaymentType;
    pickup_date: string;
    notes?: string | null;
    created_at: Date;
}
export interface OrderItem {
    id: number;
    order_id: number;
    service_id: number;
    quantity: number;
    price: number;
    subtotal: number;
}
export interface CreateOrderDTO {
    customer_id: number;
    items: CreateOrderItemDTO[];
    payment_type: PaymentType;
    amount_paid: number;
    pickup_date: string;
    notes?: string;
}
export interface CreateOrderItemDTO {
    service_id: number;
    quantity: number;
}
export interface OrderWithDetails extends Order {
    customer_name: string;
    customer_phone: string;
    items: OrderItemWithService[];
}
export interface OrderItemWithService extends OrderItem {
    service_name: string;
    service_price: number;
}
//# sourceMappingURL=order.types.d.ts.map