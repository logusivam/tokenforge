import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth, accessToken: existingToken, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'linked' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // Guard: prevent the exchange from firing twice under React 18 StrictMode
  // (StrictMode mounts → unmounts → remounts in dev, causing useEffect to run twice)
  const exchangedRef = useRef(false)

  useEffect(() => {
    // One-shot: if we already fired the exchange, do nothing on the second run
    if (exchangedRef.current) return
    exchangedRef.current = true

    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Find provider from pathname or state mapping if needed, we'll hit the universal callback
    const pathSegments = window.location.pathname.split('/')
    // We handle either /oauth/callback/google or similar, or check state/params
    const provider =
      pathSegments[pathSegments.length - 1] === 'callback'
        ? 'google'
        : pathSegments[pathSegments.length - 1]

    if (error) {
      setStatus('error')
      setErrorMsg(searchParams.get('error_description') || 'OAuth authorization failed.')
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMsg('Authorization code missing from callback parameters.')
      return
    }

    const exchangeCode = async () => {
      try {
        // Snapshot auth state BEFORE the async call (stale closure safety)
        const wasAlreadyLoggedIn = isAuthenticated && !!existingToken

        // If user is already authenticated, pass their token so the backend links the account
        const headers: Record<string, string> = {}
        if (wasAlreadyLoggedIn) {
          headers['Authorization'] = `Bearer ${existingToken}`
        }
        const response = await api.post(`/oauth/${provider}/callback`, { code, state }, { headers })
        const { accessToken, user } = response.data.data
        setAuth(user, accessToken)
        setStatus(wasAlreadyLoggedIn ? 'linked' : 'success')
        setTimeout(() => {
          // If this was an account linking (user was already logged in), go back to profile
          navigate(wasAlreadyLoggedIn ? '/profile' : '/')
        }, 1500)
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.response?.data?.message || 'Authentication code exchange failed.')
      }
    }

    exchangeCode()
  }, [searchParams, navigate, setAuth])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0F] p-4 text-center relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md w-full bg-[#12121A] border border-[#2A2A3D] rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-12 h-12 text-indigo-500" />
            <h2 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wider">
              Completing Authentication
            </h2>
            <p className="text-sm text-[#94A3B8]">Exchanging code for cryptographic tokens...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              ✓
            </div>
            <h2 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wider">
              Authentication Successful
            </h2>
            <p className="text-sm text-emerald-400 font-medium">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'linked' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              🔗
            </div>
            <h2 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wider">
              Account Linked
            </h2>
            <p className="text-sm text-indigo-400 font-medium">
              Provider connected. Returning to profile...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              ✕
            </div>
            <h2 className="text-xl font-bold text-[#F1F5F9] uppercase tracking-wider">
              Authentication Failed
            </h2>
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-mono text-left w-full overflow-x-auto">
              {errorMsg}
            </div>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
