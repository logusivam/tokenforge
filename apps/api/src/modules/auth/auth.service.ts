import bcrypt from 'bcryptjs'
import { UserRepository } from '../users/user.repository'
import { TokenService } from '../token/token.service'
import { RbacService } from '../rbac/rbac.service'
import { IUser } from '../users/user.model'
import { AppError, AuthError } from '@/shared/errors'

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: TokenService,
    private readonly rbacService: RbacService
  ) {}

  async register(email: string, password: string, name: string): Promise<IUser> {
    const existing = await this.userRepo.findByEmail(email)
    if (existing) {
      throw new AppError('Email already registered', 400)
    }

    const passwordHash = await bcrypt.hash(password, 12)
    return this.userRepo.create({
      email,
      passwordHash,
      name,
      roles: ['user'],
      isActive: true,
      emailVerified: false,
    })
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user: IUser
    accessToken: string
    refreshToken: string
    familyId: string
  }> {
    const user = await this.userRepo.findByEmailWithPassword(email)
    const passwordHash = user?.passwordHash || ''

    // Constant-time check
    const dummyHash = '$2a$12$L.bO/JgJ1i0/kSg7nBGeP.X8X1111111111111111111111111111'
    const isMatch = await bcrypt.compare(password, user ? passwordHash : dummyHash)

    if (!user || !isMatch) {
      throw new AuthError('Invalid credentials')
    }

    if (!user.isActive) {
      throw new AuthError('Account is deactivated')
    }

    const primaryRole = user.roles[0] || 'user'
    const permissions = await this.rbacService.getPermissionsForRole(primaryRole)

    const accessToken = this.tokenService.generateAccessToken({
      userId: user._id.toString(),
      role: primaryRole,
      permissions,
    })

    const { refreshToken, familyId } = await this.tokenService.generateRefreshToken(
      user._id.toString()
    )

    return { user, accessToken, refreshToken, familyId }
  }

  async logout(refreshToken: string, accessTokenJti?: string): Promise<void> {
    if (accessTokenJti) {
      await this.tokenService.blacklistAccessToken(accessTokenJti)
    }
    await this.tokenService.revokeRefreshToken(refreshToken)
  }
}
