export interface Customer {
    id: number;
    name: string;
    phone: string;
    address?: string;
    notes?: string;
    created_at: string;
}
export interface CreateCustomerDTO {
    name: string;
    phone: string;
    address?: string;
    notes?: string;
}
export interface UpdateCustomerDTO {
    id: number;
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
}
export interface CustomerWithStats extends Customer {
    total_orders: number;
    total_spent: number;
    outstanding_balance: number;
}
//# sourceMappingURL=customer.types.d.ts.map