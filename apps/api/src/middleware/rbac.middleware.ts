import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, AuthError } from '@/shared/errors'
import type { PermissionString } from '@tokenforge/types'

/**
 * Factory middleware — usage: router.get('/users', requireAuth, requirePermission('users:read'))
 *
 * Checks JWT claims.permissions array (populated at token generation time).
 * Admin role bypasses all permission checks.
 * Scope 'own' vs 'all' enforced at service layer — not here.
 */
export const requirePermission = (permission: PermissionString) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthError('User not authenticated'))
      return
    }

    const { role, permissions } = req.user

    // Admin bypasses all permission checks — has implicit wildcard
    if (role === 'admin') {
      next()
      return
    }

    // Check exact permission match in claims array
    if (!permissions.includes(permission)) {
      next(new ForbiddenError(
        `Permission denied: '${permission}' required, role '${role}' insufficient`
      ))
      return
    }

    next()
  }

/**
 * Convenience: require one of multiple permissions (OR logic)
 * Usage: requireAnyPermission(['users:read', 'audit:read'])
 */
export const requireAnyPermission = (perms: PermissionString[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthError('User not authenticated'))
      return
    }

    const { role, permissions } = req.user

    if (role === 'admin' || perms.some(p => permissions.includes(p))) {
      next()
      return
    }

    next(new ForbiddenError('Insufficient permissions'))
  }