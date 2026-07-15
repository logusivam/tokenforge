import React from 'react'

export function Spinner({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div
      className={`border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin ${className}`}
    />
  )
}
