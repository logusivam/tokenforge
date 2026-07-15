import winston from 'winston'
import { env } from '@/config/env'

const { combine, timestamp, json, colorize, simple, errors } = winston.format

// Production: structured JSON — parseable by Railway log viewer + Sentry
// Development: colorised human-readable output
const devFormat = combine(colorize(), simple())
const prodFormat = combine(
  errors({ stack: true }),   // Include stack traces in JSON
  timestamp(),
  json()
)

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'tokenforge-api' },
  transports: [
    new winston.transports.Console(),
    // Production: write errors to persistent file for post-mortem analysis
    ...(env.NODE_ENV === 'production'
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' })]
      : []),
  ],
})

// Helper: attach requestId to every log within a request context
export const requestLogger = (requestId: string): winston.Logger =>
  logger.child({ requestId })