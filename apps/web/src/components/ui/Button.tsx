import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  isLoading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  isLoading,
  className = '',
  disabled,
  size = 'md',
  ...props
}: ButtonProps) {
  const baseStyle =
    'px-4 py-2.5 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2 border disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 border-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]',
    secondary: 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200',
    danger:
      'bg-rose-600 hover:bg-rose-500 border-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    ghost:
      'bg-transparent border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : null}
      {children}
    </motion.button>
  )
}
