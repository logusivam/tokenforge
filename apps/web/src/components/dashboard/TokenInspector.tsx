import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { decodeJwt } from '../../utils/jwt.utils'
import { formatExpiry } from '../../utils/time.utils'

export function TokenInspector() {
  const { accessToken } = useAuthStore()
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [totalDuration, setTotalDuration] = useState(900)
  const [copied, setCopied] = useState(false)

  const payload = accessToken ? decodeJwt(accessToken) : null

  useEffect(() => {
    if (!payload || !payload.exp || !payload.iat) return

    const expiryTime = payload.exp * 1000
    setTotalDuration(payload.exp - payload.iat)

    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000))
      setSecondsLeft(diff)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [accessToken, payload])

  const percentage = totalDuration > 0 ? (secondsLeft / totalDuration) * 100 : 0

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
          Live Access Token Inspector
        </h3>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${secondsLeft > 60 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}
        >
          {secondsLeft > 0 ? `Expires in ${formatExpiry(secondsLeft)}` : 'Expired'}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden">
        <div
          style={{ width: `${percentage}%` }}
          className={`h-full transition-all duration-1000 ${secondsLeft > 60 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]'}`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Raw JWT (Memory-Only)
          </span>
          {accessToken && (
            <button
              onClick={() => {
                window.navigator.clipboard.writeText(accessToken)
                setCopied(true)
                setTimeout(() => {
                  setCopied(false)
                }, 2000)
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-wide uppercase"
            >
              {copied ? 'Copied ✓' : 'Copy Token'}
            </button>
          )}
        </div>
        <div className="bg-[#020617] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-indigo-400 break-all select-all max-h-24 overflow-y-auto">
          {accessToken || 'No token active'}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Decoded Payload Claims
        </span>
        <pre className="bg-[#020617] border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
          {payload ? JSON.stringify(payload, null, 2) : 'No payload claims loaded'}
        </pre>
      </div>
    </div>
  )
}
