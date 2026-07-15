import React from 'react'
import { SessionCard } from '../components/dashboard/SessionCard'
import { RolePermissionsCard } from '../components/dashboard/RolePermissionsCard'
import { SecurityEventsList } from '../components/dashboard/SecurityEventsList'
import { TokenInspector } from '../components/dashboard/TokenInspector'

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-100 uppercase tracking-wider">
          Security Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Inspect your current active session state, JWT claims, and security logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SessionCard />
          <RolePermissionsCard />
          <SecurityEventsList />
        </div>

        <div className="lg:col-span-2">
          <TokenInspector />
        </div>
      </div>
    </div>
  )
}
