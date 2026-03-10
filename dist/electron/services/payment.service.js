import { prisma } from "../database/prisma.js";
export class PaymentService {
    async recordPayment(data) {
        return await prisma.$transaction(async (tx) => {
            // Create payment
            const payment = await tx.payment.create({
                data: {
                    order_id: data.order_id,
                    amount: data.amount,
                    method: data.method,
                    notes: data.notes ?? null
                }
            });
            // Update order balance
            await tx.order.update({
                where: { id: data.order_id },
                data: {
                    amount_paid: { increment: data.amount },
                    balance: { decrement: data.amount }
                }
            });
            return payment;
        });
    }
    async getPaymentById(id) {
        return await prisma.payment.findUnique({
            where: { id }
        });
    }
    async getPaymentsByOrderId(orderId) {
        return await prisma.payment.findMany({
            where: { order_id: orderId },
            orderBy: { created_at: "desc" }
        });
    }
    async getAllPayments(limit = 100) {
        const payments = await prisma.payment.findMany({
            include: {
                order: {
                    include: {
                        customer: true
                    }
                }
            },
            orderBy: { created_at: "desc" },
            take: limit
        });
        return payments.map(p => ({
            ...p,
            order_number: p.order.order_number,
            customer_name: p.order.customer.name
        }));
    }
    async getPaymentsByDateRange(startDate, endDate) {
        const payments = await prisma.payment.findMany({
            where: {
                created_at: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            include: {
                order: {
                    include: {
                        customer: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
        return payments.map(p => ({
            ...p,
            order_number: p.order.order_number,
            customer_name: p.order.customer.name
        }));
    }
    async getOutstandingPayments() {
        return await prisma.order.findMany({
            where: {
                balance: { gt: 0 }
            },
            include: {
                customer: true
            },
            orderBy: { pickup_date: "asc" }
        }).then(orders => orders.map(o => ({
            id: o.id,
            order_id: o.id,
            order_number: o.order_number,
            total_amount: o.total_amount,
            amount_paid: o.amount_paid,
            balance: o.balance,
            status: o.status,
            pickup_date: o.pickup_date,
            customer_name: o.customer.name,
            customer_phone: o.customer.phone
        })));
    }
}
export const paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map