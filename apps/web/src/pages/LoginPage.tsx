import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const location = useLocation()
  const wasRegistered = location.state?.registered

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-wider uppercase">
            Sign In
          </h2>
          <p className="text-sm text-slate-400">Welcome back to TokenForge.</p>
        </div>

        {wasRegistered ? (
          <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 p-3 rounded-lg text-sm font-medium">
            Registration successful! Please sign in below.
          </div>
        ) : null}

        <LoginForm />

        <div className="text-center text-xs text-slate-400">
          New to TokenForge?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-bold transition"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}
