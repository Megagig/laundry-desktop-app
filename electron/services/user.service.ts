import { prisma } from "../database/prisma.js"
import { authService } from "./auth.service.js"
import type { CreateUserDTO, UpdateUserDTO } from "../../shared/types/index.js"

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Validate password
    if (data.password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    // Check if username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          { email: data.email }
        ]
      }
    })

    if (existingUser) {
      throw new Error("Username or email already exists")
    }

    // Hash password
    const passwordHash = await authService.hashPassword(data.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        passwordHash,
        roleId: data.roleId,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      include: {
        role: true
      }
    })

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        role: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Remove password hashes
    return users.map(({ passwordHash, ...user }) => user)
  }

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true
      }
    })

    if (!user) {
      return null
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async updateUser(data: UpdateUserDTO) {
    const updateData: any = {}

    if (data.fullName) updateData.fullName = data.fullName
    if (data.email) updateData.email = data.email
    if (data.username) updateData.username = data.username
    if (data.roleId) updateData.roleId = data.roleId
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    const user = await prisma.user.update({
      where: { id: data.id },
      data: updateData,
      include: {
        role: true
      }
    })

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user

    return userWithoutPassword
  }

  async deleteUser(id: number) {
    // Don't allow deleting the last admin
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    })

    if (user?.role.name === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: {
            name: "ADMIN"
          },
          isActive: true
        }
      })

      if (adminCount <= 1) {
        throw new Error("Cannot delete the last active admin user")
      }
    }

    await prisma.user.delete({
      where: { id }
    })

    return { success: true }
  }

  async toggleActive(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Don't allow deactivating the last admin
    if (user.role.name === "ADMIN" && user.isActive) {
      const activeAdminCount = await prisma.user.count({
        where: {
          role: {
            name: "ADMIN"
          },
          isActive: true
        }
      })

      if (activeAdminCount <= 1) {
        throw new Error("Cannot deactivate the last active admin user")
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      include: { role: true }
    })

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = updatedUser

    return userWithoutPassword
  }

  async resetPassword(userId: number, newPassword: string) {
    await authService.resetPassword(userId, newPassword)
    return { success: true }
  }
}

export const userService = new UserService()
