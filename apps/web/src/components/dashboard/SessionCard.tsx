import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/auth.service'
import { Link } from 'react-router-dom'
import { decodeJwt } from '../../utils/jwt.utils'

export function SessionCard() {
  const { user, accessToken, setAuth } = useAuthStore()
  const { logout, checkSession } = useAuth()
  const [revokingAll, setRevokingAll] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)

  const payload = accessToken ? decodeJwt(accessToken) : null

  const handleLogoutAll = async () => {
    if (
      !window.confirm('Are you sure you want to terminate all active sessions across all devices?')
    ) {
      return
    }
    setRevokingAll(true)
    try {
      await authService.logoutAll()
      logout()
    } catch (err) {
      console.error('Failed to revoke all sessions:', err)
    } finally {
      setRevokingAll(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await checkSession()
    } catch (err) {
      console.error('Manual refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleCopy = () => {
    if (accessToken) {
      window.navigator.clipboard.writeText(accessToken)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  // Safe parsing of provider
  const loginProvider = payload?.provider || 'email'

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="bg-indigo-650/10 border border-indigo-500/20 rounded-xl p-5 backdrop-blur-md flex flex-col gap-1.5">
        <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
          Welcome Back
        </span>
        <h2 className="text-xl font-black text-slate-100">Hello, {user?.name || 'User'}</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Logged in via:</span>
          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-semibold uppercase">
            {loginProvider}
          </span>
        </div>
      </div>

      {/* Active Session details */}
      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
          Active Session Details
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center font-bold text-indigo-400 text-lg uppercase overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.slice(0, 2) || 'US'
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-slate-800/60 pt-4 text-xs text-slate-400">
          <div className="flex justify-between items-center">
            <span>Primary Role:</span>
            <span className="font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded uppercase">
              {user?.role}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Linked Accounts:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['email', 'google', 'github'].map((provider) => {
                const isLinked =
                  provider === 'email' ? true : user?.linkedProviders?.includes(provider)
                return (
                  <span
                    key={provider}
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${isLinked ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' : 'bg-slate-900 border border-slate-850 text-slate-500'}`}
                  >
                    {provider} {isLinked ? '✅' : ''}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-800/40 pt-2.5">
            <span>Refresh Token ID:</span>
            <span className="font-mono text-slate-300">rt_uuid_Opaque...</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Token Family ID:</span>
            <span className="font-mono text-slate-300">
              {payload?.jti?.slice(0, 8) || 'family_id'}...
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-800/60 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={handleRefresh}
              isLoading={refreshing}
            >
              Refresh Token Now
            </Button>
            <Link to="/profile" className="w-full">
              <Button variant="secondary" size="sm" className="text-xs w-full justify-center">
                View Profile
              </Button>
            </Link>
          </div>
          <Button variant="danger" onClick={logout} className="w-full text-xs">
            Logout Current Device
          </Button>
          <Button
            variant="danger"
            onClick={handleLogoutAll}
            isLoading={revokingAll}
            className="w-full text-xs bg-rose-950/20 border border-rose-900/50 hover:bg-rose-900/40"
          >
            Logout All Devices
          </Button>
        </div>
      </div>
    </div>
  )
}
