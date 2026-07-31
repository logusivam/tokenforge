import { Request, Response, NextFunction } from 'express'
import { AdminService } from './admin.service'
import { AuditService } from '../audit/audit.service'
import { success } from '@/shared/response'
import { UserRole } from '@tokenforge/types'
import { AppError } from '@/shared/errors'
import { UserModel } from '../users/user.model'
import { AuditEvent } from '@/shared/constants'

export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly auditService: AuditService
  ) {}

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const data = await this.adminService.getUsers(page, limit)
      success(res, data)
    } catch (err) {
      next(err)
    }
  }

  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string
      const { role } = req.body
      if (!role) {
        throw new AppError('Role parameter is required', 400)
      }

      const user = await this.adminService.changeUserRole(id, role as UserRole)

      await this.auditService.log({
        userId: req.user?.sub,
        event: AuditEvent.ROLE_CHANGED,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { targetUserId: id, newRole: role },
      })

      success(res, user)
    } catch (err) {
      next(err)
    }
  }

  revokeSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string
      await this.adminService.revokeUserSessions(id)

      await this.auditService.log({
        userId: req.user?.sub,
        event: AuditEvent.SESSION_REVOKED,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { targetUserId: id },
      })

      success(res, { message: 'Sessions revoked successfully' })
    } catch (err) {
      next(err)
    }
  }

  getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalUsers = await UserModel.countDocuments()
      const activeSessions = await this.adminService.getActiveSessionsCount()
      const oauthUsers = await UserModel.countDocuments({
        $or: [
          { googleId: { $exists: true, $ne: null } },
          { githubId: { $exists: true, $ne: null } },
        ],
      })
      const adminUsers = await UserModel.countDocuments({ roles: 'admin' })
      success(res, { totalUsers, activeSessions, oauthUsers, adminUsers })
    } catch (err) {
      next(err)
    }
  }

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const data = await this.auditService.getAuditLogs(page, limit)
      success(res, data)
    } catch (err) {
      next(err)
    }
  }
}
