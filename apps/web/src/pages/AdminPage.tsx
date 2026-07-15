import React from 'react'
import { UsersTable } from '../components/admin/UsersTable'
import { ActiveSessionsTable } from '../components/admin/ActiveSessionsTable'
import { AuditLogTable } from '../components/admin/AuditLogTable'

export function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">
          Admin Controls
        </h1>
        <p className="text-sm text-slate-400">
          Mutate user roles, inspect audit logs, and revoke system-wide Redis session keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              System Users
            </h3>
            <UsersTable />
          </div>
          <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider text-rose-400">
              Security Audit Logs
            </h3>
            <AuditLogTable />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <ActiveSessionsTable />
        </div>
      </div>
    </div>
  )
}
