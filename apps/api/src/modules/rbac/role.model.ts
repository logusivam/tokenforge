import mongoose, { Schema, Document } from 'mongoose'
import { UserRole, PermissionString } from '@tokenforge/types'

export interface IRole extends Document {
  name: UserRole
  permissions: PermissionString[]
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'moderator', 'user', 'guest'],
  },
  permissions: { type: [String], default: [] },
})

export const RoleModel = mongoose.model<IRole>('Role', RoleSchema)
