import type { Service, CreateServiceDTO, UpdateServiceDTO } from "../../shared/types/index.js";
export declare class ServiceService {
    createService(data: CreateServiceDTO): Promise<Service>;
    getServiceById(id: number): Promise<Service | null>;
    getAllServices(): Promise<Service[]>;
    getServicesByCategory(category: string): Promise<Service[]>;
    updateService(data: UpdateServiceDTO): Promise<Service | null>;
    deleteService(id: number): Promise<boolean>;
}
export declare const serviceService: ServiceService;
//# sourceMappingURL=service.service.d.ts.map