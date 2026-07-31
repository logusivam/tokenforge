import { useQuery } from '@tanstack/react-query'
import { adminService } from '../services/admin.service'

export function useAuditLog(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['auditLogs', page, limit],
    queryFn: () => adminService.getAuditLogs(page, limit),
  })
}
