import { PrismaClient } from '@prisma/client'
import type { PermissionName } from '../../shared/types/permissions.js'

const prisma = new PrismaClient()

export class RBACService {
  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      })

      if (!user || !user.role) {
        return []
      }

      return user.role.permissions.map(rp => rp.permission.name)
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return []
    }
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: number, permission: PermissionName): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId)
    return permissions.includes(permission)
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: number, permissions: PermissionName[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return permissions.some(p => userPermissions.includes(p))
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: number, permissions: PermissionName[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)
    return permissions.every(p => userPermissions.includes(p))
  }

  /**
   * Get user's role
   */
  async getUserRole(userId: number): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
      })

      return user?.role?.name || null
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId }
      })
      return true
    } catch (error) {
      console.error('Error assigning role:', error)
      return false
    }
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles() {
    try {
      return await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error getting roles:', error)
      return []
    }
  }

  /**
   * Get all permissions
   */
  async getAllPermissions() {
    try {
      return await prisma.permission.findMany({
        orderBy: [
          { module: 'asc' },
          { name: 'asc' }
        ]
      })
    } catch (error) {
      console.error('Error getting permissions:', error)
      return []
    }
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      // Check if role exists and is not a system role
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('Cannot modify system role permissions')
      }

      // Remove all existing permissions for this role
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      })

      // Add new permissions
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId
          }))
        })
      }

      return true
    } catch (error) {
      console.error('Error updating role permissions:', error)
      return false
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: { name: string, description: string }) {
    try {
      // Check if role name already exists
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      })

      if (existingRole) {
        throw new Error('Role name already exists')
      }

      const role = await prisma.role.create({
        data: {
          name: roleData.name.toUpperCase(),
          description: roleData.description,
          isSystem: false
        }
      })

      return role
    } catch (error) {
      console.error('Error creating role:', error)
      throw error
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: number): Promise<boolean> {
    try {
      // Check if role exists and is not a system role
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      })

      if (!role) {
        throw new Error('Role not found')
      }

      if (role.isSystem) {
        throw new Error('Cannot delete system role')
      }

      // Check if any users are assigned to this role
      const usersWithRole = await prisma.user.count({
        where: { roleId }
      })

      if (usersWithRole > 0) {
        throw new Error('Cannot delete role that is assigned to users')
      }

      // Delete role permissions first
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      })

      // Delete the role
      await prisma.role.delete({
        where: { id: roleId }
      })

      return true
    } catch (error) {
      console.error('Error deleting role:', error)
      throw error
    }
  }

  /**
   * Create new permission
   */
  async createPermission(permissionData: { name: string, description: string, module: string }) {
    try {
      // Check if permission name already exists
      const existingPermission = await prisma.permission.findUnique({
        where: { name: permissionData.name }
      })

      if (existingPermission) {
        throw new Error('Permission name already exists')
      }

      const permission = await prisma.permission.create({
        data: {
          name: permissionData.name.toLowerCase(),
          description: permissionData.description,
          module: permissionData.module.toUpperCase(),
          isSystem: false
        }
      })

      return permission
    } catch (error) {
      console.error('Error creating permission:', error)
      throw error
    }
  }

  /**
   * Delete permission
   */
  async deletePermission(permissionId: number): Promise<boolean> {
    try {
      // Check if permission exists and is not a system permission
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId }
      })

      if (!permission) {
        throw new Error('Permission not found')
      }

      if (permission.isSystem) {
        throw new Error('Cannot delete system permission')
      }

      // Delete role permissions first
      await prisma.rolePermission.deleteMany({
        where: { permissionId }
      })

      // Delete the permission
      await prisma.permission.delete({
        where: { id: permissionId }
      })

      return true
    } catch (error) {
      console.error('Error deleting permission:', error)
      throw error
    }
  }
}

export const rbacService = new RBACService()
