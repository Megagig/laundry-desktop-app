import { prisma } from "../database/prisma.js"
import type { Service, CreateServiceDTO, UpdateServiceDTO } from "../../shared/types/index.js"

export class ServiceService {
  async createService(data: CreateServiceDTO): Promise<Service> {
    return await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description ?? null,
        category: data.category ?? null,
      }
    }) as Service
  }

  async getServiceById(id: number): Promise<Service | null> {
    return await prisma.service.findUnique({
      where: { id }
    }) as Service | null
  }

  async getAllServices(): Promise<Service[]> {
    return await prisma.service.findMany({
      orderBy: { name: "asc" }
    }) as Service[]
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    return await prisma.service.findMany({
      where: { category },
      orderBy: { name: "asc" }
    }) as Service[]
  }

  async updateService(data: UpdateServiceDTO): Promise<Service | null> {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.price !== undefined) updateData.price = data.price
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category

    if (Object.keys(updateData).length === 0) {
      return this.getServiceById(data.id)
    }

    return await prisma.service.update({
      where: { id: data.id },
      data: updateData
    }) as Service
  }

  async deleteService(id: number): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }
}

export const serviceService = new ServiceService()
