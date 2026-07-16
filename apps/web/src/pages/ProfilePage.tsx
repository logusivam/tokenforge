import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { userService } from '../services/user.service'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Toast } from '../components/ui/Toast'

export function ProfilePage() {
  const { user, setAuth, accessToken, clearAuth } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [loading, setLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const handleUpdateProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setLoading(true)
    setToastMsg('')
    try {
      const updatedUser = await userService.updateProfile({ name })
      if (accessToken) {
        setAuth(updatedUser, accessToken)
      }
      setToastType('success')
      setToastMsg('Profile successfully updated.')
    } catch (err: any) {
      setToastType('error')
      setToastMsg(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'CRITICAL WARNING: This will permanently delete your identity, credentials, and all active sessions. This action is irreversible. Proceed?'
      )
    ) {
      return
    }
    try {
      await userService.deleteAccount()
      clearAuth()
      window.location.href = '/login'
    } catch (err: any) {
      setToastType('error')
      setToastMsg(err.response?.data?.message || 'Failed to delete account.')
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => {
            setToastMsg('')
          }}
        />
      )}

      <div className="flex flex-col gap-1 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-400">Modify your cryptographic user identity metadata.</p>
      </div>

      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-xl font-bold text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-200">{user?.name}</h3>
            <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
              ID: {user?.id}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          <Input
            label="Email Address (Permanent)"
            type="email"
            value={user?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed bg-slate-900/60"
          />

          <Input
            label="Full Display Name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
            }}
            required
            placeholder="Your name"
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button type="submit" isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-bold text-rose-400 uppercase tracking-wider">
            Danger Zone
          </h3>
          <p className="text-xs text-slate-400">
            Once you delete your account, there is no going back. Please be absolutely certain.
          </p>
        </div>

        <div className="flex justify-start">
          <Button variant="danger" className="text-xs" onClick={handleDeleteAccount}>
            Delete Cryptographic Identity
          </Button>
        </div>
      </div>
    </div>
  )
}
