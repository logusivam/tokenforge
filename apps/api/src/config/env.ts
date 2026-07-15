import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  MONGO_URI: z.string().url({ message: 'MONGO_URI must be a valid URI' }),
  REDIS_URL: z.string().url({ message: 'REDIS_URL must be a valid URI' }),

  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY required'),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY required'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),

  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET required'),
  GOOGLE_CALLBACK_URL: z.string().url(),

  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET required'),
  GITHUB_CALLBACK_URL: z.string().url(),

  CLIENT_URL: z.string().url({ message: 'CLIENT_URL must be a valid URL' }),

  TRUST_PROXY: z.coerce.number().default(0),
  SENTRY_DSN: z.string().optional(),
})

// Throw at startup if any required env var is missing
// This prevents silent failures in production
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env