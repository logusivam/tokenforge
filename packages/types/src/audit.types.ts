export interface AuditLog {
  userId?: string
  event: string
  ip: string
  userAgent: string
  requestId?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}
