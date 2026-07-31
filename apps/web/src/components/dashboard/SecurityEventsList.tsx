import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin.service'
import { usePermission } from '../../hooks/usePermission'
import { Badge } from '../ui/Badge'
import { timeAgo } from '../../utils/time.utils'
import { Spinner } from '../ui/Spinner'

export function SecurityEventsList() {
  const { hasPermission } = usePermission()
  const canReadAudit = hasPermission('audit:read')

  const { data, isLoading } = useQuery({
    queryKey: ['securityEvents'],
    queryFn: () => adminService.getAuditLogs(1, 5),
    enabled: canReadAudit,
  })

  if (!canReadAudit) {
    return (
      <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md">
        <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider mb-2">
          Live Security Audit Logs
        </h3>
        <p className="text-xs text-slate-400 italic">
          Insufficient permissions to view system-wide logs. Admin or Moderator privileges are
          required.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800 rounded-xl p-6 backdrop-blur-md flex flex-col gap-4">
      <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">
        Live Security Audit Logs
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="w-6 h-6" />
        </div>
      ) : data?.logs && data.logs.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.logs.map((log: any, idx: number) => (
            <div
              key={idx}
              className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-2 last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-slate-200">{log.event}</span>
                <span className="text-[10px] text-slate-400">IP: {log.ip}</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-slate-500">{timeAgo(log.createdAt)}</span>
                <Badge
                  variant={
                    log.event.includes('FAIL') || log.event.includes('ATTACK')
                      ? 'danger'
                      : 'success'
                  }
                >
                  {log.event.includes('LOGIN') ? 'Auth' : 'System'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-500 italic">No security events found.</span>
      )}
    </div>
  )
}
