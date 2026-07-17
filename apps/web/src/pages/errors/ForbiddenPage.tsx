import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../../components/ui/Button'

export function ForbiddenPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md bg-[#12121A] border border-rose-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl mb-6 shadow-[0_0_35px_rgba(244,63,94,0.2)]">
          <svg
            className="w-10 h-10 stroke-rose-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#F1F5F9] uppercase tracking-widest mb-2">
          403 - Forbidden
        </h1>
        <h2 className="text-lg font-bold text-rose-400 mb-2">Access Denied</h2>
        <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
          You don't have permission to view this page.
        </p>

        {user && (
          <div className="mb-6 px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-400">
            Current Session Role:{' '}
            <span className="text-rose-400 font-bold uppercase">{user.role}</span>
          </div>
        )}

        <Link to="/" className="w-full">
          <Button variant="primary" className="w-full justify-center">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
