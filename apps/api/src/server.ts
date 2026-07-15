import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import mongoose from 'mongoose'
import Redis from 'ioredis'
import * as Sentry from '@sentry/node'

import { env } from '@/config/env'
import { connectDB } from '@/config/db'
import { connectRedis } from '@/config/redis'
import { logger } from '@/shared/logger'
import { errorHandler } from '@/middleware/errorHandler.middleware'
import { requestIdMiddleware } from '@/middleware/requestId.middleware'
import { loginRateLimiter } from '@/middleware/rateLimiter.middleware'
import { sanitize } from '@/middleware/sanitize.middleware'

// Route modules
import { authRouter } from '@/modules/auth/auth.routes'
import { oauthRouter } from '@/modules/oauth/oauth.routes'
import { usersRouter } from '@/modules/users/user.routes'
import { adminRouter } from '@/modules/admin/admin.routes'

// ── Sentry (must init before express) ──────────────────────────────
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  })
}

// ── App ─────────────────────────────────────────────────────────────
export const app = express()

// Trust Railway's reverse proxy — required for real IP in rate limiter
app.set('trust proxy', env.TRUST_PROXY)

// ── Security middleware ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI needs inline styles
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  })
)

app.use(
  cors({
    origin: env.CLIENT_URL, // Exact origin — no wildcard
    credentials: true, // Required for httpOnly cookie exchange
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  })
)

// ── Request parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })) // Limit body size — prevents large payload attacks
app.use(express.urlencoded({ extended: false, limit: '10kb' }))
app.use(cookieParser(env.COOKIE_SECRET)) // Signed cookie support

// ── Observability ────────────────────────────────────────────────────
app.use(requestIdMiddleware) // x-request-id on every request
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/v1/health', // Don't log health check spam
  })
)

// ── Input sanitization ───────────────────────────────────────────────
app.use(sanitize) // mongo-sanitize: strip $ operators

// ── Health check (no auth, no rate limit) ───────────────────────────
app.get('/api/v1/health', async (_req, res) => {
  const mongoOk = mongoose.connection.readyState === 1
  const redis = app.get('redis') as Redis
  let redisOk = false
  try {
    redisOk = (await redis.ping()) === 'PONG'
  } catch {
    /* Redis unreachable */
  }

  const healthy = mongoOk && redisOk
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      mongodb: mongoOk ? 'up' : 'down',
      redis: redisOk ? 'up' : 'down',
    },
  })
})

// ── API routes (versioned) ───────────────────────────────────────────
app.use('/api/v1/auth', loginRateLimiter, authRouter)
app.use('/api/v1/oauth', oauthRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/admin', adminRouter)

// ── 404 handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ status: 'error', statusCode: 404, message: 'Route not found' })
})

// ── Global error handler (must be last) ─────────────────────────────
app.use(errorHandler)

// ── Bootstrap ───────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB()
  const redis = await connectRedis()
  app.set('redis', redis) // Attach to app for health check + middleware access

  // Swagger UI (development + staging only)
  if (env.NODE_ENV !== 'production') {
    const { setupSwagger } = await import('./config/swagger.js')
    setupSwagger(app)
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`TokenForge API running on port ${env.PORT}`, {
      env: env.NODE_ENV,
      pid: process.pid,
    })
  })

  // ── Graceful shutdown ──────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — starting graceful shutdown`)

    // Stop accepting new connections
    server.close(async () => {
      try {
        await mongoose.connection.close()
        logger.info('MongoDB connection closed')
        await redis.quit()
        logger.info('Redis connection closed')
        logger.info('Graceful shutdown complete')
        process.exit(0)
      } catch (err) {
        logger.error('Error during shutdown', { err })
        process.exit(1)
      }
    })

    // Force exit after 30s — Railway SIGKILL arrives at 30s anyway
    setTimeout(() => {
      logger.error('Forced shutdown after 30s timeout')
      process.exit(1)
    }, 30_000).unref()
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))

  // Unhandled promise rejections — log and exit (never swallow)
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason })
    process.exit(1)
  })
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed', { err })
  process.exit(1)
})
