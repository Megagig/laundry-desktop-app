import { ipcMain } from "electron"
import { authService } from "../services/auth.service.js"
import type { LoginCredentials, ChangePasswordDTO } from "../../shared/types/index.js"

export function registerAuthHandlers() {
  // Login
  ipcMain.handle("auth:login", async (event, credentials: LoginCredentials) => {
    try {
      const { username, password, rememberMe } = credentials
      const result = await authService.login(username, password, rememberMe || false)
      return result
    } catch (error) {
      console.error("Login handler error:", error)
      return {
        success: false,
        error: "An error occurred during login"
      }
    }
  })

  // Logout
  ipcMain.handle("auth:logout", async (event, sessionToken: string) => {
    try {
      await authService.logout(sessionToken)
      return { success: true }
    } catch (error) {
      console.error("Logout handler error:", error)
      return { success: false, error: "Failed to logout" }
    }
  })

  // Validate Session
  ipcMain.handle("auth:validate-session", async (event, sessionToken: string) => {
    try {
      const session = await authService.validateSession(sessionToken)
      return { valid: !!session, session }
    } catch (error) {
      console.error("Validate session error:", error)
      return { valid: false, session: null }
    }
  })

  // Get Current User
  ipcMain.handle("auth:get-current-user", async (event, sessionToken: string) => {
    try {
      const user = await authService.getCurrentUser(sessionToken)
      return user
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  })

  // Change Password
  ipcMain.handle("auth:change-password", async (event, sessionToken: string, data: ChangePasswordDTO) => {
    try {
      const user = await authService.getCurrentUser(sessionToken)

      if (!user) {
        return {
          success: false,
          error: "Unauthorized: Invalid session"
        }
      }

      await authService.changePassword(user.id, data.oldPassword, data.newPassword)

      return {
        success: true,
        message: "Password changed successfully"
      }
    } catch (error) {
      console.error("Change password error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change password"
      }
    }
  })

  // Refresh Session
  ipcMain.handle("auth:refresh-session", async (event, sessionToken: string) => {
    try {
      const session = await authService.refreshSession(sessionToken)
      return { success: !!session, session }
    } catch (error) {
      console.error("Refresh session error:", error)
      return { success: false, session: null }
    }
  })

  console.log("✓ Auth handlers registered")
}
