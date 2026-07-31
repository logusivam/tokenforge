import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const location = useLocation()
  const wasRegistered = location.state?.registered

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#12121A] border border-[#2A2A3D] rounded-2xl p-8 backdrop-blur-xl shadow-2xl z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-black text-[#F1F5F9] tracking-wider uppercase">
            Welcome back
          </h2>
          <p className="text-sm text-slate-400">
            Sign in to manage your TokenForge security session.
          </p>
        </div>

        {wasRegistered ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3 rounded-lg text-sm font-medium">
            Registration successful! Please sign in below.
          </div>
        ) : null}

        <LoginForm />

        <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 mt-2">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-bold transition"
          >
            Create one →
          </Link>
        </div>
      </div>
    </div>
  )
}
