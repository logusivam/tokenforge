import { RoleModel } from './role.model'
import { UserRole, PermissionString } from '@tokenforge/types'
import { logger } from '@/shared/logger'

const DEFAULT_ROLES: Array<{ name: UserRole; permissions: PermissionString[] }> = [
  {
    name: 'admin',
    permissions: [], // Admins bypass all checks implicitly
  },
  {
    name: 'moderator',
    permissions: ['users:read', 'audit:read'],
  },
  {
    name: 'user',
    permissions: ['profile:read:own', 'profile:write:own', 'profile:delete:own'],
  },
  {
    name: 'guest',
    permissions: ['profile:read:own'],
  },
]

export async function seedRbac(): Promise<void> {
  logger.info('Starting RBAC seeding...')

  for (const roleDef of DEFAULT_ROLES) {
    await RoleModel.updateOne(
      { name: roleDef.name },
      { $set: { permissions: roleDef.permissions } },
      { upsert: true }
    )
    logger.debug(`Seeded role: ${roleDef.name}`)
  }

  logger.info('RBAC seeding completed successfully.')
}
export { DEFAULT_ROLES }
