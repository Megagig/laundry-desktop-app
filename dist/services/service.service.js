import { prisma } from "../database/prisma.js";
export class ServiceService {
    async createService(data) {
        return await prisma.service.create({
            data: {
                name: data.name,
                price: data.price,
                description: data.description,
                category: data.category,
            }
        });
    }
    async getServiceById(id) {
        return await prisma.service.findUnique({
            where: { id }
        });
    }
    async getAllServices() {
        return await prisma.service.findMany({
            orderBy: { name: "asc" }
        });
    }
    async getServicesByCategory(category) {
        return await prisma.service.findMany({
            where: { category },
            orderBy: { name: "asc" }
        });
    }
    async updateService(data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.price !== undefined)
            updateData.price = data.price;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (Object.keys(updateData).length === 0) {
            return this.getServiceById(data.id);
        }
        return await prisma.service.update({
            where: { id: data.id },
            data: updateData
        });
    }
    async deleteService(id) {
        try {
            await prisma.service.delete({
                where: { id }
            });
            return true;
        }
        catch {
            return false;
        }
    }
}
export const serviceService = new ServiceService();
//# sourceMappingURL=service.service.js.map