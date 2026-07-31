import Redis from 'ioredis'
import { config } from 'dotenv'

config({ path: 'apps/api/.env' })

/**
 * Emergency script — revokes ALL active sessions across all users.
 * Use only in case of:
 *   - Private key compromise
 *   - Mass session hijack event
 *   - Infrastructure breach
 */
async function revokeAll(): Promise<void> {
  const redis = new Redis(process.env.REDIS_URL ?? '')

  // Scan for all refresh token keys (non-blocking — SCAN not KEYS)
  let cursor = '0'
  let totalDeleted = 0

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH', 'refresh:*',
      'COUNT', 100
    )
    cursor = nextCursor

    if (keys.length > 0) {
      await redis.del(...keys)
      totalDeleted += keys.length
    }
  } while (cursor !== '0')

  // Also purge token families
  cursor = '0'
  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      'MATCH', 'family:*',
      'COUNT', 100
    )
    cursor = nextCursor
    if (keys.length > 0) {
      await redis.del(...keys)
      totalDeleted += keys.length
    }
  } while (cursor !== '0')

  console.log(`✅ Revoked ${totalDeleted} token keys`)
  console.log('⚠️  All users will be required to re-authenticate')

  await redis.quit()
}

revokeAll().catch((err) => {
  console.error('❌ Revocation failed:', err)
  process.exit(1)
})