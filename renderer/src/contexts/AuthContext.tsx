import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"
import type { User, LoginCredentials } from "../../../shared/types/auth.types"

interface AuthContextType {
  user: User | null
  sessionToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { user, sessionToken, isAuthenticated, login: setLogin, logout: clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  // Validate session on mount
  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async (): Promise<boolean> => {
    if (!sessionToken) {
      setIsLoading(false)
      return false
    }

    try {
      const result = await window.api.auth.validateSession(sessionToken)
      
      if (result.valid && result.session) {
        // Session is valid, get current user and permissions
        const currentUser = await window.api.auth.getCurrentUser(sessionToken)
        
        let permissions: string[] = []
        try {
          if (window.api?.rbac?.getUserPermissions) {
            const permissionsResult = await window.api.rbac.getUserPermissions(sessionToken)
            permissions = permissionsResult.success ? permissionsResult.permissions : []
          } else {
            console.warn('Session validation - RBAC API not available')
          }
        } catch (error) {
          console.warn('Failed to load permissions during session validation:', error)
          permissions = []
        }
        
        if (currentUser) {
          setLogin(currentUser, sessionToken, permissions)
          setIsLoading(false)
          return true
        }
      }

      // Session invalid, clear auth
      clearAuth()
      setIsLoading(false)
      return false
    } catch (error) {
      console.error("Session validation error:", error)
      clearAuth()
      setIsLoading(false)
      return false
    }
  }

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)

    try {
      const result = await window.api.auth.login(credentials)

      if (result.success && result.user && result.sessionToken) {
        // Get user permissions (with fallback for compatibility)
        let permissions: string[] = []
        try {
          if (window.api?.rbac?.getUserPermissions) {
            const permissionsResult = await window.api.rbac.getUserPermissions(result.sessionToken)
            permissions = permissionsResult.success ? permissionsResult.permissions : []
          } else {
            console.warn('RBAC API not available - window.api.rbac is undefined')
          }
        } catch (error) {
          console.error('Failed to load permissions:', error)
          permissions = []
        }
        
        setLogin(result.user, result.sessionToken, permissions)
        setIsLoading(false)
        return { success: true }
      }

      setIsLoading(false)
      return {
        success: false,
        error: result.error || "Login failed"
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return {
        success: false,
        error: "An error occurred during login"
      }
    }
  }

  const logout = async () => {
    if (sessionToken) {
      try {
        await window.api.auth.logout(sessionToken)
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    clearAuth()
    navigate("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        validateSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
