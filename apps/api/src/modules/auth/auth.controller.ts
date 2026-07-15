import { Request, Response, NextFunction } from 'express'
import { AuthService } from './auth.service'
import { TokenService } from '../token/token.service'
import { success } from '@/shared/response'
import { COOKIE_OPTIONS, AuditEvent } from '@/shared/constants'
import { AuthError } from '@/shared/errors'
import { AuditService } from '../audit/audit.service'

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name } = req.body
      const user = await this.authService.register(email, password, name)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.REGISTER,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
      })

      success(res, user, 201)
    } catch (err) {
      next(err)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body
      const { user, accessToken, refreshToken } = await this.authService.login(email, password)

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.LOGIN_SUCCESS,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
      })

      success(res, { accessToken, user })
    } catch (err) {
      next(err)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken
      const accessTokenJti = req.user?.jti

      if (refreshToken) {
        await this.authService.logout(refreshToken, accessTokenJti)
      }

      res.clearCookie('refreshToken', COOKIE_OPTIONS)

      if (req.user) {
        await this.auditService.log({
          userId: req.user.sub,
          event: AuditEvent.LOGOUT,
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          requestId: req.headers['x-request-id'] as string,
        })
      }

      success(res, { message: 'Logged out successfully' })
    } catch (err) {
      next(err)
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incomingToken = req.cookies.refreshToken
      if (!incomingToken) {
        throw new AuthError('Refresh token missing')
      }

      const { newAccessToken, newRefreshToken, userId } =
        await this.tokenService.rotateRefreshToken(incomingToken)

      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId,
        event: AuditEvent.TOKEN_REFRESH,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
      })

      success(res, { accessToken: newAccessToken })
    } catch (err) {
      res.clearCookie('refreshToken', COOKIE_OPTIONS)
      next(err)
    }
  }
}
