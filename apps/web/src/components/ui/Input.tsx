import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label ? (
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          {label}
        </label>
      ) : null}
      <input
        className={`w-full px-4 py-2.5 rounded-lg bg-[#0b0f19]/80 border ${
          error
            ? 'border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
        } text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-4 transition duration-200 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-500 font-medium">{error}</span> : null}
    </div>
  )
}
