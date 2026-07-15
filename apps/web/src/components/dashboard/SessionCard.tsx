import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

export function SessionCard() {
  const { user } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
        Active Session Details
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-400 text-lg uppercase overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.name?.slice(0, 2) || 'US'
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
          <span className="text-xs text-slate-400">{user?.email}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 border-t border-slate-800/60 pt-3 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Primary Role:</span>
          <span className="font-semibold text-slate-200 uppercase">{user?.role}</span>
        </div>
        <div className="flex justify-between">
          <span>Linked Accounts:</span>
          <span className="font-semibold text-slate-200">
            {user?.linkedProviders && user.linkedProviders.length > 0
              ? user.linkedProviders.join(', ')
              : 'Local Email/Password'}
          </span>
        </div>
      </div>
      <Button variant="danger" onClick={logout} className="w-full mt-2">
        Logout Session
      </Button>
    </div>
  )
}
