import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usePermission } from '../hooks/usePermission'

export function AdminRoute() {
  const { user } = useAuthStore()
  const { hasAnyPermission } = usePermission()

  const hasAccess =
    user && (user.roles.includes('admin') || hasAnyPermission(['users:read', 'audit:read']))

  return hasAccess ? <Outlet /> : <Navigate to="/403" replace />
}
