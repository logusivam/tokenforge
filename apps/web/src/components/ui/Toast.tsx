import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [isVisible, onClose])

  const styles = {
    success:
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
    info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.15)]',
  }

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg border backdrop-blur-md font-medium text-sm ${styles[type]}`}
        >
          <span>{message}</span>
          <button onClick={onClose} className="hover:opacity-70 transition duration-150">
            ✕
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
