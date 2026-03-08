import type { DashboardMetrics, RevenueReport, OutstandingBalance } from "../../shared/types/index.js";
export declare class ReportService {
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getDailyRevenue(date: string): Promise<RevenueReport>;
    getWeeklyRevenue(startDate: string, endDate: string): Promise<RevenueReport[]>;
    getMonthlyRevenue(year: number, month: number): Promise<RevenueReport>;
    getOutstandingBalances(): Promise<OutstandingBalance[]>;
    getProfitLossReport(startDate: string, endDate: string): Promise<{
        period: string;
        total_revenue: number;
        total_expenses: number;
        profit: number;
        profit_margin: number;
    }>;
    getTopCustomers(limit?: number): Promise<{
        id: number;
        name: string;
        phone: string;
        total_orders: number;
        total_spent: number;
    }[]>;
    getPopularServices(startDate: string, endDate: string, limit?: number): Promise<any[]>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map