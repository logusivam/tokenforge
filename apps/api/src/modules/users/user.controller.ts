import { Request, Response, NextFunction } from 'express'
import { UserService } from './user.service'
import { success } from '@/shared/response'
import { AppError } from '@/shared/errors'
import { AuditService } from '../audit/audit.service'
import { AuditEvent } from '@/shared/constants'

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auditService: AuditService
  ) {}

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401)
      }
      const user = await this.userService.getUserById(req.user.sub)
      success(res, user)
    } catch (err) {
      next(err)
    }
  }

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401)
      }
      const { name, avatar, password } = req.body
      const user = await this.userService.updateProfile(req.user.sub, { name, avatar, password })

      await this.auditService.log({
        userId: req.user.sub,
        event: password ? AuditEvent.PASSWORD_CHANGED : AuditEvent.PROFILE_UPDATED,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
      })

      success(res, user)
    } catch (err) {
      next(err)
    }
  }

  deleteMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401)
      }
      await this.userService.deleteAccount(req.user.sub)

      await this.auditService.log({
        userId: req.user.sub,
        event: AuditEvent.ACCOUNT_DELETED,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
      })

      res.clearCookie('refreshToken')
      success(res, { message: 'Account deleted successfully' })
    } catch (err) {
      next(err)
    }
  }
}
