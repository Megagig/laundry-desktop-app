import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "../../../shared/types/auth.types"

interface AuthState {
  user: User | null
  sessionToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSessionToken: (token: string | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  login: (user: User, sessionToken: string) => void
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

      setUser: (user) => set({ user }),
      
      setSessionToken: (token) => set({ sessionToken: token }),
      
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      login: (user, sessionToken) => set({
        user,
        sessionToken,
        isAuthenticated: true,
        isLoading: false
      }),
      
      logout: () => set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        isLoading: false
      }),
      
      clearAuth: () => set({
        user: null,
        sessionToken: null,
        isAuthenticated: false,
        isLoading: false
      })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
