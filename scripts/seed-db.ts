import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config({ path: 'apps/api/.env' })

const ROLES = [
  {
    name: 'admin',
    permissions: [
      { resource: 'users',   action: 'read',   scope: 'all' },
      { resource: 'users',   action: 'write',  scope: 'all' },
      { resource: 'users',   action: 'delete', scope: 'all' },
      { resource: 'audit',   action: 'read',   scope: 'all' },
      { resource: 'roles',   action: 'read',   scope: 'all' },
      { resource: 'roles',   action: 'write',  scope: 'all' },
      { resource: 'sessions', action: 'delete', scope: 'all' },
    ],
  },
  {
    name: 'moderator',
    permissions: [
      { resource: 'users', action: 'read',  scope: 'all' },
      { resource: 'audit', action: 'read',  scope: 'all' },
    ],
  },
  {
    name: 'user',
    permissions: [
      { resource: 'profile', action: 'read',   scope: 'own' },
      { resource: 'profile', action: 'write',  scope: 'own' },
      { resource: 'profile', action: 'delete', scope: 'own' },
    ],
  },
  {
    name: 'guest',
    permissions: [],
  },
]

async function seed(): Promise<void> {
  const uri = process.env.MONGO_URI
  if (!uri) throw new Error('MONGO_URI not set in .env')

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  // Seed roles
  const RoleModel = mongoose.model('Role', new mongoose.Schema({
    name: String,
    permissions: [{ resource: String, action: String, scope: String }],
  }))

  for (const role of ROLES) {
    await RoleModel.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    )
    console.log(`✅ Role seeded: ${role.name}`)
  }

  // Seed first admin user (idempotent)
  const UserModel = mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    roles: [String],
    createdAt: { type: Date, default: Date.now },
  }))

  const adminEmail = 'admin@tokenforge.dev'
  const existing = await UserModel.findOne({ email: adminEmail })

  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@TokenForge1!', 12)
    await UserModel.create({
      name: 'TokenForge Admin',
      email: adminEmail,
      passwordHash,
      roles: ['admin'],
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
    console.log('⚠️  Change this password immediately after first login')
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  await mongoose.disconnect()
  console.log('✅ Seed complete')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})