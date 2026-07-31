import React from 'react'

export function PasswordStrengthBar({ password = '' }: { password?: string }) {
  const getStrength = (pass: string) => {
    let score = 0
    if (!pass) return score
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = getStrength(password)

  const colors = [
    'bg-slate-800',
    'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]',
    'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
    'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]',
    'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
  ]

  const labels = ['None', 'Weak', 'Fair', 'Strong', 'Excellent']

  return (
    <div className="w-full flex flex-col gap-1.5 mt-1">
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        <span>Password Strength</span>
        <span className="font-bold">{labels[strength]}</span>
      </div>
      <div className="flex gap-1 h-1.5 w-full bg-slate-800/40 rounded overflow-hidden">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex-1 h-full rounded transition-all duration-300 ${
              strength >= step ? colors[strength] : 'bg-slate-800/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
