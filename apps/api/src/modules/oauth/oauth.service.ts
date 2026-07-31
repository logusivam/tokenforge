import { createHash, randomBytes } from 'crypto'
import type { Redis } from 'ioredis'
import { GoogleProvider } from './providers/google.provider'
import { GitHubProvider } from './providers/github.provider'
import { UserRepository } from '../users/user.repository'
import { TokenService } from '../token/token.service'
import { RbacService } from '../rbac/rbac.service'
import { env } from '@/config/env'
import { AppError } from '@/shared/errors'
import { IUser } from '../users/user.model'

export class OAuthService {
  constructor(
    private readonly redis: Redis,
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly rbacService: RbacService,
    private readonly googleProvider: GoogleProvider,
    private readonly githubProvider: GitHubProvider
  ) {}

  generateState(): string {
    return randomBytes(16).toString('hex')
  }

  generatePKCE(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = randomBytes(32).toString('base64url')
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
    return { codeVerifier, codeChallenge }
  }

  async saveStateAndVerifier(state: string, verifier?: string): Promise<void> {
    const key = `oauth:state:${state}`
    if (verifier) {
      await this.redis.set(key, verifier, 'EX', 600) // 10 min TTL
    } else {
      await this.redis.set(key, '1', 'EX', 600)
    }
  }

  async getVerifierAndValidateState(state: string, keepState = false): Promise<string | null> {
    const key = `oauth:state:${state}`
    const verifier = await this.redis.get(key)
    if (!verifier) {
      throw new AppError('Invalid state or state expired', 400)
    }
    if (!keepState) {
      await this.redis.del(key) // One-time use state
    }
    return verifier === '1' ? null : verifier
  }

  getGoogleAuthUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  getGitHubAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: env.GITHUB_CALLBACK_URL,
      state,
      scope: 'user:email',
    })
    return `https://github.com/login/oauth/authorize?${params.toString()}`
  }

  async handleGoogleCallback(
    code: string,
    codeVerifier: string,
    existingUserId?: string
  ): Promise<{
    user: IUser
    accessToken: string
    refreshToken: string
  }> {
    let providerToken: string
    let profile: Awaited<ReturnType<typeof this.googleProvider.getUserProfile>>
    try {
      const tokens = await this.googleProvider.getTokens(code, codeVerifier)
      providerToken = tokens.accessToken
      profile = await this.googleProvider.getUserProfile(providerToken)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error_description ||
        err?.response?.data?.error ||
        err?.message ||
        'Google token exchange failed'
      throw new AppError(msg, 400)
    }

    let user: IUser

    // If already logged in, link to that user directly
    if (existingUserId) {
      const foundUser = await this.userRepo.findById(existingUserId)
      if (!foundUser) throw new AppError('Authenticated user not found', 404)
      foundUser.googleId = profile.id
      if (profile.picture && !foundUser.avatar) foundUser.avatar = profile.picture
      await foundUser.save()
      user = foundUser
    } else {
      const foundUser = await this.userRepo.findByEmail(profile.email)
      if (!foundUser) {
        const createData: Partial<IUser> = {
          email: profile.email,
          name: profile.name,
          googleId: profile.id,
          roles: ['user'],
          isActive: true,
          emailVerified: profile.email_verified,
        }
        if (profile.picture) createData.avatar = profile.picture
        user = await this.userRepo.create(createData)
      } else {
        foundUser.googleId = profile.id
        if (profile.picture) foundUser.avatar = profile.picture
        await foundUser.save()
        user = foundUser
      }
    }

    const primaryRole = user.roles[0] || 'user'
    const permissions = await this.rbacService.getPermissionsForRole(primaryRole)

    const accessToken = this.tokenService.generateAccessToken({
      userId: user._id.toString(),
      role: primaryRole,
      permissions,
    })
    const { refreshToken } = await this.tokenService.generateRefreshToken(user._id.toString())

    return { user, accessToken, refreshToken }
  }

  async handleGitHubCallback(
    code: string,
    existingUserId?: string
  ): Promise<{
    user: IUser
    accessToken: string
    refreshToken: string
  }> {
    let providerToken: string
    let profile: Awaited<ReturnType<typeof this.githubProvider.getUserProfile>>
    try {
      const tokens = await this.githubProvider.getTokens(code)
      providerToken = tokens.accessToken
      profile = await this.githubProvider.getUserProfile(providerToken)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error_description ||
        err?.response?.data?.error ||
        err?.message ||
        'GitHub token exchange failed'
      throw new AppError(msg, 400)
    }

    if (!profile.email) {
      throw new AppError(
        'Email address not provided by GitHub. Please make your GitHub email public.',
        400
      )
    }

    let user: IUser

    // If already logged in, link to that user directly
    if (existingUserId) {
      const foundUser = await this.userRepo.findById(existingUserId)
      if (!foundUser) throw new AppError('Authenticated user not found', 404)
      foundUser.githubId = profile.id.toString()
      if (profile.avatar_url && !foundUser.avatar) foundUser.avatar = profile.avatar_url
      await foundUser.save()
      user = foundUser
    } else {
      const foundUser = await this.userRepo.findByEmail(profile.email)
      if (!foundUser) {
        const createData: Partial<IUser> = {
          email: profile.email,
          name: profile.name || 'GitHub User',
          githubId: profile.id.toString(),
          roles: ['user'],
          isActive: true,
          emailVerified: true,
        }
        if (profile.avatar_url) createData.avatar = profile.avatar_url
        user = await this.userRepo.create(createData)
      } else {
        foundUser.githubId = profile.id.toString()
        if (profile.avatar_url) foundUser.avatar = profile.avatar_url
        await foundUser.save()
        user = foundUser
      }
    }

    const primaryRole = user.roles[0] || 'user'
    const permissions = await this.rbacService.getPermissionsForRole(primaryRole)

    const accessToken = this.tokenService.generateAccessToken({
      userId: user._id.toString(),
      role: primaryRole,
      permissions,
    })
    const { refreshToken } = await this.tokenService.generateRefreshToken(user._id.toString())

    return { user, accessToken, refreshToken }
  }
}
