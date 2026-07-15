import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '../../services/admin.service'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'

export function UsersTable() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => adminService.getUsers(page, 10),
  })

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.changeRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
  })

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => adminService.revokeSession(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
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
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm">
            {data?.users && data.users.length > 0 ? (
              data.users.map((u: any) => (
                <tr key={u._id} className="hover:bg-slate-800/20">
                  <td className="p-4 font-medium text-slate-200">{u.name}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.roles[0] || 'user'}
                      onChange={(e) => {
                        roleMutation.mutate({ userId: u._id, role: e.target.value })
                      }}
                      className="bg-[#0b0f19] border border-slate-800 text-slate-200 text-xs rounded p-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="guest">Guest</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="danger"
                      className="text-xs px-2.5 py-1 ml-auto"
                      onClick={() => {
                        revokeMutation.mutate(u._id)
                      }}
                      isLoading={revokeMutation.isPending && revokeMutation.variables === u._id}
                    >
                      Revoke Sessions
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-400">
        <span>Total: {data?.total || 0} users</span>
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
            disabled={!data?.users || data.users.length < 10}
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
