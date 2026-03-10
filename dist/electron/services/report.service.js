import { prisma } from "../database/prisma.js";
import { expenseService } from "./expense.service.js";
export class ReportService {
    async getDashboardMetrics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Total orders today
        const ordersToday = await prisma.order.count({
            where: {
                created_at: { gte: today }
            }
        });
        // Revenue today
        const revenueToday = await prisma.order.aggregate({
            where: {
                created_at: { gte: today }
            },
            _sum: {
                amount_paid: true
            }
        });
        // Outstanding payments
        const outstanding = await prisma.order.aggregate({
            where: {
                balance: { gt: 0 }
            },
            _sum: {
                balance: true
            }
        });
        // Orders ready for pickup
        const readyOrders = await prisma.order.count({
            where: { status: "READY" }
        });
        // Total customers
        const totalCustomers = await prisma.customer.count();
        // Orders in progress
        const inProgress = await prisma.order.count({
            where: {
                status: {
                    in: ["RECEIVED", "WASHING", "DRYING", "IRONING"]
                }
            }
        });
        return {
            total_orders_today: ordersToday,
            revenue_today: revenueToday._sum.amount_paid || 0,
            outstanding_payments: outstanding._sum.balance || 0,
            orders_ready_for_pickup: readyOrders,
            total_customers: totalCustomers,
            orders_in_progress: inProgress
        };
    }
    async getDailyRevenue(date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const result = await prisma.order.aggregate({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: true,
            _sum: {
                total_amount: true,
                amount_paid: true,
                balance: true
            }
        });
        return {
            date,
            total_orders: result._count,
            total_revenue: result._sum.total_amount || 0,
            total_paid: result._sum.amount_paid || 0,
            total_balance: result._sum.balance || 0
        };
    }
    async getWeeklyRevenue(startDate, endDate) {
        const orders = await prisma.order.groupBy({
            by: ["created_at"],
            where: {
                created_at: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            _count: true,
            _sum: {
                total_amount: true,
                amount_paid: true,
                balance: true
            }
        });
        // Group by date (remove time)
        const grouped = new Map();
        for (const order of orders) {
            const dateStr = order.created_at.toISOString().split("T")[0];
            if (!dateStr)
                continue;
            if (!grouped.has(dateStr)) {
                grouped.set(dateStr, {
                    date: dateStr,
                    total_orders: 0,
                    total_revenue: 0,
                    total_paid: 0,
                    total_balance: 0
                });
            }
            const report = grouped.get(dateStr);
            if (!report)
                continue;
            report.total_orders += order._count;
            report.total_revenue += order._sum.total_amount || 0;
            report.total_paid += order._sum.amount_paid || 0;
            report.total_balance += order._sum.balance || 0;
        }
        return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
    }
    async getMonthlyRevenue(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        const result = await prisma.order.aggregate({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: true,
            _sum: {
                total_amount: true,
                amount_paid: true,
                balance: true
            }
        });
        return {
            date: `${year}-${month.toString().padStart(2, "0")}`,
            total_orders: result._count,
            total_revenue: result._sum.total_amount || 0,
            total_paid: result._sum.amount_paid || 0,
            total_balance: result._sum.balance || 0
        };
    }
    async getOutstandingBalances() {
        const orders = await prisma.order.findMany({
            where: {
                balance: { gt: 0 }
            },
            include: {
                customer: true
            },
            orderBy: [
                { pickup_date: "asc" },
                { balance: "desc" }
            ]
        });
        return orders.map(o => {
            const pickupDate = new Date(o.pickup_date);
            const today = new Date();
            const daysOverdue = Math.floor((today.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
                order_id: o.id,
                order_number: o.order_number,
                customer_name: o.customer.name,
                customer_phone: o.customer.phone,
                total_amount: o.total_amount,
                amount_paid: o.amount_paid,
                balance: o.balance,
                pickup_date: o.pickup_date,
                days_overdue: Math.max(0, daysOverdue)
            };
        });
    }
    async getProfitLossReport(startDate, endDate) {
        // Get total revenue for the date range
        const revenue = await prisma.order.aggregate({
            where: {
                created_at: {
                    gte: new Date(startDate),
                    lte: new Date(endDate + 'T23:59:59.999Z') // Include the entire end date
                }
            },
            _sum: {
                amount_paid: true
            }
        });
        // Get total expenses
        const expenses = await expenseService.getTotalExpensesByDateRange(startDate, endDate);
        const totalRevenue = revenue._sum.amount_paid || 0;
        const profit = totalRevenue - expenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
        return {
            period: `${startDate} to ${endDate}`,
            totalRevenue: totalRevenue,
            totalExpenses: expenses,
            netProfit: profit,
            profitMargin: Math.round(profitMargin * 100) / 100
        };
    }
    async getTopCustomers(limit = 10) {
        const customers = await prisma.customer.findMany({
            include: {
                orders: {
                    select: {
                        total_amount: true
                    }
                }
            }
        });
        const customersWithStats = customers
            .map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            total_orders: c.orders.length,
            total_spent: c.orders.reduce((sum, o) => sum + o.total_amount, 0)
        }))
            .filter(c => c.total_orders > 0)
            .sort((a, b) => b.total_spent - a.total_spent)
            .slice(0, limit);
        return customersWithStats;
    }
    async getPopularServices(startDate, endDate, limit = 10) {
        const items = await prisma.orderItem.findMany({
            where: {
                order: {
                    created_at: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                }
            },
            include: {
                service: true
            }
        });
        // Group by service
        const serviceMap = new Map();
        for (const item of items) {
            if (!serviceMap.has(item.service_id)) {
                serviceMap.set(item.service_id, {
                    id: item.service.id,
                    name: item.service.name,
                    price: item.service.price,
                    times_ordered: 0,
                    total_quantity: 0,
                    total_revenue: 0
                });
            }
            const service = serviceMap.get(item.service_id);
            service.times_ordered += 1;
            service.total_quantity += item.quantity;
            service.total_revenue += item.subtotal;
        }
        return Array.from(serviceMap.values())
            .sort((a, b) => b.total_revenue - a.total_revenue)
            .slice(0, limit);
    }
}
export const reportService = new ReportService();
//# sourceMappingURL=report.service.js.map