import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../../../shared/types/auth.types"

interface AuthState {
  user: User | null
  sessionToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: string[] | null
  
  // Actions
  setUser: (user: User | null) => void
  setSessionToken: (token: string | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setPermissions: (permissions: string[] | null) => void
  login: (user: User, sessionToken: string, permissions: string[]) => void
  logout: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      permissions: null,

      setUser: (user) => set({ user }),
      
      setSessionToken: (token) => set({ sessionToken: token }),
      
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setPermissions: (permissions) => set({ permissions }),
      
      login: (user, sessionToken, permissions) => set({
        user,
        sessionToken,
        permissions,
        isAuthenticated: true,
        isLoading: false
      }),
      
      logout: () => set({
        user: null,
        sessionToken: null,
        permissions: null,
        isAuthenticated: false,
        isLoading: false
      }),
      
      clearAuth: () => set({
        user: null,
        sessionToken: null,
        permissions: null,
        isAuthenticated: false,
        isLoading: false
      })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions
      })
    }
  )
)
