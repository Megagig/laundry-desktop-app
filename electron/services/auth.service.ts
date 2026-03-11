import bcrypt from "bcrypt"
import crypto from "crypto"
import { prisma } from "../database/prisma.js"
import type { LoginResult, User, Session } from "../../shared/types/index.js"

const SALT_ROUNDS = 12
const SESSION_EXPIRY_HOURS = 24
const SESSION_EXPIRY_HOURS_REMEMBER_ME = 720 // 30 days
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

// In-memory tracking for failed login attempts
const failedLoginAttempts = new Map<string, { count: number; lockedUntil?: Date }>()

export class AuthService {
  // Password Management
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS)
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  // Authentication
  async login(username: string, password: string, rememberMe: boolean = false): Promise<LoginResult> {
    try {
      // Check if account is locked
      if (await this.isAccountLocked(username)) {
        return {
          success: false,
          error: "Account is temporarily locked due to multiple failed login attempts. Please try again later."
        }
      }

      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        },
        include: {
          role: true
        }
      })

      if (!user) {
        await this.trackFailedLogin(username)
        return {
          success: false,
          error: "Invalid username or password"
        }
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          success: false,
          error: "Account is deactivated. Please contact administrator."
        }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.passwordHash)

      if (!isValidPassword) {
        await this.trackFailedLogin(username)
        return {
          success: false,
          error: "Invalid username or password"
        }
      }

      // Clear failed login attempts
      failedLoginAttempts.delete(username)

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })

      // Create session
      const session = await this.createSession(user.id, rememberMe)

      // Remove password hash from user object
      const { passwordHash, ...userWithoutPassword } = user

      return {
        success: true,
        user: userWithoutPassword as User,
        sessionToken: session.token
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: "An error occurred during login. Please try again."
      }
    }
  }

  async logout(sessionToken: string): Promise<void> {
    try {
      await prisma.session.delete({
        where: { token: sessionToken }
      })
    } catch (error) {
      // Session might already be deleted or expired
      console.error("Logout error:", error)
    }
  }

  // Session Management
  async createSession(userId: number, rememberMe: boolean = false): Promise<Session> {
    const token = this.generateSessionToken()
    const expiryHours = rememberMe ? SESSION_EXPIRY_HOURS_REMEMBER_ME : SESSION_EXPIRY_HOURS
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000)

    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt
      }
    })

    return session
  }

  async validateSession(token: string): Promise<Session | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              role: true
            }
          }
        }
      })

      if (!session) {
        return null
      }

      // Check if session is expired
      if (new Date() > session.expiresAt) {
        // Delete expired session
        await prisma.session.delete({
          where: { id: session.id }
        })
        return null
      }

      // Check if user is still active
      if (!session.user.isActive) {
        return null
      }

      return session
    } catch (error) {
      console.error("Session validation error:", error)
      return null
    }
  }

  async refreshSession(token: string): Promise<Session | null> {
    const session = await this.validateSession(token)

    if (!session) {
      return null
    }

    // Extend session expiry
    const newExpiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000)

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt }
    })

    return updatedSession
  }

  async invalidateSession(token: string): Promise<void> {
    await this.logout(token)
  }

  async invalidateAllUserSessions(userId: number): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId }
    })
  }

  // User Management
  async getCurrentUser(sessionToken: string): Promise<User | null> {
    const session = await this.validateSession(sessionToken)

    if (!session) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        role: true
      }
    })

    if (!user) {
      return null
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user

    return userWithoutPassword as User
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Verify old password
    const isValidPassword = await this.verifyPassword(oldPassword, user.passwordHash)

    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    // Validate new password
    this.validatePassword(newPassword)

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })

    // Invalidate all sessions except current one (force re-login)
    // This is a security measure to ensure all devices re-authenticate
  }

  async resetPassword(userId: number, newPassword: string): Promise<void> {
    // Validate new password
    this.validatePassword(newPassword)

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    })

    // Invalidate all user sessions (force re-login)
    await this.invalidateAllUserSessions(userId)
  }

  // Security
  async trackFailedLogin(username: string): Promise<void> {
    const attempts = failedLoginAttempts.get(username) || { count: 0 }
    attempts.count++

    if (attempts.count >= MAX_FAILED_ATTEMPTS) {
      attempts.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000)
    }

    failedLoginAttempts.set(username, attempts)
  }

  async isAccountLocked(username: string): Promise<boolean> {
    const attempts = failedLoginAttempts.get(username)

    if (!attempts || !attempts.lockedUntil) {
      return false
    }

    // Check if lockout period has expired
    if (new Date() > attempts.lockedUntil) {
      failedLoginAttempts.delete(username)
      return false
    }

    return true
  }

  async unlockAccount(username: string): Promise<void> {
    failedLoginAttempts.delete(username)
  }

  // Utility Methods
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString("base64")
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long")
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter")
    }

    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter")
    }

    if (!/[0-9]/.test(password)) {
      throw new Error("Password must contain at least one number")
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error("Password must contain at least one special character")
    }
  }

  // Cleanup expired sessions (should be called periodically)
  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return result.count
  }
}

// Export singleton instance
export const authService = new AuthService()
