export declare const OrderStatus: {
    readonly RECEIVED: "RECEIVED";
    readonly WASHING: "WASHING";
    readonly DRYING: "DRYING";
    readonly IRONING: "IRONING";
    readonly READY: "READY";
    readonly COLLECTED: "COLLECTED";
};
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
export declare const PaymentType: {
    readonly FULL_PAYMENT: "FULL_PAYMENT";
    readonly ADVANCE_PAYMENT: "ADVANCE_PAYMENT";
    readonly PAY_ON_COLLECTION: "PAY_ON_COLLECTION";
};
export type PaymentType = typeof PaymentType[keyof typeof PaymentType];
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