import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { redis } from '@/config/redis'
import { RATE_LIMIT } from '@/shared/constants'

// Login rate limiter — 5 attempts per 15 min per IP
// Uses Redis store — survives API restarts and scales horizontally
export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.LOGIN_WINDOW_MS,
  max: RATE_LIMIT.LOGIN_MAX,
  standardHeaders: 'draft-7',     // Sends RateLimit-* headers (RFC 9110 draft)
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:login:',
  }),
  keyGenerator: (req) =>
    req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown',
})

// Register rate limiter — 3 accounts per hour per IP (prevents spam account creation)
export const registerRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.REGISTER_WINDOW_MS,
  max: RATE_LIMIT.REGISTER_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Too many registration attempts. Please try again in 1 hour.',
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:register:',
  }),
  keyGenerator: (req) =>
    req.ip ?? req.headers['x-forwarded-for']?.toString() ?? 'unknown',
})

// General API rate limiter — 100 req/min per IP for all other routes
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT.API_GENERAL_WINDOW_MS,
  max: RATE_LIMIT.API_GENERAL_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
    prefix: 'rl:general:',
  }),
})