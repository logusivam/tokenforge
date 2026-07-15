import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth.service'
import { userService } from '../services/user.service'

export function useAuth() {
  const { user, accessToken, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } =
    useAuthStore()

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await authService.login(email, password)
      setAuth(data.user, data.accessToken)
      return data.user
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }

  const checkSession = async () => {
    setLoading(true)
    try {
      const { accessToken } = await authService.refresh()
      const user = await userService.getMe()
      setAuth(user, accessToken)
    } catch (err) {
      clearAuth()
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkSession,
  }
}
