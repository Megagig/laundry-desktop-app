import { prisma } from "../database/prisma.js";
export class ExpenseService {
    async createExpense(data) {
        return await prisma.expense.create({
            data: {
                title: data.title,
                amount: data.amount,
                category: data.category,
                date: data.date,
                notes: data.notes ?? null
            }
        });
    }
    async getExpenseById(id) {
        return await prisma.expense.findUnique({
            where: { id }
        });
    }
    async getAllExpenses(limit = 100) {
        return await prisma.expense.findMany({
            orderBy: [
                { date: "desc" },
                { created_at: "desc" }
            ],
            take: limit
        });
    }
    async getExpensesByDateRange(startDate, endDate) {
        return await prisma.expense.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: "desc" }
        });
    }
    async getExpensesByCategory(category) {
        return await prisma.expense.findMany({
            where: { category },
            orderBy: { date: "desc" }
        });
    }
    async updateExpense(data) {
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.amount !== undefined)
            updateData.amount = data.amount;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.date !== undefined)
            updateData.date = data.date;
        if (data.notes !== undefined)
            updateData.notes = data.notes;
        if (Object.keys(updateData).length === 0) {
            return this.getExpenseById(data.id);
        }
        return await prisma.expense.update({
            where: { id: data.id },
            data: updateData
        });
    }
    async deleteExpense(id) {
        try {
            await prisma.expense.delete({
                where: { id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async getTotalExpensesByDateRange(startDate, endDate) {
        const result = await prisma.expense.aggregate({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _sum: {
                amount: true
            }
        });
        return result._sum.amount || 0;
    }
    async getExpensesGroupedByCategory(startDate, endDate) {
        return await prisma.expense.groupBy({
            by: ["category"],
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            _count: true,
            _sum: {
                amount: true
            },
            orderBy: {
                _sum: {
                    amount: "desc"
                }
            }
        }).then(results => results.map(r => ({
            category: r.category,
            count: r._count,
            total_amount: r._sum.amount || 0
        })));
    }
}
export const expenseService = new ExpenseService();
//# sourceMappingURL=expense.service.js.map