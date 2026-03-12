// Authentication Types

export interface User {
  id: number
  fullName: string
  email: string
  username: string
  roleId: number
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  role?: Role
}

export interface Role {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  createdAt: Date
}

export interface Permission {
  id: number
  name: string
  description: string | null
  module: string
  createdAt: Date
}

export interface Session {
  id: number
  userId: number
  token: string
  expiresAt: Date
  createdAt: Date
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResult {
  success: boolean
  user?: User
  sessionToken?: string
  error?: string
}

export interface CreateUserDTO {
  fullName: string
  email: string
  username: string
  password: string
  roleId: number
  isActive?: boolean
}

export interface UpdateUserDTO {
  id: number
  fullName?: string
  email?: string
  username?: string
  roleId?: number
  isActive?: boolean
}

export interface ChangePasswordDTO {
  userId: number
  oldPassword: string
  newPassword: string
}

export interface ResetPasswordDTO {
  userId: number
  newPassword: string
}
