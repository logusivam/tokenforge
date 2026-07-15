import { UserRole } from './token.types'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  linkedProviders: string[]
}
