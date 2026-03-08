export interface Customer {
    id: number;
    name: string;
    phone: string;
    address?: string | null;
    notes?: string | null;
    created_at: Date;
}
export interface CreateCustomerDTO {
    name: string;
    phone: string;
    address?: string | null;
    notes?: string | null;
}
export interface UpdateCustomerDTO {
    id: number;
    name?: string;
    phone?: string;
    address?: string | null;
    notes?: string | null;
}
export interface CustomerWithStats extends Customer {
    total_orders: number;
    total_spent: number;
    outstanding_balance: number;
}
//# sourceMappingURL=customer.types.d.ts.map