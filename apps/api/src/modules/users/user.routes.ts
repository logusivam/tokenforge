import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { userRepo, auditService } from '../auth/auth.routes'
import { requireAuth } from '@/middleware/auth.middleware'
import { requirePermission } from '@/middleware/rbac.middleware'
import { validate } from '@/middleware/validate.middleware'
import Joi from 'joi'

export const usersRouter = Router()

const usersRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const userService = new UserService(userRepo)
const userController = new UserController(userService, auditService)

const updateMeSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().trim(),
  // Allow regular URLs and base64 data URIs (for avatar uploads)
  avatar: Joi.string()
    .optional()
    .allow('')
    .custom((value, helpers) => {
      if (!value) return value
      const isDataUri = /^data:image\/(png|jpeg|jpg|webp);base64,/.test(value)
      const isUrl = /^https?:\/\/.+/.test(value)
      if (!isDataUri && !isUrl) {
        return helpers.error('any.invalid')
      }
      return value
    }, 'avatar URL or data URI'),
  password: Joi.string().min(8).optional(),
  oldPassword: Joi.string().optional(),
})

usersRouter.use(usersRateLimiter)
usersRouter.use(requireAuth)

usersRouter.get('/me', requirePermission('profile:read:own'), userController.getMe)
usersRouter.patch(
  '/me',
  requirePermission('profile:write:own'),
  validate(updateMeSchema),
  userController.updateMe
)
usersRouter.delete('/me', requirePermission('profile:delete:own'), userController.deleteMe)
usersRouter.delete(
  '/me/providers/:provider',
  requirePermission('profile:write:own'),
  userController.unlinkProvider
)
