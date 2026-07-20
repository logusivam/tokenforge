import React from 'react'
import { useAuthStore } from '../../store/authStore'

export function Navbar() {
  const { user } = useAuthStore()

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col text-right">
        <span className="text-xs font-semibold text-slate-300">{user?.name}</span>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          {user?.role}
        </span>
      </div>
      <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 overflow-hidden">
        {user?.avatar ? (
          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          user?.name?.slice(0, 2).toUpperCase() || 'US'
        )}
      </div>
    </div>
  )
}
