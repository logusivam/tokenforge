import { useAuthStore } from '../store/authStore'
import { decodeJwt } from '../utils/jwt.utils'

export function usePermission() {
  const { accessToken } = useAuthStore()

  const hasPermission = (permission: string): boolean => {
    if (!accessToken) return false
    const claims = decodeJwt(accessToken)
    if (!claims) return false
    if (claims.role === 'admin') return true
    return claims.permissions?.includes(permission as any) || false
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!accessToken) return false
    const claims = decodeJwt(accessToken)
    if (!claims) return false
    if (claims.role === 'admin') return true
    return permissions.some((p) => claims.permissions?.includes(p as any))
  }

  return {
    hasPermission,
    hasAnyPermission,
  }
}
