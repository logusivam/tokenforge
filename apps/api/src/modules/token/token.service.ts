import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'
import type { Redis } from 'ioredis'
import { getKeys } from '@/config/keys'
import { REDIS_KEYS, TOKEN_CONFIG } from '@/shared/constants'
import { AuthError } from '@/shared/errors'
import type { JwtPayload, RefreshTokenMeta, UserRole, PermissionString } from '@tokenforge/types'

interface GenerateATOptions {
  userId: string
  role: UserRole
  permissions: PermissionString[]
}

export class TokenService {
  constructor(private readonly redis: Redis) {}

  // ── Access Token ───────────────────────────────────────────────────

  generateAccessToken(opts: GenerateATOptions): string {
    const { privateKey } = getKeys()
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: opts.userId,
      jti: randomUUID(),             // Unique per token — enables blacklisting
      role: opts.role,
      permissions: opts.permissions,
    }
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: TOKEN_CONFIG.ACCESS_EXPIRY_SECONDS,
    })
  }

  verifyAccessToken(token: string): JwtPayload {
    const { publicKey } = getKeys()
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],         // Explicit whitelist — never allow 'none'
    }) as JwtPayload
  }

  // ── Refresh Token ──────────────────────────────────────────────────

  async generateRefreshToken(userId: string, familyId?: string): Promise<{
    refreshToken: string
    familyId: string
  }> {
    const token = randomUUID()
    const fId = familyId ?? randomUUID()   // New family on fresh login

    const meta: RefreshTokenMeta = { userId, familyId: fId }

    // Atomic pipeline — set token + family reference in one round-trip
    await this.redis.pipeline()
      .set(REDIS_KEYS.refreshToken(token), JSON.stringify(meta), 'EX', TOKEN_CONFIG.REFRESH_EXPIRY_SECONDS)
      .set(REDIS_KEYS.tokenFamily(fId), token, 'EX', TOKEN_CONFIG.REFRESH_EXPIRY_SECONDS)
      .exec()

    return { refreshToken: token, familyId: fId }
  }

  async rotateRefreshToken(incomingToken: string): Promise<{
    newAccessToken: string
    newRefreshToken: string
    userId: string
    role: UserRole
    permissions: PermissionString[]
  }> {
    // Step 1: Fetch token metadata
    const raw = await this.redis.get(REDIS_KEYS.refreshToken(incomingToken))
    if (!raw) throw new AuthError('Refresh token invalid or expired')

    const meta: RefreshTokenMeta = JSON.parse(raw) as RefreshTokenMeta
    const { userId, familyId } = meta

    // Step 2: Check token family — detect reuse
    const currentFamilyToken = await this.redis.get(REDIS_KEYS.tokenFamily(familyId))
    if (currentFamilyToken !== incomingToken) {
      // REUSE ATTACK — revoke entire family atomically via SCAN + pipeline
      await this.revokeFamilyTokens(familyId)
      throw new AuthError('Token reuse detected. All sessions terminated.')
    }

    // Step 3: Fetch user role + permissions for new AT
    // (injected via dependency — shown as placeholder here)
    const { role, permissions } = await this.fetchUserClaims(userId)

    // Step 4: Issue new tokens + blacklist old AT jti (caller provides jti)
    const newAT = this.generateAccessToken({ userId, role, permissions })
    const { refreshToken: newRT } = await this.generateRefreshToken(userId, familyId)

    // Step 5: Delete old refresh token atomically
    await this.redis.del(REDIS_KEYS.refreshToken(incomingToken))

    return { newAccessToken: newAT, newRefreshToken: newRT, userId, role, permissions }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const raw = await this.redis.get(REDIS_KEYS.refreshToken(token))
    if (!raw) return  // Already expired or never existed — idempotent

    const { familyId }: RefreshTokenMeta = JSON.parse(raw) as RefreshTokenMeta

    await this.redis.pipeline()
      .del(REDIS_KEYS.refreshToken(token))
      .del(REDIS_KEYS.tokenFamily(familyId))
      .exec()
  }

  async blacklistAccessToken(jti: string): Promise<void> {
    // TTL matches AT expiry — key auto-expires when AT would have anyway
    await this.redis.set(
      REDIS_KEYS.atBlacklist(jti),
      '1',
      'EX',
      TOKEN_CONFIG.AT_BLACKLIST_EXPIRY_SECONDS
    )
  }

  // ── Private helpers ────────────────────────────────────────────────

  private async revokeFamilyTokens(familyId: string): Promise<void> {
    // Non-blocking SCAN — never use KEYS in production (blocks Redis event loop)
    let cursor = '0'
    const pipeline = this.redis.pipeline()

    do {
      const [next, keys] = await this.redis.scan(
        cursor, 'MATCH', `refresh:*`, 'COUNT', 100
      )
      cursor = next

      // Filter to this family by fetching meta (only way without secondary index)
      for (const key of keys) {
        const raw = await this.redis.get(key)
        if (!raw) continue
        const m: RefreshTokenMeta = JSON.parse(raw) as RefreshTokenMeta
        if (m.familyId === familyId) {
          pipeline.del(key)
        }
      }
    } while (cursor !== '0')

    pipeline.del(REDIS_KEYS.tokenFamily(familyId))
    await pipeline.exec()
  }

  // Placeholder — in real implementation injected from UserService
  private async fetchUserClaims(_userId: string): Promise<{
    role: UserRole
    permissions: PermissionString[]
  }> {
    throw new Error('fetchUserClaims must be injected via constructor')
  }
}