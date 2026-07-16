import React, { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface RoleData {
  name: string
  color: string
  bg: string
  permissions: string[]
}

export function RoleManager() {
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null)

  const roles: RoleData[] = [
    {
      name: 'admin',
      color: 'text-[#E0E7FF]',
      bg: 'bg-[#3730A3]',
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'audit:read',
        'sessions:read',
        'sessions:write',
        'profile:read:own',
        'profile:write:own',
      ],
    },
    {
      name: 'moderator',
      color: 'text-[#D1FAE5]',
      bg: 'bg-[#065F46]',
      permissions: [
        'users:read',
        'audit:read',
        'sessions:read',
        'profile:read:own',
        'profile:write:own',
      ],
    },
    {
      name: 'user',
      color: 'text-[#BAE6FD]',
      bg: 'bg-[#1E3A5F]',
      permissions: ['profile:read:own', 'profile:write:own'],
    },
    {
      name: 'guest',
      color: 'text-[#E7E5E4]',
      bg: 'bg-[#292524]',
      permissions: ['profile:read:own'],
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div
            key={r.name}
            className="bg-[#0f172a]/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between items-start gap-4 hover:border-slate-700 transition"
          >
            <div className="flex flex-col gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${r.bg} ${r.color}`}
              >
                {r.name}
              </span>
              <p className="text-xs text-slate-400">
                Authorized with {r.permissions.length} security permissions.
              </p>
            </div>

            <Button
              variant="secondary"
              className="text-xs py-1 px-3"
              onClick={() => {
                setSelectedRole(r)
              }}
            >
              View Permissions
            </Button>
          </div>
        ))}
      </div>

      {selectedRole && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedRole(null)
          }}
          title={`Permissions Matrix: ${selectedRole.name}`}
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-400">
              The following cryptographic permission claims are attached to user sessions holding
              this role:
            </p>

            <div className="flex flex-wrap gap-2 py-2 max-h-60 overflow-y-auto">
              {selectedRole.permissions.map((perm) => (
                <Badge
                  key={perm}
                  className="font-mono text-xs bg-slate-900 border border-slate-800 text-slate-300"
                >
                  {perm}
                </Badge>
              ))}
            </div>

            <div className="flex justify-end mt-2">
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  setSelectedRole(null)
                }}
              >
                Close Matrix
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
