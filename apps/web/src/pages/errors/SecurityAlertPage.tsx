import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function SecurityAlertPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] p-4 text-center">
      <div className="w-24 h-24 rounded-full bg-rose-600/10 border-2 border-rose-500 flex items-center justify-center text-rose-500 text-4xl mb-6 shadow-[0_0_40px_rgba(244,63,94,0.3)] animate-bounce">
        ⚠️
      </div>
      <h1 className="text-3xl font-black text-rose-500 uppercase tracking-widest mb-3">
        Security Alert
      </h1>
      <h2 className="text-lg font-bold text-slate-100 mb-2">Token Reuse Attack Detected</h2>
      <p className="text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
        Our multi-tenant auth network detected an attempt to reuse an expired refresh token family.
        To secure your profile against credential theft,{' '}
        <strong className="text-slate-200">
          all active sessions for this account have been terminated
        </strong>
        .
      </p>
      <div className="flex gap-4">
        <Link to="/login">
          <Button variant="primary">Log Back In</Button>
        </Link>
      </div>
    </div>
  )
}
