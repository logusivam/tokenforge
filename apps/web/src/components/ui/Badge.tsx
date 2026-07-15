import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'info' | 'danger'
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  }

  return (
    <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  )
}
