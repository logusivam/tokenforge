import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { decodeJwt } from '../../utils/jwt.utils'
import { Badge } from '../ui/Badge'

export function RolePermissionsCard() {
  const { accessToken, user } = useAuthStore()
  const payload = accessToken ? decodeJwt(accessToken) : null

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
        Role & Permissions
      </h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Assigned Role:</span>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded uppercase">
            {user?.role}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs text-slate-400">Granted Security Permissions:</span>
          {payload?.permissions && payload.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {payload.permissions.map((perm) => (
                <Badge key={perm} variant="info">
                  {perm}
                </Badge>
              ))}
            </div>
          ) : user?.role === 'admin' ? (
            <div className="text-xs text-slate-300 font-semibold italic bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded">
              ⚡ Admin bypass enabled (wildcard access to all resources)
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {['profile:read:own', 'profile:write:own'].map((perm) => (
                <Badge key={perm} variant="info">
                  {perm}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
