import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md bg-[#12121A] border border-[#2A2A3D] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <svg
            className="w-16 h-16 stroke-[#6366F1]"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-[#F1F5F9] uppercase tracking-widest mb-2">
          404 — Route Not Found
        </h1>
        <p className="text-sm text-[#94A3B8] mb-6 leading-relaxed">
          This page doesn't exist or was moved.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link to="/dashboard" className="w-full">
            <Button variant="primary" className="w-full justify-center">
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="ghost" className="w-full justify-center text-xs">
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-800/80 pt-4 w-full">
          <p className="text-[11px] text-[#475569]">If you followed a link, it may be outdated.</p>
        </div>
      </div>
    </div>
  )
}
