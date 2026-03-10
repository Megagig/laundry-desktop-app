import { prisma } from "../database/prisma.js";
export class OrderService {
    async generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        // Get count of orders today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = await prisma.order.count({
            where: {
                created_at: {
                    gte: today
                }
            }
        });
        const sequence = (count + 1).toString().padStart(4, "0");
        return `LND${year}${month}${day}${sequence}`;
    }
    async createOrder(data) {
        // Calculate total and prepare items
        let totalAmount = 0;
        const itemsData = await Promise.all(data.items.map(async (item) => {
            const service = await prisma.service.findUnique({
                where: { id: item.service_id }
            });
            if (!service)
                throw new Error(`Service ${item.service_id} not found`);
            const subtotal = service.price * item.quantity;
            totalAmount += subtotal;
            return {
                service_id: item.service_id,
                quantity: item.quantity,
                price: service.price,
                subtotal
            };
        }));
        const balance = totalAmount - data.amount_paid;
        const orderNumber = await this.generateOrderNumber();
        // Create order with items and payment in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    order_number: orderNumber,
                    customer_id: data.customer_id,
                    total_amount: totalAmount,
                    amount_paid: data.amount_paid,
                    balance,
                    status: "RECEIVED",
                    payment_type: data.payment_type,
                    pickup_date: data.pickup_date,
                    notes: data.notes ?? null,
                    items: {
                        createMany: {
                            data: itemsData
                        }
                    }
                },
                include: {
                    customer: true,
                    items: {
                        include: {
                            service: true
                        }
                    }
                }
            });
            // Record initial payment if any
            if (data.amount_paid > 0) {
                await tx.payment.create({
                    data: {
                        order_id: newOrder.id,
                        amount: data.amount_paid,
                        method: "CASH",
                        notes: "Initial payment"
                    }
                });
            }
            return newOrder;
        });
        return this.formatOrderWithDetails(order);
    }
    formatOrderWithDetails(order) {
        return {
            ...order,
            customer_name: order.customer.name,
            customer_phone: order.customer.phone,
            items: order.items.map((item) => ({
                ...item,
                service_name: item.service.name,
                service_price: item.service.price
            }))
        };
    }
    async getOrderById(id) {
        return await prisma.order.findUnique({
            where: { id }
        });
    }
    async getOrderByNumber(orderNumber) {
        return await prisma.order.findUnique({
            where: { order_number: orderNumber }
        });
    }
    async getOrderWithDetails(id) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true
                    }
                }
            }
        });
        if (!order)
            return null;
        return this.formatOrderWithDetails(order);
    }
    async getAllOrders(limit = 100, offset = 0) {
        const orders = await prisma.order.findMany({
            include: {
                customer: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { created_at: "desc" },
            take: limit,
            skip: offset
        });
        return orders.map(order => this.formatOrderWithDetails(order));
    }
    async getOrdersByStatus(status) {
        const orders = await prisma.order.findMany({
            where: { status },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
        return orders.map(order => this.formatOrderWithDetails(order));
    }
    async getOrdersByDateRange(startDate, endDate) {
        // Include the full end date by adding time
        const endDateTime = endDate + 'T23:59:59.999Z';
        const orders = await prisma.order.findMany({
            where: {
                created_at: {
                    gte: new Date(startDate),
                    lte: new Date(endDateTime)
                }
            },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });
        return orders.map(order => this.formatOrderWithDetails(order));
    }
    async searchOrders(query) {
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { order_number: { contains: query } },
                    { customer: { name: { contains: query } } },
                    { customer: { phone: { contains: query } } }
                ]
            },
            include: {
                customer: true,
                items: {
                    include: {
                        service: true
                    }
                }
            },
            orderBy: { created_at: "desc" },
            take: 50
        });
        return orders.map(order => this.formatOrderWithDetails(order));
    }
    async updateOrderStatus(orderId, status) {
        return await prisma.order.update({
            where: { id: orderId },
            data: { status }
        });
    }
    async updateOrder(orderId, updates) {
        const updateData = {};
        if (updates.status !== undefined)
            updateData.status = updates.status;
        if (updates.pickup_date !== undefined)
            updateData.pickup_date = updates.pickup_date;
        if (updates.notes !== undefined)
            updateData.notes = updates.notes;
        if (Object.keys(updateData).length === 0) {
            return this.getOrderById(orderId);
        }
        return await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });
    }
    async deleteOrder(id) {
        try {
            await prisma.order.delete({
                where: { id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
export const orderService = new OrderService();
//# sourceMappingURL=order.service.js.map