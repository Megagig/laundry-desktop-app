import { prisma } from "../database/prisma.js"
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO, CustomerWithStats } from "../../shared/types/index.js"

export class CustomerService {
  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    return await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address ?? null,
        notes: data.notes ?? null,
      }
    }) as Customer
  }

  async getCustomerById(id: number): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { id }
    }) as Customer | null
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      orderBy: { created_at: "desc" }
    }) as Customer[]
  }

  async searchCustomerByPhone(phone: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        phone: {
          contains: phone
        }
      },
      orderBy: { created_at: "desc" }
    }) as Customer[]
  }

  async searchCustomerByName(name: string): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        name: {
          contains: name
        }
      },
      orderBy: { created_at: "desc" }
    }) as Customer[]
  }

  async updateCustomer(data: UpdateCustomerDTO): Promise<Customer | null> {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.address !== undefined) updateData.address = data.address
    if (data.notes !== undefined) updateData.notes = data.notes

    if (Object.keys(updateData).length === 0) {
      return this.getCustomerById(data.id)
    }

    return await prisma.customer.update({
      where: { id: data.id },
      data: updateData
    }) as Customer
  }

  async deleteCustomer(id: number): Promise<boolean> {
    try {
      await prisma.customer.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }

  async getCustomerWithStats(id: number): Promise<CustomerWithStats | null> {
    const customer = await this.getCustomerById(id)
    if (!customer) return null

    const stats = await prisma.order.aggregate({
      where: { customer_id: id },
      _count: true,
      _sum: {
        total_amount: true,
        balance: true
      }
    })

    return {
      ...customer,
      total_orders: stats._count,
      total_spent: stats._sum.total_amount || 0,
      outstanding_balance: stats._sum.balance || 0
    }
  }

  async getCustomerOrderHistory(customerId: number, limit: number = 10) {
    return await prisma.order.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: "desc" },
      take: limit
    })
  }
}

export const customerService = new CustomerService()
