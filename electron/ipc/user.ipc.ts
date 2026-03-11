import { ipcMain } from "electron"
import { userService } from "../services/user.service.js"
import { auditService } from "../services/audit.service.js"
import { checkPermission } from "../middleware/permission.middleware.js"
import { PERMISSIONS } from "../../shared/types/permissions.js"
import type { CreateUserDTO, UpdateUserDTO } from "../../shared/types/index.js"

export function registerUserHandlers() {
  // Create User
  ipcMain.handle("user:create", async (_event, sessionToken: string, data: CreateUserDTO) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.CREATE_USER)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const user = await userService.createUser(data)
      
      // Log user creation
      await auditService.logUserManagement(
        'CREATE',
        permissionCheck.userId!,
        permissionCheck.user.username,
        user.id,
        user.username,
        { fullName: user.fullName, email: user.email, roleId: user.roleId }
      )
      
      return { success: true, data: user }
    } catch (error) {
      console.error("Create user error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user"
      }
    }
  })

  // Get All Users
  ipcMain.handle("user:getAll", async (_event, sessionToken: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_USERS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const users = await userService.getAllUsers()
      return { success: true, data: users }
    } catch (error) {
      console.error("Get users error:", error)
      return {
        success: false,
        error: "Failed to fetch users"
      }
    }
  })

  // Get User By ID
  ipcMain.handle("user:getById", async (_event, sessionToken: string, userId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.VIEW_USERS)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const user = await userService.getUserById(userId)
      return { success: true, data: user }
    } catch (error) {
      console.error("Get user error:", error)
      return {
        success: false,
        error: "Failed to fetch user"
      }
    }
  })

  // Update User
  ipcMain.handle("user:update", async (_event, sessionToken: string, userId: number, data: Partial<UpdateUserDTO>) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EDIT_USER)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get original user data for audit log
      const originalUser = await userService.getUserById(userId)
      if (!originalUser) {
        return { success: false, error: "User not found" }
      }

      const user = await userService.updateUser({ id: userId, ...data })
      
      // Log user update
      await auditService.logUserManagement(
        'UPDATE',
        permissionCheck.userId!,
        permissionCheck.user.username,
        userId,
        originalUser.username,
        data
      )
      
      return { success: true, data: user }
    } catch (error) {
      console.error("Update user error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user"
      }
    }
  })

  // Delete User
  ipcMain.handle("user:delete", async (_event, sessionToken: string, userId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.DELETE_USER)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get user data for audit log before deletion
      const user = await userService.getUserById(userId)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      await userService.deleteUser(userId)
      
      // Log user deletion
      await auditService.logUserManagement(
        'DELETE',
        permissionCheck.userId!,
        permissionCheck.user.username,
        userId,
        user.username
      )
      
      return { success: true }
    } catch (error) {
      console.error("Delete user error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user"
      }
    }
  })

  // Toggle User Active Status
  ipcMain.handle("user:toggle-active", async (_event, sessionToken: string, userId: number) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.EDIT_USER)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get original user data for audit log
      const originalUser = await userService.getUserById(userId)
      if (!originalUser) {
        return { success: false, error: "User not found" }
      }

      const user = await userService.toggleActive(userId)
      
      // Log user activation/deactivation
      await auditService.logUserManagement(
        user.isActive ? 'ACTIVATE' : 'DEACTIVATE',
        permissionCheck.userId!,
        permissionCheck.user.username,
        userId,
        user.username
      )
      
      return { success: true, data: user }
    } catch (error) {
      console.error("Toggle user active error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to toggle user status"
      }
    }
  })

  // Reset User Password
  ipcMain.handle("user:reset-password", async (_event, sessionToken: string, userId: number, newPassword: string) => {
    try {
      const permissionCheck = await checkPermission(sessionToken, PERMISSIONS.RESET_USER_PASSWORD)
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      // Get user data for audit log
      const user = await userService.getUserById(userId)
      if (!user) {
        return { success: false, error: "User not found" }
      }

      await userService.resetPassword(userId, newPassword)
      
      // Log password reset
      await auditService.logPasswordChange(
        userId,
        user.username,
        permissionCheck.userId!
      )
      
      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      console.error("Reset password error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset password"
      }
    }
  })

  console.log("✓ User handlers registered")
}
