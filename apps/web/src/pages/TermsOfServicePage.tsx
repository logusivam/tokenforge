import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col justify-between relative overflow-hidden p-6 md:p-12">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto bg-[#12121A] border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
            Legal Framework
          </span>
          <h1 className="text-3xl font-black text-slate-100 tracking-wide uppercase">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500">Effective date: January 1, 2026</p>
        </div>

        <div className="text-slate-300 text-sm leading-relaxed flex flex-col gap-5 border-t border-slate-800/80 pt-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using TokenForge's security network, identity management tools, and
              cryptographic token rotation engines, you consent to be legally bound by these terms.
              If you do not accept, you are forbidden from utilizing the platform.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              2. Identity & Token Safety
            </h2>
            <p>
              You remain entirely accountable for sustaining the safety of your sessions and access
              credentials. Any token reuse anomalies resulting in family rotations and session
              revocations are handled automatically by TokenForge's guard infrastructure.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              3. Mocked Services Limitation
            </h2>
            <p>
              Portions of this local application (such as email delivery, photo upload, and external
              oauth bindings) may act as simulation containers or run on local mock structures. You
              accept that these simulations are for test, validation, and demo use only.
            </p>
          </section>
        </div>

        <div className="flex justify-between items-center border-t border-slate-800/80 pt-6 mt-4">
          <Link to="/register">
            <Button variant="secondary" size="sm">
              ← Return to Signup
            </Button>
          </Link>
          <span className="text-xs text-slate-500 font-mono">©TokenForge 2026</span>
        </div>
      </div>
    </div>
  )
}
