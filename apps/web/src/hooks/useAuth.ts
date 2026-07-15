import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth.service'

export function useAuth() {
  const store = useAuthStore()
  const navigate = useNavigate()

  const login = useCallback(async (email: string, password: string) => {
    store.setLoading(true)
    try {
      const { user, accessToken } = await authService.login(email, password)
      store.setAuth(user, accessToken)
      navigate('/dashboard', { replace: true })
    } finally {
      store.setLoading(false)
    }
  }, [store, navigate])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      // Always clear local state even if API call fails
      store.clearAuth()
      navigate('/login', { replace: true })
    }
  }, [store, navigate])

  // Attempt silent refresh on app mount — determines initial auth state
  const initAuth = useCallback(async () => {
    store.setLoading(true)
    try {
      const { user, accessToken } = await authService.refresh()
      store.setAuth(user, accessToken)
    } catch {
      // No valid session — user must log in
      store.clearAuth()
    }
  }, [store])

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login,
    logout,
    initAuth,
  }
}