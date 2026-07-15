import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] p-4 text-center">
      <div className="text-6xl font-extrabold text-indigo-500 mb-4 tracking-widest animate-pulse">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-100 uppercase tracking-wider mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-400 max-w-sm mb-6">
        The security resource you are trying to locate does not exist on this server.
      </p>
      <Link to="/">
        <Button variant="primary">Return Home</Button>
      </Link>
    </div>
  )
}
