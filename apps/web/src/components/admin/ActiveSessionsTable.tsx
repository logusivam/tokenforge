import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin.service'
import { Spinner } from '../ui/Spinner'

export function ActiveSessionsTable() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
  })

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
        System-wide Active Sessions
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="w-6 h-6" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Active Sessions (Redis)
              </span>
              <span className="text-2xl font-extrabold text-indigo-400">
                {stats?.activeSessions || 0}
              </span>
            </div>
            <div className="bg-[#0b0f19] border border-slate-800 p-4 rounded-lg flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Registered Users (MongoDB)
              </span>
              <span className="text-2xl font-extrabold text-emerald-400">
                {stats?.totalUsers || 0}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Active sessions represent current valid user refresh token chains stored inside the
            Redis database. Revoking a user's sessions immediately invalidates their refresh token
            chain and prevents silent token rotations, forcing them to re-authenticate on next
            request.
          </p>
        </div>
      )}
    </div>
  )
}
