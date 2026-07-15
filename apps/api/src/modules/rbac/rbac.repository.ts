import { RoleModel, IRole } from './role.model'
import { UserRole, PermissionString } from '@tokenforge/types'

export class RbacRepository {
  async findRoleByName(name: UserRole): Promise<IRole | null> {
    return RoleModel.findOne({ name })
  }

  async findPermissionsForRole(roleName: UserRole): Promise<PermissionString[]> {
    const role = await RoleModel.findOne({ name: roleName })
    return role ? role.permissions : []
  }

  async createRole(role: Partial<IRole>): Promise<IRole> {
    return RoleModel.create(role)
  }

  async updateRolePermissions(
    name: UserRole,
    permissions: PermissionString[]
  ): Promise<IRole | null> {
    return RoleModel.findOneAndUpdate({ name }, { permissions }, { new: true })
  }
}
