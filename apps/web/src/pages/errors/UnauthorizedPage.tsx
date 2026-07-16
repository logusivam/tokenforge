import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          {/* Lock Icon */}
          <svg
            className="w-10 h-10 stroke-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#F1F5F9] uppercase tracking-widest mb-2">
          401 - Session Expired
        </h1>
        <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
          Your secure token session has ended or is invalid. Please sign in again to verify your
          cryptographic identity.
        </p>

        <Link to="/login" className="w-full">
          <Button variant="primary" className="w-full justify-center">
            Sign In Securely
          </Button>
        </Link>
      </div>
    </div>
  )
}
