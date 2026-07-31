import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '../../services/admin.service'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function AuditLogTable() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['adminAuditLogs', page],
    queryFn: () => adminService.getAuditLogs(page, 20),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0f172a]/40 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-900/50">
              <th className="p-4">Event</th>
              <th className="p-4">User ID</th>
              <th className="p-4">IP</th>
              <th className="p-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {data?.logs && data.logs.length > 0 ? (
              data.logs.map((log: any, index: number) => (
                <tr key={index} className="hover:bg-slate-800/20">
                  <td className="p-4 font-semibold text-slate-200">
                    <Badge
                      variant={
                        log.event.includes('FAIL') || log.event.includes('ATTACK')
                          ? 'danger'
                          : 'success'
                      }
                    >
                      {log.event}
                    </Badge>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-400">{log.userId || 'Guest'}</td>
                  <td className="p-4 text-slate-400">{log.ip}</td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                  No logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Total: {data?.total || 0} events</span>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => p - 1)
            }}
            className="px-3 py-1"
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            disabled={!data?.logs || data.logs.length < 20}
            onClick={() => {
              setPage((p) => p + 1)
            }}
            className="px-3 py-1"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
