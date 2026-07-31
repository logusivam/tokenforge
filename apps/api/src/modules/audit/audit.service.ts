import { AuditRepository } from './audit.repository'
import { IAuditLog } from './audit.model'
import { AuditEvent } from '@/shared/constants'

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(logData: {
    userId?: string | undefined
    event: AuditEvent
    ip: string
    userAgent: string
    requestId?: string | undefined
    metadata?: Record<string, unknown> | undefined
  }): Promise<IAuditLog> {
    return this.auditRepo.insert(logData)
  }

  async getAuditLogs(page: number, limit: number): Promise<{ logs: IAuditLog[]; total: number }> {
    return this.auditRepo.findPaginated(page, limit)
  }

  async getUserAuditLogs(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    return this.auditRepo.findByUserIdPaginated(userId, page, limit)
  }
}
