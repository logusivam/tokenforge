import { UserRepository } from './user.repository'
import { IUser, UserModel } from './user.model'
import { AppError, ConflictError } from '@/shared/errors'

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepo.findById(id)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  async updateProfile(
    id: string,
    updateData: { name?: string; avatar?: string; password?: string; oldPassword?: string }
  ): Promise<IUser> {
    const dataToUpdate: any = { ...updateData }
    delete dataToUpdate.oldPassword

    if (updateData.password) {
      const bcrypt = await import('bcryptjs')
      const existingUser = await this.userRepo.findByIdWithPassword(id)
      if (!existingUser) {
        throw new AppError('User not found', 404)
      }

      // If user has a password set, strictly validate the oldPassword
      if (existingUser.passwordHash) {
        if (!updateData.oldPassword) {
          throw new AppError('Old password is required to update password', 400)
        }
        const matches = await bcrypt.default.compare(
          updateData.oldPassword,
          existingUser.passwordHash
        )
        if (!matches) {
          throw new AppError('Incorrect old password', 400)
        }
      }

      dataToUpdate.passwordHash = await bcrypt.default.hash(updateData.password, 12)
      delete dataToUpdate.password
    }
    const user = await this.userRepo.update(id, dataToUpdate)
    if (!user) {
      throw new AppError('User not found', 404)
    }
    return user
  }

  async deleteAccount(id: string): Promise<void> {
    const user = await this.userRepo.delete(id)
    if (!user) {
      throw new AppError('User not found', 404)
    }
  }

  async unlinkProvider(userId: string, provider: 'google' | 'github'): Promise<IUser> {
    const user = await this.userRepo.findByIdWithPassword(userId)
    if (!user) throw new AppError('User not found', 404)

    const hasPassword = !!user.passwordHash
    const hasGoogle = !!user.googleId
    const hasGithub = !!user.githubId
    const loginMethodCount = [hasPassword, hasGoogle, hasGithub].filter(Boolean).length

    if (loginMethodCount <= 1) {
      throw new ConflictError(
        'Cannot disconnect your only login method. Set a password first, or connect another OAuth provider.'
      )
    }

    const field = provider === 'google' ? 'googleId' : 'githubId'
    const updated = await UserModel.findByIdAndUpdate(
      userId,
      { $unset: { [field]: 1 } },
      { new: true }
    )
    if (!updated) throw new AppError('User not found', 404)
    return updated
  }
}
