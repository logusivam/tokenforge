import { PermissionString, UserRole } from './token.types'

export interface Role {
  name: UserRole
  permissions: PermissionString[]
}

export interface Permission {
  resource: string
  action: string
  scope?: string
}
