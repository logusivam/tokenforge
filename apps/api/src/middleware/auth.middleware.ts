import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { getKeys } from '@/config/keys'
import { AuthError } from '@/shared/errors'
import { REDIS_KEYS } from '@/shared/constants'
import type { JwtPayload } from '@tokenforge/types'

// Extend Express Request to carry decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header only (not query string, not body)
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthError('Authorization header missing or malformed')
    }

    const token = authHeader.slice(7)
    const { publicKey } = getKeys()

    // Verify signature + expiry (jsonwebtoken throws on failure)
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],   // Explicitly whitelist — prevents alg:none attack
    }) as JwtPayload

    // Check jti blacklist in Redis (covers logout + force-revoke scenarios)
    const redis = req.app.get('redis')
    const blacklisted = await redis.get(REDIS_KEYS.atBlacklist(payload.jti))
    if (blacklisted) {
      throw new AuthError('Token has been revoked')
    }

    req.user = payload
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AuthError('Access token expired'))
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AuthError('Invalid token'))
    } else {
      next(err)
    }
  }
}