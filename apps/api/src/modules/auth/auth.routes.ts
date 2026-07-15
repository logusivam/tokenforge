import { Router } from 'express'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { TokenService } from '../token/token.service'
import { UserRepository } from '../users/user.repository'
import { RbacService } from '../rbac/rbac.service'
import { RbacRepository } from '../rbac/rbac.repository'
import { AuditService } from '../audit/audit.service'
import { AuditRepository } from '../audit/audit.repository'
import { redis } from '@/config/redis'
import { validate } from '@/middleware/validate.middleware'
import { loginSchema, registerSchema } from './auth.schema'
import { requireAuth } from '@/middleware/auth.middleware'

export const authRouter = Router()

// DI Setup
const userRepo = new UserRepository()
const rbacRepo = new RbacRepository()
const rbacService = new RbacService(rbacRepo)

const fetchClaims = async (userId: string) => {
  const user = await userRepo.findById(userId)
  if (!user) throw new Error('User not found')
  const primaryRole = user.roles[0] || 'user'
  const permissions = await rbacService.getPermissionsForRole(primaryRole)
  return { role: primaryRole, permissions }
}

const tokenService = new TokenService(redis, fetchClaims)
const authService = new AuthService(userRepo, tokenService, rbacService)
const auditRepo = new AuditRepository()
const auditService = new AuditService(auditRepo)
const authController = new AuthController(authService, tokenService, auditService)

authRouter.post('/register', validate(registerSchema), authController.register)
authRouter.post('/login', validate(loginSchema), authController.login)
authRouter.post('/logout', requireAuth, authController.logout)
authRouter.post('/refresh', authController.refresh)
export { tokenService, userRepo, rbacService, auditService }
