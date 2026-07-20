import { UserRepository } from './user.repository'
import { IUser } from './user.model'
import { AppError } from '@/shared/errors'

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
}
