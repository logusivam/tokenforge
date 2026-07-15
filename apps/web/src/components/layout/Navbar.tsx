import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function Navbar() {
  const { user } = useAuthStore()

  return (
    <nav className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md px-6 flex items-center justify-between z-40 fixed top-0 left-0 right-0">
      <Link to="/" className="flex items-center gap-2">
        <span className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          TF
        </span>
        <span className="font-bold text-slate-100 tracking-wider">TOKENFORGE</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-300">{user?.name}</span>
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
            {user?.role}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400 border border-slate-700">
          {user?.name?.slice(0, 2) || 'US'}
        </div>
      </div>
    </nav>
  )
}
