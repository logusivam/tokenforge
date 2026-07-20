import { Router } from 'express'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { userRepo, auditService } from '../auth/auth.routes'
import { requireAuth } from '@/middleware/auth.middleware'
import { requirePermission } from '@/middleware/rbac.middleware'
import { validate } from '@/middleware/validate.middleware'
import Joi from 'joi'

export const usersRouter = Router()

const userService = new UserService(userRepo)
const userController = new UserController(userService, auditService)

const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().trim(),
  avatar: Joi.string().uri().optional().allow(''),
  password: Joi.string().min(8).optional(),
  oldPassword: Joi.string().optional(),
})

usersRouter.use(requireAuth)

usersRouter.get('/me', requirePermission('profile:read:own'), userController.getMe)
usersRouter.patch(
  '/me',
  requirePermission('profile:write:own'),
  validate(updateMeSchema),
  userController.updateMe
)
usersRouter.delete('/me', requirePermission('profile:delete:own'), userController.deleteMe)
