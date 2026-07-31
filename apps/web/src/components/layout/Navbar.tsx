import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/auth.service'

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
    }
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    try {
      await authService.logout()
    } catch {
      // ignore — clear auth regardless
    }
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="relative flex items-center gap-3" ref={menuRef}>
      {/* Name + role — hidden on mobile */}
      <div className="hidden sm:flex flex-col text-right">
        <span className="text-xs font-semibold text-slate-300 leading-tight">{user?.name}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          {user?.role}
        </span>
      </div>

      {/* Avatar button — always visible */}
      <div className="relative">
        <button
          id="navbar-profile-btn"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v)
          }}
          className="w-9 h-9 rounded-full bg-indigo-600/20 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 hover:border-indigo-500/60 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 overflow-hidden"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.name?.slice(0, 2).toUpperCase() || 'US'
          )}
        </button>
        {/* Online indicator dot — outside the button to avoid overflow-hidden clipping */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f172a] pointer-events-none" />
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute right-0 top-12 w-60 bg-[#0f172a] border border-slate-700/80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50 overflow-hidden animate-[fadeSlideDown_0.15s_ease-out]"
          role="menu"
          aria-label="User menu"
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-sm font-bold text-indigo-400 overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'US'
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-100 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div className="py-1.5">
            <Link
              to="/dashboard"
              id="navbar-menu-dashboard"
              role="menuitem"
              onClick={() => {
                setOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"
                />
              </svg>
              Dashboard
            </Link>

            <Link
              to="/profile"
              id="navbar-menu-profile"
              role="menuitem"
              onClick={() => {
                setOpen(false)
              }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Profile Settings
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-800 py-1.5">
            <button
              id="navbar-menu-logout"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
