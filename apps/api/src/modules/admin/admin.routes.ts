import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { redis } from '@/config/redis'
import { userRepo, auditService } from '../auth/auth.routes'
import { requireAuth } from '@/middleware/auth.middleware'
import { requirePermission, requireAnyPermission } from '@/middleware/rbac.middleware'

export const adminRouter = Router()

const adminService = new AdminService(userRepo, redis)
const adminController = new AdminController(adminService, auditService)
const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

adminRouter.use(requireAuth)
adminRouter.use(adminRateLimiter)

adminRouter.get(
  '/users',
  requireAnyPermission(['users:read', 'audit:read']),
  adminController.getUsers
)
adminRouter.get('/audit', requirePermission('audit:read'), adminController.getAuditLogs)
adminRouter.get(
  '/stats',
  requireAnyPermission(['users:read', 'audit:read']),
  adminController.getStats
)

adminRouter.patch('/users/:id/role', requirePermission('users:write'), adminController.changeRole)
adminRouter.delete(
  '/users/:id/sessions',
  requirePermission('sessions:delete'),
  adminController.revokeSessions
)
