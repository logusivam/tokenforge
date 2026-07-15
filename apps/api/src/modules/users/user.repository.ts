import { UserModel, IUser } from './user.model'

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id)
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email })
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).select('+passwordHash')
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    return UserModel.create(user)
  }

  async update(id: string, update: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, update, { new: true })
  }

  async delete(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndDelete(id)
  }

  async findAllPaginated(page: number, limit: number): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(),
    ])
    return { users, total }
  }
}
