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

  async updateProfile(id: string, updateData: { name?: string; avatar?: string }): Promise<IUser> {
    const user = await this.userRepo.update(id, updateData)
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
