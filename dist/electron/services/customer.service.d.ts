import type { Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerWithStats } from "../../shared/types/index.js";
export declare class CustomerService {
    createCustomer(data: CreateCustomerDTO): Promise<Customer>;
    getCustomerById(id: number): Promise<Customer | null>;
    getAllCustomers(): Promise<Customer[]>;
    searchCustomerByPhone(phone: string): Promise<Customer[]>;
    searchCustomerByName(name: string): Promise<Customer[]>;
    updateCustomer(data: UpdateCustomerDTO): Promise<Customer | null>;
    deleteCustomer(id: number): Promise<boolean>;
    getCustomerWithStats(id: number): Promise<CustomerWithStats | null>;
    getCustomerOrderHistory(customerId: number, limit?: number): Promise<{
        id: number;
        status: string;
        notes: string | null;
        created_at: Date;
        customer_id: number;
        total_amount: number;
        balance: number;
        amount_paid: number;
        order_number: string;
        payment_type: string;
        pickup_date: string;
    }[]>;
}
export declare const customerService: CustomerService;
//# sourceMappingURL=customer.service.d.ts.map