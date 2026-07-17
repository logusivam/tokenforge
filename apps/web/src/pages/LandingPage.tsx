import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState<'privacy' | 'terms' | 'contact' | null>(null)
  const [contactSuccess, setContactSuccess] = useState('')
  const [contactError, setContactError] = useState('')

  const faqs = [
    {
      q: 'Why not just use Auth0 or Clerk?',
      a: 'Third-party auth services abstract away everything — token lifecycle, rotation logic, RBAC mapping. TokenForge gives you full auditability: every line that issues, rotates, or revokes a token is code you own and can inspect.',
    },
    {
      q: 'Is this production-ready?',
      a: 'The security primitives are production-grade (RS256, PKCE, httpOnly cookies, token family tracking, jti blacklisting). For high-scale production, add a reverse proxy (Nginx), horizontal Redis replication, and MongoDB read replicas.',
    },
    {
      q: 'What is refresh token rotation and why does it matter?',
      a: 'Rotation issues a new refresh token on every use and invalidates the old one. If an attacker steals a refresh token, the first legitimate refresh after the theft triggers reuse detection — the entire token family is revoked and the user must re-authenticate.',
    },
    {
      q: 'How does the RBAC system work?',
      a: 'Each user has a role (admin / moderator / user / guest). Each role maps to a permission set (e.g. users:read, profile:write:own). Permissions are encoded as claims in the JWT and enforced by middleware on every protected route — no DB hit per request.',
    },
    {
      q: 'What is PKCE and why is it used here?',
      a: 'PKCE (Proof Key for Code Exchange, RFC 7636) prevents OAuth2 authorization code interception. On callback, the original verifier is sent in the token exchange — only the original initiator can complete the flow.',
    },
    {
      q: 'Why RS256 instead of HS256 for JWT signing?',
      a: 'HS256 uses a shared secret — every service that verifies tokens must know the secret, creating multiple compromise points. RS256 uses an asymmetric key pair: only the API holds the private key; any downstream service verifies with the distributable public key.',
    },
    {
      q: 'Where is the access token stored on the frontend?',
      a: 'In JavaScript memory (Zustand store) — never in localStorage or sessionStorage, which are vulnerable to XSS. The refresh token is stored in an httpOnly; Secure; SameSite=Strict cookie scoped to Path=/api/v1/auth.',
    },
    {
      q: 'What happens when the access token expires?',
      a: 'The Axios response interceptor catches the 401, silently calls POST /api/v1/auth/refresh, receives a new access token, stores it in memory, and retries the original request — fully transparent to the user.',
    },
    {
      q: 'How are OAuth and email accounts linked?',
      a: 'If a Google or GitHub login returns an email that already exists in the database, the provider ID (googleId or githubId) is merged onto the existing user document. The user can then log in with any method.',
    },
    {
      q: 'What does the audit log capture?',
      a: 'Every auth event: LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT, LOGOUT_ALL, TOKEN_REFRESH, REFRESH_REUSE_ATTACK, OAUTH_LOGIN, etc. Logs auto-purge after 90 days via MongoDB TTL index.',
    },
    {
      q: 'How does logout work — does it really invalidate the access token?',
      a: "Yes. The refresh token is deleted from Redis, and the access token's jti claim is written to a Redis blacklist key with TTL matching the remaining AT lifetime. Subsequent requests with that AT are blocked.",
    },
    {
      q: 'What happens if someone intercepts my refresh token cookie?',
      a: "The token family tracking system detects the attack. When the legitimate user next refreshes their session, their current RT won't match the family's expected token. This mismatch triggers a full family revocation.",
    },
    {
      q: 'How does the rate limiter survive API restarts?',
      a: 'Rate limit counters are stored in Redis via rate-limit-redis — not in API memory. Counters persist across restarts and scale horizontally across multiple API instances.',
    },
    {
      q: 'Can I add more OAuth providers (e.g. Facebook, LinkedIn)?',
      a: 'Yes. Each OAuth provider lives in the apps/api modules/oauth/providers. Register the new callback route in oauth.routes.ts. The state/PKCE infrastructure is provider-agnostic.',
    },
    {
      q: 'What is the difference between Logout and Logout All Devices?',
      a: "Logout deletes the current session's refresh token and blacklists the current access token. Logout All Devices uses a Redis SCAN loop to find and delete every refresh token belonging to the user.",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-16 border-b border-[#2A2A3D] bg-[#0A0A0F]/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] text-sm">
              TF
            </span>
          </div>
          <span className="font-bold tracking-wider text-sm">TOKENFORGE</span>
        </div>

        <div className="flex gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" className="text-xs">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          🔥 Forged. Not imported.
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl">
          Forge Your Auth. <br />
          <span className="text-[#06B6D4]">Own Every Token.</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          JWT + Refresh Token Rotation + OAuth2 Google/GitHub + RBAC — forged from scratch. Zero
          Auth0. Zero Clerk. Zero trust in black boxes.
        </p>

        <div className="flex gap-4 mt-2">
          <Link to="/register">
            <Button variant="primary" className="px-6 py-3 text-sm">
              Get Started Free
            </Button>
          </Link>
          <a
            href="https://github.com/logusivam/tokenforge"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" className="px-6 py-3 text-sm">
              View on GitHub
            </Button>
          </a>
        </div>

        <p className="text-xs text-slate-500 uppercase tracking-widest mt-4">
          RS256 · httpOnly cookies · Token family tracking
        </p>
      </section>

      {/* Problem Flow Section */}
      <section className="py-16 px-6 bg-[#0A0A0F] max-w-6xl mx-auto w-full border-t border-[#2A2A3D]">
        <div className="flex flex-col gap-2 mb-10 text-center md:text-left">
          <span className="text-xs font-bold tracking-widest text-[#6366F1] uppercase">
            The Problem We Solve
          </span>
          <h2 className="text-3xl font-black text-slate-100 max-w-xl">
            Stop trusting black boxes with your users' identities.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-12">
          {/* Card 1 */}
          <div className="bg-[#12121A] border border-rose-500/40 rounded-xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-200">The Black Box Problem</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              Auth0, Clerk, Firebase Auth — all abstract the token layer. You sign up, paste an SDK
              key, and trust someone else's security model. At 10k users, you get hit with a massive
              monthly bill.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold uppercase">
                Vendor Lock-in
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold uppercase">
                $700/mo Bill
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#12121A] border border-amber-500/40 rounded-xl p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl font-bold">
              🛡️
            </div>
            <h3 className="text-lg font-bold text-slate-200">What You Can't See</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              You can't audit how tokens are signed. You can't see rotation logic. Your RBAC is
              locked to their dashboard schema. When their service has downtime — your users can't
              log in.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold uppercase">
                No Token Audits
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold uppercase">
                Rigid RBAC
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#12121A] border border-emerald-500/60 rounded-xl p-6 shadow-[0_0_24px_rgba(16,185,129,0.05)] flex flex-col gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold">
              ⚒️
            </div>
            <h3 className="text-lg font-bold text-slate-200">TokenForge — Own Every Token</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">
              RS256 JWT + Refresh Rotation + OAuth2 PKCE + RBAC. Every line is yours. Every token is
              yours. Every decision is yours. Free to deploy. Free to audit. Free forever.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
                Zero Cost
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
                Full Auditability
              </span>
            </div>
          </div>
        </div>

        {/* 5-step implementation strip */}
        <div className="bg-[#12121A] border border-[#2A2A3D] rounded-xl p-6">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-4">
            How it works in 5 steps:
          </span>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:divide-x md:divide-[#2A2A3D]">
            {[
              { num: '1', title: 'Register', desc: 'hash pwd (bcrypt 12)' },
              { num: '2', title: 'Login', desc: 'RS256 JWT signed' },
              { num: '3', title: 'Token Issued', desc: '15min expiry' },
              { num: '4', title: 'Refresh', desc: 'rotates silently, 7d' },
              { num: '5', title: 'RBAC', desc: 'enforced per route' },
            ].map((s, idx) => (
              <div key={idx} className="flex flex-col gap-1 px-4 first:pl-0">
                <span className="text-xs font-bold text-indigo-400">Step {s.num}</span>
                <span className="text-sm font-semibold text-slate-200">{s.title}</span>
                <span className="text-xs text-slate-500">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-[#0A0A0F] max-w-4xl mx-auto w-full border-t border-[#2A2A3D]">
        <h2 className="text-3xl font-black text-center mb-10 text-slate-100">
          Frequently Answered Questions
        </h2>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-[#2A2A3D] rounded-xl bg-[#12121A] overflow-hidden"
            >
              <button
                type="button"
                className="w-full text-left p-5 font-semibold text-sm md:text-base flex justify-between items-center transition hover:bg-slate-800/20 text-slate-200"
                onClick={() => {
                  setActiveFaq(activeFaq === idx ? null : idx)
                }}
              >
                <span>{faq.q}</span>
                <span className="text-indigo-400">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 border-t border-[#2A2A3D] text-sm text-slate-400 leading-relaxed bg-[#0A0A0F]/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Global Footer */}
      <footer className="bg-[#0A0A0F] border-t border-[#2A2A3D] py-8 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          {/* Main Footer Row */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-widest">
                  TokenForge
                </span>
              </div>
              <p className="text-[13px] text-[#94A3B8]">Built by Loganathan G P</p>
              <p className="text-[12px] text-[#475569]">Logusivam Vision</p>

              {/* Popover triggers */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen('privacy')
                  }}
                  className="text-[12px] text-[#475569] hover:text-[#94A3B8] hover:underline transition-colors animate-none"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen('terms')
                  }}
                  className="text-[12px] text-[#475569] hover:text-[#94A3B8] hover:underline transition-colors animate-none"
                >
                  Terms of Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen('contact')
                  }}
                  className="text-[12px] text-[#475569] hover:text-[#94A3B8] hover:underline transition-colors animate-none"
                >
                  Contact
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/loganathan26"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                LinkedIn
              </a>
              <a
                href="https://github.com/logusivam"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Bottom Copyright Text - centered */}
          <div className="w-full border-t border-[#2A2A3D]/40 pt-4 text-center">
            <p className="text-xs text-slate-500">©TokenForge 2026. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Popover Modals */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#12121A] border border-[#2A2A3D] rounded-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-3">
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-wider">
                {modalOpen === 'privacy' && 'Privacy Policy'}
                {modalOpen === 'terms' && 'Terms of Service'}
                {modalOpen === 'contact' && 'Contact Support'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(null)
                  setContactSuccess('')
                  setContactError('')
                }}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Privacy Policy Content */}
            {modalOpen === 'privacy' && (
              <div className="text-sm text-slate-400 flex flex-col gap-3 leading-relaxed">
                <p>
                  At TokenForge, we respect your cryptographic identity privacy. We only process
                  session data, authorization parameters, and audit logging metrics explicitly
                  generated to safeguard account actions.
                </p>
                <p>
                  We store authentication credentials securely using cryptographic hashing standards
                  (bcrypt) and asymmetrical encryption signatures (RS256). We never sell your
                  personal information.
                </p>
              </div>
            )}

            {/* Terms Content */}
            {modalOpen === 'terms' && (
              <div className="text-sm text-slate-400 flex flex-col gap-3 leading-relaxed">
                <p>
                  By accessing TokenForge, you agree to protect the security of your private keys
                  and credentials. Unauthorized exploitation, credential sharing, or token
                  manipulation is strictly prohibited.
                </p>
                <p>
                  All software is provided "as is", without warranty of any kind, express or
                  implied.
                </p>
              </div>
            )}

            {/* Contact Form Content */}
            {modalOpen === 'contact' && (
              <ContactForm
                onClose={() => {
                  setModalOpen(null)
                }}
                successMsg={contactSuccess}
                setSuccessMsg={setContactSuccess}
                errorMsg={contactError}
                setErrorMsg={setContactError}
              />
            )}

            {/* Close Button for non-contact modals */}
            {modalOpen !== 'contact' && (
              <div className="flex justify-end mt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setModalOpen(null)
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ContactFormProps {
  onClose: () => void
  successMsg: string
  setSuccessMsg: (msg: string) => void
  errorMsg: string
  setErrorMsg: (msg: string) => void
}

function ContactForm({
  onClose,
  successMsg,
  setSuccessMsg,
  errorMsg,
  setErrorMsg,
}: ContactFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (name.trim().length < 2 || name.trim().length > 100) {
      setErrorMsg('Name must be between 2 and 100 characters.')
      return
    }
    if (message.trim().length < 10 || message.trim().length > 1000) {
      setErrorMsg('Message must be between 10 and 1000 characters.')
      return
    }

    setSubmitting(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      // POST to backend contact form API
      const response = await window.fetch('http://localhost:5000/api/v1/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Support enquiry submission failed')
      }

      setSuccessMsg('Your support enquiry was sent successfully.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit contact enquiry. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 w-full">
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Name (2-100 characters)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
          }}
          required
          maxLength={100}
          className="w-full px-4 py-2 bg-[#0b0f19]/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition duration-200"
          placeholder="Enter display name"
        />
        <span className="text-[10px] text-slate-500 text-right">{name.length}/100</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
          }}
          required
          className="w-full px-4 py-2 bg-[#0b0f19]/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition duration-200"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Message (10-1000 characters)
        </label>
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
          }}
          required
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-2 bg-[#0b0f19]/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition duration-200 resize-none"
          placeholder="Type your support message..."
        />
        <span className="text-[10px] text-slate-500 text-right">{message.length}/1000</span>
      </div>

      <div className="flex gap-2 justify-end border-t border-[#2A2A3D] pt-4 mt-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting} disabled={submitting}>
          Submit Enquiry
        </Button>
      </div>
    </form>
  )
}
