import mongoose, { Schema, Document } from 'mongoose'

export interface IPermission extends Document {
  resource: string
  action: string
  scope?: string
}

const PermissionSchema = new Schema<IPermission>({
  resource: { type: String, required: true },
  action: { type: String, required: true },
  scope: { type: String },
})

// Compound unique index
PermissionSchema.index({ resource: 1, action: 1, scope: 1 }, { unique: true })

export const PermissionModel = mongoose.model<IPermission>('Permission', PermissionSchema)
