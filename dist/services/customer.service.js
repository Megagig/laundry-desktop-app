import { prisma } from "../database/prisma.js";
export class CustomerService {
    async createCustomer(data) {
        return await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                notes: data.notes,
            }
        });
    }
    async getCustomerById(id) {
        return await prisma.customer.findUnique({
            where: { id }
        });
    }
    async getAllCustomers() {
        return await prisma.customer.findMany({
            orderBy: { created_at: "desc" }
        });
    }
    async searchCustomerByPhone(phone) {
        return await prisma.customer.findMany({
            where: {
                phone: {
                    contains: phone
                }
            },
            orderBy: { created_at: "desc" }
        });
    }
    async searchCustomerByName(name) {
        return await prisma.customer.findMany({
            where: {
                name: {
                    contains: name,
                    mode: "insensitive"
                }
            },
            orderBy: { created_at: "desc" }
        });
    }
    async updateCustomer(data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.notes !== undefined)
            updateData.notes = data.notes;
        if (Object.keys(updateData).length === 0) {
            return this.getCustomerById(data.id);
        }
        return await prisma.customer.update({
            where: { id: data.id },
            data: updateData
        });
    }
    async deleteCustomer(id) {
        try {
            await prisma.customer.delete({
                where: { id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async getCustomerWithStats(id) {
        const customer = await this.getCustomerById(id);
        if (!customer)
            return null;
        const stats = await prisma.order.aggregate({
            where: { customer_id: id },
            _count: true,
            _sum: {
                total_amount: true,
                balance: true
            }
        });
        return {
            ...customer,
            total_orders: stats._count,
            total_spent: stats._sum.total_amount || 0,
            outstanding_balance: stats._sum.balance || 0
        };
    }
    async getCustomerOrderHistory(customerId, limit = 10) {
        return await prisma.order.findMany({
            where: { customer_id: customerId },
            orderBy: { created_at: "desc" },
            take: limit
        });
    }
}
export const customerService = new CustomerService();
//# sourceMappingURL=customer.service.js.map