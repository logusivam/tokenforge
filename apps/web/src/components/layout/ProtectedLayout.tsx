import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function ProtectedLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100">
      <nav className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md px-6 flex items-center justify-between z-40 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setMobileOpen(!mobileOpen)
            }}
            className="md:hidden p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              TF
            </span>
            <span className="font-bold text-slate-100 tracking-wider">TOKENFORGE</span>
          </Link>
        </div>
        <Navbar />
      </nav>

      {/* Responsive Sidebar wrapper */}
      <div className={`${mobileOpen ? 'block' : 'hidden'} md:block`}>
        <Sidebar
          onClose={() => {
            setMobileOpen(false)
          }}
        />
      </div>

      <main className="md:pl-64 pt-16 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
