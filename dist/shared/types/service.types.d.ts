export interface Service {
    id: number;
    name: string;
    price: number;
    description?: string;
    category?: string;
}
export interface CreateServiceDTO {
    name: string;
    price: number;
    description?: string;
    category?: string;
}
export interface UpdateServiceDTO {
    id: number;
    name?: string;
    price?: number;
    description?: string;
    category?: string;
}
//# sourceMappingURL=service.types.d.ts.map