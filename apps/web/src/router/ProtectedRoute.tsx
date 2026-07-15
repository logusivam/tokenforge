import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'
import type { UserRole } from '@tokenforge/types'

interface ProtectedRouteProps {
  requiredRole?: UserRole
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  // Still attempting silent refresh — render spinner, not redirect
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0F]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve intended destination for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}