import type { Order, OrderWithDetails, CreateOrderDTO, OrderStatus } from "../../shared/types/index.js";
export declare class OrderService {
    private generateOrderNumber;
    createOrder(data: CreateOrderDTO): Promise<OrderWithDetails>;
    private formatOrderWithDetails;
    getOrderById(id: number): Promise<Order | null>;
    getOrderByNumber(orderNumber: string): Promise<Order | null>;
    getOrderWithDetails(id: number): Promise<OrderWithDetails | null>;
    getAllOrders(limit?: number, offset?: number): Promise<OrderWithDetails[]>;
    getOrdersByStatus(status: OrderStatus): Promise<OrderWithDetails[]>;
    getOrdersByDateRange(startDate: string, endDate: string): Promise<OrderWithDetails[]>;
    searchOrders(query: string): Promise<OrderWithDetails[]>;
    updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order | null>;
    updateOrder(orderId: number, updates: Partial<Order>): Promise<Order | null>;
    deleteOrder(id: number): Promise<boolean>;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map