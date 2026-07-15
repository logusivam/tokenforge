import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] p-4 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
        🚫
      </div>
      <h1 className="text-3xl font-extrabold text-slate-100 uppercase tracking-widest mb-2">
        403 - Forbidden
      </h1>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        Access Denied. You do not possess the required RBAC security permissions to view this
        resource.
      </p>
      <Link to="/">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  )
}
