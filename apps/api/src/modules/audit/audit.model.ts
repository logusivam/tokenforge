import mongoose, { Schema, Document } from 'mongoose'
import { AuditEvent } from '@/shared/constants'

export interface IAuditLog extends Document {
  userId?: string | undefined
  event: AuditEvent
  ip: string
  userAgent: string
  requestId?: string | undefined
  metadata?: Record<string, unknown> | undefined
  createdAt: Date
}

const AuditSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, index: true },
    event: { type: String, required: true, enum: Object.values(AuditEvent) },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    requestId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable logs — no updatedAt
    versionKey: false,
  }
)

// ── Indexes ────────────────────────────────────────────────────────────
AuditSchema.index({ userId: 1, createdAt: -1 }) // Paginated per-user audit view
AuditSchema.index({ event: 1, createdAt: -1 }) // Filter by event type
AuditSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7_776_000 } // TTL: 90 days — auto-purge old logs
)

export const AuditModel = mongoose.model<IAuditLog>('AuditLog', AuditSchema)
