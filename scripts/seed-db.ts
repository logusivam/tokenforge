import dotenv from 'dotenv'
import path from 'path'
import bcrypt from 'bcryptjs'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/api/.env') })

import { connectDB, disconnectDB } from '../apps/api/src/config/db'
import { seedRbac } from '../apps/api/src/modules/rbac/rbac.seed'
import { UserModel } from '../apps/api/src/modules/users/user.model'
import { logger } from '../apps/api/src/shared/logger'

async function main() {
  await connectDB()
  await seedRbac()

  const adminEmail = 'admin@tokenforge.dev'
  const adminExists = await UserModel.findOne({ email: adminEmail })
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('AdminPassword123!', 12)
    await UserModel.create({
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      roles: ['admin'],
      isActive: true,
      emailVerified: true,
    })
    logger.info(`Default admin user created: ${adminEmail} / AdminPassword123!`)
  } else {
    logger.info(`Default admin user already exists.`)
  }

  await disconnectDB()
  logger.info('Database seeding completed.')
}

main().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
