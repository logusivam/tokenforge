import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function SecurityAlertPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md bg-[#12121A] border border-rose-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-24 h-24 rounded-full bg-rose-600/10 border-2 border-rose-500 flex items-center justify-center text-rose-500 text-4xl mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-pulse">
          ⚠️
        </div>
        <h1 className="text-3xl font-black text-rose-500 uppercase tracking-widest mb-3">
          Security Alert
        </h1>
        <h2 className="text-lg font-bold text-[#F1F5F9] mb-2">Security Event Detected</h2>
        <p className="text-sm text-[#94A3B8] mb-8 leading-relaxed">
          Unusual activity was detected on your account. All sessions have been terminated.
        </p>
        <div className="w-full">
          <Link to="/login" className="w-full">
            <Button variant="primary" className="w-full justify-center">
              Sign In Securely
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
