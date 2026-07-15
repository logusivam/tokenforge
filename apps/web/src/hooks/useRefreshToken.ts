import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/user.service'

export function useRefreshToken() {
  const { setAuth, clearAuth } = useAuthStore()

  const refresh = async (): Promise<string | null> => {
    try {
      const { accessToken } = await authService.refresh()
      const user = await userService.getMe()
      setAuth(user, accessToken)
      return accessToken
    } catch (err) {
      clearAuth()
      return null
    }
  }

  return refresh
}
