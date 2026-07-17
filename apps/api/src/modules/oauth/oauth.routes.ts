import { Router } from 'express'
import { OAuthController } from './oauth.controller'
import { OAuthService } from './oauth.service'
import { GoogleProvider } from './providers/google.provider'
import { GitHubProvider } from './providers/github.provider'
import { redis } from '@/config/redis'
import { tokenService, userRepo, rbacService, auditService } from '../auth/auth.routes'

export const oauthRouter = Router()

const googleProvider = new GoogleProvider()
const githubProvider = new GitHubProvider()
const oauthService = new OAuthService(
  redis,
  userRepo,
  tokenService,
  rbacService,
  googleProvider,
  githubProvider
)
const oauthController = new OAuthController(oauthService, auditService)

oauthRouter.get('/google', oauthController.googleInit)
oauthRouter.get('/google/callback', oauthController.googleCallback)
oauthRouter.post('/google/callback', oauthController.googleExchange)
oauthRouter.get('/github', oauthController.githubInit)
oauthRouter.get('/github/callback', oauthController.githubCallback)
oauthRouter.post('/github/callback', oauthController.githubExchange)
