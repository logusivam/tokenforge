import { AuditModel, IAuditLog } from './audit.model'

export class AuditRepository {
  async insert(log: Partial<IAuditLog>): Promise<IAuditLog> {
    return AuditModel.create(log)
  }

  async findPaginated(page: number, limit: number): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit
    const [logs, total] = await Promise.all([
      AuditModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditModel.countDocuments(),
    ])
    return { logs, total }
  }

  async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ logs: IAuditLog[]; total: number }> {
    const skip = (page - 1) * limit
    const [logs, total] = await Promise.all([
      AuditModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditModel.countDocuments({ userId }),
    ])
    return { logs, total }
  }
}
