import { RbacRepository } from './rbac.repository'
import { UserRole, PermissionString } from '@tokenforge/types'

export class RbacService {
  constructor(private readonly rbacRepo: RbacRepository) {}

  async getPermissionsForRole(role: UserRole): Promise<PermissionString[]> {
    return this.rbacRepo.findPermissionsForRole(role)
  }

  async hasPermission(role: UserRole, permission: PermissionString): Promise<boolean> {
    if (role === 'admin') return true
    const perms = await this.getPermissionsForRole(role)
    return perms.includes(permission)
  }
}
