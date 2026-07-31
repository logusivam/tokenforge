import React from 'react'
import { Link } from 'react-router-dom'
import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#12121A] border border-[#2A2A3D] rounded-2xl p-8 backdrop-blur-xl shadow-2xl z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <div className="flex justify-center mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              🛡️ No third-party auth services
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F1F5F9] tracking-wider uppercase">
            Create Account
          </h2>
          <p className="text-sm text-slate-455">Join TokenForge security network.</p>
        </div>

        <RegisterForm />

        <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
