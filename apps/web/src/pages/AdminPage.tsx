import React, { useState } from 'react'
import { UsersTable } from '../components/admin/UsersTable'
import { ActiveSessionsTable } from '../components/admin/ActiveSessionsTable'
import { AuditLogTable } from '../components/admin/AuditLogTable'
import { RoleManager } from '../components/admin/RoleManager'
import { usePermission } from '../hooks/usePermission'

export function AdminPage() {
  const { hasPermission } = usePermission()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'audit' | 'sessions'>(
    'overview'
  )

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', visible: true },
    { id: 'users', label: 'Users Manager', visible: hasPermission('users:read') },
    { id: 'roles', label: 'Roles & Permissions', visible: hasPermission('roles:read') },
    { id: 'audit', label: 'Audit Logs', visible: hasPermission('audit:read') },
    { id: 'sessions', label: 'Active Sessions', visible: hasPermission('roles:read') }, // Gated to roles:read or equivalent admin-only permission
  ] as const

  const visibleMenuItems = menuItems.filter((item) => item.visible)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-wider">Admin Panel</h1>
        <p className="text-sm text-slate-400">
          Mutate user roles, inspect audit logs, and revoke system-wide Redis session keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 bg-[#12121A] border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
          {visibleMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tab content wrapper */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <ActiveSessionsTable />
              </div>
              <div className="md:col-span-2 bg-[#12121A] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                  System Overview
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TokenForge is operating normally. All security enforcement policies, PKCE
                  configurations, and rate-limiting modules are active. Cryptographic signatures are
                  signing via standard RS256 algorithms.
                </p>
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-lg flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400">
                    Configuration Details
                  </span>
                  <span className="text-xs text-slate-350">
                    JWT Lifetime: <strong className="text-slate-200">15 Minutes</strong>
                  </span>
                  <span className="text-xs text-slate-350">
                    Refresh Token Sliding Expiry: <strong className="text-slate-200">7 Days</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && hasPermission('users:read') && (
            <div className="bg-[#12121A] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                System Users
              </h3>
              <UsersTable />
            </div>
          )}

          {activeTab === 'roles' && hasPermission('roles:read') && (
            <div className="bg-[#12121A] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                RBAC Role Matrix
              </h3>
              <RoleManager />
            </div>
          )}

          {activeTab === 'audit' && hasPermission('audit:read') && (
            <div className="bg-[#12121A] border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider text-rose-450">
                Security Audit Logs
              </h3>
              <AuditLogTable />
            </div>
          )}

          {activeTab === 'sessions' && hasPermission('roles:read') && (
            <div className="grid grid-cols-1 gap-6">
              <ActiveSessionsTable />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
