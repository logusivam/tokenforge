import mongoose, { Schema, Document } from 'mongoose'
import type { UserRole } from '@tokenforge/types'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash?: string // Undefined for OAuth-only accounts
  googleId?: string
  githubId?: string
  avatar?: string
  roles: UserRole[]
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // Never returned in queries by default
    googleId: { type: String },
    githubId: { type: String },
    avatar: { type: String },
    roles: { type: [String], default: ['user'], enum: ['admin', 'moderator', 'user', 'guest'] },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    // Never return passwordHash in JSON responses
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString()
        ret.role = ret.roles?.[0] || 'user'
        delete ret._id
        delete ret.passwordHash
        delete ret.__v
        return ret
      },
    },
  }
)

// ── Indexes ────────────────────────────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ googleId: 1 }, { sparse: true }) // sparse: null values not indexed
UserSchema.index({ githubId: 1 }, { sparse: true })
UserSchema.index({ createdAt: -1 }) // Descending for admin user list

export const UserModel = mongoose.model<IUser>('User', UserSchema)
