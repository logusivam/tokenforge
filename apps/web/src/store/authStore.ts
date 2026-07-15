import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  linkedProviders: string[]
}

interface AuthState {
  user: User | null
  accessToken: string | null      // In-memory only — NEVER persisted to localStorage
  isLoading: boolean
  isAuthenticated: boolean

  setAuth: (user: User, accessToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,                // true on mount — wait for silent refresh attempt
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}))