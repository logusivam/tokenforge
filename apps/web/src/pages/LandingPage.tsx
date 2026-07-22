import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'
import { config } from '../config'

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

  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 h-16 border-b border-[#2A2A3D] bg-[#0A0A0F]/80 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo Image */}
          <img src="/navbar-logo-full@2x.svg" alt="TokenForge Logo" className="h-8 w-auto" />
        </div>

        <div className="flex gap-2 sm:gap-3 flex-nowrap flex-shrink-0">
          {isAuthenticated ? (
            <Link to="/dashboard" className="flex-shrink-0">
              <Button variant="primary" className="text-xs whitespace-nowrap">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="flex-shrink-0">
                <Button variant="ghost" className="text-xs whitespace-nowrap px-2.5 sm:px-4">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="flex-shrink-0">
                <Button variant="primary" className="text-xs whitespace-nowrap px-2.5 sm:px-4">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          🔥 Forged. Not imported.
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-3xl">
          Build Auth From Scratch. <br />
          <span className="text-[#06B6D4]">JWT Refresh Token Rotation.</span>
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Custom authentication without Auth0. An open-source, developer-first boilerplate with
          RS256 asymmetric signing, OAuth2 Google/GitHub, and custom RBAC — forged from scratch.
        </p>

        <div className="flex gap-4 mt-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" className="px-6 py-3 text-sm">
                Explore Dashboard →
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button variant="primary" className="px-6 py-3 text-sm">
                Get Started Free
              </Button>
            </Link>
          )}
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
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-6 text-center md:text-left">
            How it works in 5 steps:
          </span>
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-4 justify-between items-stretch">
            {/* Dotted connector line visible only on mobile */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-indigo-500/20 md:hidden pointer-events-none" />

            {[
              { num: '1', title: 'Register', desc: 'hash pwd (bcrypt 12)' },
              { num: '2', title: 'Login', desc: 'RS256 JWT signed' },
              { num: '3', title: 'Token Issued', desc: '15min expiry' },
              { num: '4', title: 'Refresh', desc: 'rotates silently, 7d' },
              { num: '5', title: 'RBAC', desc: 'enforced per route' },
            ].map((s, idx) => (
              <div
                key={idx}
                className="relative flex-1 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-1 pl-0 md:pl-4 first:pl-0 md:first:border-l-0"
              >
                {/* Visual Step Indicator badge for mobile vertical layout (overlapping the dashed connector) */}
                <div className="z-10 flex items-center justify-center w-8 h-8 rounded-full bg-[#12121A] border-2 border-indigo-500 text-indigo-400 text-xs font-bold md:hidden flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
                  {s.num}
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-indigo-400 hidden md:inline">
                    Step {s.num}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{s.title}</span>
                  <span className="text-xs text-slate-500">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1. Features Grid Section */}
      <section className="py-20 px-6 bg-[#0A0A0F] max-w-6xl mx-auto w-full border-t border-[#2A2A3D]/40">
        <div className="text-center md:text-left mb-12 flex flex-col gap-2">
          <span className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-[#F1F5F9] tracking-tight">
            Every security primitive. From first principles.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'JWT Token Engine',
              desc: 'Signed with RS256 asymmetric keys. API holds the private key, client services verify with distributable public keys.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              ),
            },
            {
              title: 'Refresh Rotation',
              desc: 'Issues fresh sliding-window rotation tokens on every refresh action. Auto-detects reuse events to drop session lineages.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              ),
            },
            {
              title: 'OAuth2 PKCE',
              desc: 'Google & GitHub integrations with code challenges, state parameter verification, and CSRF lock validation.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.956 11.956 0 0 1 12 2.714Z"
                  />
                </svg>
              ),
            },
            {
              title: 'RBAC Engine',
              desc: 'Role mappings with resource-scoped grants. Decoded claims are parsed directly without per-request DB queries.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.018 12.018 0 0 1 12 21c-1.07 0-2.097-.14-3.07-.403v-.109c0-1.112.284-2.16.786-3.07M11.25 18a4.5 4.5 0 0 0-8.25-2.285 4.5 4.5 0 0 0 6.643 4.27M12 15.75A4.5 4.5 0 0 0 16.5 12 4.5 4.5 0 0 0 12 7.5 4.5 4.5 0 0 0 7.5 12 4.5 4.5 0 0 0 12 15.75Z"
                  />
                </svg>
              ),
            },
            {
              title: 'Rate Limiting',
              desc: 'Protects sensitive paths via Redis rate limit store, persisting client IP request thresholds across container upgrades.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              ),
            },
            {
              title: 'Audit Logging',
              desc: 'Documents authentication anomalies and events. Automatically purges old logs using Mongoose TTL indices.',
              icon: (
                <svg
                  className="w-5 h-5 stroke-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              ),
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#12121A] border border-[#2A2A3D] rounded-xl p-6 flex flex-col gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-[#F1F5F9]">{item.title}</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed flex-grow">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. OAuth Showcase Section */}
      <section className="bg-[#12121A] border-y border-[#2A2A3D] py-16 px-6 w-full">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          <div className="text-center md:text-left flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
              Social Auth
            </span>
            <h2 className="text-3xl font-black text-[#F1F5F9] tracking-tight">
              Login with any provider. Data stays yours.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                provider: 'Google OAuth Flow',
                steps: [
                  'Redirect client securely to accounts.google.com with code challenge.',
                  'User authenticates & consents to profile/identity share scopes.',
                  'Callback handles verifier check to swap OAuth code for Google user details.',
                  'Database resolves identity records, issuing secure httpOnly session cookies.',
                ],
              },
              {
                provider: 'GitHub OAuth Flow',
                steps: [
                  'Redirect client to github.com/login/oauth/authorize verification endpoint.',
                  'User authorizes request and consent parameters on login.',
                  'Exchange authorization code securely for GitHub access credentials.',
                  'Compute matching user schemas, returning JWT payload directly to storage.',
                ],
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-[#0A0A0F] border border-[#2A2A3D] rounded-xl p-6 flex flex-col gap-4"
              >
                <h3 className="text-base font-bold text-indigo-400">{p.provider}</h3>
                <div className="flex flex-col gap-3">
                  {p.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex gap-3 items-start">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                        {sIdx + 1}
                      </div>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Security Section with Code Snippet */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
                Architecture Primitives
              </span>
              <h2 className="text-3xl font-black text-[#F1F5F9] tracking-tight">
                Cryptographic primitives, implemented correctly.
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {[
                'Asymmetric signature verification (RS256 algorithm)',
                'Transparent silent refresh mechanism (Axios Interceptors)',
                'Strict cookie settings (SameSite=Strict, Secure, HttpOnly)',
                'Full token reuse family tracking (compromise auto-invalidation)',
                'Persistent Redis-backed rate limiting thresholds',
                'MongoDB auto-expiring audit logs (TTL Indexes)',
              ].map((spec, idx) => (
                <div key={idx} className="flex gap-2 items-center text-sm text-[#94A3B8]">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monospace Code snippet card */}
          <div className="bg-[#12121A] border border-[#2A2A3D] rounded-xl p-5 font-mono text-[13px] leading-relaxed shadow-2xl overflow-x-auto">
            <div className="flex items-center gap-1.5 border-b border-[#2A2A3D] pb-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              <span className="text-[10px] text-slate-500 ml-2 font-mono">token.service.ts</span>
            </div>
            <pre className="text-slate-400">
              <span className="text-purple-400">async</span>{' '}
              <span className="text-blue-400">generateTokenPair</span>
              {'('}
              payload: <span className="text-[#06B6D4] font-semibold">JwtPayload</span>
              {'): '}
              <span className="text-[#06B6D4] font-semibold">Promise</span>&lt;{'{'}
              accessToken: <span className="text-amber-400">string</span>; refreshToken:{' '}
              <span className="text-amber-400">string</span>;{'}'}&gt; {'{'}
              <span className="text-purple-400">const</span> jti ={' '}
              <span className="text-blue-400">uuid</span>();
              <span className="text-purple-400">const</span> accessToken ={' '}
              <span className="text-blue-400">jwt.sign</span>( payload, privateKey,
              {'{'} algorithm: <span className="text-[#10B981]">'RS256'</span>, jti {'}'}
              );
              <span className="text-purple-400">const</span> refreshToken ={' '}
              <span className="text-purple-400">this</span>.
              <span className="text-blue-400">saveToRedis</span>( payload.userId, jti );
              <span className="text-purple-400">return</span> {'{'} accessToken, refreshToken {'}'};
              {'}'}
            </pre>
          </div>
        </div>
      </section>

      {/* 4. Architecture Preview Section */}
      <section className="bg-[#12121A] border-t border-[#2A2A3D] py-20 px-6 w-full">
        <div className="max-w-6xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase">
              System Topology
            </span>
            <h2 className="text-3xl font-black text-[#F1F5F9] tracking-tight">
              Modular Monorepo Topology
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
              Stateless API tier scaling alongside memory-mapped cache boundaries.
            </p>
          </div>

          {/* Simple Visual Architecture Diagram */}
          <div className="bg-[#0A0A0F] border border-[#2A2A3D] rounded-xl p-8 flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden">
            <div className="z-10 flex flex-col items-center gap-2 p-4 bg-[#12121A] border border-[#2A2A3D] rounded-xl w-40 text-center shadow-lg">
              <span className="text-2xl">📱</span>
              <span className="text-xs font-bold text-indigo-400">Web App Client</span>
              <span className="text-[10px] text-slate-500 font-mono">React / Zustand</span>
            </div>

            <div className="text-indigo-500 text-xl font-bold animate-pulse rotate-90 md:rotate-0">
              ⇆
            </div>

            <div className="z-10 flex flex-col items-center gap-2 p-4 bg-[#12121A] border border-indigo-500/50 rounded-xl w-40 text-center shadow-lg shadow-indigo-500/5">
              <span className="text-2xl">⚙️</span>
              <span className="text-xs font-bold text-[#F1F5F9]">Stateless API</span>
              <span className="text-[10px] text-slate-500 font-mono">Node / Express</span>
            </div>

            <div className="text-indigo-500 text-xl font-bold animate-pulse rotate-90 md:rotate-0">
              ⇆
            </div>

            <div className="flex flex-col gap-3">
              <div className="z-10 flex flex-col items-center gap-2 p-3 bg-[#12121A] border border-[#2A2A3D] rounded-xl w-40 text-center shadow-lg">
                <span className="text-xl">🗄️</span>
                <span className="text-xs font-bold text-emerald-400">Database tier</span>
                <span className="text-[10px] text-slate-500 font-mono">MongoDB Atlas</span>
              </div>
              <div className="z-10 flex flex-col items-center gap-2 p-3 bg-[#12121A] border border-[#2A2A3D] rounded-xl w-40 text-center shadow-lg">
                <span className="text-xl">⚡</span>
                <span className="text-xs font-bold text-amber-400">Cache / Session</span>
                <span className="text-[10px] text-slate-500 font-mono">Redis cache</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Footer Strip */}
      <section className="bg-indigo-600 py-16 px-6 w-full text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to see how auth really works?
          </h2>
          <p className="text-sm text-indigo-100 leading-relaxed max-w-lg">
            Dive into the dashboard console to inspect decoded token claims, trigger rotation, or
            audit security events.
          </p>
          <Link to={isAuthenticated ? '/dashboard' : '/login'}>
            <Button
              variant="secondary"
              className="px-8 py-3 text-sm font-bold bg-[#F1F5F9] text-indigo-600 border border-slate-200 hover:bg-white hover:text-indigo-700 shadow-md transition-colors"
            >
              Explore the Dashboard
            </Button>
          </Link>
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
            <div className="flex flex-col gap-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start">
                {/* Footer Logo Image */}
                <img src="/footer.svg" alt="TokenForge Logo" className="h-10 w-auto" />
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
      const response = await window.fetch(`${config.API_URL}/support/contact`, {
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
