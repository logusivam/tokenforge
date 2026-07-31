import Redis from 'ioredis'
import { env } from './env'
import { logger } from '@/shared/logger'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
})

redis.on('connect', () => {
  logger.info('Redis client connecting...')
})

redis.on('ready', () => {
  logger.info('Redis client connected and ready')
})

redis.on('error', (err) => {
  logger.error('Redis error', { err })
})

export async function connectRedis(): Promise<Redis> {
  if (redis.status === 'wait' || redis.status === 'close') {
    await redis.connect()
  }
  return redis
}
