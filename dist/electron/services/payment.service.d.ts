import type { Payment, CreatePaymentDTO, PaymentWithOrder } from "../../shared/types/index.js";
export declare class PaymentService {
    recordPayment(data: CreatePaymentDTO): Promise<Payment>;
    getPaymentById(id: number): Promise<Payment | null>;
    getPaymentsByOrderId(orderId: number): Promise<Payment[]>;
    getAllPayments(limit?: number): Promise<PaymentWithOrder[]>;
    getPaymentsByDateRange(startDate: string, endDate: string): Promise<PaymentWithOrder[]>;
    getOutstandingPayments(): Promise<{
        id: number;
        order_id: number;
        order_number: string;
        total_amount: number;
        amount_paid: number;
        balance: number;
        status: string;
        pickup_date: string;
        customer_name: string;
        customer_phone: string;
    }[]>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map