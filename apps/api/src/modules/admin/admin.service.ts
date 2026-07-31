import { UserRepository } from '../users/user.repository'
import type { Redis } from 'ioredis'
import { IUser } from '../users/user.model'
import { AppError } from '@/shared/errors'
import { UserRole } from '@tokenforge/types'
import { REDIS_KEYS } from '@/shared/constants'

export class AdminService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redis: Redis
  ) {}

  async getUsers(page: number, limit: number): Promise<{ users: IUser[]; total: number }> {
    return this.userRepo.findAllPaginated(page, limit)
  }

  async changeUserRole(userId: string, role: UserRole): Promise<IUser> {
    const user = await this.userRepo.update(userId, { roles: [role] })
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  async getActiveSessionsCount(): Promise<number> {
    let cursor = '0'
    let count = 0
    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', 'refresh:*', 'COUNT', 100)
      cursor = nextCursor
      count += keys.length
    } while (cursor !== '0')
    return count
  }

  async revokeUserSessions(userId: string): Promise<void> {
    let cursor = '0'
    const pipeline = this.redis.pipeline()
    const keysToDelete: string[] = []
    const familiesToDelete: string[] = []

    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', 'refresh:*', 'COUNT', 100)
      cursor = nextCursor

      for (const key of keys) {
        const raw = await this.redis.get(key)
        if (!raw) continue
        const meta = JSON.parse(raw)
        if (meta.userId === userId) {
          keysToDelete.push(key)
          familiesToDelete.push(REDIS_KEYS.tokenFamily(meta.familyId))
        }
      }
    } while (cursor !== '0')

    if (keysToDelete.length > 0) {
      keysToDelete.forEach((k) => pipeline.del(k))
      familiesToDelete.forEach((f) => pipeline.del(f))
      await pipeline.exec()
    }
  }
}
