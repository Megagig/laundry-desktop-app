import { ipcMain } from "electron"
import { userService } from "../services/user.service.js"
import type { CreateUserDTO, UpdateUserDTO, ResetPasswordDTO } from "../../shared/types/index.js"

export function registerUserHandlers() {
  // Create User
  ipcMain.handle("user:create", async (event, sessionToken: string, data: CreateUserDTO) => {
    try {
      // TODO: Add permission check in Phase 3
      const user = await userService.createUser(data)
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
  ipcMain.handle("user:getAll", async (event, sessionToken: string) => {
    try {
      // TODO: Add permission check in Phase 3
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
  ipcMain.handle("user:getById", async (event, sessionToken: string, userId: number) => {
    try {
      // TODO: Add permission check in Phase 3
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
  ipcMain.handle("user:update", async (event, sessionToken: string, userId: number, data: Partial<UpdateUserDTO>) => {
    try {
      // TODO: Add permission check in Phase 3
      const user = await userService.updateUser({ id: userId, ...data })
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
  ipcMain.handle("user:delete", async (event, sessionToken: string, userId: number) => {
    try {
      // TODO: Add permission check in Phase 3
      await userService.deleteUser(userId)
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
  ipcMain.handle("user:toggle-active", async (event, sessionToken: string, userId: number) => {
    try {
      // TODO: Add permission check in Phase 3
      const user = await userService.toggleActive(userId)
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
  ipcMain.handle("user:reset-password", async (event, sessionToken: string, userId: number, newPassword: string) => {
    try {
      // TODO: Add permission check in Phase 3
      await userService.resetPassword(userId, newPassword)
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
