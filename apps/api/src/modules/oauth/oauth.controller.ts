import { Request, Response, NextFunction } from 'express'
import { OAuthService } from './oauth.service'
import { success } from '@/shared/response'
import { COOKIE_OPTIONS, AuditEvent } from '@/shared/constants'
import { AuditService } from '../audit/audit.service'
import { AppError } from '@/shared/errors'
import { env } from '@/config/env'

export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly auditService: AuditService
  ) {}

  googleInit = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const state = this.oauthService.generateState()
      const { codeVerifier, codeChallenge } = this.oauthService.generatePKCE()

      await this.oauthService.saveStateAndVerifier(state, codeVerifier)
      const url = this.oauthService.getGoogleAuthUrl(state, codeChallenge)

      success(res, { url })
    } catch (err) {
      next(err)
    }
  }

  githubInit = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const state = this.oauthService.generateState()

      await this.oauthService.saveStateAndVerifier(state)
      const url = this.oauthService.getGitHubAuthUrl(state)

      success(res, { url })
    } catch (err) {
      next(err)
    }
  }

  googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.query
      if (typeof code !== 'string' || typeof state !== 'string') {
        throw new AppError('Query parameters code and state are required', 400)
      }

      const codeVerifier = await this.oauthService.getVerifierAndValidateState(state, true)
      if (!codeVerifier) {
        throw new AppError('PKCE verification code missing from state cache', 400)
      }

      const {
        user,
        accessToken: _accessToken,
        refreshToken,
      } = await this.oauthService.handleGoogleCallback(code, codeVerifier)

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.OAUTH_LOGIN,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { provider: 'google' },
      })

      // Redirect to frontend callback route with code and state parameters
      const frontendRedirectUrl = `${env.CLIENT_URL}/oauth/callback/google?code=${code}&state=${state}`
      res.redirect(frontendRedirectUrl)
    } catch (err) {
      next(err)
    }
  }

  githubCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.query
      if (typeof code !== 'string' || typeof state !== 'string') {
        throw new AppError('Query parameters code and state are required', 400)
      }

      await this.oauthService.getVerifierAndValidateState(state, true)

      const {
        user,
        accessToken: _accessToken,
        refreshToken,
      } = await this.oauthService.handleGitHubCallback(code)

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.OAUTH_LOGIN,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { provider: 'github' },
      })

      // Redirect to frontend callback route with code and state parameters
      const frontendRedirectUrl = `${env.CLIENT_URL}/oauth/callback/github?code=${code}&state=${state}`
      res.redirect(frontendRedirectUrl)
    } catch (err) {
      next(err)
    }
  }

  googleExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.body
      if (typeof code !== 'string' || typeof state !== 'string') {
        throw new AppError('Body parameters code and state are required', 400)
      }

      const codeVerifier = await this.oauthService.getVerifierAndValidateState(state)
      if (!codeVerifier) {
        throw new AppError('PKCE verification code missing from state cache', 400)
      }

      const { user, accessToken, refreshToken } = await this.oauthService.handleGoogleCallback(
        code,
        codeVerifier
      )

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.OAUTH_LOGIN,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { provider: 'google' },
      })

      success(res, { accessToken, user })
    } catch (err) {
      next(err)
    }
  }

  githubExchange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, state } = req.body
      if (typeof code !== 'string' || typeof state !== 'string') {
        throw new AppError('Body parameters code and state are required', 400)
      }

      await this.oauthService.getVerifierAndValidateState(state)

      const { user, accessToken, refreshToken } = await this.oauthService.handleGitHubCallback(code)

      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

      await this.auditService.log({
        userId: user._id.toString(),
        event: AuditEvent.OAUTH_LOGIN,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestId: req.headers['x-request-id'] as string,
        metadata: { provider: 'github' },
      })

      success(res, { accessToken, user })
    } catch (err) {
      next(err)
    }
  }
}
