import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { usePermission } from '../../hooks/usePermission'

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const { user } = useAuthStore()
  const { hasAnyPermission } = usePermission()

  const hasAdminAccess =
    user && (user.roles.includes('admin') || hasAnyPermission(['users:read', 'audit:read']))

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-150 ${
      isActive
        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
    }`

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] md:bg-[#0f172a]/45 min-h-screen fixed left-0 top-16 pt-6 px-4 z-30">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">
          Main Navigation
        </span>

        <NavLink to="/dashboard" onClick={onClose} className={linkClass}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
            />
          </svg>
          Security Dashboard
        </NavLink>

        <NavLink to="/profile" onClick={onClose} className={linkClass}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Profile Settings
        </NavLink>

        {hasAdminAccess ? (
          <>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">
              Administration
            </span>

            <NavLink to="/admin" onClick={onClose} className={linkClass}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Admin Controls
            </NavLink>
          </>
        ) : null}
      </div>
    </aside>
  )
}
